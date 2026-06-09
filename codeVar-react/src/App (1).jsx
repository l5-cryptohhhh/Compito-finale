import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TeamSelect from './pages/TeamSelect';
import Dashboard from './pages/Dashboard';
import MatchPage from './pages/MatchPage';
import Leaderboard from './pages/Leaderboard';
import './index.css';

function Router() {
  const { user, isGuest } = useAuth();
  const [page, setPage] = useState('dashboard'); // dashboard | match | leaderboard

  // Non loggato → login
  if (!user) return <Login />;

  // Loggato ma senza squadra (non ospite) → selezione squadra
  if (!isGuest && !user.team) return <TeamSelect />;

  // Ospite va dritto alla partita demo
  if (isGuest) {
    if (page === 'match') return <MatchPage onExit={() => setPage('guest-home')} />;
    return <GuestHome onPlay={() => setPage('match')} />;
  }

  // Utente registrato con squadra
  if (page === 'match') return <MatchPage onExit={() => setPage('dashboard')} />;
  if (page === 'leaderboard') return <Leaderboard onBack={() => setPage('dashboard')} />;
  return <Dashboard onPlay={() => setPage('match')} onLeaderboard={() => setPage('leaderboard')} />;
}

// Mini-home per l'ospite
function GuestHome({ onPlay }) {
  const { logout } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24, textAlign: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: 3, color: '#3ad6c5' }}>// MODALITÀ OSPITE</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Demo · Bianchi vs Neri</h1>
      <p style={{ color: '#8a8a96', maxWidth: 420 }}>Azioni casuali, nessun progresso salvato. Registrati per scegliere una squadra e scalare la classifica.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onPlay} style={btnPrimary}>⚽ Gioca la demo</button>
        <button onClick={logout} style={btnGhost}>Torna al login</button>
      </div>
    </div>
  );
}
const btnPrimary = { padding: '14px 28px', borderRadius: 24, border: 'none', background: '#c8102e', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };
const btnGhost = { padding: '14px 28px', borderRadius: 24, border: '1px solid #2a2a34', background: 'transparent', color: '#a0a0a8', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
