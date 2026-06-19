// ── THREE.JS LAZY LOAD ────────────────────────────────────────────────────────
let THREE = null;
async function loadThree() {
  if (!THREE) THREE = await import('./three.js');
}

// ── SCENARIOS ─────────────────────────────────────────────────────────────────
// World coords: X = attack direction (−52=left goal, +52=right goal)
// Z = pitch width   Y = up
// x,z  = CALIBRATED pass-moment position (single source of truth).
// Pre-pass motion converges to (x,z) EXACTLY at passFrame → frozen offside
//   line == last defender x, receiver judged x == receiver.x. No contradiction.
// Motion fields (all optional): app=x approach offset (decays to 0 at pass),
//   appz=z approach, wob=x wobble amp, wobLoops, post=post-pass x speed/frame,
//   postz=post-pass z speed/frame.
// verdict: 'auto' (geometry: receiver.x > lastDef.x+EPS), 'onside', 'offside'.
// isOffside computed once below — feedback always matches the rendered geometry.

const OFFSIDE_EPS = 0.2; // ~shoulder; in-line within EPS = benefit to attacker

const SCENARIOS = [
  {
    id: 1, title: 'Azione 1 – Lancio in profondità', verdict: 'auto',
    explanation: 'Al momento del passaggio l\'attaccante era nettamente oltre l\'ultimo difensore. FUORIGIOCO.',
    players: [
      { role: 'passer',     x:  4, z:  7, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 26.5, z: -6, team: 'attack',  app: -9, appz: 4, post: 5, postz: 0.4 },
      { role: 'defender',   x: 24, z:  5, team: 'defense', isLast: true, app: 5, wob: 1.2, wobLoops: 2 },
      { role: 'defender',   x: 14, z: -4, team: 'defense', app: 4, appz: -2 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: 2 },
    ],
  },
  {
    id: 2, title: 'Azione 2 – Posizione regolare', verdict: 'auto',
    explanation: 'Al momento del passaggio l\'attaccante era chiaramente dietro l\'ultimo difensore. NON in fuorigioco.',
    players: [
      { role: 'passer',     x:  5, z:  6, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 21.5, z: -6, team: 'attack',  app: -8, appz: 3, post: 6, postz: 0.5 },
      { role: 'defender',   x: 24, z:  5, team: 'defense', isLast: true, app: 6, wob: 1.5, wobLoops: 3 },
      { role: 'defender',   x: 14, z: -3, team: 'defense', app: 5 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 3, title: 'Azione 3 – Fuorigioco di un soffio', verdict: 'auto',
    explanation: 'L\'attaccante superava l\'ultimo difensore di una spalla. Qualsiasi parte giocabile del corpo conta. FUORIGIOCO.',
    players: [
      { role: 'passer',     x:  6, z:  7, team: 'attack',  app: -4 },
      { role: 'receiver',   x: 24.9, z: -5, team: 'attack', app: -9, appz: 4, post: 5 },
      { role: 'defender',   x: 24.2, z:  5, team: 'defense', isLast: true, app: 7, wob: 1.8, wobLoops: 3 },
      { role: 'defender',   x: 16, z: -4, team: 'defense', app: 6, appz: 2 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: 2 },
    ],
  },
  {
    id: 4, title: 'Azione 4 – Attaccante in linea', verdict: 'auto',
    explanation: 'L\'attaccante era in linea con il difensore (entro la spalla). In parità: beneficio del dubbio all\'attaccante. NON in fuorigioco.',
    players: [
      { role: 'passer',     x:  5, z:  7, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 24.0, z: -5, team: 'attack', app: -9, appz: 4, post: 5 },
      { role: 'defender',   x: 24.1, z:  4, team: 'defense', isLast: true, app: 8, wob: 2.0, wobLoops: 3 },
      { role: 'defender',   x: 16, z: -3, team: 'defense', app: 6 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 5, title: 'Azione 5 – Due difensori oltre l\'attaccante', verdict: 'onside',
    explanation: 'Due avversari (oltre al portiere) erano più vicini alla linea di porta dell\'attaccante. Servono almeno due avversari davanti: NON in fuorigioco.',
    players: [
      { role: 'passer',     x:  4, z:  8, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 20.5, z: -5, team: 'attack',  app: -8, appz: 3, post: 6 },
      { role: 'defender',   x: 26, z:  4, team: 'defense', app: 5, wob: 1.4, wobLoops: 2 },
      { role: 'defender',   x: 22, z: -4, team: 'defense', isLast: true, app: 6, wob: 1.6, wobLoops: 3 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: 2 },
      { role: 'attacker',   x:  3, z: -9, team: 'attack',  app: -4 },
    ],
  },
  {
    id: 6, title: 'Azione 6 – Solo il portiere rimasto', verdict: 'auto',
    explanation: 'L\'unico difensore di movimento era già dietro l\'attaccante: davanti restava solo il portiere. FUORIGIOCO.',
    players: [
      { role: 'passer',     x:  6, z:  7, team: 'attack',  app: -4 },
      { role: 'receiver',   x: 30.5, z: -5, team: 'attack',  app: -9, appz: 4, post: 6 },
      { role: 'defender',   x: 28, z:  5, team: 'defense', isLast: true, app: 9, wob: 1.5, wobLoops: 2 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 7, title: 'Azione 7 – Contropiede, di un soffio', verdict: 'auto',
    explanation: 'Nel contropiede l\'attaccante che riceve il pallone aveva superato di pochissimo l\'ultimo difensore. FUORIGIOCO.',
    players: [
      { role: 'passer',     x: 10, z:  0, team: 'attack',  app: -6, post: 3 },
      { role: 'receiver',   x: 27.7, z: -8, team: 'attack', app: -10, appz: 5, post: 6, postz: 0.6 },
      { role: 'attacker',   x: 22, z:  5, team: 'attack',  app: -8, post: 4 },
      { role: 'defender',   x: 27.0, z:  3, team: 'defense', isLast: true, app: 4, wob: 1.8, wobLoops: 3 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: 2 },
    ],
  },
  {
    id: 8, title: 'Azione 8 – Due attaccanti, uno oltre la linea', verdict: 'auto',
    explanation: 'L\'attaccante che RICEVE il pallone era oltre l\'ultimo difensore. L\'altro attaccante, regolare, non conta. FUORIGIOCO.',
    players: [
      { role: 'passer',     x:  4, z:  9, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 29.5, z: -5, team: 'attack',  app: -9, appz: 4, post: 5 },
      { role: 'attacker',   x: 19, z:  3, team: 'attack',  app: -7, post: 4 },
      { role: 'defender',   x: 28, z:  5, team: 'defense', isLast: true, app: 6, wob: 1.6, wobLoops: 3 },
      { role: 'defender',   x: 20, z: -5, team: 'defense', app: 5 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 9, title: 'Azione 9 – Deviazione del difensore', verdict: 'onside',
    explanation: 'Il difensore ha giocato il pallone volontariamente. Un tocco deliberato di un avversario azzera il fuorigioco. NON in fuorigioco.',
    players: [
      { role: 'passer',     x:  5, z:  7, team: 'attack',  app: -4 },
      { role: 'receiver',   x: 24, z: -5, team: 'attack',  app: -8, appz: 4, post: 5 },
      { role: 'defender',   x: 22, z:  4, team: 'defense', isLast: true, app: 5, wob: 1.4, wobLoops: 2 },
      { role: 'defender',   x: 16, z: -3, team: 'defense', app: 4 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: 2 },
    ],
    isDeflection: true,
  },
  {
    id: 10, title: 'Azione 10 – Attaccante in area piccola', verdict: 'auto',
    explanation: 'L\'attaccante era già nell\'area piccola, davanti a tutti i difensori, al momento del passaggio. FUORIGIOCO.',
    players: [
      { role: 'passer',     x: -2, z:  9, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 32.5, z:  0, team: 'attack',  app: -10, appz: -3, post: 6 },
      { role: 'defender',   x: 30, z:  5, team: 'defense', isLast: true, app: 8, wob: 1.5, wobLoops: 2 },
      { role: 'defender',   x: 22, z: -5, team: 'defense', app: 6 },
      { role: 'defender',   x: 14, z:  0, team: 'defense', app: 5, appz: 2 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
];

// Derive verdict from geometry → guaranteed consistent with the rendered line.
function computeVerdict(sc) {
  if (sc.verdict === 'onside')  return false;
  if (sc.verdict === 'offside') return true;
  const last = sc.players.find(p => p.isLast);
  const rec  = sc.players.find(p => p.role === 'receiver');
  return rec.x > last.x + OFFSIDE_EPS;
}
SCENARIOS.forEach(sc => {
  sc.isOffside     = computeVerdict(sc);
  sc.lastDefenderX = sc.players.find(p => p.isLast).x;
});

// ── STATE ─────────────────────────────────────────────────────────────────────
const G = {
  qi: 0, score: 0, answers: [],
  frame: 0, totalFrames: 220, passFrame: 80,
  playing: true, speed: 1,
  animId: null, lastT: 0, accMs: 0,
  answered: false,
  frozenOffsideX: null,
};
const MSPF = 1000 / 60;

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const canvas = $('game-canvas');

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
$('tab-login-btn').onclick = () => switchTab('login');
$('tab-reg-btn').onclick   = () => switchTab('reg');
$('btn-guest').onclick     = () => startGame();

$('form-login').addEventListener('submit', e => {
  e.preventDefault();
  const u = $('login-user').value.trim();
  const p = $('login-pass').value;
  const db = JSON.parse(localStorage.getItem('var_users') || '{}');
  if (db[u] && db[u].p === btoa(p)) { startGame(); }
  else { $('login-error').textContent = 'Username o password errati.'; }
});

$('form-register').addEventListener('submit', e => {
  e.preventDefault();
  const u = $('reg-user').value.trim();
  const em = $('reg-email').value.trim();
  const p  = $('reg-pass').value;
  const db = JSON.parse(localStorage.getItem('var_users') || '{}');
  if (db[u]) { $('reg-error').textContent = 'Username già in uso.'; return; }
  db[u] = { email: em, p: btoa(p) };
  localStorage.setItem('var_users', JSON.stringify(db));
  startGame();
});

function switchTab(tab) {
  $('tab-login-btn').classList.toggle('active', tab === 'login');
  $('tab-reg-btn').classList.toggle('active', tab !== 'login');
  $('form-login-wrap').classList.toggle('active', tab === 'login');
  $('form-reg-wrap').classList.toggle('active', tab !== 'login');
  $('login-error').textContent = '';
  $('reg-error').textContent   = '';
}

// ── THREE.JS GAME RENDERER ────────────────────────────────────────────────────
const R = {
  renderer: null, scene: null, camera: null,
  pitch: null, ball: null, offsidePlane: null, offsideLabel: null,
  stickmen: [],   // [{ sm, playerData }]
  passMarker: null, receiverMarker: null,
};

async function initGameScene() {
  await loadThree();

  const cont = canvas.parentElement;
  const W = cont.clientWidth  || 800;
  const H = cont.clientHeight || 440;

  R.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  R.renderer.setSize(W, H);
  R.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  R.renderer.shadowMap.enabled = true;
  R.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  R.renderer.setClearColor(0x07111f);

  R.scene = new THREE.Scene();
  R.scene.fog = new THREE.Fog(0x07111f, 65, 110);

  R.camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 200);

  // Lights
  const ambient = new THREE.AmbientLight(0x334466, 0.8);
  R.scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff5e0, 1.4);
  sun.position.set(20, 40, -30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far  = 120;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top   = 60;
  sun.shadow.camera.bottom = -60;
  R.scene.add(sun);

  const hemi = new THREE.HemisphereLight(0x88aabb, 0x2d5a1b, 0.5);
  R.scene.add(hemi);

  const stadiumLight1 = new THREE.PointLight(0xfff0cc, 0.6, 80);
  stadiumLight1.position.set(-30, 25, -20);
  R.scene.add(stadiumLight1);
  const stadiumLight2 = new THREE.PointLight(0xfff0cc, 0.6, 80);
  stadiumLight2.position.set(40, 25, 20);
  R.scene.add(stadiumLight2);

  // Pitch
  R.pitch = buildPitch();
  R.scene.add(R.pitch);

  // Ball
  R.ball = buildBall();
  R.scene.add(R.ball);

  // Offside plane
  const plGeo = new THREE.PlaneGeometry(72, 5);
  const plMat = new THREE.MeshBasicMaterial({
    color: 0xff2222, transparent: true, opacity: 0, side: THREE.DoubleSide
  });
  R.offsidePlane = new THREE.Mesh(plGeo, plMat);
  R.offsidePlane.rotation.y = Math.PI / 2;
  R.offsidePlane.position.y = 2.5;
  R.scene.add(R.offsidePlane);

  // Offside glow line (thin bright line at base)
  const lineGeo = new THREE.BoxGeometry(0.08, 3.5, 72);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0 });
  R.offsideLineGlow = new THREE.Mesh(lineGeo, lineMat);
  R.offsideLineGlow.position.y = 1.75;
  R.scene.add(R.offsideLineGlow);

  const onResize = () => {
    const c = canvas.parentElement;
    const nW = c.clientWidth, nH = c.clientHeight;
    if (!nW || !nH) return;
    R.renderer.setSize(nW, nH, false);
    R.camera.aspect = nW / nH;
    R.camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 250));

  // Resize whenever the container itself changes size (responsive layouts,
  // entering the game screen, devtools breakpoints). Fixes blank canvas
  // when the renderer was first sized before layout settled.
  if (window.ResizeObserver) {
    R.resizeObs = new ResizeObserver(onResize);
    R.resizeObs.observe(canvas.parentElement);
  }
  R.onResize = onResize;
}

// ── PITCH ─────────────────────────────────────────────────────────────────────
function buildPitch() {
  const g = new THREE.Group();

  // Ground plane with stripes
  const groundGeo = new THREE.PlaneGeometry(104, 72, 8, 1);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x2a7013 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);

  // Alternating stripe effect via 8 sub-planes
  const stripeW = 104 / 8;
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      const sm = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeW - 0.1, 72),
        new THREE.MeshLambertMaterial({ color: 0x267010 })
      );
      sm.rotation.x = -Math.PI / 2;
      sm.position.set(-52 + stripeW * i + stripeW / 2, 0.01, 0);
      g.add(sm);
    }
  }

  const wMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  function addLine(x, y, z, w, h, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wMat);
    m.position.set(x, y, z);
    g.add(m);
  }

  // Outer boundary
  addLine(   0, 0.02,  -36, 104, 0.05, 0.25);  // near sideline
  addLine(   0, 0.02,   36, 104, 0.05, 0.25);  // far sideline
  addLine( -52, 0.02,    0, 0.25, 0.05, 72);   // left goal line
  addLine(  52, 0.02,    0, 0.25, 0.05, 72);   // right goal line
  addLine(   0, 0.02,    0, 0.25, 0.05, 72);   // center line

  // Center circle (32-segment torus)
  const circlePoints = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(a) * 9.15, 0, Math.sin(a) * 9.15));
  }
  const circleCurve = new THREE.CatmullRomCurve3(circlePoints, true);
  const circleTube  = new THREE.TubeGeometry(circleCurve, 64, 0.1, 4, true);
  const circleM     = new THREE.Mesh(circleTube, wMat);
  circleM.position.y = 0.02;
  g.add(circleM);

  // Center dot
  const dotM = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), wMat);
  dotM.position.y = 0.03;
  g.add(dotM);

  // Penalty / goal boxes. Front (vertical) line always faces midfield; the
  // open side sits on the goal line. Mirrored correctly for each goal.
  function box(goalX, depth, halfZ) {
    const dir    = goalX > 0 ? 1 : -1;
    const frontX = goalX - dir * depth;       // inner line, toward center
    const midX   = (goalX + frontX) / 2;
    addLine(midX,   0.02,  halfZ, depth, 0.05, 0.25);   // top side
    addLine(midX,   0.02, -halfZ, depth, 0.05, 0.25);   // bottom side
    addLine(frontX, 0.02,  0,     0.25,  0.05, halfZ * 2); // front line
  }
  box( 52, 16.5, 20.15);  // right penalty area
  box(-52, 16.5, 20.15);  // left penalty area
  box( 52,  5.5,  9.16);  // right 6-yard box
  box(-52,  5.5,  9.16);  // left 6-yard box

  // Penalty spots (11m from goal line)
  const psDot = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 10);
  const l1 = new THREE.Mesh(psDot, wMat); l1.position.set(-41, 0.03, 0); g.add(l1);
  const r1 = new THREE.Mesh(psDot, wMat); r1.position.set( 41, 0.03, 0); g.add(r1);

  // Goals (post + crossbar)
  function addGoal(sideX) {
    const postMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const postR = 0.12;
    const postGeo = new THREE.CylinderGeometry(postR, postR, 2.44, 8);
    const barGeo  = new THREE.CylinderGeometry(postR, postR, 7.32, 8);
    const p1 = new THREE.Mesh(postGeo, postMat); p1.position.set(sideX, 1.22,  3.66); g.add(p1);
    const p2 = new THREE.Mesh(postGeo, postMat); p2.position.set(sideX, 1.22, -3.66); g.add(p2);
    const bar = new THREE.Mesh(barGeo, postMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(sideX, 2.44, 0); g.add(bar);
    // Net (simple grid)
    const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, wireframe: true });
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32), netMat);
    net.position.set(sideX + (sideX > 0 ? 1 : -1), 1.22, 0); g.add(net);
  }
  addGoal( 52);
  addGoal(-52);

  return g;
}

// ── BALL ──────────────────────────────────────────────────────────────────────
function buildBall() {
  const group = new THREE.Group();

  // Main sphere
  const ballMat = new THREE.MeshPhongMaterial({ color: 0xfafafa, shininess: 90 });
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), ballMat);
  ballMesh.castShadow = true;
  group.add(ballMesh);

  // Black pentagon patches via icosahedron overlay
  const patchMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.85 });
  const patchGeo = new THREE.IcosahedronGeometry(0.39, 0);
  const patches  = new THREE.Mesh(patchGeo, patchMat);
  patches.name = 'patches';
  group.add(patches);

  // Shadow on ground
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
  const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  shadowMesh.name = 'shadow';
  group.add(shadowMesh);

  return group;
}

// ── STICKMAN ──────────────────────────────────────────────────────────────────
const COLORS = {
  attack:     0xd63031,
  defense:    0x2d6ab2,
  goalkeeper: 0xe67e22,
  skin:       0xf0c080,
  shorts:     0x111133,
  boots:      0x111111,
};

function buildStickman(team, role) {
  const group = new THREE.Group();
  const jersey = team === 'attack' ? COLORS.attack : role === 'goalkeeper' ? COLORS.goalkeeper : COLORS.defense;
  const jMat   = new THREE.MeshPhongMaterial({ color: jersey, shininess: 40 });
  const sMat   = new THREE.MeshPhongMaterial({ color: COLORS.skin, shininess: 20 });
  const shMat  = new THREE.MeshPhongMaterial({ color: COLORS.shorts });
  const bMat   = new THREE.MeshPhongMaterial({ color: COLORS.boots });

  function cyl(rTop, rBot, h, segs, mat, px, py, pz, rx = 0) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    m.position.set(px, py, pz);
    m.rotation.x = rx;
    m.castShadow = true;
    return m;
  }
  function sph(r, segs, mat, px, py, pz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, segs), mat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    return m;
  }

  // Body
  group.add(cyl(0.165, 0.13, 0.72, 8, jMat, 0, 1.21, 0));
  // Shorts
  group.add(cyl(0.14, 0.12, 0.28, 8, shMat, 0, 0.77, 0));
  // Head
  group.add(sph(0.26, 9, sMat, 0, 1.78, 0));
  // Hair (cap for GK, dark for others)
  const hairMat = new THREE.MeshPhongMaterial({ color: role === 'goalkeeper' ? 0xffaa00 : 0x1a0a00 });
  group.add(sph(0.265, 8, hairMat, 0, 1.93, 0));

  // Shoulders (epaulettes)
  const epMat = new THREE.MeshPhongMaterial({ color: jersey });
  group.add(sph(0.11, 6, epMat, -0.22, 1.45, 0));
  group.add(sph(0.11, 6, epMat,  0.22, 1.45, 0));

  // Arms
  const leftShoulder  = new THREE.Group(); leftShoulder.position.set(-0.22, 1.45, 0);  group.add(leftShoulder);
  const rightShoulder = new THREE.Group(); rightShoulder.position.set( 0.22, 1.45, 0); group.add(rightShoulder);

  const leftForearm  = new THREE.Group(); leftForearm.position.y  = -0.52; leftShoulder.add(leftForearm);
  const rightForearm = new THREE.Group(); rightForearm.position.y = -0.52; rightShoulder.add(rightForearm);

  leftShoulder.add(cyl(0.065, 0.055, 0.55, 5, jMat,  0, -0.26, 0));
  rightShoulder.add(cyl(0.065, 0.055, 0.55, 5, jMat,  0, -0.26, 0));
  leftForearm.add(cyl(0.055, 0.045, 0.45, 5, sMat,  0, -0.22, 0));
  rightForearm.add(cyl(0.055, 0.045, 0.45, 5, sMat,  0, -0.22, 0));

  // Legs
  const leftHip  = new THREE.Group(); leftHip.position.set(-0.11, 0.65, 0);  group.add(leftHip);
  const rightHip = new THREE.Group(); rightHip.position.set( 0.11, 0.65, 0); group.add(rightHip);

  const leftKnee  = new THREE.Group(); leftKnee.position.y  = -0.6; leftHip.add(leftKnee);
  const rightKnee = new THREE.Group(); rightKnee.position.y = -0.6; rightHip.add(rightKnee);

  leftHip.add(cyl(0.095, 0.08, 0.62, 6, jMat,  0, -0.31, 0));
  rightHip.add(cyl(0.095, 0.08, 0.62, 6, jMat,  0, -0.31, 0));
  leftKnee.add(cyl(0.075, 0.06, 0.58, 6, shMat, 0, -0.29, 0));
  rightKnee.add(cyl(0.075, 0.06, 0.58, 6, shMat, 0, -0.29, 0));

  // Boots
  const leftAnkle  = new THREE.Group(); leftAnkle.position.y  = -0.58; leftKnee.add(leftAnkle);
  const rightAnkle = new THREE.Group(); rightAnkle.position.y = -0.58; rightKnee.add(rightAnkle);

  leftAnkle.add(sph(0.085, 6, bMat, 0, 0, 0.06));
  rightAnkle.add(sph(0.085, 6, bMat, 0, 0, 0.06));

  // Team indicator dot above head
  const indicatorColor = team === 'attack' ? 0xff6666 : role === 'goalkeeper' ? 0xffcc44 : 0x6699ee;
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: indicatorColor })
  );
  dot.position.y = 2.18;
  group.add(dot);

  return {
    group,
    leftShoulder, rightShoulder, leftForearm, rightForearm,
    leftHip, rightHip, leftKnee, rightKnee,
    leftAnkle, rightAnkle,
  };
}

// ── STICKMAN ANIMATION ────────────────────────────────────────────────────────
function animateStickman(sm, frame, intensity = 1.0) {
  const t = frame * 0.17;
  const s = intensity;

  const hipSwing  = Math.sin(t) * 0.65 * s;
  const kneeBend  = Math.max(0, Math.sin(t - 0.35)) * 0.85 * s;
  const armSwing  = Math.sin(t) * 0.42 * s;
  const forearmA  = Math.max(0, Math.sin(t + 0.5)) * 0.5 * s;

  sm.leftHip.rotation.x   =  hipSwing;
  sm.rightHip.rotation.x  = -hipSwing;
  sm.leftKnee.rotation.x  =  kneeBend;
  sm.rightKnee.rotation.x =  Math.max(0, Math.sin(t + Math.PI - 0.35)) * 0.85 * s;

  sm.leftShoulder.rotation.x  = -armSwing;
  sm.rightShoulder.rotation.x =  armSwing;
  sm.leftForearm.rotation.x   = -forearmA;
  sm.rightForearm.rotation.x  =  forearmA;

  // Slight body bob
  sm.group.position.y = Math.abs(Math.sin(t * 2)) * 0.045 * s;
}

// ── PLAYER DYNAMIC POSITION ───────────────────────────────────────────────────
// Pre-pass: converge from approach offset → exactly (player.x, player.z) at
// passFrame (conv = 0 there). Wobble also vanishes at pass. Post-pass: run-through.
// Guarantees: position at passFrame == calibrated truth → verdict matches visuals.
const APP_SCALE  = 0.7;   // gentler pre-pass sprint
const POST_CAP   = 45;    // post-pass run lasts ~45 frames then stops
const POST_SCALE = 0.045; // per-frame run-through speed
const PITCH_MAXX = 50;    // keep players inside the pitch
const PITCH_MAXZ = 33;

function getPlayerPos(player, scenario, frame) {
  let x = player.x, z = player.z;
  const pf = G.passFrame;

  if (frame < pf) {
    const prog = frame / pf;          // 0 → 1
    const conv = 1 - prog;            // 1 → 0  (zero at pass → exact truth)
    x += (player.app  || 0) * APP_SCALE * conv;
    z += (player.appz || 0) * APP_SCALE * conv;
    if (player.wob) {
      x += Math.sin(prog * Math.PI * (player.wobLoops || 2)) * player.wob * conv;
    }
  } else {
    const after = Math.min(frame - pf, POST_CAP);
    x += (player.post  || 0) * after * POST_SCALE;
    z += (player.postz || 0) * after * POST_SCALE;
  }

  // Clamp inside pitch so nobody runs off the field.
  x = Math.max(-PITCH_MAXX, Math.min(PITCH_MAXX, x));
  z = Math.max(-PITCH_MAXZ, Math.min(PITCH_MAXZ, z));
  return { x, z };
}

// ── LOAD SCENARIO ─────────────────────────────────────────────────────────────
function loadScenario(idx) {
  const sc = SCENARIOS[idx];
  G.frame = 0; G.playing = true; G.answered = false;
  G.accMs = 0; G.lastT = 0; G.frozenOffsideX = null;

  $('q-num').textContent           = idx + 1;
  $('score').textContent           = G.score;
  $('scenario-title').textContent  = sc.title;
  $('progress-fill').style.width   = ((idx + 1) / 10 * 100) + '%';
  $('feedback-panel').style.display = 'none';
  $('btn-offside').disabled = false;
  $('btn-onside').disabled  = false;
  $('btn-play').textContent = '⏸';

  // Clear old stickmen
  R.stickmen.forEach(({ sm }) => R.scene.remove(sm.group));
  R.stickmen = [];

  // Build new stickmen
  sc.players.forEach(p => {
    const sm = buildStickman(p.team, p.role);
    const pos = getPlayerPos(p, sc, 0);
    sm.group.position.set(pos.x, 0, pos.z);

    // Attackers face right (positive X), defenders face left
    sm.group.rotation.y = p.team === 'attack' ? 0 : Math.PI;

    R.scene.add(sm.group);
    R.stickmen.push({ sm, p });
  });

  // Reposition offside plane off-screen
  R.offsidePlane.material.opacity = 0;
  R.offsideLineGlow.material.opacity = 0;

  // Ball at passer
  const passer = sc.players.find(p => p.role === 'passer');
  R.ball.position.set(passer.x, 0.38, passer.z);

  // Camera positioned for side VAR view
  const midX = (sc.lastDefenderX + sc.players.find(p => p.role === 'passer').x) / 2;
  R.camera.position.set(midX + 3, 11, -52);
  R.camera.lookAt(midX, 1.5, 2);
}

// ── UPDATE (every frame) ──────────────────────────────────────────────────────
function update3D(sc) {
  const frame = G.frame;

  // Update stickmen positions + animation
  R.stickmen.forEach(({ sm, p }) => {
    const pos = getPlayerPos(p, sc, frame);
    sm.group.position.x = pos.x;
    sm.group.position.z = pos.z;

    // Running intensity: sprinters animate hard, the holding last defender less.
    const moving   = (p.app || p.appz || p.post || p.postz);
    const intensity = p.isLast ? 0.55 : moving ? 1.15 : 0.7;
    animateStickman(sm, frame, intensity);

    // Defenders face toward attacker (look left)
    if (p.team === 'defense') {
      sm.group.rotation.y = Math.PI + Math.sin(frame * 0.015) * 0.15;
    }
  });

  // Update ball
  const passer   = sc.players.find(p => p.role === 'passer');
  const receiver = sc.players.find(p => p.role === 'receiver');
  const passerPos   = getPlayerPos(passer, sc, frame);
  const receiverPos = getPlayerPos(receiver, sc, frame);

  if (frame < G.passFrame) {
    const bounce = Math.abs(Math.sin(frame * 0.25)) * 0.18;
    R.ball.position.set(passerPos.x, 0.38 + bounce, passerPos.z);
    R.ball.children.find(c => c.name === 'shadow').position.set(0, -(0.37 + bounce), 0);
  } else {
    const t    = Math.min((frame - G.passFrame) / (G.totalFrames * 0.58), 1);
    const ease = 1 - Math.pow(1 - t, 2.4);
    const arc  = Math.sin(Math.PI * t) * 5.5;
    const bx   = passerPos.x + (receiverPos.x - passerPos.x) * ease;
    const bz   = passerPos.z + (receiverPos.z - passerPos.z) * ease;
    const by   = 0.38 + arc;
    R.ball.position.set(bx, by, bz);
    R.ball.children.find(c => c.name === 'shadow').position.set(0, -(by - 0.01), 0);
  }
  R.ball.children.find(c => c.name === 'patches').rotation.z += 0.04;
  R.ball.children.find(c => c.name === 'patches').rotation.x += 0.02;

  // Offside line
  const lastDef = sc.players.find(p => p.isLast);
  if (frame === G.passFrame && lastDef) {
    G.frozenOffsideX = getPlayerPos(lastDef, sc, frame).x;
  }

  if (frame >= G.passFrame && G.frozenOffsideX !== null) {
    R.offsidePlane.position.x      = G.frozenOffsideX;
    R.offsideLineGlow.position.x   = G.frozenOffsideX;

    const sincePassed = frame - G.passFrame;
    const targetOpacity = Math.min(sincePassed / 15, 0.55);
    const pulse = 1 + Math.sin(frame * 0.18) * 0.08;
    R.offsidePlane.material.opacity    = targetOpacity * pulse;
    R.offsideLineGlow.material.opacity = Math.min(sincePassed / 8, 0.9) * pulse;
    R.offsidePlane.material.needsUpdate     = true;
    R.offsideLineGlow.material.needsUpdate  = true;
  } else if (frame < G.passFrame) {
    // Show faint guide before pass
    if (lastDef) {
      const x = getPlayerPos(lastDef, sc, frame).x;
      R.offsidePlane.position.x    = x;
      R.offsideLineGlow.position.x = x;
      R.offsidePlane.material.opacity    = 0.08;
      R.offsideLineGlow.material.opacity = 0.08;
      R.offsidePlane.material.needsUpdate    = true;
      R.offsideLineGlow.material.needsUpdate = true;
    }
  }

  // Special labels
  if (sc.isDeflection && frame >= G.passFrame + 25) {
    $('frame-badge').textContent = `Frame ${frame} | 💫 DEVIAZIONE`;
  } else {
    $('frame-badge').textContent = frame >= G.passFrame
      ? `Frame ${frame} | ⚡ PASSAGGIO (frame ${G.passFrame})`
      : `Frame ${frame} / ${G.totalFrames - 1}`;
  }
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
function gameLoop(t) {
  G.animId = requestAnimationFrame(gameLoop);

  if (!G.lastT) G.lastT = t;
  const dt = t - G.lastT;
  G.lastT  = t;

  if (G.playing) {
    G.accMs += dt * G.speed;
    while (G.accMs >= MSPF) { G.frame++; G.accMs -= MSPF; }
    if (G.frame >= G.totalFrames) {
      G.frame   = G.totalFrames - 1;
      G.playing = false;
      $('btn-play').textContent = '▶';
    }
  }

  update3D(SCENARIOS[G.qi]);
  R.renderer.render(R.scene, R.camera);
}

// ── CONTROLS ──────────────────────────────────────────────────────────────────
$('btn-play').onclick = () => {
  if (G.frame >= G.totalFrames - 1) { G.frame = 0; G.frozenOffsideX = null; }
  G.playing = !G.playing;
  $('btn-play').textContent = G.playing ? '⏸' : '▶';
  G.lastT = 0;
};
$('btn-rew').onclick = () => {
  G.playing = false; $('btn-play').textContent = '▶';
  G.frame = Math.max(0, G.frame - 5);
  if (G.frame < G.passFrame) G.frozenOffsideX = null;
};
$('btn-fwd').onclick = () => {
  G.playing = false; $('btn-play').textContent = '▶';
  G.frame = Math.min(G.totalFrames - 1, G.frame + 5);
};
$('btn-speed').onclick = () => {
  if (G.speed === 1) { G.speed = 0.5; $('btn-speed').textContent = '🐇 1x'; }
  else               { G.speed = 1;   $('btn-speed').textContent = '🐢 0.5x'; }
};
$('btn-offside').onclick = () => answer(true);
$('btn-onside').onclick  = () => answer(false);
$('btn-next-q').onclick  = nextQ;

// ── ANSWER ────────────────────────────────────────────────────────────────────
function answer(userOffside) {
  if (G.answered) return;
  G.answered = true;
  G.playing  = false;
  $('btn-play').textContent = '▶';
  $('btn-offside').disabled = true;
  $('btn-onside').disabled  = true;

  const sc = SCENARIOS[G.qi];
  const ok = userOffside === sc.isOffside;
  if (ok) G.score++;
  $('score').textContent = G.score;
  G.answers.push({ id: sc.id, title: sc.title, ok, explanation: sc.explanation, correct: sc.isOffside });

  $('fb-result').textContent = ok ? '✅ Corretto!' : '❌ Sbagliato!';
  $('fb-result').style.color = ok ? '#06d6a0' : '#e63946';
  $('fb-exp').textContent    = sc.explanation;
  $('feedback-panel').style.display = 'block';
}

function nextQ() {
  G.qi++;
  if (G.qi >= SCENARIOS.length) showResults();
  else loadScenario(G.qi);
}

// ── GAME START ────────────────────────────────────────────────────────────────
async function startGame() {
  G.qi = 0; G.score = 0; G.answers = [];
  showScreen('game');

  if (!R.renderer) {
    await initGameScene();
    G.animId = requestAnimationFrame(gameLoop);
  }

  loadScenario(0);
  // Screen just became visible — make sure the renderer matches the container.
  if (R.onResize) requestAnimationFrame(R.onResize);
}

// ── RESULTS (Three.js particles) ──────────────────────────────────────────────
let rR, rS, rC, rM = [], rA;

function showResults() {
  if (G.animId) { cancelAnimationFrame(G.animId); G.animId = null; }
  showScreen('results');

  $('final-score').textContent = G.score;
  const ranks = ['🎓 Arbitro Dilettante','📋 Arbitro in Formazione','⭐ Arbitro Esperto','🏆 Arbitro Professionista'];
  $('res-rank').textContent = ranks[G.score <= 4 ? 0 : G.score <= 6 ? 1 : G.score <= 8 ? 2 : 3];

  const wrong = G.answers.filter(a => !a.ok);
  const ws = $('wrong-section');
  ws.innerHTML = '';
  if (wrong.length) {
    ws.innerHTML = '<div class="wrong-title-hdr">❌ Risposte Sbagliate</div>';
    wrong.forEach(a => {
      const d = document.createElement('div'); d.className = 'wrong-item';
      d.innerHTML = `<div class="wrong-item-title">${a.title}</div>
        <div class="wrong-item-exp">${a.explanation}</div>
        <div class="wrong-correct">✅ Risposta corretta: ${a.correct ? 'FUORIGIOCO' : 'NON in fuorigioco'}</div>`;
      ws.appendChild(d);
    });
  } else {
    ws.innerHTML = '<div style="color:#06d6a0;font-weight:700;font-size:15px;margin:12px 0">🎉 Perfetto! Nessun errore!</div>';
  }

  initResultsThree();
  $('btn-restart').onclick = () => { destroyResultsThree(); startGame(); };
}

async function initResultsThree() {
  await loadThree();
  const rc = $('results-canvas');
  rc.width  = window.innerWidth;
  rc.height = window.innerHeight;

  rR = new THREE.WebGLRenderer({ canvas: rc, alpha: true, antialias: false });
  rR.setSize(rc.width, rc.height);
  rR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  rS = new THREE.Scene();
  rC = new THREE.PerspectiveCamera(70, rc.width / rc.height, 0.1, 100);
  rC.position.z = 8;

  const sGeo = new THREE.SphereGeometry(0.12, 7, 7);
  const gMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
  const wMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const rMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
  rM = [];

  for (let i = 0; i < 80; i++) {
    const mat = i % 3 === 0 ? rMat : i % 2 === 0 ? gMat : wMat;
    const m   = new THREE.Mesh(sGeo, mat);
    m.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6);
    m.scale.setScalar(Math.random() * 0.9 + 0.4);
    m.userData.vx = (Math.random() - 0.5) * 0.028;
    m.userData.vy = Math.random() * 0.022 + 0.005;
    rS.add(m); rM.push(m);
  }

  rS.add(new THREE.AmbientLight(0xffffff, 2));
  animResultsThree();
}

function animResultsThree() {
  rA = requestAnimationFrame(animResultsThree);
  rM.forEach(m => {
    m.position.x += m.userData.vx;
    m.position.y += m.userData.vy;
    if (m.position.y >  9) m.position.y = -9;
    if (m.position.x > 12) m.position.x = -12;
    if (m.position.x < -12) m.position.x = 12;
  });
  rC.position.x = Math.sin(Date.now() * 0.0002) * 0.5;
  rR.render(rS, rC);
}

function destroyResultsThree() {
  if (rA) cancelAnimationFrame(rA);
  if (rR) { rR.dispose(); rR = null; }
  rS = rC = null; rM = [];
}
