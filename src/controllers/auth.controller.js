const authService = require('../services/auth.service');

async function login(req, res) {
  const { token, user } = await authService.login(req.body);
  res.json({ token, user });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
