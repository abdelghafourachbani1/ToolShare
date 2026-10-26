const User = require('../models/user.model');

async function create(data, session = null) {
  const user = new User(data);
  return user.save({ session });
}

function findById(id) {
  return User.findById(id);
}

function findByEmailWithPassword(email) {
  return User.findOne({ email: String(email).trim().toLowerCase() }).select('+motDePasse');
}

function findAll(filter = {}) {
  return User.find(filter).sort({ createdAt: -1 });
}

function updateById(id, data) {
  return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
}

module.exports = { create, findById, findByEmailWithPassword, findAll, updateById };
