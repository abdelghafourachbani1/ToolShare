const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
    // Ne sort jamais dans les requêtes par défaut (select: false) ni dans les réponses JSON
    motDePasse: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    actif: { type: Boolean, default: true },
    // Obligatoire pour un gestionnaire, absent pour les autres rôles
    magasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      default: null,
      required: [
        function () {
          return this.role === ROLES.GESTIONNAIRE;
        },
        'Un gestionnaire doit être affecté à un magasin',
      ],
    },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.motDePasse;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
