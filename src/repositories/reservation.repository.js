const Reservation = require('../models/reservation.model');

const checkAvailabilityAndOverlap = async (materielId, dateDebut, dateFin) => {

    const conflictingReservation = await Reservation.findOne({
        materielId: materielId,
        statut: { $in: ['confirmée', 'en cours'] },
        dateDebut: { $lt: dateFin },
        dateFin: { $gt: dateDebut }
    });

    return !conflictingReservation; 
};

module.exports = {
    checkAvailabilityAndOverlap
};