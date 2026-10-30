const Reservation = require('../models/reservation.model');
const { STATUTS_ACTIFS, STATUTS_RESERVATION } = require('../utils/constants');

async function create(data, session = null) {
  const reservation = new Reservation(data);
  return reservation.save({ session });
}

const findById = (id, session = null) => Reservation.findById(id).session(session);

// Existe-t-il une réservation active du matériel qui chevauche [dateDebut, dateFin[ ?
// Condition : debutExistant < fin ET finExistante > debut (un créneau contigu ne chevauche pas).
function existsOverlap({ materiel, dateDebut, dateFin }, session = null) {
  return Reservation.exists({
    materiel,
    statut: { $in: STATUTS_ACTIFS },
    dateDebut: { $lt: dateFin },
    dateFin: { $gt: dateDebut },
  }).session(session);
}

// Le matériel est-il actuellement sorti (emprunt EN_COURS), hors réservation "excludeId" ?
const existsEnCours = (materiel, excludeId, session = null) =>
  Reservation.exists({ materiel, statut: STATUTS_RESERVATION.EN_COURS, _id: { $ne: excludeId } }).session(session);

// Changement de statut atomique : ne s'applique que si la réservation est encore
// dans le statut attendu (renvoie null sinon).
const transition = (id, statutAttendu, changes, session = null) =>
  Reservation.findOneAndUpdate(
    { _id: id, statut: statutAttendu },
    { $set: changes },
    { session, returnDocument: 'after' }
  );

module.exports = { create, findById, existsOverlap, existsEnCours, transition };
