// Point d'entrée de toutes les routes de l'API, montées sous /api.
const { Router } = require('express');
const healthRoutes = require('./health.routes');
const installationRoutes = require('./installation.routes');
const authRoutes = require('./auth.routes');
const magasinRoutes = require('./magasin.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/installation', installationRoutes);
router.use('/auth', authRoutes);
router.use('/magasins', magasinRoutes);

// Routes à ajouter au fil des tickets :
// router.use('/users', userRoutes);                // TOOL-16
// router.use('/materiels', materielRoutes);        // TOOL-20
// router.use('/reservations', reservationRoutes);  // TOOL-24

module.exports = router;
