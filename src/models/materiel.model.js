const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, 'La référence est requise'],
      trim: true,
      maxlength: 50,
    },
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: '', maxlength: 500 },
    // disponible = false : indisponible à la réservation (panne, maintenance, endommagé).
    disponible: { type: Boolean, default: true },
    // actif = false : matériel retiré (désactivation), historique conservé.
    actif: { type: Boolean, default: true },
    magasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      required: [true, 'Le magasin est requis'],
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Référence unique, sans tenir compte des majuscules.
materielSchema.index({ reference: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

module.exports = mongoose.model('Materiel', materielSchema);
