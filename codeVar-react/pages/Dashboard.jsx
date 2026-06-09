import { useAuth } from '../context/AuthContext';
import { getTeam } from '../data/teams';
import { getLevel, getLevelProgress } from '../data/levels';
import TeamCrest from '../components/TeamCrest';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard({ onPlay, onLeaderboard }) {
  const { user, logout } = useAuth();
  const team = getTeam(user.team);
  const stats = user.stats || { points: 0, matches: 0, correct: 0, totalActions: 0 };
  const level = getLevel(stats.points);
  const progress = getLevelProgress(stats.points);
  const accuracy = stats.totalActions > 0
    ? Math.round((stats.correct / stats.totalActions) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} />

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.code}>{'{ code }'}</span>
          <span className={styles.var}><span className={styles.v}>V</span>AR</span>
        </div>
        <button className={styles.logout} onClick={logout}>Logout</button>
      </header>

      <div className={styles.content}>
        {/* PROFILO */}
        <section className={styles.profile}>
          <div className={styles.profileTop}>
            <TeamCrest team={team} size={72} />
            <div>
              <div className={styles.username}>{user.username}</div>
              <div className={styles.teamName}>{team.name}</div>
              <div className={styles.levelBadge}>{level.name}</div>
            </div>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>Progresso livello</span><span>{stats.points} pt</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        {/* STATISTICHE */}
        <section className={styles.stats}>
          <div className={styles.statCard}><span>{stats.points}</span><small>Punti totali</small></div>
          <div className={styles.statCard}><span>{accuracy}%</span><small>Precisione</small></div>
          <div className={styles.statCard}><span>{stats.correct}</span><small>Decisioni corrette</small></div>
          <div className={styles.statCard}><span>{stats.matches}</span><small>Partite</small></div>
        </section>

        {/* MENU */}
        <section className={styles.menu}>
          <button className={styles.menuPrimary} onClick={onPlay}>
            <span className={styles.menuIcon}>⚽</span>
            <span>Nuova partita</span>
            <span className={styles.menuArrow}>→</span>
          </button>
          <button className={styles.menuItem} onClick={onLeaderboard}>
            <span className={styles.menuIcon}>🏆</span> Classifica
          </button>
        </section>
      </div>
    </div>
  );
}
