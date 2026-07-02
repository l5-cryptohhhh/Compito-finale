// ── codeVar 2 – CARRIERA ARBITRALE ───────────────────────────────────────────
// Flusso: AUTH → MAPPA ALLENATORI → PARTITA (fase live simulata + episodi VAR)
// Modalità Classica: le 10 azioni originali del progetto base.
// Il backend (server/server.js) è OPZIONALE: se non risponde, tutto ricade
// automaticamente su localStorage e il gioco funziona identico.

import { TRAINERS, HOME_TEAM, RANKS, COMMENTARY, EPISODE_INTRO, pickDiff } from './data.js';
import {
  CLASSIC_SCENARIOS, OFFSIDE_EPS, getPlayerPos,
  genOffside, genContact, getContactPositions,
} from './scenarios.js';
import * as E from './engine3d.js';

let THREE = null;

// ── API BACKEND (con fallback) ────────────────────────────────────────────────
const api = {
  online: false,
  token: null,

  async call(path, body) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    try {
      const res = await fetch('/api/' + path, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { 'Authorization': 'Bearer ' + this.token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      clearTimeout(t);
      // Live Server / Vite rispondono comunque (404 o HTML) su /api/*:
      // se la risposta non è JSON il backend NON c'è → fallback locale.
      const ct = res.headers.get('content-type') || '';
      if (res.status === 404 || res.status === 405 || !ct.includes('application/json')) return null;
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    } catch {
      clearTimeout(t);
      return null; // backend assente → fallback locale
    }
  },

  async login(u, p)       { return this.call('login',    { user: u, pass: p }); },
  async register(u, e, p) { return this.call('register', { user: u, email: e, pass: p }); },
  async me()              { return this.call('me'); },
  async logout()          { return this.call('logout', {}); },
  async getProgress()     { return this.call('progress'); },
  async saveProgress(d)   { return this.call('progress', d); },
};

// ── STATO GLOBALE ─────────────────────────────────────────────────────────────
const G = {
  user: null,
  mode: null,        // 'classic' | 'career'
  phase: 'idle',     // 'live' | 'varcheck' | 'review' | 'feedback'

  // review episodio
  sc: null, frame: 0, playing: true, speed: 1,
  accMs: 0, lastT: 0, answered: false, frozenOffsideX: null,
  cam: 'a',          // telecamera replay attiva: 'a' | 'b' | 'c'
  buildup: null,     // azione live che porta al check VAR { who, timer }

  // classica
  qi: 0, score: 0, answers: [],

  // partita carriera
  trainer: null, episodes: [], epIndex: 0, correct: 0,
  scoreHome: 0, scoreAway: 0, minute: 0, minuteAcc: 0,
  checkTimer: 0, commentTimer: 0,

  animId: null,
  progress: { beaten: {} },   // { [trainerId]: miglior numero di decisioni corrette }
};
const MSPF = 1000 / 60;
const MIN_FRAMES = 30;        // frame reali per 1 minuto di gioco

const $ = id => document.getElementById(id);
const canvas = $('game-canvas');

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// ── PERSISTENZA ───────────────────────────────────────────────────────────────
function localKey() { return 'var_career_' + (G.user || 'ospite'); }

async function loadProgress() {
  if (api.online) {
    const r = await api.getProgress();
    if (r && r.status === 200 && r.data.progress) { G.progress = r.data.progress; return; }
  }
  G.progress = JSON.parse(localStorage.getItem(localKey()) || '{"beaten":{}}');
}

async function saveProgress() {
  localStorage.setItem(localKey(), JSON.stringify(G.progress));
  if (api.online) await api.saveProgress(G.progress);
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
// Sessione persistente: token (online) o utente (offline) salvati in
// localStorage e ripristinati all'avvio. Nel fallback locale le password
// sono hashate con SHA-256 + salt (i vecchi account btoa vengono migrati
// al primo login riuscito).
const SESSION_KEY = 'var_session';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Reset una-tantum: elimina i vecchi account locali (formati rotti/duplicati)
// che impedivano nuove registrazioni. I progressi carriera restano.
if (!localStorage.getItem('var_authreset')) {
  localStorage.removeItem('var_users');
  localStorage.removeItem(SESSION_KEY);
  localStorage.setItem('var_authreset', '1');
}

function saveSession(online) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: G.user, token: api.token, online }));
}
function clearSession() { localStorage.removeItem(SESSION_KEY); }

async function restoreSession() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { /* corrotta */ }
  if (!s || !s.user) return false;
  if (s.online && s.token) {
    api.token = s.token;
    const r = await api.me();
    if (r && r.status === 200) { api.online = true; G.user = s.user; return true; }
    if (r) { clearSession(); api.token = null; return false; }   // token scaduto
    // Server spento: si prosegue offline con la copia locale dei progressi.
  }
  api.online = false; api.token = null;
  G.user = s.user;
  return true;
}

async function hashLocal(pass, salt) {
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pass));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // ponytail: crypto.subtle manca nei contesti non sicuri (es. http su IP di
  // rete): fallback djb2 doppio, basta per il salvataggio locale del gioco.
  const s = salt + ':' + pass;
  let h1 = 5381, h2 = 52711;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = (h1 * 33 ^ c) >>> 0;
    h2 = (h2 * 31 + c) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}
async function newLocalHash(pass) {
  const salt = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
  return salt + ':' + await hashLocal(pass, salt);
}

function setLoading(btn, on) { btn.disabled = on; btn.classList.toggle('loading', on); }
function markInvalid(ids) {
  document.querySelectorAll('#screen-auth input').forEach(i => i.classList.remove('invalid'));
  ids.forEach(id => $(id).classList.add('invalid'));
}

$('tab-login-btn').onclick = () => switchTab('login');
$('tab-reg-btn').onclick   = () => switchTab('reg');
$('btn-guest').onclick     = () => { G.user = 'ospite'; api.online = false; saveSession(false); afterAuth(); };

document.querySelectorAll('.pass-toggle').forEach(b => {
  b.onclick = () => {
    const inp = $(b.dataset.target);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.classList.toggle('on', show);
    b.setAttribute('aria-label', show ? 'Nascondi password' : 'Mostra password');
  };
});

$('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('login-user').value.trim();
  const p = $('login-pass').value;
  $('login-error').textContent = '';

  const bad = [];
  if (u.length < 2) bad.push('login-user');
  if (!p)           bad.push('login-pass');
  markInvalid(bad);
  if (bad.length) { $('login-error').textContent = 'Inserisci username e password.'; return; }

  const btn = $('btn-login-submit');
  setLoading(btn, true);
  try {
    const r = await api.login(u, p);
    if (r) {                                   // backend presente
      if (r.status === 200) { api.online = true; api.token = r.data.token; G.user = u; saveSession(true); afterAuth(); }
      else {
        const msg = r.data.error || 'Username o password errati.';
        $('login-error').textContent = msg;
        markInvalid([/utente|username/i.test(msg) ? 'login-user' : 'login-pass']);
      }
      return;
    }
    // Fallback locale (nessun server attivo)
    const db = JSON.parse(localStorage.getItem('var_users') || '{}');
    const rec = db[u];
    if (!rec) {
      $('login-error').textContent = 'Utente non trovato. Registrati prima.';
      markInvalid(['login-user']);
      return;
    }
    let ok = false;
    if (rec.p.includes(':')) {
      const [salt, h] = rec.p.split(':');
      ok = (await hashLocal(p, salt)) === h;
    } else if (rec.p === btoa(p)) {            // vecchio formato: migra
      ok = true;
      rec.p = await newLocalHash(p);
      localStorage.setItem('var_users', JSON.stringify(db));
    }
    if (ok) { G.user = u; saveSession(false); afterAuth(); }
    else { $('login-error').textContent = 'Password errata.'; markInvalid(['login-pass']); }
  } catch (err) {
    $('login-error').textContent = 'Errore imprevisto, riprova.';
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});

$('form-register').addEventListener('submit', async e => {
  e.preventDefault();
  const u  = $('reg-user').value.trim();
  const em = $('reg-email').value.trim();
  const p  = $('reg-pass').value;
  const p2 = $('reg-pass2').value;
  $('reg-error').textContent = '';

  let msg = '', bad = [];
  if (u.length < 2)            { bad = ['reg-user'];  msg = 'Username: minimo 2 caratteri.'; }
  else if (!EMAIL_RE.test(em)) { bad = ['reg-email']; msg = 'Inserisci un indirizzo email valido.'; }
  else if (p.length < 6)       { bad = ['reg-pass'];  msg = 'Password: minimo 6 caratteri.'; }
  else if (p2 !== p)           { bad = ['reg-pass2']; msg = 'Le password non coincidono.'; }
  markInvalid(bad);
  if (msg) { $('reg-error').textContent = msg; return; }

  const btn = $('btn-reg-submit');
  setLoading(btn, true);
  try {
    const r = await api.register(u, em, p);
    if (r) {
      if (r.status === 200) { api.online = true; api.token = r.data.token; G.user = u; saveSession(true); afterAuth(); }
      else {
        const msg = r.data.error || 'Registrazione non riuscita.';
        $('reg-error').textContent = msg;
        markInvalid([/email/i.test(msg) ? 'reg-email' : /username/i.test(msg) ? 'reg-user' : 'reg-pass']);
      }
      return;
    }
    const db = JSON.parse(localStorage.getItem('var_users') || '{}');
    if (db[u]) { $('reg-error').textContent = 'Username già in uso.'; markInvalid(['reg-user']); return; }
    if (Object.values(db).some(x => x.email === em)) {
      $('reg-error').textContent = 'Email già utilizzata.';
      markInvalid(['reg-email']);
      return;
    }
    db[u] = { email: em, p: await newLocalHash(p) };
    localStorage.setItem('var_users', JSON.stringify(db));
    G.user = u; saveSession(false); afterAuth();
  } catch (err) {
    $('reg-error').textContent = 'Errore imprevisto, riprova.';
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});

function switchTab(tab) {
  $('tab-login-btn').classList.toggle('active', tab === 'login');
  $('tab-reg-btn').classList.toggle('active', tab !== 'login');
  $('form-login-wrap').classList.toggle('active', tab === 'login');
  $('form-reg-wrap').classList.toggle('active', tab !== 'login');
  $('login-error').textContent = '';
  $('reg-error').textContent   = '';
  markInvalid([]);
}

async function afterAuth() {
  await loadProgress();
  openCareer();
}

// ── MAPPA ALLENATORI ──────────────────────────────────────────────────────────
function beatenCount() { return Object.keys(G.progress.beaten).length; }
function isUnlocked(t) { return t.id <= beatenCount() + 1; }

function openCareer() {
  stopLoop();
  showScreen('career');
  $('career-user').textContent = G.user + (api.online ? ' \u{1F310}' : '');
  const n = beatenCount();
  $('career-progress').textContent = `${n} / ${TRAINERS.length} allenatori battuti`;
  $('career-fill').style.width = (n / TRAINERS.length * 100) + '%';

  const grid = $('career-grid');
  grid.innerHTML = '';
  TRAINERS.forEach(t => {
    const beaten   = G.progress.beaten[t.id] != null;
    const unlocked = isUnlocked(t);
    const card = document.createElement('button');
    card.className = 'trainer-card' + (beaten ? ' beaten' : unlocked ? '' : ' locked');
    card.style.setProperty('--tc', t.color);
    card.innerHTML = `
      <div class="tc-portrait">
        <img src="assets/img/allenatori/a${t.id}.jpg" alt="" onerror="this.remove()">
        <span class="tc-initial">${t.name.split(' ').pop()[0]}</span>
        ${beaten ? '<span class="tc-badge">\u2713</span>' : ''}
        ${!unlocked ? '<span class="tc-lock">\u{1F512}</span>' : ''}
      </div>
      <div class="tc-name">${t.name}</div>
      <div class="tc-team">${t.team}</div>
      <div class="tc-league">${t.league} \u00B7 ${t.episodes} episodi</div>
      ${beaten ? `<div class="tc-best">Miglior punteggio: ${G.progress.beaten[t.id]}/${t.episodes}</div>` : ''}
    `;
    if (unlocked) card.onclick = () => openTrainerIntro(t);
    grid.appendChild(card);
  });
}

$('btn-logout').onclick  = () => {
  if (api.online) api.logout();               // invalida il token lato server
  clearSession();
  G.user = null; api.online = false; api.token = null;
  showScreen('auth');
};
$('btn-classic').onclick = () => startClassic();

function openTrainerIntro(t) {
  G.trainer = t;
  $('ti-portrait').style.setProperty('--tc', t.color);
  $('ti-portrait').innerHTML =
    `<img src="assets/img/allenatori/a${t.id}.jpg" alt="" onerror="this.remove()">` +
    `<span class="tc-initial">${t.name.split(' ').pop()[0]}</span>`;
  $('ti-name').textContent    = t.name;
  $('ti-team').textContent    = `${t.team} \u00B7 ${t.league}`;
  $('ti-stadium').textContent = t.stadium;
  $('ti-taunt').textContent   = '\u201C' + t.taunt + '\u201D';
  $('ti-meta').textContent    =
    `${t.episodes} episodi VAR \u00B7 servono ${t.toWin} decisioni corrette \u00B7 difficoltà ${t.difficulty}`;
  $('trainer-intro').classList.add('open');
}
$('btn-ti-close').onclick = () => $('trainer-intro').classList.remove('open');
$('btn-ti-start').onclick = () => { $('trainer-intro').classList.remove('open'); startMatch(G.trainer); };

// ── SCENA 3D ──────────────────────────────────────────────────────────────────
const R = {
  renderer: null, scene: null, camera: null,
  pitch: null, ball: null,
  offsidePlane: null, offsideLineGlow: null,
  contactRing: null, areaGlow: null,
  stickmen: [],          // review:  [{ sm, p }]
  live: [],              // live:    [{ sm, team, gk, x, z, tx, tz, phase }]
  liveHolder: 0, livePass: null,
  camCur: null,          // posizione/lookAt correnti della camera replay (lerp)
  onResize: null,
};

async function initGameScene() {
  THREE = await E.loadThree();

  const cont = canvas.parentElement;
  const W = cont.clientWidth || 800;
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

  R.scene.add(new THREE.AmbientLight(0x334466, 0.8));
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.4);
  sun.position.set(20, 40, -30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.1;  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -60;  sun.shadow.camera.right = 60;
  sun.shadow.camera.top  = 60;   sun.shadow.camera.bottom = -60;
  R.scene.add(sun);
  R.scene.add(new THREE.HemisphereLight(0x88aabb, 0x2d5a1b, 0.5));
  const st1 = new THREE.PointLight(0xfff0cc, 0.6, 80); st1.position.set(-30, 25, -20); R.scene.add(st1);
  const st2 = new THREE.PointLight(0xfff0cc, 0.6, 80); st2.position.set( 40, 25,  20); R.scene.add(st2);

  R.pitch = E.buildPitch();  R.scene.add(R.pitch);
  R.ball  = E.buildBall();   R.scene.add(R.ball);

  const plMat = new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0, side: THREE.DoubleSide });
  R.offsidePlane = new THREE.Mesh(new THREE.PlaneGeometry(72, 5), plMat);
  R.offsidePlane.rotation.y = Math.PI / 2;
  R.offsidePlane.position.y = 2.5;
  R.scene.add(R.offsidePlane);

  R.offsideLineGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 3.5, 72),
    new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0 })
  );
  R.offsideLineGlow.position.y = 1.75;
  R.scene.add(R.offsideLineGlow);

  R.contactRing = E.buildContactRing(); R.scene.add(R.contactRing);
  R.areaGlow    = E.buildAreaGlow();    R.scene.add(R.areaGlow);

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
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(canvas.parentElement);
  R.onResize = onResize;
}

function clearActors() {
  R.stickmen.forEach(({ sm }) => R.scene.remove(sm.group));
  R.stickmen = [];
  R.live.forEach(l => R.scene.remove(l.sm.group));
  R.live = [];
}

function hideOverlays() {
  R.offsidePlane.material.opacity = 0;
  R.offsideLineGlow.material.opacity = 0;
  R.contactRing.material.opacity = 0;
  R.areaGlow.material.opacity = 0;
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function setHudMode(mode) {                       // 'classic' | 'career'
  $('hdr-classic').style.display = mode === 'classic' ? '' : 'none';
  $('match-hud').style.display   = mode === 'career'  ? '' : 'none';
}
function setReviewUI(on) {
  $('controls-row').style.display = on ? '' : 'none';
  $('verdict-row').style.display  = on ? '' : 'none';
  $('cam-row').style.display      = on ? '' : 'none';
  $('commentary').style.display   = on ? 'none' : '';
}
function updateMatchHud() {
  $('mh-home').textContent   = HOME_TEAM.name;
  $('mh-away').textContent   = G.trainer.team;
  $('mh-score').textContent  = `${G.scoreHome} \u2013 ${G.scoreAway}`;
  $('mh-minute').textContent = Math.min(G.minute, 90) + "\u2032";
  $('mh-rep').textContent    = `\u2696\uFE0F ${G.correct}/${G.trainer.toWin}`;
}

// ── PARTITA CARRIERA ──────────────────────────────────────────────────────────
function startMatch(t) {
  G.mode = 'career';
  G.trainer = t;
  G.epIndex = 0; G.correct = 0;
  G.scoreHome = 0; G.scoreAway = 0;
  G.minute = 0; G.minuteAcc = 0; G.commentTimer = 0;
  $('match-end').classList.remove('open');

  // Genera gli episodi e i minuti in cui scattano.
  G.episodes = [];
  const minutes = [];
  for (let i = 0; i < t.episodes; i++) {
    minutes.push(Math.round(8 + (74 / t.episodes) * i + Math.random() * (74 / t.episodes - 6)));
  }
  minutes.sort((a, b) => a - b);
  for (let i = 0; i < t.episodes; i++) {
    const type = t.types[Math.floor(Math.random() * t.types.length)];
    const diff = pickDiff(t.difficulty);
    const sc = type === 'offside' ? genOffside(diff) : genContact(diff, type);
    sc.diff = diff;
    // A chi "appartiene" l'episodio: la squadra che attacca.
    sc.team = Math.random() < 0.5
      ? { name: HOME_TEAM.name, jersey: HOME_TEAM.jersey, who: 'home' }
      : { name: t.team, jersey: t.jersey, who: 'away' };
    sc.defTeam = sc.team.who === 'home'
      ? { name: t.team, jersey: t.jersey }
      : { name: HOME_TEAM.name, jersey: HOME_TEAM.jersey };
    sc.minute = minutes[i];
    G.episodes.push(sc);
  }

  openMatchScreen();
}

async function openMatchScreen() {
  showScreen('game');
  setHudMode('career');
  setReviewUI(false);
  $('feedback-panel').style.display = 'none';
  $('scenario-banner').textContent =
    `${G.trainer.stadium} \u00B7 ${HOME_TEAM.name} vs ${G.trainer.team}`;

  if (!R.renderer) await initGameScene();
  startLive();
  startLoop();
  if (R.onResize) requestAnimationFrame(R.onResize);
}

// ── FASE LIVE (simulazione ambientale) ────────────────────────────────────────
// Casa attacca verso +x, ospiti verso −x. I portieri restano vicino alla
// propria porta e non ricevono passaggi.
function startLive() {
  G.phase = 'live';
  G.buildup = null;
  clearActors();
  hideOverlays();
  updateMatchHud();
  pushComment();

  for (let i = 0; i < 10; i++) {
    const home = i < 5;
    const gk = i === 0 || i === 9;
    const sm = E.buildStickman(home ? 'attack' : 'defense',
      gk ? 'goalkeeper' : 'player',
      home ? HOME_TEAM.jersey : G.trainer.jersey);
    const dir = home ? 1 : -1;
    const x = gk ? dir * -44 : -dir * (4 + Math.random() * 22);
    const z = gk ? (Math.random() - 0.5) * 6 : -22 + Math.random() * 44;
    sm.group.position.set(x, 0, z);
    R.scene.add(sm.group);
    R.live.push({ sm, team: home ? 'home' : 'away', gk, x, z, tx: x, tz: z, phase: Math.random() * 6.28, wait: 0 });
  }
  R.liveHolder = 1 + Math.floor(Math.random() * 4);   // parte un giocatore di movimento
  R.livePass = null;

  R.camera.position.set(0, 26, -46);
  R.camera.lookAt(0, 0, 0);
}

function nearestLive(x, z, filter) {
  let best = -1, bd = Infinity;
  R.live.forEach((l, i) => {
    if (!filter(l, i)) return;
    const d = Math.hypot(l.x - x, l.z - z);
    if (d < bd) { bd = d; best = i; }
  });
  return { i: best, d: bd };
}

// Sceglie a chi passare: solo compagni, preferenza per chi è più avanti
// (molto più avanti durante il buildup) e a distanza di passaggio sensata.
function pickPassTarget() {
  const h = R.live[R.liveHolder];
  const dir = h.team === 'home' ? 1 : -1;
  const push = G.buildup && G.buildup.who === h.team ? 3 : 1;
  let best = -1, bs = -Infinity;
  R.live.forEach((l, i) => {
    if (i === R.liveHolder || l.team !== h.team || l.gk) return;
    const fwd  = (l.x - h.x) * dir;
    const dist = Math.hypot(l.x - h.x, l.z - h.z);
    if (dist < 3 || dist > 34) return;
    const s = fwd * push - Math.abs(dist - 13) * 0.5 + Math.random() * 5;
    if (s > bs) { bs = s; best = i; }
  });
  return best;
}

function pushComment() {
  const line = COMMENTARY[Math.floor(Math.random() * COMMENTARY.length)]
    .replaceAll('{A}', HOME_TEAM.name).replaceAll('{B}', G.trainer.team);
  $('commentary').textContent = '\u{1F4E2} ' + line;
}

function updateLive(frame) {
  const holder = R.live[R.liveHolder];

  // Giocatori: waypoint con senso tattico. Chi è in possesso spinge avanti,
  // chi difende arretra; durante il buildup la squadra dell'episodio sprinta
  // verso la porta avversaria.
  R.live.forEach(l => {
    const dir = l.team === 'home' ? 1 : -1;
    const sprint = G.buildup && G.buildup.who === l.team && !l.gk;
    const dx = l.tx - l.x, dz = l.tz - l.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.5) {
      if (--l.wait <= 0 || sprint) {
        if (l.gk) {
          l.tx = dir * -44 + (Math.random() - 0.5) * 3;
          l.tz = (Math.random() - 0.5) * 10;
        } else {
          const possess = holder.team === l.team;
          let nx = l.x + (Math.random() - 0.5) * 24 + dir * (possess ? 7 : -5);
          if (sprint) nx = dir * (18 + Math.random() * 20);
          l.tx = Math.max(-46, Math.min(46, nx));
          l.tz = Math.max(-30, Math.min(30, l.z + (Math.random() - 0.5) * 22));
        }
        l.wait = 50 + Math.random() * 110;
      }
      E.animateStickman(l.sm, frame, 0.08, l.phase);
    } else {
      const sp = (G.buildup && G.buildup.who === l.team) ? 0.085 : 0.055;
      l.x += (dx / d) * sp;
      l.z += (dz / d) * sp;
      E.animateStickman(l.sm, frame, sp / 0.07, l.phase);
      l.sm.group.rotation.y = E.lerpAngle(l.sm.group.rotation.y, Math.atan2(-dz, dx), 0.12);
    }
    l.sm.group.position.x = l.x;
    l.sm.group.position.z = l.z;
    l.sm.group.rotation.x += ((l.sm._leanTarget || 0) - l.sm.group.rotation.x) * 0.1;
  });

  // Pallone: passaggi solo tra compagni, con possibilità di intercetto.
  if (!R.livePass) {
    const h = R.live[R.liveHolder];
    R.ball.position.set(h.x + 0.5, 0.42 + Math.abs(Math.sin(frame * 0.2)) * 0.08, h.z);
    if (G.buildup && h.team !== G.buildup.who) {
      // Palla persa: recupero della squadra dell'episodio.
      const n = nearestLive(h.x, h.z, l => l.team === G.buildup.who && !l.gk);
      if (n.i >= 0) R.livePass = { from: { x: h.x + 0.5, z: h.z }, to: n.i, t: 0 };
    } else if (Math.random() < (G.buildup ? 0.035 : 0.012)) {
      const to = pickPassTarget();
      if (to >= 0) R.livePass = { from: { x: h.x + 0.5, z: h.z }, to, t: 0 };
    }
  } else {
    R.livePass.t += 1 / 28;
    const dest = R.live[R.livePass.to];
    const t = Math.min(R.livePass.t, 1);
    const e = 1 - Math.pow(1 - t, 2);
    R.ball.position.set(
      R.livePass.from.x + (dest.x - R.livePass.from.x) * e,
      0.42 + Math.sin(Math.PI * t) * 2.4,
      R.livePass.from.z + (dest.z - R.livePass.from.z) * e
    );
    if (t >= 1) {
      R.liveHolder = R.livePass.to;
      R.livePass = null;
      if (!G.buildup && Math.random() < 0.16) {
        // Passaggio letto dalla difesa: intercetto se c'è un avversario vicino.
        const h2 = R.live[R.liveHolder];
        const n = nearestLive(h2.x, h2.z, l => l.team !== h2.team && !l.gk);
        if (n.d < 6) R.liveHolder = n.i;
      }
    }
  }

  const patches = R.ball.children.find(c => c.name === 'patches');
  patches.rotation.z += 0.08; patches.rotation.x += 0.04;

  // Telecamera: segue morbida il pallone.
  R.camera.position.x += (R.ball.position.x * 0.5 - R.camera.position.x) * 0.02;
  R.camera.lookAt(R.ball.position.x * 0.5, 0, R.ball.position.z * 0.3);

  // Buildup: il check VAR scatta solo quando l'azione arriva davvero nella
  // metà campo d'attacco della squadra coinvolta (orologio fermo).
  if (G.buildup) {
    const dir = G.buildup.who === 'home' ? 1 : -1;
    const carried = !R.livePass && R.live[R.liveHolder].team === G.buildup.who;
    if ((carried && R.ball.position.x * dir > 20) || --G.buildup.timer <= 0) {
      G.buildup = null;
      beginVarCheck(G.episodes[G.epIndex]);
    }
    return;
  }

  // Orologio.
  if (++G.minuteAcc >= MIN_FRAMES) {
    G.minuteAcc = 0;
    G.minute++;
    updateMatchHud();
    if (G.minute % 7 === 0) pushComment();

    const ep = G.episodes[G.epIndex];
    if (ep && G.minute >= ep.minute) {
      G.buildup = { who: ep.team.who, timer: 60 * 8 };
      $('commentary').textContent = '\u{1F4E2} ' + ep.team.name + ' costruisce l’azione in avanti…';
    }
    else if (!ep && G.minute >= 90) endMatch();
  }
}

// ── CHECK VAR → REVIEW ────────────────────────────────────────────────────────
function beginVarCheck(ep) {
  G.phase = 'varcheck';
  G.checkTimer = 110;
  const intro = EPISODE_INTRO[ep.kind === 'offside' ? 'offside' : ep.kind]
    .replaceAll('{T}', ep.team.name);
  $('commentary').textContent = intro;
  $('var-banner').classList.add('show');
}

function startReview(sc) {
  $('var-banner').classList.remove('show');
  G.phase = 'review';
  G.sc = sc;
  G.frame = 0; G.playing = true; G.answered = false;
  G.accMs = 0; G.lastT = 0; G.frozenOffsideX = null;

  clearActors();
  hideOverlays();
  setReviewUI(true);
  $('feedback-panel').style.display = 'none';
  $('btn-play').textContent = '\u23F8';

  const label = sc.kind === 'offside' ? 'FUORIGIOCO?' : sc.kind === 'rigore' ? 'RIGORE?' : 'ROSSO O GIALLO?';
  $('scenario-banner').textContent = G.mode === 'career'
    ? `${sc.minute}\u2032 \u00B7 ${sc.title} \u00B7 CHECK: ${label}`
    : sc.title;

  configureVerdictButtons(sc);

  // Specchio: gli episodi della squadra ospite si giocano verso la porta di
  // sinistra (−x), coerente con la direzione d'attacco vista in fase live.
  // La geometria del verdetto resta in coordinate canoniche: si specchia
  // solo il rendering.
  const mir = (G.mode === 'career' && sc.team && sc.team.who === 'away') ? -1 : 1;
  sc.mir = mir;
  G.cam = 'a';
  updateCamButtons(sc);

  const atkJersey = G.mode === 'career' ? sc.team.jersey    : undefined;
  const defJersey = G.mode === 'career' ? sc.defTeam.jersey : undefined;

  if (sc.type === 'offside') {
    sc.players.forEach(p => {
      const sm = E.buildStickman(p.team, p.role, p.team === 'attack' ? atkJersey : (p.role === 'goalkeeper' ? undefined : defJersey));
      const pos = getPlayerPos(p, sc.passFrame, 0);
      sm.group.position.set(pos.x * mir, 0, pos.z);
      sm.group.rotation.y = p.team === 'attack' ? (mir > 0 ? 0 : Math.PI) : (mir > 0 ? Math.PI : 0);
      R.scene.add(sm.group);
      R.stickmen.push({ sm, p });
    });
    const passer = sc.players.find(p => p.role === 'passer');
    R.ball.position.set(passer.x * mir, 0.38, passer.z);
  } else {
    // Contatto: dribbler + tackler + comparse.
    const drib = E.buildStickman('attack', 'player', atkJersey);
    const tack = E.buildStickman('defense', 'player', defJersey);
    R.scene.add(drib.group); R.scene.add(tack.group);
    R.stickmen.push({ sm: drib, p: { role: 'dribbler' } });
    R.stickmen.push({ sm: tack, p: { role: 'tackler' } });
    sc.players.forEach(p => {
      const sm = E.buildStickman(p.team, p.role, p.team === 'attack' ? atkJersey : (p.role === 'goalkeeper' ? undefined : defJersey));
      sm.group.position.set(p.x * mir, 0, p.z);
      sm.group.rotation.y = p.team === 'attack' ? (mir > 0 ? 0 : Math.PI) : (mir > 0 ? Math.PI : 0);
      p._phase = Math.random() * 6.28;
      R.scene.add(sm.group);
      R.stickmen.push({ sm, p });
    });
    R.contactRing.position.set(sc.cx * mir, 0.06, sc.cz);
    R.areaGlow.position.x = 35.5 * mir;
  }
  applyCam(true);
}

function configureVerdictButtons(sc) {
  const A = $('btn-verdict-a'), B = $('btn-verdict-b');
  if (sc.kind === 'rigore') {
    A.textContent = '\u26AA RIGORE';          A.className = 'verdict-btn off-btn';
    B.textContent = '\u274C NIENTE RIGORE';   B.className = 'verdict-btn on-btn';
  } else if (sc.kind === 'rosso') {
    A.textContent = '\u{1F7E5} ROSSO';        A.className = 'verdict-btn off-btn';
    B.textContent = '\u{1F7E8} GIALLO';       B.className = 'verdict-btn yellow-btn';
  } else {
    A.textContent = '\u{1F6A9} FUORIGIOCO';   A.className = 'verdict-btn off-btn';
    B.textContent = '\u2705 REGOLARE';        B.className = 'verdict-btn on-btn';
  }
  A.disabled = false; B.disabled = false;
}

// ── TELECAMERE REPLAY ─────────────────────────────────────────────────────────
// Tre angolazioni per il check VAR, come in sala regia:
//  offside → TV (broadcast) | LINEA (in asse con la linea del fuorigioco) | PORTA
//  contatto → TV | CAMPO (bordocampo bassa) | ALTO (tattica dall'alto)
const CAM_LABELS = {
  offside: ['TV', 'LINEA', 'PORTA'],
  contact: ['TV', 'CAMPO', 'ALTO'],
};

function updateCamButtons(sc) {
  const labs = CAM_LABELS[sc.type === 'offside' ? 'offside' : 'contact'];
  ['a', 'b', 'c'].forEach((k, i) => {
    const b = $('btn-cam-' + k);
    b.textContent = labs[i];
    b.classList.toggle('active', G.cam === k);
  });
}

function camTarget(sc) {
  const mir = sc.mir || 1;
  if (sc.type === 'offside') {
    const passer = sc.players.find(p => p.role === 'passer');
    const midX  = (sc.lastDefenderX + passer.x) / 2;
    const lineX = (G.frozenOffsideX !== null ? G.frozenOffsideX : sc.lastDefenderX) * mir;
    if (G.cam === 'b') return { px: lineX, py: 6.5, pz: -42, lx: lineX, ly: 0.8, lz: 0 };
    if (G.cam === 'c') return { px: 58 * mir, py: 8, pz: 0, lx: (midX - 4) * mir, ly: 1.2, lz: 0 };
    return { px: (midX + 3) * mir, py: 11, pz: -52, lx: midX * mir, ly: 1.5, lz: 2 };
  }
  const cx = sc.cx * mir, cz = sc.cz;
  if (G.cam === 'b') return { px: cx + 3 * mir, py: 2.4, pz: cz - 13, lx: cx, ly: 1.1, lz: cz };
  if (G.cam === 'c') return { px: cx, py: 26, pz: cz - 7, lx: cx, ly: 0, lz: cz };
  return { px: (sc.cx - 7) * mir, py: 9.5, pz: cz - 26, lx: cx, ly: 1, lz: cz };
}

function applyCam(snap) {
  const t = camTarget(G.sc);
  if (snap || !R.camCur) R.camCur = { ...t };
  else for (const k in t) R.camCur[k] += (t[k] - R.camCur[k]) * 0.09;
  R.camera.position.set(R.camCur.px, R.camCur.py, R.camCur.pz);
  R.camera.lookAt(R.camCur.lx, R.camCur.ly, R.camCur.lz);
}

['a', 'b', 'c'].forEach(k => {
  $('btn-cam-' + k).onclick = () => {
    G.cam = k;
    ['a', 'b', 'c'].forEach(x => $('btn-cam-' + x).classList.toggle('active', x === k));
  };
});

// ── UPDATE REVIEW ─────────────────────────────────────────────────────────────
function updateOffside(sc) {
  const frame = G.frame;
  const mir = sc.mir || 1;

  R.stickmen.forEach(({ sm, p }) => {
    const pos  = getPlayerPos(p, sc.passFrame, frame);
    const prev = getPlayerPos(p, sc.passFrame, Math.max(0, frame - 1));
    const vx = (pos.x - prev.x) * mir, vz = pos.z - prev.z;
    const speed = Math.hypot(vx, vz);

    sm.group.position.x = pos.x * mir;
    sm.group.position.z = pos.z;

    if (p._phase === undefined) p._phase = Math.random() * Math.PI * 2;
    E.animateStickman(sm, frame, Math.min(speed / 0.11, 1.3), p._phase);

    let yaw;
    if (p.team === 'defense') yaw = (mir > 0 ? Math.PI : 0) + Math.sin(frame * 0.02 + p._phase) * 0.12;
    else if (speed > 0.004)   yaw = Math.atan2(-vz, vx);
    else                      yaw = sm.group.rotation.y;
    sm.group.rotation.y = E.lerpAngle(sm.group.rotation.y, yaw, 0.18);

    const leanTarget = (sm._leanTarget || 0) * (p.team === 'defense' ? -0.4 : 1);
    sm.group.rotation.x += (leanTarget - sm.group.rotation.x) * 0.15;
  });

  const passer   = sc.players.find(p => p.role === 'passer');
  const receiver = sc.players.find(p => p.role === 'receiver');
  const passerPos   = getPlayerPos(passer, sc.passFrame, frame);
  const receiverPos = getPlayerPos(receiver, sc.passFrame, frame);

  const shadow  = R.ball.children.find(c => c.name === 'shadow');
  const patches = R.ball.children.find(c => c.name === 'patches');
  const prevX = R.ball.position.x, prevZ = R.ball.position.z;
  let by;
  if (frame < sc.passFrame) {
    by = 0.38 + Math.abs(Math.sin(frame * 0.25)) * 0.18;
    R.ball.position.set(passerPos.x * mir, by, passerPos.z);
  } else {
    const t    = Math.min((frame - sc.passFrame) / (sc.totalFrames * 0.58), 1);
    const ease = 1 - Math.pow(1 - t, 2.4);
    const arc  = Math.sin(Math.PI * t) * 5.5;
    by = 0.38 + arc;
    R.ball.position.set(
      (passerPos.x + (receiverPos.x - passerPos.x) * ease) * mir, by,
      passerPos.z + (receiverPos.z - passerPos.z) * ease
    );
  }
  const h = Math.max(0, by - 0.38);
  shadow.position.set(0, -(by - 0.01), 0);
  shadow.scale.setScalar(1 + h * 0.12);
  shadow.material.opacity = Math.max(0.06, 0.3 - h * 0.03);

  const travel = Math.hypot(R.ball.position.x - prevX, R.ball.position.z - prevZ);
  const spin = 0.04 + travel * 0.9;
  patches.rotation.z += spin;
  patches.rotation.x += spin * 0.5;
  patches.rotation.y += 0.01;

  const lastDef = sc.players.find(p => p.isLast);
  if (frame === sc.passFrame && lastDef) {
    G.frozenOffsideX = getPlayerPos(lastDef, sc.passFrame, frame).x;
  }

  if (frame >= sc.passFrame && G.frozenOffsideX !== null) {
    R.offsidePlane.position.x    = G.frozenOffsideX * mir;
    R.offsideLineGlow.position.x = G.frozenOffsideX * mir;
    const since = frame - sc.passFrame;
    const pulse = 1 + Math.sin(frame * 0.18) * 0.08;
    R.offsidePlane.material.opacity    = Math.min(since / 15, 0.55) * pulse;
    R.offsideLineGlow.material.opacity = Math.min(since / 8, 0.9) * pulse;
  } else if (lastDef) {
    const x = getPlayerPos(lastDef, sc.passFrame, frame).x * mir;
    R.offsidePlane.position.x    = x;
    R.offsideLineGlow.position.x = x;
    R.offsidePlane.material.opacity    = 0.08;
    R.offsideLineGlow.material.opacity = 0.08;
  }

  if (sc.isDeflection && frame >= sc.passFrame + 25) {
    $('frame-badge').textContent = `Frame ${frame} | \u{1F4AB} DEVIAZIONE`;
  } else {
    $('frame-badge').textContent = frame >= sc.passFrame
      ? `Frame ${frame} | \u26A1 PASSAGGIO (frame ${sc.passFrame})`
      : `Frame ${frame} / ${sc.totalFrames - 1}`;
  }
}

function updateContact(sc) {
  const frame = G.frame;
  const CF = sc.contactFrame;
  const mir = sc.mir || 1;
  const pos = getContactPositions(sc, frame);

  const [dribEntry, tackEntry, ...extras] = R.stickmen;
  const drib = dribEntry.sm, tack = tackEntry.sm;

  // Dribbler
  drib.group.position.x = pos.drib.x * mir;
  drib.group.position.z = pos.drib.z;
  if (pos.drib.fall > 0) {
    E.applyFallPose(drib, pos.drib.fall);
  } else {
    E.animateStickman(drib, frame, 1.0, 0.4);
    drib.group.rotation.z = 0;
    drib.group.rotation.x += ((drib._leanTarget || 0) - drib.group.rotation.x) * 0.15;
  }
  drib.group.rotation.y = mir > 0 ? 0 : Math.PI; // corre verso la porta d'attacco

  // Tackler
  tack.group.position.x = pos.tack.x * mir;
  tack.group.position.z = pos.tack.z;
  const dirYaw = Math.atan2(-(sc.tTarget.z - sc.tStart.z), (sc.tTarget.x - sc.tStart.x) * mir);
  tack.group.rotation.y = dirYaw;
  if (pos.tack.slide > 0) E.applySlidePose(tack, pos.tack.slide);
  else {
    E.animateStickman(tack, frame, 1.2, 2.1);
    tack.group.rotation.x += ((tack._leanTarget || 0) - tack.group.rotation.x) * 0.15;
  }

  // Comparse: piccolo movimento sul posto.
  extras.forEach(({ sm, p }) => {
    E.animateStickman(sm, frame, 0.12, p._phase || 0);
    sm.group.position.z = p.z + Math.sin(frame * 0.015 + (p._phase || 0)) * 1.2;
  });

  // Pallone
  const shadow  = R.ball.children.find(c => c.name === 'shadow');
  const patches = R.ball.children.find(c => c.name === 'patches');
  const prevX = R.ball.position.x, prevZ = R.ball.position.z;
  R.ball.position.set(pos.ball.x * mir, pos.ball.y, pos.ball.z);
  shadow.position.set(0, -(pos.ball.y - 0.01), 0);
  const travel = Math.hypot(pos.ball.x - prevX, pos.ball.z - prevZ);
  const spin = 0.04 + travel * 0.9;
  patches.rotation.z += spin; patches.rotation.x += spin * 0.5;

  // Anello contatto: appare poco prima, pulsa dopo.
  if (frame >= CF - 20) {
    const since = frame - (CF - 20);
    const pulse = 1 + Math.sin(frame * 0.25) * 0.25;
    R.contactRing.material.opacity = Math.min(since / 12, frame >= CF ? 0.85 : 0.3) * pulse;
    const s = 1 + (frame >= CF ? Math.sin(frame * 0.25) * 0.12 : 0);
    R.contactRing.scale.set(s, s, s);
  } else {
    R.contactRing.material.opacity = 0;
  }

  // Area di rigore evidenziata negli episodi rigore.
  if (sc.kind === 'rigore') {
    R.areaGlow.material.opacity = 0.35 + Math.sin(frame * 0.1) * 0.15;
  }

  $('frame-badge').textContent = frame >= CF
    ? `Frame ${frame} | \u{1F4A5} CONTATTO (frame ${CF})`
    : `Frame ${frame} / ${sc.totalFrames - 1}`;
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
function startLoop() {
  if (!G.animId) { G.lastT = 0; G.animId = requestAnimationFrame(gameLoop); }
}
function stopLoop() {
  if (G.animId) { cancelAnimationFrame(G.animId); G.animId = null; }
}

let liveFrame = 0;

function gameLoop(t) {
  G.animId = requestAnimationFrame(gameLoop);
  if (!G.lastT) G.lastT = t;
  const dt = t - G.lastT;
  G.lastT = t;

  if (G.phase === 'live') {
    liveFrame++;
    updateLive(liveFrame);
  } else if (G.phase === 'varcheck') {
    liveFrame++;
    // La scena live continua sotto il banner, ma l'orologio è fermo.
    R.live.forEach(l => E.animateStickman(l.sm, liveFrame, 0.08, l.phase));
    if (--G.checkTimer <= 0) startReview(G.episodes[G.epIndex]);
  } else if (G.phase === 'review' || G.phase === 'feedback') {
    if (G.playing) {
      G.accMs += dt * G.speed;
      while (G.accMs >= MSPF) { G.frame++; G.accMs -= MSPF; }
      if (G.frame >= G.sc.totalFrames) {
        G.frame = G.sc.totalFrames - 1;
        G.playing = false;
        $('btn-play').textContent = '\u25B6';
      }
    }
    if (G.sc.type === 'offside') updateOffside(G.sc);
    else updateContact(G.sc);
    applyCam(false);
  }

  if (R.renderer) R.renderer.render(R.scene, R.camera);
}

// ── CONTROLLI REPLAY ──────────────────────────────────────────────────────────
$('btn-play').onclick = () => {
  if (G.frame >= G.sc.totalFrames - 1) { G.frame = 0; G.frozenOffsideX = null; }
  G.playing = !G.playing;
  $('btn-play').textContent = G.playing ? '\u23F8' : '\u25B6';
  G.lastT = 0;
};
$('btn-rew').onclick = () => {
  G.playing = false; $('btn-play').textContent = '\u25B6';
  G.frame = Math.max(0, G.frame - 5);
  if (G.sc.type === 'offside' && G.frame < G.sc.passFrame) G.frozenOffsideX = null;
};
$('btn-fwd').onclick = () => {
  G.playing = false; $('btn-play').textContent = '\u25B6';
  G.frame = Math.min(G.sc.totalFrames - 1, G.frame + 5);
};
$('btn-speed').onclick = () => {
  if (G.speed === 1) { G.speed = 0.5;  $('btn-speed').textContent = '\u{1F407} 1x'; }
  else               { G.speed = 1;    $('btn-speed').textContent = '\u{1F422} 0.5x'; }
};

$('btn-verdict-a').onclick = () => answer(true);
$('btn-verdict-b').onclick = () => answer(false);
$('btn-next-q').onclick    = () => nextStep();
$('btn-abort').onclick     = () => { if (G.mode === 'career') openCareer(); else openCareer(); };

// ── VERDETTO ──────────────────────────────────────────────────────────────────
function answer(val) {
  if (G.answered || G.phase !== 'review') return;
  G.answered = true;
  G.phase = 'feedback';
  G.playing = false;
  $('btn-play').textContent = '\u25B6';
  $('btn-verdict-a').disabled = true;
  $('btn-verdict-b').disabled = true;

  const sc = G.sc;
  const ok = val === sc.truth;

  let conseq = '';
  if (G.mode === 'career') {
    if (ok) G.correct++;
    // La TUA decisione fa il punteggio della partita, giusta o sbagliata che sia.
    if (sc.kind === 'offside') {
      if (!val) { addGoal(sc.team.who); conseq = `\u26BD Gol CONVALIDATO: ${sc.team.name} segna.`; }
      else conseq = `\u{1F6A9} Gol ANNULLATO a ${sc.team.name}.`;
    } else if (sc.kind === 'rigore') {
      if (val) { addGoal(sc.team.who); conseq = `\u26AA Rigore assegnato e trasformato: ${sc.team.name} segna.`; }
      else conseq = '\u274C Nessun rigore, si prosegue.';
    } else {
      conseq = val
        ? `\u{1F7E5} Espulsione: ${sc.defTeam.name} resta in dieci.`
        : `\u{1F7E8} Ammonizione per il difensore di ${sc.defTeam.name}.`;
    }
    if (!ok) conseq += ' \u{1F5E3}\uFE0F La panchina protesta furiosamente!';
    updateMatchHud();
    $('btn-next-q').textContent = 'Riprendi la partita \u25B6';
  } else {
    if (ok) G.score++;
    $('score').textContent = G.score;
    G.answers.push({ title: sc.title, ok, explanation: sc.explanation, correct: sc.isOffside });
    $('btn-next-q').textContent = 'Prossima azione \u2192';
  }

  $('fb-result').textContent = ok ? '\u2705 Decisione corretta!' : '\u274C Decisione sbagliata!';
  $('fb-result').style.color = ok ? '#06d6a0' : '#e63946';
  $('fb-exp').textContent    = sc.explanation;
  $('fb-conseq').textContent = conseq;
  $('feedback-panel').style.display = 'block';
}

function addGoal(who) {
  if (who === 'home') G.scoreHome++; else G.scoreAway++;
}

function nextStep() {
  $('feedback-panel').style.display = 'none';
  if (G.mode === 'classic') {
    G.qi++;
    if (G.qi >= CLASSIC_SCENARIOS.length) showClassicResults();
    else { startReview(CLASSIC_SCENARIOS[G.qi]); updateClassicHud(); }
    return;
  }
  // Carriera: episodio archiviato, si torna al live.
  G.epIndex++;
  setReviewUI(false);
  hideOverlays();
  if (G.epIndex >= G.episodes.length && G.minute >= 90) { endMatch(); return; }
  $('scenario-banner').textContent =
    `${G.trainer.stadium} \u00B7 ${HOME_TEAM.name} vs ${G.trainer.team}`;
  startLive();
}

// ── FINE PARTITA ──────────────────────────────────────────────────────────────
async function endMatch() {
  G.phase = 'idle';
  const t = G.trainer;
  const won = G.correct >= t.toWin;

  if (won) {
    const prev = G.progress.beaten[t.id] || 0;
    G.progress.beaten[t.id] = Math.max(prev, G.correct);
    await saveProgress();
  }

  $('me-title').textContent = won ? '\u{1F3C6} ALLENATORE BATTUTO!' : '\u{1F4C9} SEI STATO SUPERATO';
  $('me-sub').textContent   = `${HOME_TEAM.name} ${G.scoreHome} \u2013 ${G.scoreAway} ${t.team}`;
  $('me-rep').textContent   = `Decisioni corrette: ${G.correct} / ${t.episodes} (servivano ${t.toWin})`;
  $('me-quote').textContent = '\u201C' + (won ? t.winQuote : t.loseQuote) + '\u201D \u2014 ' + t.name;

  const next = TRAINERS.find(x => x.id === t.id + 1);
  $('btn-me-next').style.display = won && next ? '' : 'none';
  $('btn-me-next').onclick  = () => { $('match-end').classList.remove('open'); openTrainerIntro(next); openCareer(); $('trainer-intro').classList.add('open'); };
  $('btn-me-retry').onclick = () => { $('match-end').classList.remove('open'); startMatch(t); };
  $('btn-me-map').onclick   = () => { $('match-end').classList.remove('open'); openCareer(); };

  const allBeaten = Object.keys(G.progress.beaten).length >= TRAINERS.length;
  if (won && allBeaten && t.id === TRAINERS.length) {
    $('me-title').textContent = '\u{1F451} CAMPIONE DEL VAR!';
    $('me-quote').textContent = 'Hai battuto tutti gli 8 allenatori. Sei l\u2019arbitro definitivo.';
  }

  $('match-end').classList.add('open');
}

// ── MODALITÀ CLASSICA ─────────────────────────────────────────────────────────
async function startClassic() {
  G.mode = 'classic';
  G.qi = 0; G.score = 0; G.answers = [];
  showScreen('game');
  setHudMode('classic');
  setReviewUI(true);
  $('feedback-panel').style.display = 'none';
  $('score').textContent = '0';

  if (!R.renderer) await initGameScene();
  startLoop();
  startReview(CLASSIC_SCENARIOS[0]);
  updateClassicHud();
  if (R.onResize) requestAnimationFrame(R.onResize);
}

function updateClassicHud() {
  $('q-num').textContent = G.qi + 1;
  $('progress-fill').style.width = ((G.qi + 1) / 10 * 100) + '%';
}

// ── RISULTATI CLASSICA ────────────────────────────────────────────────────────
let rR, rS, rC, rM = [], rA;

function showClassicResults() {
  stopLoop();
  showScreen('results');

  $('final-score').textContent = G.score;
  $('res-rank').textContent = RANKS[G.score <= 4 ? 0 : G.score <= 6 ? 1 : G.score <= 8 ? 2 : 3];

  const wrong = G.answers.filter(a => !a.ok);
  const ws = $('wrong-section');
  ws.innerHTML = '';
  if (wrong.length) {
    ws.innerHTML = '<div class="wrong-title-hdr">\u274C Risposte Sbagliate</div>';
    wrong.forEach(a => {
      const d = document.createElement('div'); d.className = 'wrong-item';
      d.innerHTML = `<div class="wrong-item-title">${a.title}</div>
        <div class="wrong-item-exp">${a.explanation}</div>
        <div class="wrong-correct">\u2705 Risposta corretta: ${a.correct ? 'FUORIGIOCO' : 'NON in fuorigioco'}</div>`;
      ws.appendChild(d);
    });
  } else {
    ws.innerHTML = '<div style="color:#06d6a0;font-weight:700;font-size:15px;margin:12px 0">\u{1F389} Perfetto! Nessun errore!</div>';
  }

  initResultsThree();
  $('btn-restart').onclick = () => { destroyResultsThree(); startClassic(); };
  $('btn-res-map').onclick = () => { destroyResultsThree(); openCareer(); };
}

async function initResultsThree() {
  await E.loadThree();
  const T3 = E.THREE();
  const rc = $('results-canvas');
  rc.width = window.innerWidth;
  rc.height = window.innerHeight;

  rR = new T3.WebGLRenderer({ canvas: rc, alpha: true, antialias: false });
  rR.setSize(rc.width, rc.height);
  rR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  rS = new T3.Scene();
  rC = new T3.PerspectiveCamera(70, rc.width / rc.height, 0.1, 100);
  rC.position.z = 8;

  const sGeo = new T3.SphereGeometry(0.12, 7, 7);
  const gMat = new T3.MeshBasicMaterial({ color: 0xFFD700 });
  const wMat = new T3.MeshBasicMaterial({ color: 0xffffff });
  const rMat = new T3.MeshBasicMaterial({ color: 0xff4444 });
  rM = [];
  for (let i = 0; i < 80; i++) {
    const mat = i % 3 === 0 ? rMat : i % 2 === 0 ? gMat : wMat;
    const m = new T3.Mesh(sGeo, mat);
    m.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6);
    m.scale.setScalar(Math.random() * 0.9 + 0.4);
    m.userData.vx = (Math.random() - 0.5) * 0.028;
    m.userData.vy = Math.random() * 0.022 + 0.005;
    rS.add(m); rM.push(m);
  }
  rS.add(new T3.AmbientLight(0xffffff, 2));
  animResultsThree();
}

function animResultsThree() {
  rA = requestAnimationFrame(animResultsThree);
  rM.forEach(m => {
    m.position.x += m.userData.vx;
    m.position.y += m.userData.vy;
    if (m.position.y >  9)  m.position.y = -9;
    if (m.position.x > 12)  m.position.x = -12;
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

// ── AVVIO: ripristino sessione salvata ────────────────────────────────────────
restoreSession().then(ok => { if (ok) afterAuth(); });