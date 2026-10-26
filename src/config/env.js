require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/toolshare',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};

env.isProduction = env.nodeEnv === 'production';

// Sans secret, impossible de signer ni de vérifier un JWT : on échoue dès le démarrage.
if (!env.jwtSecret && env.nodeEnv !== 'test') {
  throw new Error('JWT_SECRET est manquant : vérifiez votre fichier .env');
}

module.exports = env;
