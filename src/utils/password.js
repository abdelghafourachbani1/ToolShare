const bcrypt = require('bcryptjs');
const env = require('../config/env');

const hashPassword = (plain) => bcrypt.hash(plain, env.bcryptSaltRounds);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

// Hash factice : permet de faire le même travail de comparaison quand l'email n'existe pas,
// pour qu'un attaquant ne puisse pas deviner quels emails existent d'après le temps de réponse.
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', env.bcryptSaltRounds);

module.exports = { hashPassword, comparePassword, DUMMY_HASH };
