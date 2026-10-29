const Materiel = require('../models/materiel.model');

// "magasin" accepte un identifiant ou une liste d'identifiants.
function toQuery(filter) {
  const query = { ...filter };
  if (Array.isArray(query.magasin)) query.magasin = { $in: query.magasin };
  return query;
}

const findById = (id) => Materiel.findById(id);

const findPage = (filter, { skip, limit }) =>
  Materiel.find(toQuery(filter))
    .collation({ locale: 'fr', strength: 2 })
    .sort({ nom: 1, _id: 1 })
    .skip(skip)
    .limit(limit);

const count = (filter) => Materiel.countDocuments(toQuery(filter));

const updateById = (id, data) =>
  Materiel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true });

module.exports = { findById, findPage, count, updateById };
