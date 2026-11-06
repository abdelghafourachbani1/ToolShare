
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'ToolShare API',
      version: '1.0.0',
      description: `
        API REST de gestion de matériel et de réservations.

        ToolShare permet de gérer les magasins, les utilisateurs,
        les matériels et les réservations.
      `,
    },

    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Serveur local de développement',
      },
    ],

    tags: [
      { name: 'Health', description: 'État de santé de l’API' },
      { name: 'Installation', description: 'Installation initiale de l’application' },
      { name: 'Authentification', description: 'Connexion et profil utilisateur' },
      { name: 'Utilisateurs', description: 'Gestion des utilisateurs' },
      { name: 'Magasins', description: 'Gestion des magasins' },
      { name: 'Matériels', description: 'Consultation et disponibilité du matériel' },
      { name: 'Réservations', description: 'Gestion des réservations, remises et retours' },
    ],

    
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Saisir le token JWT obtenu après connexion.',
    },
  },

  schemas: {
    User: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          example: '672a12345678901234567890',
        },
        nom: {
          type: 'string',
          example: 'Fatima',
        },
        email: {
          type: 'string',
          example: 'admin@toolshare.ma',
        },
        role: {
          type: 'string',
          enum: ['ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'],
        },
        actif: {
          type: 'boolean',
          example: true,
        },
        magasin: {
          type: 'string',
          nullable: true,
        },
      },
    },
  },
},

  },

  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
