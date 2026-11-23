const Reservation = require('../models/reservation.model');
const { ROLES, STATUTS_RESERVATION } = require('../utils/constants');
const { isValidObjectId } = require('../utils/objectId');
const AppError = require('../utils/AppError');

async function list(user, { enRetard = false, ...query } = {}) {
  const filter = {};
  if (user.role === ROLES.GESTIONNAIRE) filter.magasin = user.magasin;
  else if (query.magasin !== undefined) {
    if (!isValidObjectId(query.magasin)) throw new AppError(400, 'Identifiant de magasin invalide');
    filter.magasin = query.magasin;
  }
  if (enRetard === 'true') {
    filter.statut = STATUTS_RESERVATION.EN_COURS;
    filter.dateFin = { $lt: new Date() };
  } else {
    filter.statut = { $in: [STATUTS_RESERVATION.EN_COURS, STATUTS_RESERVATION.TERMINEE] };
  }
  return Reservation.find(filter).sort({ updatedAt: -1 }).limit(200)
    .populate('utilisateur', 'nom email').populate('materiel', 'reference nom').populate('magasin', 'nom');
}

module.exports = { list };
