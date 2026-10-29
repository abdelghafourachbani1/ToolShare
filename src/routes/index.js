// Point d'entrée de toutes les routes de l'API, montées sous /api.
const { Router } = require('express');
const healthRoutes = require('./health.routes');
const installationRoutes = require('./installation.routes');
const authRoutes = require('./auth.routes');
const magasinRoutes = require('./magasin.routes');
const userRoutes = require('./user.routes');
const materielRoutes = require('./materiel.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/installation', installationRoutes);
router.use('/auth', authRoutes);
router.use('/magasins', magasinRoutes);
router.use('/users', userRoutes);
router.use('/materiels', materielRoutes);

// Routes à ajouter au fil des tickets :
// router.use('/reservations', reservationRoutes);  // TOOL-24

module.exports = router;
