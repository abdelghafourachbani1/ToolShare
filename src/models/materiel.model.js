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
    disponible: { type: Boolean, default: true },
    actif: { type: Boolean, default: true },
    magasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      required: [true, 'Le magasin est requis'],
      index: true,
    },
    verrouReservation: { type: Number, default: 0, select: false },
  },
  { timestamps: true, versionKey: false }
);

materielSchema.index({ reference: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

module.exports = mongoose.model('Materiel', materielSchema);
