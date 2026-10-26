// Un identifiant MongoDB valide fait 24 caractères hexadécimaux.
// Vérifié avant toute requête pour répondre 400 (et non 500) à un identifiant mal formé.
const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

module.exports = { isValidObjectId };
