// Seul endroit qui connaît les sessions MongoDB : les services demandent
// une transaction sans manipuler Mongoose directement.
const mongoose = require('mongoose');

function runInTransaction(work) {
  return mongoose.connection.transaction(work);
}

module.exports = { runInTransaction };
