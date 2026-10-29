const materielService = require('../services/materiel.service');

async function list(req, res) {
  res.json(await materielService.list(req.user, req.query));
}

async function getById(req, res) {
  res.json({ materiel: await materielService.getById(req.user, req.params.id) });
}

async function declareUnavailable(req, res) {
  res.json({ materiel: await materielService.declareUnavailable(req.user, req.params.id) });
}

async function putBackInService(req, res) {
  res.json({ materiel: await materielService.putBackInService(req.user, req.params.id) });
}

module.exports = { list, getById, declareUnavailable, putBackInService };
