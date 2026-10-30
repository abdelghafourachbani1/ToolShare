// Fonctions pures de calcul sur les réservations (faciles à tester unitairement).
const MS_PAR_HEURE = 60 * 60 * 1000;

// Date de fin = date de début + durée (en heures).
function calculerDateFin(dateDebut, dureeHeures) {
  return new Date(new Date(dateDebut).getTime() + dureeHeures * MS_PAR_HEURE);
}

// Deux créneaux se chevauchent si chacun commence avant la fin de l'autre.
// Une réservation qui commence EXACTEMENT à la fin de la précédente ne chevauche pas.
function seChevauchent(a, b) {
  return a.dateDebut < b.dateFin && a.dateFin > b.dateDebut;
}

module.exports = { calculerDateFin, seChevauchent, MS_PAR_HEURE };
