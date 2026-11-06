// Parcours de démonstration ToolShare : node scripts/demo.js [URL_API]
// Rejoue les règles métier principales et affiche OK / KO pour chaque vérification.
const BASE = process.argv[2] || 'http://localhost:3001/api';
const COMPTES = {
  admin: ['admin1@toolshare.ma', 'Admin1234!'],
  util: ['util@toolshare.ma', 'User1234!'],
  gest: ['gest@toolshare.ma', 'Gest1234!'],
  gest2: ['gest2@toolshare.ma', 'Gest1234!'],
};

let ok = 0;
let ko = 0;

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

function check(label, got, want) {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  if (pass) ok += 1; else ko += 1;
  console.log(`${pass ? 'OK ' : 'KO '} ${label.padEnd(66)} ${JSON.stringify(got)}${pass ? '' : `  (attendu ${JSON.stringify(want)})`}`);
}

(async () => {
  const T = {};
  for (const [nom, [email, motDePasse]] of Object.entries(COMPTES)) {
    const r = await call('POST', '/auth/login', null, { email, motDePasse });
    if (!r.body.token) throw new Error(`Connexion impossible pour ${email} (${r.status}) : ${JSON.stringify(r.body)}`);
    T[nom] = r.body.token;
  }
  const nord = (await call('GET', '/magasins', T.admin)).body.magasins.find((m) => m.nom === 'Magasin Safi Nord');
  const perc = (await call('GET', '/materiels?limit=100', T.admin)).body.materiels.find((m) => m.reference === 'PERC-01');
  if (!nord || !perc) throw new Error('Magasin Safi Nord ou matériel PERC-01 introuvable');
  await call('PATCH', `/materiels/${perc._id}/remise-en-service`, T.gest);

  // Cherche un jour futur où le matériel est libre : le script peut être relancé à volonté.
  const baseDe = (jours) => {
    const d = new Date(Date.now() + jours * 86400e3);
    d.setUTCHours(9, 0, 0, 0);
    return d;
  };
  const creneauLibre = async (jours, h) => {
    const debut = new Date(baseDe(jours).getTime() + h * 3600e3).toISOString();
    const r = await call('GET', `/reservations/disponibilite?magasin=${nord._id}&materiel=${perc._id}&dateDebut=${encodeURIComponent(debut)}&dureeHeures=3`, T.util);
    return r.body.disponible === true;
  };
  let jours = 5 + Math.floor(Math.random() * 3000);
  while (!(await creneauLibre(jours, 0)) || !(await creneauLibre(jours, 10))) jours += 1;
  const base = baseDe(jours);
  const at = (h) => new Date(base.getTime() + h * 3600e3).toISOString();
  const reserver = (token, h, duree) =>
    call('POST', '/reservations', token, { magasin: nord._id, materiel: perc._id, dateDebut: at(h), dureeHeures: duree });
  const patch = (token, id, action, body) => call('PATCH', `/reservations/${id}/${action}`, token, body || {});

  console.log('\n--- Droits et validation ---');
  check('sans token', (await call('POST', '/reservations', null, {})).status, 401);
  check('un gestionnaire ne réserve pas', (await reserver(T.gest, 0, 1)).status, 403);
  check('un admin ne réserve pas', (await reserver(T.admin, 0, 1)).status, 403);
  check('durée nulle', (await reserver(T.util, 0, 0)).status, 400);
  check('début dans le passé', (await call('POST', '/reservations', T.util, { magasin: nord._id, materiel: perc._id, dateDebut: '2020-01-01T09:00:00Z', dureeHeures: 1 })).status, 400);

  console.log('\n--- Réservation, fin calculée, chevauchements ---');
  const r1 = await reserver(T.util, 0, 2);
  check('réservation 09:00 pendant 2 h', r1.status, 201);
  check('date de fin calculée = 11:00', r1.body.reservation && r1.body.reservation.dateFin, at(2));
  check('chevauchement partiel refusé', (await reserver(T.util, 1, 2)).status, 409);
  const r2 = await reserver(T.util, 2, 1);
  check('créneau contigu (11:00) accepté', r2.status, 201);
  const dispo = (h) => call('GET', `/reservations/disponibilite?magasin=${nord._id}&materiel=${perc._id}&dateDebut=${encodeURIComponent(at(h))}&dureeHeures=1`, T.util);
  check('disponibilité : créneau occupé', (await dispo(1)).body.disponible, false);
  check('disponibilité : créneau libre', (await dispo(20)).body.disponible, true);

  console.log('\n--- Concurrence : 15 demandes simultanées sur le même créneau ---');
  const rafale = await Promise.all(Array.from({ length: 15 }, () => reserver(T.util, 10, 3)));
  check('une seule réservation créée', rafale.filter((r) => r.status === 201).length, 1);
  check('les 14 autres refusées (409)', rafale.filter((r) => r.status === 409).length, 14);

  console.log('\n--- Remise du matériel ---');
  const id1 = r1.body.reservation._id;
  const id2 = r2.body.reservation._id;
  check('un utilisateur ne remet pas', (await patch(T.util, id1, 'remise')).status, 403);
  check('gestionnaire d\'un autre magasin', (await patch(T.gest2, id1, 'remise')).status, 403);
  const remise = await patch(T.gest, id1, 'remise');
  check('remise par le gestionnaire du magasin', remise.status, 200);
  check('statut EN_COURS + date de sortie', [remise.body.reservation.statut, !!remise.body.reservation.dateSortieReelle], ['EN_COURS', true]);
  check('remise déjà faite', (await patch(T.gest, id1, 'remise')).status, 409);
  check('matériel déjà emprunté : pas de remise à un autre', (await patch(T.gest, id2, 'remise')).status, 409);

  console.log('\n--- Retour du matériel ---');
  check('retour sans état constaté', (await patch(T.gest, id1, 'retour')).status, 400);
  const retour = await patch(T.gest, id1, 'retour', { etatConstate: 'ENDOMMAGE' });
  check('retour du matériel endommagé', retour.status, 200);
  check('statut TERMINEE + date de retour', [retour.body.reservation.statut, !!retour.body.reservation.dateRetourReelle], ['TERMINEE', true]);
  const apres = (await call('GET', `/materiels/${perc._id}`, T.gest)).body.materiel;
  check('le matériel endommagé devient indisponible', apres.disponible, false);
  check('on ne peut plus le réserver', (await reserver(T.util, 30, 1)).status, 409);
  check('remise en service par le gestionnaire', (await call('PATCH', `/materiels/${perc._id}/remise-en-service`, T.gest)).status, 200);
  check('la remise suivante devient possible', (await patch(T.gest, id2, 'remise')).status, 200);
  check('retour en bon état', (await patch(T.gest, id2, 'retour', { etatConstate: 'BON' })).status, 200);

  console.log(`\nRésultat : ${ok} OK, ${ko} KO`);
  process.exit(ko === 0 ? 0 : 1);
})().catch((e) => { console.error('ERREUR :', e.message); process.exit(2); });
