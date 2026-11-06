const authService = require('../services/auth.service');
const AppError = require('../utils/AppError');

// Vérifie le JWT (header "Authorization: Bearer <token>") et place l'utilisateur dans req.user.
async function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Token manquant');

  req.user = await authService.getUserFromToken(token);
  next();
}

module.exports = authenticate;
