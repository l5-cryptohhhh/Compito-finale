// ── SCENARI ───────────────────────────────────────────────────────────────────
// Due famiglie di episodi:
//  type 'offside'  → fuorigioco (linea congelata al frame del passaggio)
//  type 'contact'  → contatto (kind: 'rigore' | 'rosso')
// La "verità" di ogni episodio è GEOMETRICA e verificabile a schermo:
//  - offside: posizione X dell'attaccante vs ultimo difensore al passFrame
//  - contact: il pallone DEVIA al frame del contatto? → il difensore ha preso
//    la palla. Non devia? → ha preso l'uomo. C'è distanza (gap)? → simulazione.

import { DIFF } from './data.js';

export const OFFSIDE_EPS = 0.2; // ~una spalla: in linea entro EPS = attaccante

const rnd  = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sign = () => (Math.random() < 0.5 ? -1 : 1);
const fmt  = n => n.toFixed(2).replace('.', ',');

// ── I 10 SCENARI ORIGINALI (Modalità Classica) ───────────────────────────────
export const CLASSIC_SCENARIOS = [
  {
    id: 1, title: 'Azione 1 – Lancio in profondità', verdict: 'auto',
    explanation: 'Al momento del passaggio l\u2019attaccante era nettamente oltre l\u2019ultimo difensore. FUORIGIOCO.',
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
    explanation: 'Al momento del passaggio l\u2019attaccante era chiaramente dietro l\u2019ultimo difensore. NON in fuorigioco.',
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
    explanation: 'L\u2019attaccante superava l\u2019ultimo difensore di una spalla. Qualsiasi parte giocabile del corpo conta. FUORIGIOCO.',
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
    explanation: 'L\u2019attaccante era in linea con il difensore (entro la spalla). In parità: beneficio del dubbio all\u2019attaccante. NON in fuorigioco.',
    players: [
      { role: 'passer',     x:  5, z:  7, team: 'attack',  app: -3 },
      { role: 'receiver',   x: 24.0, z: -5, team: 'attack', app: -9, appz: 4, post: 5 },
      { role: 'defender',   x: 24.1, z:  4, team: 'defense', isLast: true, app: 8, wob: 2.0, wobLoops: 3 },
      { role: 'defender',   x: 16, z: -3, team: 'defense', app: 6 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 5, title: 'Azione 5 – Due difensori oltre l\u2019attaccante', verdict: 'onside',
    explanation: 'Due avversari (oltre al portiere) erano più vicini alla linea di porta dell\u2019attaccante. Servono almeno due avversari davanti: NON in fuorigioco.',
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
    explanation: 'L\u2019unico difensore di movimento era già dietro l\u2019attaccante: davanti restava solo il portiere. FUORIGIOCO.',
    players: [
      { role: 'passer',     x:  6, z:  7, team: 'attack',  app: -4 },
      { role: 'receiver',   x: 30.5, z: -5, team: 'attack',  app: -9, appz: 4, post: 6 },
      { role: 'defender',   x: 28, z:  5, team: 'defense', isLast: true, app: 9, wob: 1.5, wobLoops: 2 },
      { role: 'goalkeeper', x: 47, z:  0, team: 'defense', appz: -2 },
    ],
  },
  {
    id: 7, title: 'Azione 7 – Contropiede, di un soffio', verdict: 'auto',
    explanation: 'Nel contropiede l\u2019attaccante che riceve il pallone aveva superato di pochissimo l\u2019ultimo difensore. FUORIGIOCO.',
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
    explanation: 'L\u2019attaccante che RICEVE il pallone era oltre l\u2019ultimo difensore. L\u2019altro attaccante, regolare, non conta. FUORIGIOCO.',
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
    explanation: 'L\u2019attaccante era già nell\u2019area piccola, davanti a tutti i difensori, al momento del passaggio. FUORIGIOCO.',
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

function computeOffsideVerdict(sc) {
  if (sc.verdict === 'onside')  return false;
  if (sc.verdict === 'offside') return true;
  const last = sc.players.find(p => p.isLast);
  const rec  = sc.players.find(p => p.role === 'receiver');
  return rec.x > last.x + OFFSIDE_EPS;
}

CLASSIC_SCENARIOS.forEach(sc => {
  sc.type          = 'offside';
  sc.passFrame     = 80;
  sc.totalFrames   = 220;
  sc.isOffside     = computeOffsideVerdict(sc);
  sc.lastDefenderX = sc.players.find(p => p.isLast).x;
});

// ── POSIZIONE GIOCATORE (episodi offside) ─────────────────────────────────────
const APP_SCALE  = 0.7;
const POST_CAP   = 45;
const POST_SCALE = 0.045;
const PITCH_MAXX = 50;
const PITCH_MAXZ = 33;

export function getPlayerPos(player, passFrame, frame) {
  let x = player.x, z = player.z;
  if (frame < passFrame) {
    const prog = frame / passFrame;
    const conv = 1 - prog;
    x += (player.app  || 0) * APP_SCALE * conv;
    z += (player.appz || 0) * APP_SCALE * conv;
    if (player.wob) x += Math.sin(prog * Math.PI * (player.wobLoops || 2)) * player.wob * conv;
  } else {
    const after = Math.min(frame - passFrame, POST_CAP);
    x += (player.post  || 0) * after * POST_SCALE;
    z += (player.postz || 0) * after * POST_SCALE;
  }
  x = Math.max(-PITCH_MAXX, Math.min(PITCH_MAXX, x));
  z = Math.max(-PITCH_MAXZ, Math.min(PITCH_MAXZ, z));
  return { x, z };
}

// ── GENERATORE FUORIGIOCO ─────────────────────────────────────────────────────
const OFF_TITLES = [
  'Lancio sul filo del fuorigioco', 'Inserimento in profondità',
  'Imbucata centrale', 'Taglio alle spalle della difesa',
  'Verticalizzazione improvvisa', 'Palla dietro la linea',
];

export function genOffside(diffKey) {
  const D      = DIFF[diffKey];
  const lastX  = rnd(21, 28);
  const offside = Math.random() < 0.5;

  let recX, marginTxt;
  if (offside) {
    const m = rnd(D.offMin, D.offMax);
    recX = lastX + OFFSIDE_EPS + m;
    marginTxt = `oltre l\u2019ultimo difensore di ${fmt(m + OFFSIDE_EPS)} m`;
  } else if (diffKey === 'millimetrica' && Math.random() < 0.35) {
    // In linea: entro la tolleranza → beneficio all'attaccante.
    recX = lastX + rnd(0, OFFSIDE_EPS * 0.85);
    marginTxt = 'praticamente in linea con l\u2019ultimo difensore: in parità il beneficio va all\u2019attaccante';
  } else {
    const m = rnd(D.offMin, D.offMax);
    recX = lastX - m;
    marginTxt = `dietro l\u2019ultimo difensore di ${fmt(m)} m`;
  }

  const recZ  = sign() * rnd(3, 9);
  const players = [
    { role: 'passer',   x: lastX - rnd(12, 17), z: -recZ * 0.6 + rnd(-3, 3), team: 'attack', app: -rnd(2, 4) },
    { role: 'receiver', x: recX, z: recZ, team: 'attack',
      app: -rnd(7, 10), appz: sign() * rnd(2, 5), post: rnd(4, 6), postz: rnd(-0.6, 0.6) },
    { role: 'defender', x: lastX, z: -recZ * 0.8 + rnd(-2, 2), team: 'defense', isLast: true,
      app: rnd(4, 8), wob: rnd(1.0, 2.0), wobLoops: pick([2, 3]) },
    { role: 'defender', x: lastX - rnd(6, 11), z: sign() * rnd(2, 6), team: 'defense',
      app: rnd(3, 6), appz: sign() * rnd(0, 2) },
    { role: 'goalkeeper', x: 47, z: 0, team: 'defense', appz: sign() * 2 },
  ];
  if (Math.random() < 0.4) {
    players.push({ role: 'attacker', x: lastX - rnd(4, 12), z: sign() * rnd(4, 9),
      team: 'attack', app: -rnd(4, 7), post: rnd(2, 4) });
  }

  const sc = {
    type: 'offside', kind: 'offside',
    title: pick(OFF_TITLES),
    passFrame: 80, totalFrames: 220,
    players,
    isOffside: offside,
    truth: offside,
    lastDefenderX: lastX,
    explanation: `Al momento del passaggio l\u2019attaccante era ${marginTxt}. ` +
      (offside ? 'FUORIGIOCO: gol da annullare.' : 'Posizione REGOLARE: gol valido.'),
  };
  return sc;
}

// ── GENERATORE CONTATTI (rigore / rosso) ──────────────────────────────────────
// Cinematica: il dribbler avanza col pallone, il tackler scivola addosso.
// Al contactFrame: se il tackler tocca il pallone, il pallone DEVIA di devAngle
// gradi (visibile fotogramma per fotogramma). Se non lo tocca, il pallone
// prosegue dritto mentre l'uomo va giù. Se manca del tutto (gap), è simulazione.

export function genContact(diffKey, kind) {
  const D = DIFF[diffKey];
  const inArea = kind === 'rigore';
  const cx = inArea ? rnd(37.5, 44.5) : rnd(4, 18);
  const cz = rnd(-10, 10);

  // Varianti con verità geometrica distinta.
  let contact = true, ballTouched, gap = 0, variant;
  if (kind === 'rigore') {
    const r = Math.random();
    if (r < 0.4)      { ballTouched = false; variant = 'fallo'; }
    else if (r < 0.75){ ballTouched = true;  variant = 'pulito'; }
    else              { ballTouched = false; contact = false; gap = rnd(D.gapMin, D.gapMax); variant = 'simulazione'; }
  } else {
    ballTouched = Math.random() < 0.5;
    variant = ballTouched ? 'giallo' : 'rosso';
  }

  const devAngle = rnd(D.devMin, D.devMax);        // deviazione se tocca palla
  const side     = sign();                         // da che lato arriva il tackler
  const tStart   = { x: cx - rnd(7, 10), z: cz + side * rnd(3.5, 5) };
  const tTarget  = { x: cx, z: cz + (contact ? 0 : side * gap) };

  const extras = inArea
    ? [
        { role: 'goalkeeper', x: 47, z: cz * 0.3, team: 'defense' },
        { role: 'defender',   x: cx - 6, z: cz + side * -6, team: 'defense', wander: true },
        { role: 'attacker',   x: cx - 9, z: cz - side * 5,  team: 'attack',  wander: true },
      ]
    : [
        { role: 'defender', x: cx + rnd(8, 12),  z: cz + sign() * rnd(4, 8), team: 'defense', wander: true },
        { role: 'attacker', x: cx - rnd(8, 12),  z: cz + sign() * rnd(4, 8), team: 'attack',  wander: true },
        { role: 'goalkeeper', x: 47, z: 0, team: 'defense' },
      ];

  let truth, explanation;
  if (kind === 'rigore') {
    truth = contact && !ballTouched;
    if (variant === 'fallo')
      explanation = `Il difensore non tocca mai il pallone (la sfera prosegue dritta al momento del contatto) e travolge l\u2019attaccante in area. \u00C8 RIGORE.`;
    else if (variant === 'pulito')
      explanation = `Al frame del contatto il pallone devia di ~${Math.round(devAngle)}\u00B0: il difensore gioca prima la palla. Intervento pulito, NIENTE rigore.`;
    else
      explanation = `Il difensore passa a ~${fmt(gap)} m dall\u2019attaccante senza toccarlo: nessun contatto, l\u2019attaccante si lascia cadere. Simulazione: NIENTE rigore.`;
  } else {
    truth = !ballTouched;
    explanation = ballTouched
      ? `Al frame del contatto il pallone devia di ~${Math.round(devAngle)}\u00B0: il difensore sfiora prima la palla, poi travolge l\u2019uomo. Intervento imprudente: GIALLO.`
      : `Il pallone non cambia mai traiettoria: il difensore entra in velocità solo sull\u2019uomo, da dietro. Vigoria sproporzionata: ROSSO.`;
  }

  return {
    type: 'contact', kind, variant,
    title: kind === 'rigore'
      ? (variant === 'simulazione' ? 'Crollo in area di rigore' : 'Contatto in area di rigore')
      : 'Entrata dura a centrocampo',
    contactFrame: 100, totalFrames: 230,
    cx, cz, contact, ballTouched, gap, devAngle, side,
    tStart, tTarget,
    dribbleSpeed: 0.082,
    players: extras,
    truth,
    explanation,
  };
}

// ── CINEMATICA CONTATTI ───────────────────────────────────────────────────────
export function getContactPositions(sc, frame) {
  const CF = sc.contactFrame;

  // Dribbler: corre in +x col pallone, poi va giù (fallo o tuffo che sia).
  const drib = { x: 0, z: sc.cz, fall: 0 };
  if (frame < CF) {
    drib.x = sc.cx - (CF - frame) * sc.dribbleSpeed;
  } else {
    drib.x   = sc.cx + Math.min(frame - CF, 14) * 0.045;
    drib.fall = Math.min((frame - CF) / 16, 1);
  }

  // Tackler: converge sul punto di contatto, poi prosegue in scivolata.
  const dirX = sc.tTarget.x - sc.tStart.x;
  const dirZ = sc.tTarget.z - sc.tStart.z;
  const len  = Math.hypot(dirX, dirZ) || 1;
  const tack = { x: 0, z: 0, slide: 0 };
  if (frame < CF) {
    const e = Math.pow(frame / CF, 1.55);
    tack.x = sc.tStart.x + dirX * e;
    tack.z = sc.tStart.z + dirZ * e;
    tack.slide = Math.max(0, (frame - (CF - 22)) / 22);
  } else {
    const after = Math.min(frame - CF, 18);
    tack.x = sc.tTarget.x + (dirX / len) * after * 0.09;
    tack.z = sc.tTarget.z + (dirZ / len) * after * 0.09;
    tack.slide = 1;
  }

  // Pallone: coi piedi del dribbler fino al contatto, poi la fisica decide.
  const ball = { x: 0, y: 0.38, z: 0 };
  if (frame < CF) {
    ball.x = drib.x + 0.55;
    ball.z = drib.z + 0.15;
    ball.y = 0.38 + Math.abs(Math.sin(frame * 0.28)) * 0.1;
  } else {
    const after = frame - CF;
    const bx0 = sc.cx + 0.55, bz0 = sc.cz + 0.15;
    const travel = (1 - Math.pow(0.94, after));
    if (sc.ballTouched) {
      const a = (sc.devAngle * Math.PI) / 180;
      ball.x = bx0 + Math.cos(a) * travel * 9;
      ball.z = bz0 + Math.sin(a) * -sc.side * travel * 9;
    } else {
      ball.x = bx0 + travel * 5.5;
      ball.z = bz0 + travel * 0.4;
    }
  }
  ball.x = Math.max(-PITCH_MAXX, Math.min(PITCH_MAXX, ball.x));
  ball.z = Math.max(-PITCH_MAXZ, Math.min(PITCH_MAXZ, ball.z));
  return { drib, tack, ball };
}