const User = require('../models/user.model');
const { comparePassword, hashPassword } = require('../utils/password');
const AppError = require('../utils/AppError');

async function update(user, body = {}) {
  const fields = {};
  if (body.nom !== undefined) {
    if (typeof body.nom !== 'string' || !body.nom.trim()) throw new AppError(400, 'nom est invalide');
    fields.nom = body.nom.trim();
  }
  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) throw new AppError(400, 'email invalide');
    fields.email = body.email.trim().toLowerCase();
  }
  if (!Object.keys(fields).length) throw new AppError(400, 'Aucun champ à modifier');
  try {
    const updated = await User.findByIdAndUpdate(user._id, { $set: fields }, { new: true, runValidators: true });
    return updated;
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Cet email est déjà utilisé');
    throw err;
  }
}

async function changePassword(user, body = {}) {
  const { ancienMotDePasse, nouveauMotDePasse } = body;
  if (typeof ancienMotDePasse !== 'string' || typeof nouveauMotDePasse !== 'string' || nouveauMotDePasse.length < 8) {
    throw new AppError(400, 'Ancien mot de passe requis et nouveau mot de passe de 8 caractères minimum');
  }
  const doc = await User.findById(user._id).select('+motDePasse');
  if (!doc || !(await comparePassword(ancienMotDePasse, doc.motDePasse))) throw new AppError(401, 'Ancien mot de passe incorrect');
  doc.motDePasse = await hashPassword(nouveauMotDePasse);
  await doc.save();
}

module.exports = { update, changePassword };
