// ── MOTORE 3D (Three.js) ──────────────────────────────────────────────────────
// Costruttori di campo, pallone e giocatori + animazioni (corsa, idle,
// caduta, scivolata). I giocatori hanno busto ruotabile (twist di corsa),
// braccia con avambraccio e mani, gambe con calzettoni e scarpini.

let T = null;
export async function loadThree() {
  if (!T) T = await import('./three.js');
  return T;
}
export function THREE() { return T; }

export const COLORS = {
  attack:     0xd63031,
  defense:    0x2d6ab2,
  goalkeeper: 0xe67e22,
  shorts:     0x111133,
  boots:      0x111111,
};

const SKINS = [0xf0c080, 0xe8b478, 0xd9a066, 0xc68642, 0x8d5524];
const HAIRS = [0x1a0a00, 0x2c1608, 0x553311, 0x111111, 0x886611];
const pick  = arr => arr[Math.floor(Math.random() * arr.length)];

// ── CAMPO ─────────────────────────────────────────────────────────────────────
export function buildPitch() {
  const THREE = T;
  const g = new THREE.Group();

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(104, 72, 8, 1),
    new THREE.MeshLambertMaterial({ color: 0x2a7013 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);

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

  addLine(   0, 0.02, -36, 104, 0.05, 0.25);
  addLine(   0, 0.02,  36, 104, 0.05, 0.25);
  addLine( -52, 0.02,   0, 0.25, 0.05, 72);
  addLine(  52, 0.02,   0, 0.25, 0.05, 72);
  addLine(   0, 0.02,   0, 0.25, 0.05, 72);

  const circlePoints = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(a) * 9.15, 0, Math.sin(a) * 9.15));
  }
  const circleCurve = new THREE.CatmullRomCurve3(circlePoints, true);
  const circleM = new THREE.Mesh(new THREE.TubeGeometry(circleCurve, 64, 0.1, 4, true), wMat);
  circleM.position.y = 0.02;
  g.add(circleM);

  const dotM = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), wMat);
  dotM.position.y = 0.03;
  g.add(dotM);

  function box(goalX, depth, halfZ) {
    const dir    = goalX > 0 ? 1 : -1;
    const frontX = goalX - dir * depth;
    const midX   = (goalX + frontX) / 2;
    addLine(midX,   0.02,  halfZ, depth, 0.05, 0.25);
    addLine(midX,   0.02, -halfZ, depth, 0.05, 0.25);
    addLine(frontX, 0.02,  0,     0.25,  0.05, halfZ * 2);
  }
  box( 52, 16.5, 20.15);
  box(-52, 16.5, 20.15);
  box( 52,  5.5,  9.16);
  box(-52,  5.5,  9.16);

  const psDot = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 10);
  const l1 = new THREE.Mesh(psDot, wMat); l1.position.set(-41, 0.03, 0); g.add(l1);
  const r1 = new THREE.Mesh(psDot, wMat); r1.position.set( 41, 0.03, 0); g.add(r1);

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
    const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, wireframe: true });
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32), netMat);
    net.position.set(sideX + (sideX > 0 ? 1 : -1), 1.22, 0); g.add(net);
  }
  addGoal( 52);
  addGoal(-52);

  return g;
}

// ── PALLONE ───────────────────────────────────────────────────────────────────
// Texture generata al volo (pattern a pentagoni): la rotazione si vede davvero.
export function buildBall() {
  const THREE = T;
  const group = new THREE.Group();

  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 128;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#161616';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      const x = 26 + i * 52 + (j % 2) * 26;
      const y = 22 + j * 42;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 12, y + Math.sin(a) * 12);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;

  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 18),
    new THREE.MeshPhongMaterial({ map: tex, shininess: 70 })
  );
  ballMesh.castShadow = true;
  ballMesh.name = 'patches';          // script.js lo ruota per lo spin
  group.add(ballMesh);

  const shadowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  shadowMesh.name = 'shadow';
  group.add(shadowMesh);

  return group;
}

// ── GIOCATORE ─────────────────────────────────────────────────────────────────
// jerseyOverride: colore maglia personalizzato (squadre della carriera).
export function buildStickman(team, role, jerseyOverride) {
  const THREE = T;
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';

  const jersey = jerseyOverride != null
    ? jerseyOverride
    : team === 'attack' ? COLORS.attack : role === 'goalkeeper' ? COLORS.goalkeeper : COLORS.defense;
  const skin = pick(SKINS);

  const jMat  = new THREE.MeshPhongMaterial({ color: jersey, shininess: 45 });
  const sMat  = new THREE.MeshPhongMaterial({ color: skin, shininess: 18 });
  const shMat = new THREE.MeshPhongMaterial({ color: COLORS.shorts });
  const soMat = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
  const bMat  = new THREE.MeshPhongMaterial({ color: COLORS.boots, shininess: 70 });
  const glMat = new THREE.MeshPhongMaterial({ color: 0xdddddd });      // guanti GK

  function cap(r, len, mat, px, py, pz) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), mat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    return m;
  }
  function sph(r, segs, mat, px, py, pz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, segs), mat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    return m;
  }

  // Busto ruotabile: pivot al bacino, contiene petto, testa e spalle
  // così il twist di corsa muove tutta la parte alta insieme.
  const torso = new THREE.Group();
  torso.position.y = 0.85;
  group.add(torso);

  const chest = cap(0.17, 0.4, jMat, 0, 0.36, 0);
  chest.scale.z = 0.76;
  torso.add(chest);
  torso.add(cap(0.05, 0.07, sMat, 0, 0.72, 0));                 // collo
  torso.add(sph(0.215, 12, sMat, 0, 0.95, 0));                  // testa
  const hair = sph(0.22, 10, new THREE.MeshPhongMaterial({ color: pick(HAIRS) }), 0, 1.03, -0.02);
  hair.scale.y = 0.72;                                          // capelli
  torso.add(hair);

  group.add(cap(0.15, 0.14, shMat, 0, 0.66, 0));                // pantaloncini

  torso.add(sph(0.1, 8, jMat, -0.24, 0.58, 0));                 // spalle
  torso.add(sph(0.1, 8, jMat,  0.24, 0.58, 0));

  const leftShoulder  = new THREE.Group(); leftShoulder.position.set(-0.24, 0.58, 0);  torso.add(leftShoulder);
  const rightShoulder = new THREE.Group(); rightShoulder.position.set( 0.24, 0.58, 0); torso.add(rightShoulder);
  const leftForearm  = new THREE.Group(); leftForearm.position.y  = -0.52; leftShoulder.add(leftForearm);
  const rightForearm = new THREE.Group(); rightForearm.position.y = -0.52; rightShoulder.add(rightForearm);

  leftShoulder.add(cap(0.062, 0.36, jMat, 0, -0.26, 0));
  rightShoulder.add(cap(0.062, 0.36, jMat, 0, -0.26, 0));
  const handMat = role === 'goalkeeper' ? glMat : sMat;
  leftForearm.add(cap(0.052, 0.28, sMat, 0, -0.2, 0));
  rightForearm.add(cap(0.052, 0.28, sMat, 0, -0.2, 0));
  leftForearm.add(sph(0.06, 6, handMat, 0, -0.4, 0));
  rightForearm.add(sph(0.06, 6, handMat, 0, -0.4, 0));

  const leftHip  = new THREE.Group(); leftHip.position.set(-0.11, 0.65, 0);  group.add(leftHip);
  const rightHip = new THREE.Group(); rightHip.position.set( 0.11, 0.65, 0); group.add(rightHip);
  const leftKnee  = new THREE.Group(); leftKnee.position.y  = -0.6; leftHip.add(leftKnee);
  const rightKnee = new THREE.Group(); rightKnee.position.y = -0.6; rightHip.add(rightKnee);

  leftHip.add(cap(0.088, 0.38, sMat, 0, -0.3, 0));              // coscia
  rightHip.add(cap(0.088, 0.38, sMat, 0, -0.3, 0));
  leftKnee.add(cap(0.068, 0.34, soMat, 0, -0.27, 0));           // calzettone
  rightKnee.add(cap(0.068, 0.34, soMat, 0, -0.27, 0));

  const leftAnkle  = new THREE.Group(); leftAnkle.position.y  = -0.58; leftKnee.add(leftAnkle);
  const rightAnkle = new THREE.Group(); rightAnkle.position.y = -0.58; rightKnee.add(rightAnkle);
  const bootL = sph(0.085, 8, bMat, 0, -0.01, 0.07); bootL.scale.set(0.9, 0.55, 1.5);
  const bootR = sph(0.085, 8, bMat, 0, -0.01, 0.07); bootR.scale.set(0.9, 0.55, 1.5);
  leftAnkle.add(bootL);
  rightAnkle.add(bootR);

  const indicatorColor = team === 'attack' ? 0xff6666 : role === 'goalkeeper' ? 0xffcc44 : 0x6699ee;
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: indicatorColor })
  );
  dot.position.y = 2.18;
  group.add(dot);

  return {
    group, torso,
    leftShoulder, rightShoulder, leftForearm, rightForearm,
    leftHip, rightHip, leftKnee, rightKnee,
    leftAnkle, rightAnkle,
  };
}

// ── ANIMAZIONI ────────────────────────────────────────────────────────────────
// Corsa con twist del busto e falcata completa; sotto speed 0.12 il giocatore
// passa in idle (respiro, peso che oscilla, braccia rilassate).
export function animateStickman(sm, frame, speed01 = 0, phase = 0) {
  const spd = Math.min(speed01, 1.3);

  if (spd < 0.12) {
    const b = Math.sin(frame * 0.045 + phase);
    sm.torso.rotation.y = Math.sin(frame * 0.018 + phase) * 0.09;
    sm.torso.rotation.x = 0.03 + b * 0.02;
    sm.leftShoulder.rotation.x  = -0.14 + b * 0.04;
    sm.rightShoulder.rotation.x = -0.14 - b * 0.04;
    sm.leftShoulder.rotation.z  =  0.1;
    sm.rightShoulder.rotation.z = -0.1;
    sm.leftForearm.rotation.x  = -0.4;
    sm.rightForearm.rotation.x = -0.4;
    sm.leftHip.rotation.x  = 0;
    sm.rightHip.rotation.x = 0;
    sm.leftKnee.rotation.x  = 0.07;
    sm.rightKnee.rotation.x = 0.07;
    sm.leftAnkle.rotation.x  = 0;
    sm.rightAnkle.rotation.x = 0;
    sm.group.position.y = 0;
    sm._leanTarget = 0;
    return;
  }

  const freq = 0.12 + spd * 0.13;
  const t    = frame * freq + phase;
  const amp  = 0.22 + spd * 0.95;

  const hipL = Math.sin(t);
  const hipR = Math.sin(t + Math.PI);

  sm.leftHip.rotation.x  = hipL * 0.6 * amp;
  sm.rightHip.rotation.x = hipR * 0.6 * amp;
  sm.leftKnee.rotation.x  = Math.max(0, Math.sin(t + 1.1))           * 1.25 * amp;
  sm.rightKnee.rotation.x = Math.max(0, Math.sin(t + Math.PI + 1.1)) * 1.25 * amp;
  sm.leftAnkle.rotation.x  = Math.max(0, Math.sin(t - 0.6))           * 0.55 * amp;
  sm.rightAnkle.rotation.x = Math.max(0, Math.sin(t + Math.PI - 0.6)) * 0.55 * amp;

  // Busto: controrotazione rispetto alle anche + inclinazione da sprint.
  sm.torso.rotation.y = -hipL * 0.16 * amp;
  sm.torso.rotation.x = 0.06 * spd;

  sm.leftShoulder.rotation.x  = -hipL * 0.6 * amp;
  sm.rightShoulder.rotation.x = -hipR * 0.6 * amp;
  sm.leftShoulder.rotation.z  =  0.12 + spd * 0.06;
  sm.rightShoulder.rotation.z = -0.12 - spd * 0.06;
  sm.leftForearm.rotation.x  = -(0.6 + Math.max(0, Math.sin(t + 0.6))           * 0.5) * (0.4 + amp * 0.8);
  sm.rightForearm.rotation.x = -(0.6 + Math.max(0, Math.sin(t + Math.PI + 0.6)) * 0.5) * (0.4 + amp * 0.8);

  sm.group.position.y = Math.abs(Math.sin(t)) * 0.07 * amp;
  sm._leanTarget = spd * 0.26;
}

// Posa caduta (dribbler a terra): fallProg 0→1.
export function applyFallPose(sm, fallProg) {
  const p = Math.min(Math.max(fallProg, 0), 1);
  const e = 1 - Math.pow(1 - p, 2.2);
  sm.group.rotation.x = 0;
  sm.group.rotation.z = -e * (Math.PI / 2 - 0.12);
  sm.group.position.y = (1 - e) * sm.group.position.y + e * 0.25;
  sm.torso.rotation.y = 0;
  sm.torso.rotation.x = 0.35 * e;                // si raggomitola
  // Braccia avanti a proteggersi, gambe distese.
  sm.leftShoulder.rotation.x  = -1.9 * e;
  sm.rightShoulder.rotation.x = -1.5 * e;
  sm.leftForearm.rotation.x   = -0.7 * e;
  sm.rightForearm.rotation.x  = -0.9 * e;
  sm.leftHip.rotation.x  = 0.3 * e;
  sm.rightHip.rotation.x = -0.15 * e;
  sm.leftKnee.rotation.x  = 0.6 * e;
  sm.rightKnee.rotation.x = 0.35 * e;
}

// Posa scivolata (tackler): slideProg 0→1.
export function applySlidePose(sm, slideProg) {
  const p = Math.min(Math.max(slideProg, 0), 1);
  const e = 1 - Math.pow(1 - p, 2);
  sm.group.rotation.x = e * 0.9;                 // busto indietro/basso
  sm.group.position.y = (1 - e) * sm.group.position.y + e * -0.35;
  sm.torso.rotation.y = e * 0.25;
  sm.torso.rotation.x = -e * 0.2;
  sm.leftHip.rotation.x  = -1.5 * e;             // gamba tesa in avanti
  sm.leftKnee.rotation.x = 0.15 * e;
  sm.rightHip.rotation.x = 0.9 * e;              // gamba raccolta sotto
  sm.rightKnee.rotation.x = 1.6 * e;
  sm.leftShoulder.rotation.x  = -0.9 * e;
  sm.rightShoulder.rotation.x = 0.6 * e;
  sm.leftForearm.rotation.x   = -0.5 * e;
  sm.rightForearm.rotation.x  = -0.3 * e;
}

export function lerpAngle(cur, target, a) {
  const d = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + d * a;
}

// ── OVERLAY EPISODI ───────────────────────────────────────────────────────────
// Anello pulsante sul punto di contatto (rigore / rosso).
export function buildContactRing() {
  const THREE = T;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.25, 40),
    new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  return ring;
}

// Evidenziazione della linea frontale dell'area di rigore (x = ±35.5,
// script.js la posiziona sul lato giusto in base allo specchio).
export function buildAreaGlow() {
  const THREE = T;
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.02, 40.3),
    new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0 })
  );
  m.position.set(35.5, 0.05, 0);
  return m;
}
