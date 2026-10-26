// Point d'entrée de toutes les routes de l'API, montées sous /api.
const { Router } = require('express');
const healthRoutes = require('./health.routes');
const installationRoutes = require('./installation.routes');
const authRoutes = require('./auth.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/installation', installationRoutes);
router.use('/auth', authRoutes);

module.exports = router;
