// Validation de TOOL-27 (liste et filtres des réservations) : node scripts/demo-liste.js [URL_API]
const BASE = process.argv[2] || 'http://localhost:3000/api';
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
  const magasins = (await call('GET', '/magasins', T.admin)).body.magasins;
  const nord = magasins.find((m) => m.nom === 'Magasin Safi Nord');
  const est = magasins.find((m) => m.nom === 'Magasin Safi Est');
  const perc = (await call('GET', '/materiels?limit=100', T.admin)).body.materiels.find((m) => m.reference === 'PERC-01');
  if (!nord || !est || !perc) throw new Error('Magasins Nord / Est ou matériel PERC-01 introuvable');
  await call('PATCH', `/materiels/${perc._id}/remise-en-service`, T.gest);

  // Une réservation de référence, sur un jour libre
  const baseDe = (j) => { const d = new Date(Date.now() + j * 86400e3); d.setUTCHours(9, 0, 0, 0); return d; };
  const libre = async (j) => (await call('GET', `/reservations/disponibilite?magasin=${nord._id}&materiel=${perc._id}&dateDebut=${encodeURIComponent(baseDe(j).toISOString())}&dureeHeures=2`, T.util)).body.disponible === true;
  let jours = 5 + Math.floor(Math.random() * 3000);
  while (!(await libre(jours))) jours += 1;
  const debut = baseDe(jours);
  const at = (h) => new Date(debut.getTime() + h * 3600e3).toISOString();
  const cree = await call('POST', '/reservations', T.util, { magasin: nord._id, materiel: perc._id, dateDebut: at(0), dureeHeures: 2 });
  if (cree.status !== 201) throw new Error(`Création de la réservation de référence impossible (${cree.status})`);
  const id = cree.body.reservation._id;

  // Fenêtre étroite autour de la réservation de référence, pour la retrouver quelle que soit la page
  const fenetre = `du=${encodeURIComponent(at(-1))}&au=${encodeURIComponent(at(3))}`;
  const liste = (token, filtres = '') => call('GET', `/reservations?${filtres}`, token);
  const contient = (r) => (r.body.reservations || []).some((x) => x._id === id);
  const toutes = (r, test) => (r.body.reservations || []).every(test);

  console.log('\n--- Droits ---');
  check('sans token', (await liste(null)).status, 401);
  check('un utilisateur ne liste pas', (await liste(T.util)).status, 403);

  console.log('\n--- Isolation entre magasins ---');
  const gNord = await liste(T.gest, fenetre);
  check('gestionnaire Nord : voit la réservation de son magasin', [gNord.status, contient(gNord)], [200, true]);
  const gNordTout = await liste(T.gest, 'limit=100');
  check('gestionnaire Nord : toutes les réservations sont du Nord', toutes(gNordTout, (x) => String(x.magasin) === nord._id), true);
  const gEst = await liste(T.gest2, `${fenetre}&limit=100`);
  check('gestionnaire Est : ne voit PAS la réservation du Nord', [gEst.status, contient(gEst)], [200, false]);
  check('gestionnaire Est : aucune réservation du Nord', toutes(await liste(T.gest2, 'limit=100'), (x) => String(x.magasin) !== nord._id), true);
  check('gestionnaire Est vise le magasin Nord', (await liste(T.gest2, `magasin=${nord._id}`)).status, 403);
  check('gestionnaire Est filtre sur un matériel du Nord : rien', (await liste(T.gest2, `materiel=${perc._id}`)).body.reservations.length, 0);

  console.log('\n--- Admin ---');
  check('admin : voit la réservation', contient(await liste(T.admin, fenetre)), true);
  check('admin ?magasin=Nord : la voit', contient(await liste(T.admin, `${fenetre}&magasin=${nord._id}`)), true);
  check('admin ?magasin=Est : ne la voit pas', contient(await liste(T.admin, `${fenetre}&magasin=${est._id}`)), false);

  console.log('\n--- Filtres (seuls, puis combinés) ---');
  check('filtre statut=CONFIRMEE', contient(await liste(T.gest, `${fenetre}&statut=CONFIRMEE`)), true);
  check('filtre statut=TERMINEE : exclut la réservation', contient(await liste(T.gest, `${fenetre}&statut=TERMINEE`)), false);
  const rTerm = await liste(T.gest, 'statut=TERMINEE&limit=100');
  check('statut=TERMINEE : toutes ont ce statut', toutes(rTerm, (x) => x.statut === 'TERMINEE'), true);
  check('filtre matériel', contient(await liste(T.gest, `${fenetre}&materiel=${perc._id}`)), true);
  check('période après la réservation : exclue', contient(await liste(T.gest, `du=${encodeURIComponent(at(5))}&au=${encodeURIComponent(at(9))}`)), false);
  check('période chevauchant seulement la fin : incluse', contient(await liste(T.gest, `du=${encodeURIComponent(at(1))}&au=${encodeURIComponent(at(8))}`)), true);
  check('filtres combinés (matériel + statut + période)', contient(await liste(T.gest, `${fenetre}&materiel=${perc._id}&statut=CONFIRMEE`)), true);
  check('filtres combinés, un critère faux : exclue', contient(await liste(T.gest, `${fenetre}&materiel=${perc._id}&statut=ANNULEE`)), false);

  console.log('\n--- Données renvoyées et validation ---');
  const ref = (gNord.body.reservations || []).find((x) => x._id === id) || {};
  check('matériel et emprunteur lisibles', [ref.materiel && ref.materiel.reference, ref.utilisateur && ref.utilisateur.email], ['PERC-01', 'util@toolshare.ma']);
  check('aucun mot de passe dans la réponse', JSON.stringify(gNord.body).includes('motDePasse'), false);
  const p = await liste(T.gest, 'limit=1');
  check('pagination limit=1', [p.body.reservations.length, p.body.pagination.limit], [1, 1]);
  check('limit trop grand', (await liste(T.gest, 'limit=500')).status, 400);
  check('statut inconnu', (await liste(T.gest, 'statut=XXX')).status, 400);
  check('identifiant de matériel invalide', (await liste(T.gest, 'materiel=abc')).status, 400);
  check('date invalide', (await liste(T.gest, 'du=demain')).status, 400);
  check('du postérieur à au', (await liste(T.gest, `du=${encodeURIComponent(at(5))}&au=${encodeURIComponent(at(1))}`)).status, 400);

  console.log(`\nRésultat : ${ok} OK, ${ko} KO`);
  process.exit(ko === 0 ? 0 : 1);
})().catch((e) => { console.error('ERREUR :', e.message); process.exit(2); });
