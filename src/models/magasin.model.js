const mongoose = require('mongoose');

const magasinSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true, maxlength: 100 },
    localisation: { type: String, trim: true, default: '', maxlength: 200 },
    // Pas de suppression physique : on désactive pour conserver l'historique.
    actif: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Nom unique, sans tenir compte des majuscules ("Magasin A" = "magasin a").
magasinSchema.index({ nom: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

module.exports = mongoose.model('Magasin', magasinSchema);
