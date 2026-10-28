const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    utilisateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'utilisateur est obligatoire"]
    },
    materielId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materiel',
        required: [true, "Le matériel est obligatoire"]
    },
    magasinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Magasin',
        required: [true, "Le magasin est obligatoire"]
    },
    dateDebut: {
        type: Date,
        required: [true, "La date de début est obligatoire"],
        validate: {
            validator: function(value) {
                // La date de début ne peut pas être dans le passé (lors de la création)
                if (this.isNew) {
                    return value >= new Date();
                }
                return true;
            },
            message: "La date de début ne peut pas être dans le passé."
        }
    },
    duree: {
        type: Number,
        required: [true, "La durée en heures est obligatoire"],
        min: [0.1, "La durée doit être strictement positive"]
    },
    dateFin: {
        type: Date
    },
    statut: {
        type: String,
        enum: ['confirmée', 'annulée', 'en cours', 'terminée'],
        default: 'confirmée'
    },
    dateReelleSortie: {
        type: Date
    },
    dateReelleRetour: {
        type: Date
    },
    etatRetour: {
        type: String,
        enum: ['bon', 'endommagé', null],
        default: null
    }
}, {
    timestamps: true
});

// Middleware Mongoose (Pre-save) : Calcul automatique de la date de fin
reservationSchema.pre('save', function(next) {
    if (this.dateDebut && this.duree) {
        // Calcul : dateFin = dateDebut + duree (convertie en millisecondes)
        const dureeEnMs = this.duree * 60 * 60 * 1000;
        this.dateFin = new Date(this.getTime ? this.dateDebut.getTime() + dureeEnMs : new Date(this.dateDebut).getTime() + dureeEnMs);
    }
    next();
});

module.exports = mongoose.model('Reservation', reservationSchema);