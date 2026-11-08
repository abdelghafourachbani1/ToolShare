const Reservation = require('../models/reservation.model');
const { STATUTS_ACTIFS, STATUTS_RESERVATION } = require('../utils/constants');

async function create(data, session = null) {
  return new Reservation(data).save({ session });
}

const findById = (id, session = null) => Reservation.findById(id).session(session);

function existsOverlap({ materiel, dateDebut, dateFin }, session = null) {
  return Reservation.exists({
    materiel,
    statut: { $in: STATUTS_ACTIFS },
    dateDebut: { $lt: dateFin },
    dateFin: { $gt: dateDebut },
  }).session(session);
}

const existsEnCours = (materiel, excludeId, session = null) =>
  Reservation.exists({ materiel, statut: STATUTS_RESERVATION.EN_COURS, _id: { $ne: excludeId } }).session(session);

const transition = (id, statutAttendu, changes, session = null) =>
  Reservation.findOneAndUpdate(
    { _id: id, statut: statutAttendu },
    { $set: changes },
    { session, returnDocument: 'after' }
  );

function toQuery({ magasin, materiel, utilisateur, statut, du, au }) {
  const query = {};
  if (magasin) query.magasin = magasin;
  if (materiel) query.materiel = materiel;
  if (utilisateur) query.utilisateur = utilisateur;
  if (statut) query.statut = statut;
  if (au) query.dateDebut = { $lt: au };
  if (du) query.dateFin = { $gt: du };
  return query;
}

const findPage = (criteres, { skip, limit }) =>
  Reservation.find(toQuery(criteres))
    .sort({ dateDebut: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate('materiel', 'reference nom')
    .populate('utilisateur', 'nom email');

const count = (criteres) => Reservation.countDocuments(toQuery(criteres));

module.exports = { create, findById, existsOverlap, existsEnCours, transition, findPage, count };
