const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function start() {
  // Start HTTP first so the health endpoint can report MongoDB failures too.
  server = app.listen(env.port, () => {
    logger.info(`ToolShare démarré sur le port ${env.port} (${env.nodeEnv})`);
  });

  try {
    await connectDB();
  } catch (err) {
    logger.error('Connexion MongoDB échouée; le serveur HTTP reste disponible', err);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} reçu, arrêt en cours...`);
  if (server) server.close();
  await disconnectDB().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
