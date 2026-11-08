const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const healthController = require('./controllers/health.controller');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev', { skip: (req) => ['/health', '/api/health'].includes(req.path) }));
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Keep /health available for simple local checks; API clients can use /api/health too.
app.get('/health', healthController.getHealth);
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
