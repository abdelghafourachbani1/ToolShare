const installationService = require('../services/installation.service');

// Express 5 transmet automatiquement les erreurs des fonctions async au middleware d'erreurs.
async function getStatus(_req, res) {
  res.json(await installationService.getStatus());
}

async function install(req, res) {
  const admin = await installationService.install(req.body);
  res.status(201).json({ message: 'Application installée', admin });
}

module.exports = { getStatus, install };
