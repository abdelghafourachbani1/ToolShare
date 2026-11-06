// Couche REPOSITORY : seule couche autorisée à accéder aux données (MongoDB / Mongoose).
const mongoose = require('mongoose');

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

function getDatabaseState() {
  return READY_STATES[mongoose.connection.readyState] || 'unknown';
}

module.exports = { getDatabaseState };