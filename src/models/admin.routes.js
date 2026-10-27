const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

router.patch('/gestionnaires/:userId/magasin',verifyToken,checkRole('admin'),userController.updateManagerStore);

module.exports = router;