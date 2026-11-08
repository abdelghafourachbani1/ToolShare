// Lectures sur les réservations (les écritures sont dans reservation.service.js).
const reservationRepository = require('../repositories/reservation.repository');
const { ROLES, STATUTS_RESERVATION } = require('../utils/constants');
const { isValidObjectId } = require('../utils/objectId');
const { parsePagination, buildPagination } = require('../utils/pagination');
const AppError = require('../utils/AppError');

const STATUTS = Object.values(STATUTS_RESERVATION);

function parseDate(valeur, nom, errors) {
  if (valeur === undefined) return null;
  const date = new Date(valeur);
  if (typeof valeur !== 'string' || Number.isNaN(date.getTime())) {
    errors.push(`${nom} doit être une date ISO (ex. 2026-11-02T09:00:00Z)`);
    return null;
  }
  return date;
}

// Liste paginée des réservations, avec filtres combinables :
// ?materiel=<id> &statut=<STATUT> &du=<date> &au=<date> &page= &limit=   (+ ?magasin=<id> pour l'Admin)
// - GESTIONNAIRE : uniquement les réservations de SON magasin
// - ADMIN : toutes les réservations
async function lister(user, query = {}) {
  // L'autorisation d'abord : un gestionnaire ne peut pas viser un autre magasin.
  if (user.role === ROLES.GESTIONNAIRE && query.magasin !== undefined && String(query.magasin) !== String(user.magasin)) {
    throw new AppError(403, "Vous n'avez accès qu'aux réservations de votre magasin");
  }

  const pagination = parsePagination(query);
  const errors = [];
  const criteres = {};

  if (query.materiel !== undefined) {
    if (isValidObjectId(query.materiel)) criteres.materiel = query.materiel;
    else errors.push('materiel : identifiant invalide');
  }
  if (query.magasin !== undefined && user.role === ROLES.ADMIN) {
    if (isValidObjectId(query.magasin)) criteres.magasin = query.magasin;
    else errors.push('magasin : identifiant invalide');
  }
  if (query.statut !== undefined) {
    if (STATUTS.includes(query.statut)) criteres.statut = query.statut;
    else errors.push(`statut doit valoir : ${STATUTS.join(', ')}`);
  }

  const du = parseDate(query.du, 'du', errors);
  const au = parseDate(query.au, 'au', errors);
  if (du && au && du >= au) errors.push('du doit être antérieur à au');
  if (errors.length > 0) throw new AppError(400, 'Filtres invalides', errors);

  if (du) criteres.du = du;
  if (au) criteres.au = au;
  if (user.role === ROLES.GESTIONNAIRE) criteres.magasin = user.magasin;

  const [reservations, total] = await Promise.all([
    reservationRepository.findPage(criteres, pagination),
    reservationRepository.count(criteres),
  ]);
  return { reservations, pagination: buildPagination(pagination, total) };
}

module.exports = { lister };
