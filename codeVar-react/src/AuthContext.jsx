import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'codevar_users';
const SESSION_KEY = 'codevar_session';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // utente loggato (o ospite)
  const [isGuest, setIsGuest] = useState(false);

  // Ripristina sessione all'avvio
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s && s.email) {
        const u = loadUsers().find((x) => x.email === s.email);
        if (u) { setUser(u); setIsGuest(false); }
      }
    } catch { /* ignora */ }
  }, []);

  // ── REGISTRAZIONE ──
  function register({ username, email, password }) {
    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'Email già registrata' };
    }
    const newUser = {
      username, email, password,         // nota: in un progetto reale la password va hashata
      team: null,
      stats: { points: 0, matches: 0, correct: 0, totalActions: 0 },
    };
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    setIsGuest(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    return { ok: true };
  }

  // ── LOGIN ──
  function login({ email, password }) {
    const users = loadUsers();
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return { ok: false, error: 'Email o password non corretti' };
    setUser(u);
    setIsGuest(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    return { ok: true };
  }

  // ── OSPITE ──
  function loginGuest() {
    setUser({ username: 'Ospite', email: null, team: null, stats: null });
    setIsGuest(true);
    localStorage.removeItem(SESSION_KEY);
  }

  // ── LOGOUT ──
  function logout() {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem(SESSION_KEY);
  }

  // ── SELEZIONE SQUADRA ──
  function selectTeam(teamId) {
    if (isGuest) { setUser((u) => ({ ...u, team: teamId })); return; }
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx >= 0) {
      users[idx].team = teamId;
      saveUsers(users);
      setUser(users[idx]);
    }
  }

  // ── SALVA RISULTATO PARTITA ──
  function saveMatchResult({ score, correct, totalActions }) {
    if (isGuest || !user) return; // l'ospite non salva progressi
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx < 0) return;
    const s = users[idx].stats;
    s.points += score;
    s.matches += 1;
    s.correct += correct;
    s.totalActions += totalActions;
    saveUsers(users);
    setUser({ ...users[idx] });
  }

  const value = {
    user, isGuest,
    register, login, loginGuest, logout,
    selectTeam, saveMatchResult,
    allUsers: loadUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
