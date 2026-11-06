const magasinService = require('../services/magasin.service');

async function create(req, res) {
  const magasin = await magasinService.create(req.body);
  res.status(201).json({ magasin });
}

async function list(req, res) {
  const magasins = await magasinService.list(req.user, req.query);
  res.json({ magasins });
}

async function getById(req, res) {
  res.json({ magasin: await magasinService.getById(req.user, req.params.id) });
}

async function update(req, res) {
  res.json({ magasin: await magasinService.update(req.params.id, req.body) });
}

async function deactivate(req, res) {
  res.json({ magasin: await magasinService.deactivate(req.params.id) });
}

async function activate(req, res) {
  res.json({ magasin: await magasinService.activate(req.params.id) });
}

module.exports = { create, list, getById, update, deactivate, activate };
