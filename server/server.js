// ── codeVar BACKEND (opzionale) ──────────────────────────────────────────────
// Express minimale: serve i file statici del gioco + API REST per auth e
// salvataggio carriera. Password hashate con scrypt (crypto nativo di Node,
// niente bcrypt da installare). Dati su file JSON in server/data/db.json.
//
// Avvio:   cd server && npm install && npm start
// Il gioco è poi su http://localhost:3000
//
// NB: il front-end funziona ANCHE senza questo server (fallback localStorage).

const express = require('express');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE  = path.join(DATA_DIR, 'db.json');

// ── "DATABASE" SU FILE ────────────────────────────────────────────────────────
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: {} }; }
}
function saveDB(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ── PASSWORD: scrypt + salt ───────────────────────────────────────────────────
function hashPassword(pass) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pass, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(pass, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(pass, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

// ── SESSIONI (persistite su db.json, scadenza 7 giorni) ──────────────────────
const SESSION_TTL = 7 * 24 * 3600 * 1000;

function createSession(db, user) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions = db.sessions || {};
  const now = Date.now();
  for (const t in db.sessions) if (db.sessions[t].exp < now) delete db.sessions[t];
  db.sessions[token] = { user, exp: now + SESSION_TTL };
  return token;
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  const db = loadDB();
  const s = token && db.sessions && db.sessions[token];
  if (!s || s.exp < Date.now()) {
    return res.status(401).json({ error: 'Sessione scaduta, accedi di nuovo.' });
  }
  req.user = s.user;
  req.token = token;
  req.db = db;
  next();
}

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));  // serve il gioco

// ── API ───────────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.post('/api/register', (req, res) => {
  const { user, email, pass } = req.body || {};
  if (!user || typeof user !== 'string' || user.trim().length < 2) {
    return res.status(400).json({ error: 'Username: minimo 2 caratteri.' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Indirizzo email non valido.' });
  }
  if (!pass || pass.length < 6) {
    return res.status(400).json({ error: 'Password: minimo 6 caratteri.' });
  }
  const uname = user.trim();
  const db = loadDB();
  if (db.users[uname]) return res.status(409).json({ error: 'Username già in uso.' });
  if (Object.values(db.users).some(u => u.email === email)) {
    return res.status(409).json({ error: 'Email già utilizzata.' });
  }

  db.users[uname] = {
    email,
    pass: hashPassword(pass),
    progress: { beaten: {} },
    createdAt: new Date().toISOString(),
  };
  const token = createSession(db, uname);
  saveDB(db);
  res.json({ token, user: uname });
});

app.post('/api/login', (req, res) => {
  const { user, pass } = req.body || {};
  const db = loadDB();
  const u = db.users[user];
  if (!u) return res.status(401).json({ error: 'Utente non trovato. Registrati prima.' });
  if (!verifyPassword(pass || '', u.pass)) {
    return res.status(401).json({ error: 'Password errata.' });
  }
  const token = createSession(db, user);
  saveDB(db);
  res.json({ token, user });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/logout', auth, (req, res) => {
  delete req.db.sessions[req.token];
  saveDB(req.db);
  res.json({ ok: true });
});

app.get('/api/progress', auth, (req, res) => {
  const db = loadDB();
  res.json({ progress: (db.users[req.user] || {}).progress || { beaten: {} } });
});

app.post('/api/progress', auth, (req, res) => {
  const db = loadDB();
  if (!db.users[req.user]) return res.status(404).json({ error: 'Utente non trovato.' });
  const incoming = req.body || {};
  if (typeof incoming.beaten !== 'object') {
    return res.status(400).json({ error: 'Formato progressi non valido.' });
  }
  db.users[req.user].progress = { beaten: incoming.beaten };
  saveDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\u26BD codeVar server attivo su http://localhost:${PORT}`);
  console.log('   Il gioco viene servito da qui; le API sono su /api/*');
});