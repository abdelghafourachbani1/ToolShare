const { Router } = require('express');
const magasinController = require('../controllers/magasin.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(authenticate);

// Lecture : tout utilisateur connecté (le service filtre selon le rôle)
router.get('/', magasinController.list);
router.get('/:id', magasinController.getById);

// Écriture : Admin uniquement
router.post('/', authorize(ROLES.ADMIN), magasinController.create);
router.patch('/:id', authorize(ROLES.ADMIN), magasinController.update);
router.patch('/:id/desactiver', authorize(ROLES.ADMIN), magasinController.deactivate);
router.patch('/:id/activer', authorize(ROLES.ADMIN), magasinController.activate);

module.exports = router;
