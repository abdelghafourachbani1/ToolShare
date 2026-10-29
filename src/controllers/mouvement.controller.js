// 1. Identifier les emprunts en retard (pour les gestionnaires/admins)
const getEmpruntsEnRetard = async (req, res, next) => {
    try {
        const maintenant = new Date();
        let filtre = {
            statut: 'en cours',
            dateFin: { $lt: maintenant }
        };

        // Si c'est un gestionnaire, filtrer uniquement par son magasin
        if (req.user.role === 'gestionnaire') {
            filtre.magasinId = req.user.magasinId;
        }

        const retards = await Reservation.find(filtre)
            .populate('utilisateurId', 'nom email telephone')
            .populate('materielId', 'reference nom')
            .populate('magasinId', 'nom');

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
        let filtre = {
            statut: { $in: ['en cours', 'terminée', 'annulée'] }
        };

        if (req.user.role === 'gestionnaire') {
            filtre.magasinId = req.user.magasinId;
        }

        const historique = await Reservation.find(filtre)
            .populate('utilisateurId', 'nom email')
            .populate('materielId', 'reference nom')
            .populate('magasinId', 'nom')
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