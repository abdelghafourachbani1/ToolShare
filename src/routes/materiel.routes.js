const express = require('express');
const router = express.Router();
const { verifyToken, checkRole, verifyManagerStore } = require('../middlewares/auth.middleware');
const materielController = require('../controllers/materiel.controller');

router.post('/', verifyToken, checkRole('gestionnaire', 'admin'), verifyManagerStore, materielController.creerMateriel);
router.get('/', verifyToken, materielController.getMateriels);
router.get('/:id', verifyToken, materielController.getMaterielById);
router.put('/:id', verifyToken, checkRole('gestionnaire', 'admin'), verifyManagerStore, materielController.updateMateriel);
router.delete('/:id', verifyToken, checkRole('gestionnaire', 'admin'), verifyManagerStore, materielController.deleteMateriel);

module.exports = router;