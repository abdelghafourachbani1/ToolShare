const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(authenticate);

// Création : Admin et gestionnaire. Le service limite les rôles que chacun peut attribuer.
router.post('/', authorize(ROLES.ADMIN, ROLES.GESTIONNAIRE), userController.create);

// Consultation, modification, désactivation : Admin uniquement
router.get('/', authorize(ROLES.ADMIN), userController.list);
router.get('/:id', authorize(ROLES.ADMIN), userController.getById);
router.patch('/:id', authorize(ROLES.ADMIN), userController.update);
router.patch('/:id/desactiver', authorize(ROLES.ADMIN), userController.deactivate);
router.patch('/:id/activer', authorize(ROLES.ADMIN), userController.activate);

module.exports = router;
