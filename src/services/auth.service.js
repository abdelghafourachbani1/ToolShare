const userRepository = require('../repositories/user.repository');
const { comparePassword, DUMMY_HASH } = require('../utils/password');
const { signToken, verifyToken } = require('../utils/token');
const AppError = require('../utils/AppError');

async function login(body) {
  const { email, motDePasse } = body || {};
  if (typeof email !== 'string' || !email.trim() || typeof motDePasse !== 'string' || !motDePasse) {
    throw new AppError(400, 'Email et mot de passe requis');
  }

  const user = await userRepository.findByEmailWithPassword(email);
  const passwordOk = await comparePassword(motDePasse, user ? user.motDePasse : DUMMY_HASH);

  // Même message pour "email inconnu" et "mauvais mot de passe" : on ne révèle rien.
  if (!user || !passwordOk) throw new AppError(401, 'Email ou mot de passe incorrect');
  if (!user.actif) throw new AppError(403, 'Compte désactivé');

  return { token: signToken(user), user };
}

async function getUserFromToken(token) {
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, 'Token invalide ou expiré');
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new AppError(401, 'Utilisateur introuvable');
  if (!user.actif) throw new AppError(403, 'Compte désactivé');
  return user;
}

module.exports = { login, getUserFromToken };
