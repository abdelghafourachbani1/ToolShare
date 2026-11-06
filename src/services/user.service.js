const userRepository = require('../repositories/user.repository');
const magasinRepository = require('../repositories/magasin.repository');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../utils/constants');
const { isValidObjectId } = require('../utils/objectId');
const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const ALL_ROLES = Object.values(ROLES);


const CREATABLE_ROLES = {
  [ROLES.ADMIN]: [ROLES.GESTIONNAIRE, ROLES.UTILISATEUR],
  [ROLES.GESTIONNAIRE]: [ROLES.UTILISATEUR],
};

// champs ne modifie pas par ce rome
const FORBIDDEN_UPDATE_FIELDS = ['role', 'magasin', 'actif', 'motDePasse', 'creePar'];

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isEmail = (value) => typeof value === 'string' && EMAIL_REGEX.test(value.trim());

function assertValidId(id) {
  if (!isValidObjectId(id)) throw new AppError(400, 'Identifiant de compte invalide');
}

async function withDuplicateEmailCheck(action) {
  try {
    return await action();
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Cet email est déjà utilisé');
    throw err;
  }
}

async function assertMagasinUsable(magasinId) {
  const magasin = await magasinRepository.findById(magasinId);
  if (!magasin) throw new AppError(404, 'Magasin introuvable');
  if (!magasin.actif) throw new AppError(409, 'Le magasin est désactivé');
}

async function findTargetOrFail(id) {
  assertValidId(id);
  const user = await userRepository.findById(id);
  if (!user) throw new AppError(404, 'Compte introuvable');
  return user;
}

function assertNotAdminAccount(user) {
  if (user.role === ROLES.ADMIN) {
    throw new AppError(403, 'Un compte administrateur ne se gère pas par cette route');
  }
}

async function create(actor, body) {
  const { nom, email, motDePasse, role = ROLES.UTILISATEUR, magasin } = body || {};

  if (!ALL_ROLES.includes(role)) {
    throw new AppError(400, 'Données invalides', [`role doit valoir : ${ALL_ROLES.join(', ')}`]);
  }

  // L'autorisation est vérifiée AVANT le reste : un rôle interdit est refusé en 403,
  // quelles que soient les autres données.
  const allowed = CREATABLE_ROLES[actor.role] || [];
  if (!allowed.includes(role)) {
    throw new AppError(403, `Vous n'avez pas le droit de créer un compte ${role}`);
  }

  const errors = [];
  if (!isText(nom)) errors.push('nom est requis');
  if (!isEmail(email)) errors.push('email invalide');
  if (typeof motDePasse !== 'string' || motDePasse.length < MIN_PASSWORD_LENGTH) {
    errors.push(`motDePasse doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
  }
  if (role === ROLES.GESTIONNAIRE && !isValidObjectId(magasin)) {
    errors.push('magasin est requis pour un gestionnaire (identifiant valide)');
  }
  if (role !== ROLES.GESTIONNAIRE && magasin !== undefined) {
    errors.push('magasin est réservé aux comptes gestionnaires');
  }
  if (errors.length > 0) throw new AppError(400, 'Données invalides', errors);

  if (role === ROLES.GESTIONNAIRE) await assertMagasinUsable(magasin);

  const data = {
    nom: nom.trim(),
    email: email.trim().toLowerCase(),
    motDePasse: await hashPassword(motDePasse),
    role,
    creePar: actor._id,
  };
  if (role === ROLES.GESTIONNAIRE) data.magasin = magasin;

  return withDuplicateEmailCheck(() => userRepository.create(data));
}

async function list(query = {}) {
  const filter = {};
  if (query.role !== undefined) {
    if (!ALL_ROLES.includes(query.role)) {
      throw new AppError(400, 'Données invalides', [`role doit valoir : ${ALL_ROLES.join(', ')}`]);
    }
    filter.role = query.role;
  }
  if (query.actif === 'true') filter.actif = true;
  if (query.actif === 'false') filter.actif = false;
  return userRepository.findAll(filter);
}

function getById(id) {
  return findTargetOrFail(id);
}

async function update(id, body) {
  const target = await findTargetOrFail(id);
  assertNotAdminAccount(target);

  const { nom, email } = body || {};
  const forbidden = FORBIDDEN_UPDATE_FIELDS.filter((field) => body && body[field] !== undefined);
  if (forbidden.length > 0) {
    throw new AppError(400, 'Modification non autorisée', [
      `champs non modifiables ici : ${forbidden.join(', ')}`,
    ]);
  }

  const errors = [];
  const data = {};
  if (nom !== undefined) {
    if (!isText(nom)) errors.push('nom est invalide');
    else data.nom = nom.trim();
  }
  if (email !== undefined) {
    if (!isEmail(email)) errors.push('email invalide');
    else data.email = email.trim().toLowerCase();
  }
  if (!errors.length && Object.keys(data).length === 0) {
    errors.push('aucun champ à modifier (nom ou email)');
  }
  if (errors.length > 0) throw new AppError(400, 'Données invalides', errors);

  return withDuplicateEmailCheck(() => userRepository.updateById(id, data));
}

// Désactiver ne supprime rien : l'historique (réservations, emprunts) reste consultable.
async function setActif(id, actif) {
  const target = await findTargetOrFail(id);
  assertNotAdminAccount(target);
  return userRepository.updateById(id, { actif });
}

const deactivate = (id) => setActif(id, false);
const activate = (id) => setActif(id, true);

module.exports = { create, list, getById, update, deactivate, activate };
