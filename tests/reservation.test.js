const test = require('node:test');
const assert = require('node:assert/strict');
const { calculerDateFin, seChevauchent } = require('../src/utils/reservation');

test('calculates reservation end from start and duration', () => {
  const start = new Date('2026-11-01T10:00:00.000Z');
  assert.equal(calculerDateFin(start, 5).toISOString(), '2026-11-01T15:00:00.000Z');
});

test('detects overlapping reservations', () => {
  const existing = { dateDebut: new Date('2026-11-01T08:00:00Z'), dateFin: new Date('2026-11-01T12:00:00Z') };
  const overlapping = { dateDebut: new Date('2026-11-01T10:00:00Z'), dateFin: new Date('2026-11-01T14:00:00Z') };
  assert.equal(seChevauchent(existing, overlapping), true);
});

test('allows a reservation that starts when the previous one ends', () => {
  const existing = { dateDebut: new Date('2026-11-01T08:00:00Z'), dateFin: new Date('2026-11-01T12:00:00Z') };
  const contiguous = { dateDebut: new Date('2026-11-01T12:00:00Z'), dateFin: new Date('2026-11-01T16:00:00Z') };
  assert.equal(seChevauchent(existing, contiguous), false);
});
