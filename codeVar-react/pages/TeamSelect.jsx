import { useAuth } from '../context/AuthContext';
import { TEAMS } from '../data/teams';
import TeamCrest from '../components/TeamCrest';
import styles from '../styles/TeamSelect.module.css';

export default function TeamSelect() {
  const { selectTeam, logout } = useAuth();

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} />
      <header className={styles.head}>
        <div>
          <div className={styles.kicker}>// SCEGLI LA TUA SQUADRA</div>
          <h1>Le tue azioni saranno della squadra scelta</h1>
          <p className={styles.sub}>Squadre ispirate alle città italiane · nomi e stemmi originali</p>
        </div>
        <button className={styles.logout} onClick={logout}>Esci</button>
      </header>

      <div className={styles.grid}>
        {TEAMS.map((team) => (
          <button key={team.id} className={styles.teamCard} onClick={() => selectTeam(team.id)}>
            <TeamCrest team={team} size={64} />
            <div className={styles.teamName}>{team.name}</div>
            <div className={styles.teamCity}>{team.city}</div>
            <div className={styles.colors}>
              <span style={{ background: team.primary }} />
              <span style={{ background: team.secondary }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
