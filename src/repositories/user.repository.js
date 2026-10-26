const User = require('../models/user.model');

async function create(data, session = null) {
  const user = new User(data);
  return user.save({ session });
}

function findById(id) {
  return User.findById(id);
}

// Le mot de passe haché est exclu par défaut (select: false) : on le demande explicitement.
function findByEmailWithPassword(email) {
  return User.findOne({ email: String(email).trim().toLowerCase() }).select('+motDePasse');
}

module.exports = { create, findById, findByEmailWithPassword };
