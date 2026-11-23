const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const userController = require('../controllers/user.controller');
const { ROLES } = require('../utils/constants');

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN));
router.patch('/gestionnaires/:id/magasin', userController.setManagerStore);
module.exports = router;
