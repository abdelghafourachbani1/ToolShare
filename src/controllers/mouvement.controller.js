const Reservation = require('../models/reservation.model');
const { ROLES, STATUTS_RESERVATION } = require('../utils/constants');

// 1. Identifier les emprunts en retard (pour les gestionnaires/admins)
const getEmpruntsEnRetard = async (req, res, next) => {
    try {
        const maintenant = new Date();
        const filtre = {
            statut: STATUTS_RESERVATION.EN_COURS,
            dateFin: { $lt: maintenant }
        };

        // Si c'est un gestionnaire, filtrer uniquement par son magasin
        if (req.user.role === ROLES.GESTIONNAIRE) {
            filtre.magasin = req.user.magasin;
        }

        const retards = await Reservation.find(filtre)
            .populate('utilisateur', 'nom email')
            .populate('materiel', 'reference nom')
            .populate('magasin', 'nom');

        res.status(200).json({
            success: true,
            count: retards.length,
            message: "Liste des emprunts en retard récupérée avec succès.",
            data: retards
        });
    } catch (error) {
        next(error);
    }
};

// 2. Afficher l'historique des mouvements (sorties et retours de matériel)
const getHistoriqueMouvements = async (req, res, next) => {
    try {
        const filtre = {
            statut: { $in: [STATUTS_RESERVATION.EN_COURS, STATUTS_RESERVATION.TERMINEE, STATUTS_RESERVATION.ANNULEE] }
        };

        if (req.user.role === ROLES.GESTIONNAIRE) {
            filtre.magasin = req.user.magasin;
        }

        const historique = await Reservation.find(filtre)
            .populate('utilisateur', 'nom email')
            .populate('materiel', 'reference nom')
            .populate('magasin', 'nom')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: historique.length,
            data: historique
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmpruntsEnRetard,
    getHistoriqueMouvements
};
