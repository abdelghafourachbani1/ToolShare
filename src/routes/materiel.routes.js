const express = require('express');
const router = express.Router();
const { verifyToken, checkRole, verifyManagerStore } = require('../middlewares/auth.middleware');

const materielController = require('../controllers/materiel.controller');

router.post('/',verifyToken,checkRole('gestionnaire', 'admin'),verifyManagerStore,materielController.creerMateriel);

module.exports = router;