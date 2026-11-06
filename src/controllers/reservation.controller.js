const reservationService = require('../services/reservation.service');
const reservationQueryService = require('../services/reservation.query.service');

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

async function lister(req, res) {
  res.json(await reservationQueryService.lister(req.user, req.query));
}

module.exports = { creer, verifierDisponibilite, remettre, retourner, lister };
