const { Router } = require('express');
const installationController = require('../controllers/installation.controller');

const router = Router();

router.get('/status', installationController.getStatus);
router.post('/', installationController.install);

module.exports = router;
