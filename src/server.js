const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function start() {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      logger.info(`ToolShare démarré sur le port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    logger.error('Impossible de démarrer le serveur (connexion MongoDB échouée ?)', err);
    process.exit(1);
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