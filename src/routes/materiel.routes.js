const { Router } = require('express');
const materielController = require('../controllers/materiel.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../utils/constants');

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN, ROLES.GESTIONNAIRE), materielController.create);
router.get('/', materielController.list);
router.get('/:id', materielController.getById);
router.patch('/:id', authorize(ROLES.GESTIONNAIRE), materielController.update);
router.patch('/:id/desactiver', authorize(ROLES.GESTIONNAIRE), materielController.deactivate);
router.patch('/:id/indisponible', authorize(ROLES.GESTIONNAIRE), materielController.declareUnavailable);
router.patch('/:id/remise-en-service', authorize(ROLES.GESTIONNAIRE), materielController.putBackInService);

module.exports = router;
