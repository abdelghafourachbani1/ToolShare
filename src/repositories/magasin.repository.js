const Magasin = require('../models/magasin.model');

const create = (data) => new Magasin(data).save();

const findById = (id) => Magasin.findById(id);

const findAll = (filter = {}) =>
  Magasin.find(filter).collation({ locale: 'fr', strength: 2 }).sort({ nom: 1 });

const updateById = (id, data) =>
  Magasin.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

module.exports = { create, findById, findAll, updateById };
