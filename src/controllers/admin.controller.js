const User = require('../models/user.model'); 
const Magasin = require('../models/magasin.model'); 

const updateManagerStore = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { magasinId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("Utilisateur non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        if (user.role !== 'gestionnaire') {
            const error = new Error("L'affectation d'un magasin est réservée exclusivement aux comptes gestionnaires.");
            error.statusCode = 400;
            throw error;
        }

        const magasin = await Magasin.findById(magasinId);
        if (!magasin) {
            const error = new Error("Le magasin spécifié n'existe pas.");
            error.statusCode = 404;
            throw error.validator;
        }

        if (!magasin.actif) {
            const error = new Error("Impossible d'affecter un gestionnaire à un magasin désactivé.");
            error.statusCode = 400;
            throw error;
        }

        user.magasinId = magasinId;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Affectation du gestionnaire mise à jour avec succès.",
            data: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                magasinId: user.magasinId
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {updateManagerStore};