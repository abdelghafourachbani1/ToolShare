const mongoose = require('mongoose');

// Document unique : l'_id fixe garantit qu'une seule installation peut exister,
// même si deux requêtes arrivent en même temps (clé dupliquée => la seconde échoue).
const INSTALLATION_ID = 'toolshare';

const installationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: INSTALLATION_ID },
    installee: { type: Boolean, required: true, default: true },
    dateInstallation: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Installation', installationSchema);
module.exports.INSTALLATION_ID = INSTALLATION_ID;
