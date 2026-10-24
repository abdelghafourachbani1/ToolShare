const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', routes);


module.exports = app;