const mongoose = require('mongoose');
const Reservation = require('../models/reservation.model');

describe('Règles Métier - Réservations', () => {

    test('Devrait calculer automatiquement la date de fin en fonction de la date de début et de la durée en heures', function () {
        const dateDebut = new Date('2026-11-01T10:00:00.000Z');
        const dureeEnHeures = 5;

        const dureeEnMs = dureeEnHeures * 60 * 60 * 1000;
        const dateFinCalculee = new Date(dateDebut.getTime() + dureeEnMs);

        const expectedDateFin = new Date('2026-11-01T15:00:00.000Z');

        expect(dateFinCalculee.toISOString()).toBe(expectedDateFin.toISOString());
    });

    test('Devrait détecter un chevauchement si une réservation tombe sur un créneau existant', () => {
        const reservationExistante = {
            dateDebut: new Date('2026-11-01T08:00:00.000Z'),
            dateFin: new Date('2026-11-01T12:00:00.000Z')
        };

        const nouvelleReservation = {
            dateDebut: new Date('2026-11-01T10:00:00.000Z'),
            dateFin: new Date('2026-11-01T14:00:00.000Z')
        };

        const isOverlapping = (
            nouvelleReservation.dateDebut < reservationExistante.dateFin &&
            nouvelleReservation.dateFin > reservationExistante.dateDebut
        );

        expect(isOverlapping).toBe(true);
    });

    test('Ne devrait pas détecter de chevauchement si la nouvelle réservation commence exactement quand l’ancienne se termine', () => {
        const reservationExistante = {
            dateDebut: new Date('2026-11-01T08:00:00.000Z'),
            dateFin: new Date('2026-11-01T12:00:00.000Z')
        };

        const nouvelleReservation = {
            dateDebut: new Date('2026-11-01T12:00:00.000Z'),
            dateFin: new Date('2026-11-01T16:00:00.000Z')
        };

        const isOverlapping = (
            nouvelleReservation.dateDebut < reservationExistante.dateFin &&
            nouvelleReservation.dateFin > reservationExistante.dateDebut
        );

        expect(isOverlapping).toBe(false);
    });

});