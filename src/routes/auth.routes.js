
const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur avec son email et son mot de passe.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - motDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@toolshare.ma
 *               motDePasse:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email ou mot de passe manquant
 *       401:
 *         description: Email ou mot de passe incorrect
 *       403:
 *         description: Compte désactivé
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     description: Retourne les informations de l'utilisateur associé au token JWT.
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token invalide, expiré ou utilisateur introuvable
 *       403:
 *         description: Compte désactivé
 */
router.get('/me', authenticate, authController.me);

module.exports = router;

