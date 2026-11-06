const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  GESTIONNAIRE: 'GESTIONNAIRE',
  UTILISATEUR: 'UTILISATEUR',
});

const STATUTS_RESERVATION = Object.freeze({
  CONFIRMEE: 'CONFIRMEE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE',
});

// Statuts qui occupent le créneau d'un matériel (une réservation annulée le libère).
const STATUTS_ACTIFS = Object.freeze([STATUTS_RESERVATION.CONFIRMEE, STATUTS_RESERVATION.EN_COURS]);

const ETATS_MATERIEL = Object.freeze({
  BON: 'BON',
  ENDOMMAGE: 'ENDOMMAGE',
});

module.exports = { ROLES, STATUTS_RESERVATION, STATUTS_ACTIFS, ETATS_MATERIEL };
