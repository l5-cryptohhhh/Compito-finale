import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

export default function Login() {
  const { login, register, loginGuest } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    setError('');
    if (mode === 'login') {
      if (!form.email || !form.password) return setError('Inserisci email e password');
      const r = login({ email: form.email, password: form.password });
      if (!r.ok) setError(r.error);
    } else {
      if (!form.username || !form.email || !form.password) return setError('Compila tutti i campi');
      if (form.password !== form.confirm) return setError('Le password non coincidono');
      const r = register({ username: form.username, email: form.email, password: form.password });
      if (!r.ok) setError(r.error);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.code}>{'{ code }'}</span>
          <span className={styles.var}><span className={styles.v}>V</span>AR</span>
        </div>
        <p className={styles.tagline}>Video Assistant Referee · Simulatore</p>

        <div className={styles.tabs}>
          <button className={mode === 'login' ? styles.tabActive : styles.tab} onClick={() => { setMode('login'); setError(''); }}>Accedi</button>
          <button className={mode === 'register' ? styles.tabActive : styles.tab} onClick={() => { setMode('register'); setError(''); }}>Registrati</button>
        </div>

        <div className={styles.fields}>
          {mode === 'register' && (
            <input className={styles.input} placeholder="Username" value={form.username} onChange={upd('username')} />
          )}
          <input className={styles.input} placeholder="Email" type="email" value={form.email} onChange={upd('email')} />
          <input className={styles.input} placeholder="Password" type="password" value={form.password} onChange={upd('password')} />
          {mode === 'register' && (
            <input className={styles.input} placeholder="Conferma password" type="password" value={form.confirm} onChange={upd('confirm')} />
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.primary} onClick={submit}>
          {mode === 'login' ? 'Accedi' : 'Crea account'}
        </button>

        <div className={styles.divider}><span>oppure</span></div>

        <button className={styles.guest} onClick={loginGuest}>
          Entra come ospite
        </button>
        <p className={styles.guestHint}>
          Modalità demo · Bianchi vs Neri · azioni casuali · nessun salvataggio
        </p>
      </div>
    </div>
  );
}
