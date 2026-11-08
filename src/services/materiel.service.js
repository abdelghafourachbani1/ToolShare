const materielRepository = require('../repositories/materiel.repository');
const magasinRepository = require('../repositories/magasin.repository');
const Materiel = require('../models/materiel.model');
const { ROLES } = require('../utils/constants');
const { isValidObjectId } = require('../utils/objectId');
const AppError = require('../utils/AppError');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const REFERENCE_MAX = 50;
const NOM_MAX = 100;

const sameId = (a, b) => String(a) === String(b);

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);
  const valid =
    Number.isInteger(page) && page >= 1 && Number.isInteger(limit) && limit >= 1 && limit <= MAX_LIMIT;
  if (!valid) {
    throw new AppError(400, 'Pagination invalide', [`page >= 1 et 1 <= limit <= ${MAX_LIMIT}`]);
  }
  return { page, limit };
}

function parseBoolean(value, name) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(400, 'Données invalides', [`${name} doit valoir true ou false`]);
}

function assertValidId(id) {
  if (!isValidObjectId(id)) throw new AppError(400, 'Identifiant de matériel invalide');
}

async function create(user, body = {}) {
  const { reference, nom, description = '', magasin } = body;
  const errors = [];
  if (typeof reference !== 'string' || !reference.trim()) errors.push('reference est requis');
  else if (reference.trim().length > REFERENCE_MAX) errors.push(`reference : ${REFERENCE_MAX} caractères maximum`);
  if (typeof nom !== 'string' || !nom.trim()) errors.push('nom est requis');
  else if (nom.trim().length > NOM_MAX) errors.push(`nom : ${NOM_MAX} caractères maximum`);
  if (typeof description !== 'string') errors.push('description doit être un texte');

  const magasinId = user.role === ROLES.GESTIONNAIRE ? user.magasin : magasin;
  if (!isValidObjectId(magasinId)) errors.push('magasin est requis (identifiant valide)');
  if (user.role === ROLES.GESTIONNAIRE && magasin && !sameId(magasin, user.magasin)) {
    throw new AppError(403, "Vous ne pouvez créer du matériel que dans votre magasin");
  }
  if (errors.length) throw new AppError(400, 'Données invalides', errors);

  const magasinDoc = await magasinRepository.findById(magasinId);
  if (!magasinDoc || !magasinDoc.actif) throw new AppError(404, 'Magasin introuvable ou désactivé');
  try {
    return await Materiel.create({
      reference: reference.trim(),
      nom: nom.trim(),
      description: description.trim(),
      magasin: magasinId,
    });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Un matériel porte déjà cette référence');
    throw err;
  }
}

// Liste paginée, filtrée selon le rôle :
// - UTILISATEUR : matériels actifs des magasins actifs uniquement
// - GESTIONNAIRE : tous les matériels de SON magasin
// - ADMIN : tous les matériels
async function list(user, query = {}) {
  const { page, limit } = parsePagination(query);
  const filter = {};

  const disponible = parseBoolean(query.disponible, 'disponible');
  if (disponible !== undefined) filter.disponible = disponible;

  if (query.magasin !== undefined && !isValidObjectId(query.magasin)) {
    throw new AppError(400, 'Identifiant de magasin invalide');
  }

  if (user.role === ROLES.UTILISATEUR) {
    filter.actif = true;
    if (query.magasin) {
      const magasin = await magasinRepository.findById(query.magasin);
      if (!magasin || !magasin.actif) throw new AppError(404, 'Magasin introuvable');
      filter.magasin = query.magasin;
    } else {
      const magasinsActifs = await magasinRepository.findAll({ actif: true });
      filter.magasin = magasinsActifs.map((m) => m._id);
    }
  } else {
    const actif = parseBoolean(query.actif, 'actif');
    if (actif !== undefined) filter.actif = actif;

    if (user.role === ROLES.GESTIONNAIRE) {
      if (query.magasin && !sameId(query.magasin, user.magasin)) {
        throw new AppError(403, "Vous n'avez accès qu'aux matériels de votre magasin");
      }
      filter.magasin = user.magasin;
    } else if (query.magasin) {
      filter.magasin = query.magasin;
    }
  }

  const [materiels, total] = await Promise.all([
    materielRepository.findPage(filter, { skip: (page - 1) * limit, limit }),
    materielRepository.count(filter),
  ]);

  return { materiels, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getById(user, id) {
  assertValidId(id);
  const materiel = await materielRepository.findById(id);
  if (!materiel) throw new AppError(404, 'Matériel introuvable');

  if (user.role === ROLES.GESTIONNAIRE && !sameId(materiel.magasin, user.magasin)) {
    throw new AppError(403, 'Ce matériel appartient à un autre magasin');
  }

  if (user.role === ROLES.UTILISATEUR) {
    // Matériel retiré ou magasin désactivé : on ne révèle pas son existence.
    const magasin = materiel.actif ? await magasinRepository.findById(materiel.magasin) : null;
    if (!magasin || !magasin.actif) throw new AppError(404, 'Matériel introuvable');
  }

  return materiel;
}

// Déclarer indisponible / remettre en service : réservé au gestionnaire du magasin concerné.
// Un matériel indisponible ne peut pas être réservé (contrôlé à la création de réservation).
async function setDisponible(user, id, disponible) {
  assertValidId(id);
  const materiel = await materielRepository.findById(id);
  if (!materiel) throw new AppError(404, 'Matériel introuvable');

  if (!sameId(materiel.magasin, user.magasin)) {
    throw new AppError(403, 'Ce matériel appartient à un autre magasin');
  }
  if (!materiel.actif) throw new AppError(409, 'Ce matériel est désactivé');

  return materielRepository.updateById(id, { disponible });
}

const declareUnavailable = (user, id) => setDisponible(user, id, false);
const putBackInService = (user, id) => setDisponible(user, id, true);

module.exports = { create, list, getById, declareUnavailable, putBackInService };
