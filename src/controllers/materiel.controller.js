const materielRepository = require('../repositories/materiel.repository');

const creerMateriel = async (req, res, next) => {
    try {
        if (req.user.role === 'gestionnaire') {
            req.body.magasinId = req.user.magasinId;
        }
        const materiel = await materielRepository.createMateriel(req.body);
        res.status(201).json({
            success: true,
            message: "Matériel créé avec succès",
            data: materiel
        });
    } catch (error) {
        next(error);
    }
};

const getMateriels = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role === 'gestionnaire') {
            filter.magasinId = req.user.magasinId;
        } else if (req.query.magasinId) {
            filter.magasinId = req.query.magasinId;
        }
        const materiels = await materielRepository.findAllMateriels(filter);
        res.status(200).json({
            success: true,
            count: materiels.length,
            data: materiels
        });
    } catch (error) {
        next(error);
    }
};

const getMaterielById = async (req, res, next) => {
    try {
        const materiel = await materielRepository.findMaterielById(req.params.id);

        if (!materiel) {
            const error = new Error("Matériel non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        if (req.user.role === 'gestionnaire' && materiel.magasinId._id.toString() !== req.user.magasinId.toString()) {
            const error = new Error("Accès refusé. Ce matériel n'appartient pas à votre magasin.");
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: materiel
        });
    } catch (error) {
        next(error);
    }
};

const updateMateriel = async (req, res, next) => {
    try {
        const materiel = await materielRepository.findMaterielById(req.params.id);

        if (!materiel) {
            const error = new Error("Matériel non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        if (req.user.role === 'gestionnaire' && materiel.magasinId._id.toString() !== req.user.magasinId.toString()) {
            const error = new Error("Action interdite. Ce matériel n'appartient pas à votre magasin.");
            error.statusCode = 403;
            throw error;
        }

        if (req.user.role === 'gestionnaire' && req.body.magasinId && req.body.magasinId !== req.user.magasinId.toString()) {
            const error = new Error("Vous ne pouvez pas réassigner un matériel vers un autre magasin.");
            error.statusCode = 403;
            throw error;
        }

        const updatedMateriel = await materielRepository.updateMateriel(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Matériel mis à jour avec succès",
            data: updatedMateriel
        });
    } catch (error) {
        next(error);
    }
};

const deleteMateriel = async (req, res, next) => {
    try {
        const materiel = await materielRepository.findMaterielById(req.params.id);

        if (!materiel) {
            const error = new Error("Matériel non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        if (req.user.role === 'gestionnaire' && materiel.magasinId._id.toString() !== req.user.magasinId.toString()) {
            const error = new Error("Action interdite. Ce matériel n'appartient pas à votre magasin.");
            error.statusCode = 403;
            throw error;
        }

        await materielRepository.deleteMateriel(req.params.id);
        res.status(200).json({
            success: true,
            message: "Matériel supprimé avec succès"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    creerMateriel,
    getMateriels,
    getMaterielById,
    updateMateriel,
    deleteMateriel
};