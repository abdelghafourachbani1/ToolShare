# ToolShare — API de gestion de réservation de matériel industriel

## 1. Présentation du projet

**ToolShare** est une API REST développée avec Node.js, Express et MongoDB. Elle permet de gérer la réservation et le suivi du matériel industriel disponible dans plusieurs magasins.

L'objectif est de faciliter la gestion des équipements, de contrôler leur disponibilité et d'assurer le suivi des réservations, des remises et des retours.

Le projet est développé dans le cadre d'un travail collaboratif.

## 2. Technologies utilisées

| Technologie | Utilisation |
|---|---|
| Node.js | Environnement d'exécution JavaScript |
| Express.js | Création de l'API REST |
| MongoDB | Base de données NoSQL |
| Mongoose | Modélisation et interaction avec MongoDB |
| JWT | Authentification |
| bcryptjs | Hachage des mots de passe |
| Docker | Conteneurisation |
| Docker Compose | Orchestration des services |
| Postman | Tests des endpoints API |
| ESLint | Vérification de la qualité du code |

## 3. Architecture du projet

Le projet adopte une architecture en couches afin de séparer les responsabilités.

```text
ToolShare/
│
├── src/
│   ├── config/          # Configuration de la base de données et environnement
│   ├── controllers/    # Gestion des requêtes HTTP
│   ├── middlewares/    # Authentification et autorisation
│   ├── models/         # Modèles Mongoose
│   ├── repositories/   # Accès aux données
│   ├── routes/         # Définition des endpoints
│   ├── services/       # Logique métier
│   ├── utils/          # Fonctions utilitaires
│   ├── app.js          # Configuration Express
│   └── server.js       # Démarrage du serveur
│
├── scripts/            # Scripts de démonstration et de test
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## 4. Gestion des rôles

L'application utilise trois rôles :

### ADMIN
- Gérer les magasins.
- Créer et gérer les comptes utilisateurs et gestionnaires.
- Affecter les gestionnaires aux magasins.
- Administrer les ressources de la plateforme.

### GESTIONNAIRE
- Gérer les matériels de son magasin.
- Créer des comptes utilisateurs.
- Consulter et gérer les réservations de son magasin.
- Effectuer la remise et le retour du matériel.
- Suivre l'état des équipements.

### UTILISATEUR
- Consulter les magasins et les matériels disponibles.
- Effectuer des réservations.
- Consulter ses propres réservations.
- Annuler une réservation selon les règles métier.

## 5. Fonctionnalités principales

### Authentification et sécurité
- Connexion avec JWT.
- Hachage sécurisé des mots de passe.
- Consultation du profil connecté.
- Protection des routes selon les rôles.

### Gestion des magasins
- Création et consultation des magasins.
- Modification des informations.
- Désactivation des magasins.

### Gestion des comptes
- Création des comptes selon les permissions.
- Gestion des rôles.
- Affectation des gestionnaires aux magasins.

### Gestion du matériel
- Création et modification des matériels.
- Consultation des disponibilités.
- Gestion de l'état des équipements.

### Gestion des réservations
- Création d'une réservation.
- Vérification de la disponibilité du matériel.
- Contrôle des chevauchements horaires.
- Prévention des doubles réservations simultanées.
- Annulation des réservations selon les règles métier.
- Consultation des réservations avec filtres et pagination.

### Remise et retour
- Enregistrement de la remise du matériel.
- Suivi des réservations en cours.
- Enregistrement du retour et de l'état du matériel.
- Gestion du matériel endommagé.

## 6. Installation et lancement

### Prérequis

Avant de commencer, il faut disposer de :
- Git
- Node.js et npm
- Docker
- Docker Compose

### Cloner le projet

```bash
git clone https://github.com/abdelghafourachbani1/ToolShare.git

cd ToolShare
```

### Configuration de l'environnement

Créer le fichier `.env` à partir du fichier d'exemple :

```bash
cp .env.example .env
```

Configurer les variables d'environnement nécessaires selon le fichier `.env.example` et la configuration du projet.

**Important :** ne jamais partager ou versionner les secrets contenus dans `.env`.

### Lancement avec Docker Compose

```bash
docker compose up --build
```

Pour lancer les services en arrière-plan :

```bash
docker compose up -d --build
```

Pour consulter les logs :

```bash
docker compose logs -f
```

Pour arrêter les services :

```bash
docker compose down
```

## 7. Lancement en développement sans Docker

Installer les dépendances :

```bash
npm install
```

Lancer le serveur en mode développement :

```bash
npm run dev
```

Lancer le serveur en mode production :

```bash
npm start
```

## 8. API et authentification

L'API utilise le préfixe :

```text
/api
```

Les endpoints protégés nécessitent un token JWT transmis dans l'en-tête HTTP :

```http
Authorization: Bearer <TOKEN>
```

Le token est obtenu après authentification.

L'API comprend notamment les fonctionnalités d'authentification, de gestion des utilisateurs, des magasins, du matériel et des réservations.

Pour consulter les routes exactes, se référer aux fichiers présents dans `src/routes/`.

## 9. Tests de l'API

Les tests fonctionnels de l'API sont réalisés avec **Postman**.

Les scénarios de test couvrent notamment :
- L'authentification.
- Les accès selon les rôles.
- La gestion des magasins et des matériels.
- La création et l'annulation des réservations.
- La disponibilité du matériel.
- La remise et le retour des équipements.
- La gestion des accès interdits.

Des scripts de démonstration sont également disponibles :

```bash
npm run demo
```

```bash
npm run demo:liste
```

## 10. Qualité du code

Le projet utilise ESLint pour analyser le code source.

Exécuter :

```bash
npm run lint
```

Pour appliquer les corrections automatiques disponibles :

```bash
npm run lint:fix
```

## 11. Équipe et contexte

**Projet :** ToolShare  
**Type :** API REST de gestion de réservation de matériel industriel  
**Environnement :** Projet collaboratif  
**Technologies principales :** Node.js, Express.js, MongoDB et Docker

---

*ToolShare — Simplifier la gestion et la réservation du matériel industriel.*# ToolShare
