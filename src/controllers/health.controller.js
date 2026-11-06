const healthService = require('../services/health.service');

function getHealth(_req, res) {
  const health = healthService.getHealth();
  const httpStatus = health.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(health);
}

module.exports = { getHealth };