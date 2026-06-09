// ═══════════════════════════════════════════
//  CodeVAR — teams.js
//  Squadre fittizie ispirate ai colori delle città italiane.
//  Nessun logo o marchio ufficiale: stemmi generati via SVG.
// ═══════════════════════════════════════════

export const TEAMS = [
  { id: 'lupi',        name: 'Lupi Capitolini',  city: 'Roma',      primary: '#8e1b1b', secondary: '#e6b800', initials: 'LC' },
  { id: 'partenopei',  name: 'Partenopei',       city: 'Napoli',    primary: '#0a84c1', secondary: '#ffffff', initials: 'PA' },
  { id: 'bianconeri',  name: 'Vecchia Signora',  city: 'Torino',    primary: '#1a1a1a', secondary: '#ffffff', initials: 'VS' },
  { id: 'rossoneri',   name: 'Diavoli Rossi',    city: 'Milano',    primary: '#b00020', secondary: '#1a1a1a', initials: 'DR' },
  { id: 'nerazzurri',  name: 'Biscia Nerazzurra',city: 'Milano',    primary: '#0b1c44', secondary: '#1e88e5', initials: 'BN' },
  { id: 'orobici',     name: 'Orobici',          city: 'Bergamo',   primary: '#1b3a8e', secondary: '#1a1a1a', initials: 'OR' },
  { id: 'viola',       name: 'Gigliati Viola',   city: 'Firenze',   primary: '#5e2e8e', secondary: '#ffffff', initials: 'GV' },
];

export function getTeam(id) {
  return TEAMS.find((t) => t.id === id) || TEAMS[0];
}

// Squadre della modalità ospite (sempre Bianchi vs Neri)
export const GUEST_TEAMS = {
  home: { id: 'bianchi', name: 'Bianchi', primary: '#f0f0f0', secondary: '#888', initials: 'BI' },
  away: { id: 'neri',    name: 'Neri',    primary: '#1a1a1a', secondary: '#555', initials: 'NE' },
};
