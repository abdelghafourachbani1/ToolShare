const reservationRepository = require('../repositories/reservation.repository');
const materielRepository = require('../repositories/materiel.repository');
const { checkAvailabilityAndOverlap } = require('../repositories/reservation.repository');

const creerReservation = async (req, res, next) => {
    try {
        const { materielId, dateDebut, duree, magasinId } = req.body;
        const utilisateurId = req.user.id;

        // 1. Vérifier que le matériel existe et est disponible physiquement
        const materiel = await materielRepository.findMaterielById(materielId);
        if (!materiel) {
            const error = new Error("Matériel non trouvé.");
            error.statusCode = 404;
            throw error;
        }
        if (materiel.statut !== 'disponible') {
            const error = new Error("Ce matériel n'est pas disponible actuellement.");
            error.statusCode = 400;
            throw error;
        }

        // 2. Calcul temporaire de la date de fin pour tester le chevauchement
        const dureeEnMs = duree * 60 * 60 * 1000;
        const calculatedDateFin = new Date(new Date(dateDebut).getTime() + dureeEnMs);

        // 3. Vérifier les chevauchements de planning (TOOL-24)
        const isAvailable = await checkAvailabilityAndOverlap(materielId, new Date(dateDebut), calculatedDateFin);
        if (!isAvailable) {
            const error = new Error("Conflit de planning : Ce matériel est déjà réservé sur ce créneau horaire.");
            error.statusCode = 409; // Conflict
            throw error;
        }

        // 4. Création de la réservation
        const nouvelleReservation = await Reservation.create({
            utilisateurId,
            materielId,
            magasinId,
            dateDebut,
            duree
        });

        res.status(201).json({
            success: true,
            message: "Réservation créée avec succès.",
            data: nouvelleReservation
        });
    } catch (error) {
        next(error);
    }
};

// Consulter ses propres réservations
const getMesReservations = async (req, res, next) => {
    try {
        const utilisateurId = req.user.id;
        const reservations = await Reservation.find({ utilisateurId })
            .populate('materielId', 'reference nom statut')
            .populate('magasinId', 'nom localisation')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        next(error);
    }
};

// Annuler sa propre réservation
const annulerReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const utilisateurId = req.user.id;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            const error = new Error("Réservation non trouvée.");
            error.statusCode = 404;
            throw error;
        }

        // Vérifier que la réservation appartient bien à l'utilisateur connecté
        if (reservation.utilisateurId.toString() !== utilisateurId) {
            const error = new Error("Action non autorisée. Cette réservation ne vous appartient pas.");
            error.statusCode = 403;
            throw error;
        }

        // Vérifier si elle peut encore être annulée
        if (reservation.statut !== 'confirmée') {
            const error = new Error(`Impossible d'annuler cette réservation car son statut est '${reservation.statut}'.`);
            error.statusCode = 400;
            throw error;
        }

        reservation.statut = 'annulée';
        await reservation.save();

        res.status(200).json({
            success: true,
            message: "Réservation annulée avec succès.",
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMesReservations,
    annulerReservation,
    creerReservation
};
