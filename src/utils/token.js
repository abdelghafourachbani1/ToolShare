const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Le token ne contient que l'identifiant (sub) et le rôle.
// Le compte est rechargé en base à chaque requête : une désactivation est donc immédiate.
function signToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user._id),
    expiresIn: env.jwtExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
