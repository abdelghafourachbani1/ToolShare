const Materiel = require('../models/materiel.model');

const createMateriel = async (data) => {
    return await Materiel.create(data);
};

const findAllMateriels = async (filter = {}) => {
    return await Materiel.find(filter).populate('magasinId', 'nom localisation');
};

const findMaterielById = async (id) => {
    return await Materiel.findById(id).populate('magasinId');
};

const findMaterielByReference = async (reference) => {
    return await Materiel.findOne({ reference });
};

const updateMateriel = async (id, data) => {
    return await Materiel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteMateriel = async (id) => {
    return await Materiel.findByIdAndDelete(id);
};

module.exports = {
    createMateriel,
    findAllMateriels,
    findMaterielById,
    findMaterielByReference,
    updateMateriel,
    deleteMateriel
};