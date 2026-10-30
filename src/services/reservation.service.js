const reservationRepository = require('../repositories/reservation.repository');
const materielRepository = require('../repositories/materiel.repository');
const magasinRepository = require('../repositories/magasin.repository');
const { runInTransaction } = require('../repositories/transaction');
const { calculerDateFin } = require('../utils/reservation');
const { isValidObjectId } = require('../utils/objectId');
const { STATUTS_RESERVATION, ETATS_MATERIEL } = require('../utils/constants');
const AppError = require('../utils/AppError');

// Valide la demande et calcule le créneau. Ne touche pas à la base.
function parseCreneau(params) {
  const { magasin, materiel, dateDebut, dureeHeures } = params || {};
  const errors = [];

  if (!isValidObjectId(magasin)) errors.push('magasin est requis (identifiant valide)');
  if (!isValidObjectId(materiel)) errors.push('materiel est requis (identifiant valide)');

  const debut = typeof dateDebut === 'string' ? new Date(dateDebut) : null;
  if (!debut || Number.isNaN(debut.getTime())) errors.push('dateDebut est requise (date ISO, ex. 2026-11-02T09:00:00Z)');
  else if (debut.getTime() < Date.now()) errors.push('dateDebut ne peut pas être dans le passé');

  const duree = typeof dureeHeures === 'string' && dureeHeures.trim() !== '' ? Number(dureeHeures) : dureeHeures;
  if (typeof duree !== 'number' || !Number.isFinite(duree) || duree <= 0) {
    errors.push('dureeHeures doit être un nombre strictement positif');
  }

  const dateFin = errors.length === 0 ? calculerDateFin(debut, duree) : null;
  if (dateFin && Number.isNaN(dateFin.getTime())) errors.push('dureeHeures est trop grande');

  if (errors.length > 0) throw new AppError(400, 'Données invalides', errors);
  return { magasin, materiel, dateDebut: debut, dureeHeures: duree, dateFin };
}

async function assertMagasinReservable(magasinId) {
  const magasin = await magasinRepository.findById(magasinId);
  if (!magasin) throw new AppError(404, 'Magasin introuvable');
  if (!magasin.actif) throw new AppError(409, 'Ce magasin est désactivé');
}

// Règles propres au matériel : appartenance au magasin, actif, disponible.
function assertMaterielReservable(materiel, magasinId) {
  if (!materiel) throw new AppError(404, 'Matériel introuvable');
  if (String(materiel.magasin) !== String(magasinId)) {
    throw new AppError(400, "Ce matériel n'appartient pas au magasin sélectionné");
  }
  if (!materiel.actif) throw new AppError(409, 'Ce matériel est désactivé');
  if (!materiel.disponible) throw new AppError(409, "Ce matériel est indisponible à la réservation");
}

// Lecture seule : « ce matériel est-il libre sur ce créneau ? » (sans réserver).
async function verifierDisponibilite(params) {
  const creneau = parseCreneau(params);
  await assertMagasinReservable(creneau.magasin);
  assertMaterielReservable(await materielRepository.findById(creneau.materiel), creneau.magasin);

  const occupe = await reservationRepository.existsOverlap(creneau);
  return {
    disponible: !occupe,
    materiel: creneau.materiel,
    dateDebut: creneau.dateDebut,
    dateFin: creneau.dateFin,
  };
}

// Création sans double réservation, même avec des demandes simultanées :
// tout se passe dans une transaction, qui commence par verrouiller le matériel.
// Deux demandes concurrentes sur le même matériel sont donc exécutées l'une après l'autre,
// et la seconde voit la réservation de la première (et reçoit un 409 si les créneaux se chevauchent).
async function creer(user, params) {
  const creneau = parseCreneau(params);
  await assertMagasinReservable(creneau.magasin);

  return runInTransaction(async (session) => {
    const materiel = await materielRepository.lockForReservation(creneau.materiel, session);
    assertMaterielReservable(materiel, creneau.magasin);

    if (await reservationRepository.existsOverlap(creneau, session)) {
      throw new AppError(409, 'Ce matériel est déjà réservé sur ce créneau');
    }

    return reservationRepository.create({ ...creneau, utilisateur: user._id }, session);
  });
}

async function findReservationOrFail(id, session) {
  if (!isValidObjectId(id)) throw new AppError(400, 'Identifiant de réservation invalide');
  const reservation = await reservationRepository.findById(id, session);
  if (!reservation) throw new AppError(404, 'Réservation introuvable');
  return reservation;
}

// Un gestionnaire n'intervient que sur les réservations de son magasin.
function assertReservationDeSonMagasin(user, reservation) {
  if (String(reservation.magasin) !== String(user.magasin)) {
    throw new AppError(403, 'Cette réservation appartient à un autre magasin');
  }
}

const MESSAGES_REMISE = {
  [STATUTS_RESERVATION.EN_COURS]: 'Ce matériel a déjà été remis',
  [STATUTS_RESERVATION.TERMINEE]: 'Cette réservation est terminée',
  [STATUTS_RESERVATION.ANNULEE]: 'Cette réservation est annulée',
};

// Remise du matériel : CONFIRMEE -> EN_COURS, avec la date réelle de sortie.
// Verrouille le matériel pour qu'un même matériel ne soit jamais remis à deux personnes.
async function remettre(user, id) {
  return runInTransaction(async (session) => {
    const reservation = await findReservationOrFail(id, session);
    assertReservationDeSonMagasin(user, reservation);

    if (reservation.statut !== STATUTS_RESERVATION.CONFIRMEE) {
      throw new AppError(409, MESSAGES_REMISE[reservation.statut] || 'Statut incompatible avec une remise');
    }

    const materiel = await materielRepository.lockForReservation(reservation.materiel, session);
    if (!materiel || !materiel.actif) throw new AppError(409, 'Ce matériel est désactivé');
    if (!materiel.disponible) throw new AppError(409, 'Ce matériel est indisponible');

    if (await reservationRepository.existsEnCours(reservation.materiel, reservation._id, session)) {
      throw new AppError(409, "Ce matériel est déjà emprunté : il doit d'abord être rendu");
    }

    const remise = await reservationRepository.transition(
      reservation._id,
      STATUTS_RESERVATION.CONFIRMEE,
      { statut: STATUTS_RESERVATION.EN_COURS, dateSortieReelle: new Date() },
      session
    );
    if (!remise) throw new AppError(409, 'Cette réservation vient de changer de statut');
    return remise;
  });
}

// Retour du matériel : EN_COURS -> TERMINEE, avec la date réelle de retour et l'état constaté.
// Un matériel rendu endommagé devient indisponible jusqu'à sa remise en service.
// Le retour reste possible même si le magasin, le matériel ou un compte est désactivé.
async function retourner(user, id, body) {
  const { etatConstate } = body || {};
  const etats = Object.values(ETATS_MATERIEL);
  if (!etats.includes(etatConstate)) {
    throw new AppError(400, 'Données invalides', [`etatConstate doit valoir : ${etats.join(', ')}`]);
  }

  return runInTransaction(async (session) => {
    const reservation = await findReservationOrFail(id, session);
    assertReservationDeSonMagasin(user, reservation);

    if (reservation.statut !== STATUTS_RESERVATION.EN_COURS) {
      throw new AppError(409, `Seul un emprunt en cours peut être retourné (statut actuel : ${reservation.statut})`);
    }

    const retour = await reservationRepository.transition(
      reservation._id,
      STATUTS_RESERVATION.EN_COURS,
      { statut: STATUTS_RESERVATION.TERMINEE, dateRetourReelle: new Date(), etatConstate },
      session
    );
    if (!retour) throw new AppError(409, 'Cette réservation vient de changer de statut');

    if (etatConstate === ETATS_MATERIEL.ENDOMMAGE) {
      await materielRepository.updateById(reservation.materiel, { disponible: false }, session);
    }
    return retour;
  });
}

module.exports = { creer, verifierDisponibilite, remettre, retourner };
