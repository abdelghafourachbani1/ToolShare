const installationRepository = require('../repositories/installation.repository');
const userRepository = require('../repositories/user.repository');
const { runInTransaction } = require('../repositories/transaction');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../utils/constants');
const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validatePayload(body) {
  const { nom, email, motDePasse } = body || {};
  const errors = [];

  if (typeof nom !== 'string' || !nom.trim()) errors.push('nom est requis');
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) errors.push('email invalide');
  if (typeof motDePasse !== 'string' || motDePasse.length < MIN_PASSWORD_LENGTH) {
    errors.push(`motDePasse doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
  }

  if (errors.length > 0) throw new AppError(400, 'Données invalides', errors);
}

async function getStatus() {
  const installation = await installationRepository.find();
  return { installed: Boolean(installation && installation.installee) };
}

async function install(body) {
  validatePayload(body);
  const { nom, email, motDePasse } = body;
  const motDePasseHache = await hashPassword(motDePasse);

  try {
    // Tout ou rien : si l'une des écritures échoue, aucune donnée n'est conservée.
    return await runInTransaction(async (session) => {
      const existing = await installationRepository.find(session);
      if (existing) throw new AppError(409, "L'application est déjà installée");

      const admin = await userRepository.create(
        { nom, email, motDePasse: motDePasseHache, role: ROLES.ADMIN },
        session
      );
      await installationRepository.create(session);
      return admin;
    });
  } catch (err) {
    // Deux installations simultanées : la seconde est rejetée par la clé unique.
    if (err.code === 11000) throw new AppError(409, "L'application est déjà installée");
    throw err;
  }
}

module.exports = { getStatus, install };
