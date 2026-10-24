const healthRepository = require('../repositories/health.repository');

function getHealth() {
  const database = healthRepository.getDatabaseState();

  return {
    status: database === 'connected' ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  };
}

module.exports = { getHealth };