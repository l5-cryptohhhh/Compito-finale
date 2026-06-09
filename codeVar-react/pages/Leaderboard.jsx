import { useAuth } from '../context/AuthContext';
import { getLevel } from '../data/levels';
import { getTeam } from '../data/teams';
import TeamCrest from '../components/TeamCrest';
import styles from '../styles/Leaderboard.module.css';

export default function Leaderboard({ onBack }) {
  const { allUsers, user } = useAuth();

  const players = allUsers()
    .map((u) => {
      const acc = u.stats.totalActions > 0
        ? Math.round((u.stats.correct / u.stats.totalActions) * 100) : 0;
      return { ...u, accuracy: acc, level: getLevel(u.stats.points).name };
    })
    .sort((a, b) => b.stats.points - a.stats.points)
    .slice(0, 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} />
      <header className={styles.head}>
        <button className={styles.back} onClick={onBack}>← Dashboard</button>
        <div>
          <div className={styles.kicker}>// CLASSIFICA</div>
          <h1>Top arbitri VAR</h1>
        </div>
      </header>

      {players.length === 0 ? (
        <p className={styles.empty}>Nessun giocatore in classifica. Completa una partita!</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.rowHead}>
            <span>#</span><span>Giocatore</span><span>Livello</span><span>Prec.</span><span>Punti</span>
          </div>
          {players.map((p, i) => (
            <div key={p.email} className={`${styles.row} ${user && p.email === user.email ? styles.me : ''}`}>
              <span className={styles.rank}>{i + 1}</span>
              <span className={styles.player}>
                <TeamCrest team={getTeam(p.team)} size={26} />
                {p.username}
              </span>
              <span className={styles.level}>{p.level}</span>
              <span>{p.accuracy}%</span>
              <span className={styles.pts}>{p.stats.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
