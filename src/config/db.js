const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB déconnecté'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnecté'));

  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
  logger.info(`MongoDB connecté : ${mongoose.connection.host}/${mongoose.connection.name}`);
}

async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('Connexion MongoDB fermée');
}

module.exports = { connectDB, disconnectDB };