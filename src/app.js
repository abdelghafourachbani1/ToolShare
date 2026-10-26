const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev', { skip: (req) => req.originalUrl === '/api/health' }));
}

app.use('/api', routes);

// TEMPORAIRE (TOOL-12) : à remplacer par le middleware 404 et le middleware
// global de gestion des erreurs du ticket TOOL-11.
app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) logger.error('Erreur non gérée', err);
  res.status(status).json({
    message: status >= 500 ? 'Erreur interne du serveur' : err.message,
    ...(err.details && { details: err.details }),
  });
});

module.exports = app;
