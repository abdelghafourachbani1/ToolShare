const reservationService = require('../services/reservation.service');

async function creer(req, res) {
  const reservation = await reservationService.creer(req.user, req.body);
  res.status(201).json({ reservation });
}

async function verifierDisponibilite(req, res) {
  res.json(await reservationService.verifierDisponibilite(req.query));
}

async function remettre(req, res) {
  res.json({ reservation: await reservationService.remettre(req.user, req.params.id) });
}

async function retourner(req, res) {
  res.json({ reservation: await reservationService.retourner(req.user, req.params.id, req.body) });
}

module.exports = { creer, verifierDisponibilite, remettre, retourner };
