const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../utils/constants');
const mouvementService = require('../services/mouvement.service');

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.GESTIONNAIRE));
router.get('/', async (req, res) => res.json({ mouvements: await mouvementService.list(req.user, req.query) }));
router.get('/retards', async (req, res) => res.json({ emprunts: await mouvementService.list(req.user, { ...req.query, enRetard: 'true' }) }));
module.exports = router;
