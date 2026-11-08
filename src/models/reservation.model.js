const mongoose = require('mongoose');
const { STATUTS_RESERVATION, ETATS_MATERIEL } = require('../utils/constants');

const reservationSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    materiel: { type: mongoose.Schema.Types.ObjectId, ref: 'Materiel', required: true },
    magasin: { type: mongoose.Schema.Types.ObjectId, ref: 'Magasin', required: true, index: true },
    dateDebut: { type: Date, required: true },
    dureeHeures: {
      type: Number,
      required: true,
      validate: { validator: (v) => Number.isFinite(v) && v > 0, message: 'La durée doit être strictement positive' },
    },
    // Calculée à partir du début et de la durée, jamais saisie par le client.
    dateFin: { type: Date, required: true },
    statut: {
      type: String,
      enum: Object.values(STATUTS_RESERVATION),
      default: STATUTS_RESERVATION.CONFIRMEE,
    },
    dateSortieReelle: { type: Date, default: null },
    dateRetourReelle: { type: Date, default: null },
    etatConstate: { type: String, enum: [...Object.values(ETATS_MATERIEL), null], default: null },
  },
  { timestamps: true, versionKey: false }
);

// Sert la recherche de chevauchement sur un matériel.
reservationSchema.index({ materiel: 1, statut: 1, dateDebut: 1, dateFin: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
