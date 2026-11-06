const magasinRepository = require('../repositories/magasin.repository');
const { ROLES } = require('../utils/constants');
const { isValidObjectId } = require('../utils/objectId');
const AppError = require('../utils/AppError');

const NOM_MAX = 100;
const LOCALISATION_MAX = 200;

function assertValidId(id) {
  if (!isValidObjectId(id)) throw new AppError(400, 'Identifiant de magasin invalide');
}

// Ne garde que les champs autorisés : un client ne peut pas imposer "actif" ou "_id".
function pickAndValidate(body, { requireNom }) {
  const { nom, localisation } = body || {};
  const errors = [];
  const data = {};

  if (nom !== undefined || requireNom) {
    if (typeof nom !== 'string' || !nom.trim()) errors.push('nom est requis');
    else if (nom.trim().length > NOM_MAX) errors.push(`nom : ${NOM_MAX} caractères maximum`);
    else data.nom = nom.trim();
  }
  if (localisation !== undefined) {
    if (typeof localisation !== 'string') errors.push('localisation doit être un texte');
    else if (localisation.trim().length > LOCALISATION_MAX) {
      errors.push(`localisation : ${LOCALISATION_MAX} caractères maximum`);
    } else data.localisation = localisation.trim();
  }

  if (!errors.length && Object.keys(data).length === 0) {
    errors.push('aucun champ à modifier (nom ou localisation)');
  }
  if (errors.length) throw new AppError(400, 'Données invalides', errors);
  return data;
}

async function withDuplicateCheck(action) {
  try {
    return await action();
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Un magasin porte déjà ce nom');
    throw err;
  }
}

async function create(body) {
  const data = pickAndValidate(body, { requireNom: true });
  return withDuplicateCheck(() => magasinRepository.create(data));
}

// Admin : tous les magasins (filtre ?actif=true|false possible).
// Autres rôles : uniquement les magasins actifs.
async function list(user, query = {}) {
  const filter = {};
  if (user.role === ROLES.ADMIN) {
    if (query.actif === 'true') filter.actif = true;
    if (query.actif === 'false') filter.actif = false;
  } else {
    filter.actif = true;
  }
  return magasinRepository.findAll(filter);
}

async function getById(user, id) {
  assertValidId(id);
  const magasin = await magasinRepository.findById(id);
  if (!magasin) throw new AppError(404, 'Magasin introuvable');

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwnStore =
    user.role === ROLES.GESTIONNAIRE && user.magasin && String(user.magasin) === String(magasin._id);

  // Un magasin désactivé n'est visible que de l'Admin et de ses gestionnaires.
  if (!isAdmin && !isOwnStore && !magasin.actif) throw new AppError(404, 'Magasin introuvable');
  return magasin;
}

async function update(id, body) {
  assertValidId(id);
  const data = pickAndValidate(body, { requireNom: false });
  const magasin = await withDuplicateCheck(() => magasinRepository.updateById(id, data));
  if (!magasin) throw new AppError(404, 'Magasin introuvable');
  return magasin;
}

async function setActif(id, actif) {
  assertValidId(id);
  const magasin = await magasinRepository.updateById(id, { actif });
  if (!magasin) throw new AppError(404, 'Magasin introuvable');
  return magasin;
}

const deactivate = (id) => setActif(id, false);
const activate = (id) => setActif(id, true);

module.exports = { create, list, getById, update, deactivate, activate };
