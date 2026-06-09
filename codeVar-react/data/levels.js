// ═══════════════════════════════════════════
//  CodeVAR — levels.js
//  Sistema di progressione livelli VAR.
// ═══════════════════════════════════════════

export const LEVELS = [
  { name: 'Rookie VAR',        min: 0,    max: 100 },
  { name: 'National VAR',      min: 101,  max: 500 },
  { name: 'Elite VAR',         min: 501,  max: 1000 },
  { name: 'International VAR',  min: 1001, max: 2500 },
  { name: 'World VAR',         min: 2501, max: Infinity },
];

export function getLevel(points) {
  return LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0];
}

// Percentuale di avanzamento nel livello corrente (per barra di progresso)
export function getLevelProgress(points) {
  const lvl = getLevel(points);
  if (lvl.max === Infinity) return 100;
  const span = lvl.max - lvl.min;
  return Math.round(((points - lvl.min) / span) * 100);
}
