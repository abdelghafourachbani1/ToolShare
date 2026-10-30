const { Router } = require('express');
const reservationController = require('../controllers/reservation.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(authenticate);

// Réserver et vérifier une disponibilité : rôle UTILISATEUR
router.get('/disponibilite', authorize(ROLES.UTILISATEUR), reservationController.verifierDisponibilite);
router.post('/', authorize(ROLES.UTILISATEUR), reservationController.creer);

// Remise et retour du matériel : gestionnaire du magasin concerné
router.patch('/:id/remise', authorize(ROLES.GESTIONNAIRE), reservationController.remettre);
router.patch('/:id/retour', authorize(ROLES.GESTIONNAIRE), reservationController.retourner);

module.exports = router;
