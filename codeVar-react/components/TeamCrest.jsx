import styles from '../styles/TeamCrest.module.css';

/**
 * Stemma generato via SVG (nessun logo ufficiale).
 * Forma a scudo con iniziali e colori della squadra.
 */
export default function TeamCrest({ team, size = 56 }) {
  if (!team) return null;
  return (
    <svg
      className={styles.crest}
      width={size}
      height={size}
      viewBox="0 0 60 68"
      aria-label={team.name}
    >
      <defs>
        <linearGradient id={`g-${team.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={team.primary} />
          <stop offset="100%" stopColor={shade(team.primary, -25)} />
        </linearGradient>
      </defs>
      <path
        d="M30 2 L56 10 L56 36 Q56 56 30 66 Q4 56 4 36 L4 10 Z"
        fill={`url(#g-${team.id})`}
        stroke={team.secondary}
        strokeWidth="2.5"
      />
      <path d="M4 24 L56 24" stroke={team.secondary} strokeWidth="1.5" opacity="0.5" />
      <text
        x="30" y="40"
        textAnchor="middle"
        fontFamily="'Sora', sans-serif"
        fontWeight="800"
        fontSize="18"
        fill={team.secondary}
      >
        {team.initials}
      </text>
    </svg>
  );
}

function shade(hex, percent) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) + percent;
  let g = ((n >> 8) & 0xff) + percent;
  let b = (n & 0xff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
