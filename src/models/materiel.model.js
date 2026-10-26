const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema({
    reference: { type: String, required:true,unique: true},
    nom: {type: String,required:true,},
    description: {type: String,},
    magasinId: {type: mongoose.Schema.Types.ObjectId,ref: 'Magasin',required: true},
    statut: {type: String,enum: ['disponible', 'indisponible', 'endommagé'],default: 'disponible'}
}, {
    timestamps: true
});

module.exports = mongoose.model('Materiel', materielSchema);