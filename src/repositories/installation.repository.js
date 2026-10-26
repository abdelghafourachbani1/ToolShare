const Installation = require('../models/installation.model');

function find(session = null) {
  return Installation.findById(Installation.INSTALLATION_ID).session(session).lean();
}

async function create(session) {
  const installation = new Installation();
  return installation.save({ session });
}

module.exports = { find, create };
