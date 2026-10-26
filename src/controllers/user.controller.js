const userService = require('../services/user.service');

async function create(req, res) {
  const user = await userService.create(req.user, req.body);
  res.status(201).json({ user });
}

async function list(req, res) {
  res.json({ users: await userService.list(req.query) });
}

async function getById(req, res) {
  res.json({ user: await userService.getById(req.params.id) });
}

async function update(req, res) {
  res.json({ user: await userService.update(req.params.id, req.body) });
}

async function deactivate(req, res) {
  res.json({ user: await userService.deactivate(req.params.id) });
}

async function activate(req, res) {
  res.json({ user: await userService.activate(req.params.id) });
}

module.exports = { create, list, getById, update, deactivate, activate };
