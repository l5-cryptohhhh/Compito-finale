import { useAuth } from '../context/AuthContext';
import { getTeam, GUEST_TEAMS } from '../data/teams';
import MatchGame from '../components/MatchGame';
import TeamCrest from '../components/TeamCrest';
import styles from '../styles/MatchPage.module.css';

export default function MatchPage({ onExit }) {
  const { user, isGuest, saveMatchResult } = useAuth();
  const team = isGuest ? null : getTeam(user.team);

  const handleFinish = (result) => {
    saveMatchResult(result);
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <button className={styles.back} onClick={onExit}>← {isGuest ? 'Esci' : 'Dashboard'}</button>
        <div className={styles.matchTitle}>
          {isGuest ? (
            <span>{GUEST_TEAMS.home.name} <em>vs</em> {GUEST_TEAMS.away.name}</span>
          ) : (
            <span className={styles.teamLabel}>
              <TeamCrest team={team} size={28} /> {team.name}
            </span>
          )}
        </div>
        <span className={styles.mode}>{isGuest ? 'DEMO' : 'CLASSIFICATA'}</span>
      </header>

      <MatchGame onFinish={handleFinish} isGuest={isGuest} />
    </div>
  );
}
