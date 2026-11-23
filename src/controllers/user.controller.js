const userService = require('../services/user.service');
const profileService = require('../services/profile.service');

async function create(req, res) { const user = await userService.create(req.user, req.body); res.status(201).json({ user }); }
async function list(req, res) { res.json({ users: await userService.list(req.query) }); }
async function getById(req, res) { res.json({ user: await userService.getById(req.params.id) }); }
async function update(req, res) { res.json({ user: await userService.update(req.params.id, req.body) }); }
async function deactivate(req, res) { res.json({ user: await userService.deactivate(req.params.id) }); }
async function activate(req, res) { res.json({ user: await userService.activate(req.params.id) }); }
async function updateProfile(req, res) { res.json({ user: await profileService.update(req.user, req.body) }); }
async function updatePassword(req, res) { await profileService.changePassword(req.user, req.body); res.json({ message: 'Mot de passe modifié' }); }
async function setManagerStore(req, res) { res.json({ user: await userService.assignStore(req.params.id, req.body.magasin) }); }

module.exports = { create, list, getById, update, deactivate, activate, updateProfile, updatePassword, setManagerStore };
