// ── DATI CARRIERA ─────────────────────────────────────────────────────────────
// 8 allenatori-boss stile "capipalestra". Ogni vittoria sblocca il successivo.
// difficulty: 'media' | 'mista' | 'millimetrica'  (mista = 50/50 a episodio)
// types: tipi di episodio che possono capitare nella partita.
// episodes: quanti episodi VAR nella partita. toWin: decisioni corrette minime.

export const TRAINERS = [
  {
    id: 1, name: 'Mister Bruni', team: 'Borgo Vecchio',
    stadium: 'Campo Comunale "La Polvere"', league: 'Terza Categoria',
    color: '#8e5a2b', jersey: 0x8e5a2b,
    episodes: 4, toWin: 3, difficulty: 'media', types: ['offside'],
    taunt: 'Ragazzino, qui il VAR è un telone dietro la porta. Vediamo se hai occhio.',
    winQuote: 'Occhio buono. Ma in Promozione corrono il doppio.',
    loseQuote: 'Torna quando distingui un fuorigioco da un calcio d\u2019angolo.',
  },
  {
    id: 2, name: 'Mister Ferraro', team: 'Sporting Litorale',
    stadium: 'Arena del Molo', league: 'Promozione',
    color: '#1f8a6d', jersey: 0x1f8a6d,
    episodes: 4, toWin: 3, difficulty: 'media', types: ['offside'],
    taunt: 'I miei attaccanti partono sempre sul filo. Sempre.',
    winQuote: 'Hai fermato il mio gioco in profondità. Rispetto.',
    loseQuote: 'Il filo del fuorigioco ti ha tagliato, arbitro.',
  },
  {
    id: 3, name: 'Mister Vitale', team: 'Real Collina',
    stadium: 'Stadio delle Terrazze', league: 'Eccellenza',
    color: '#b03a9c', jersey: 0xb03a9c,
    episodes: 5, toWin: 4, difficulty: 'media', types: ['offside', 'rigore'],
    taunt: 'La mia squadra cade in area con molto talento. Sai riconoscere una simulazione?',
    winQuote: 'Non abbocchi ai tuffi. Peccato, era la mia arma migliore.',
    loseQuote: 'Ti ho venduto tre rigori su cinque. Grazie dei punti.',
  },
  {
    id: 4, name: 'Mister Kowalski', team: 'Dinamo Nord',
    stadium: 'Fortezza del Ghiaccio', league: 'Serie D',
    color: '#3a7bd5', jersey: 0x3a7bd5,
    episodes: 5, toWin: 4, difficulty: 'mista', types: ['offside', 'rigore'],
    taunt: 'Difendiamo altissimi. Ogni azione finisce sul filo del millimetro.',
    winQuote: 'Millimetri. Li hai visti tutti. Impressionante.',
    loseQuote: 'La mia linea alta ti ha mandato in tilt.',
  },
  {
    id: 5, name: 'Mister Serra', team: 'Officina Calcio',
    stadium: 'Stadio dei Cantieri', league: 'Serie C',
    color: '#c0392b', jersey: 0xc0392b,
    episodes: 5, toWin: 4, difficulty: 'mista', types: ['offside', 'rigore', 'rosso'],
    taunt: 'I miei entrano duri. Sta a te decidere: giallo o rosso?',
    winQuote: 'Hai tenuto in pugno una partita di guerra. Bravo.',
    loseQuote: 'Ti tremava il cartellino, si vedeva dalla tribuna.',
  },
  {
    id: 6, name: 'Mister Almeida', team: 'Atletico Riviera',
    stadium: 'Estadio do Sol', league: 'Serie B',
    color: '#e67e22', jersey: 0xe67e22,
    episodes: 6, toWin: 5, difficulty: 'mista', types: ['offside', 'rigore', 'rosso'],
    taunt: 'Velocità, dribbling, contatti in area. Benvenuto nel calcio vero.',
    winQuote: 'Decidere a quella velocità... hai la stoffa per la Serie A.',
    loseQuote: 'Il ritmo ti ha mangiato. Riprova con calma.',
  },
  {
    id: 7, name: 'Mister De Santis', team: 'Capitale FC',
    stadium: 'Stadio Olimpo', league: 'Serie A',
    color: '#5b48c2', jersey: 0x5b48c2,
    episodes: 6, toWin: 5, difficulty: 'millimetrica', types: ['offside', 'rigore', 'rosso'],
    taunt: 'Ottanta mila persone fischiano ogni tua decisione. Reggi la pressione?',
    winQuote: 'Freddo come il ghiaccio sotto la curva. Sei pronto per la finale.',
    loseQuote: 'Lo stadio ti ha divorato. Succede ai migliori.',
  },
  {
    id: 8, name: 'Mister Volkov', team: 'Invicta Continental',
    stadium: 'Gran Stadio Internazionale', league: 'Finale di Coppa',
    color: '#c9a227', jersey: 0xc9a227,
    episodes: 6, toWin: 6, difficulty: 'millimetrica', types: ['offside', 'rigore', 'rosso'],
    taunt: 'La finale. Sei episodi, zero errori concessi. Il mondo guarda.',
    winQuote: 'Perfetto. Sei l\u2019arbitro più forte che abbia mai visto.',
    loseQuote: 'Un solo errore in finale pesa come dieci. Lo sai adesso.',
  },
];

// Squadra "di casa" che affronta l'allenatore in ogni partita.
export const HOME_TEAM = { name: 'Union Codevar', color: '#d63031', jersey: 0xd63031 };

// Gradi arbitro per la modalità classica e per il riepilogo carriera.
export const RANKS = [
  '\u{1F393} Arbitro Dilettante',
  '\u{1F4CB} Arbitro in Formazione',
  '\u2B50 Arbitro Esperto',
  '\u{1F3C6} Arbitro Professionista',
];

// Cronaca della fase live (i {A}/{B} vengono sostituiti dai nomi squadra).
export const COMMENTARY = [
  'Possesso prolungato di {A} a centrocampo.',
  '{B} pressa alto, ritmi intensi.',
  'Cross di {A}, la difesa libera.',
  'Punizione dalla trequarti per {B}, nulla di fatto.',
  'Occasione! {A} calcia da fuori, palla alta.',
  'Contropiede di {B}, fermato al limite.',
  'Il portiere di {A} blocca in due tempi.',
  'Fase di studio, il pallone viaggia tra le difese.',
  'Angolo per {B}, la mischia non produce nulla.',
  'Tackle pulito a centrocampo, si riparte.',
  '{A} palleggia con pazienza in cerca del varco.',
  'Lancio lungo di {B}, l\u2019attaccante non ci arriva.',
];

// Testi che introducono l'episodio VAR in base al tipo.
export const EPISODE_INTRO = {
  offside: '\u26BD GOL di {T}!... ma la sala VAR chiama: possibile fuorigioco.',
  rigore:  '\u{1F4A5} Contatto in area su un giocatore di {T}! Check VAR: rigore?',
  rosso:   '\u{1F9B5} Intervento durissimo su {T}! Check VAR: che cartellino \u00E8?',
};

// Config difficoltà: margini in "metri campo" (1 unità ≈ 1 m).
// off: distanza |attaccante − ultimo difensore| oltre/entro la soglia.
// dev: deviazione del pallone al contatto quando il difensore tocca la palla
//      (gradi) — più piccola = più difficile da vedere.
export const DIFF = {
  media:        { offMin: 0.9,  offMax: 2.2, devMin: 34, devMax: 55, gapMin: 0.9, gapMax: 1.4 },
  millimetrica: { offMin: 0.12, offMax: 0.5, devMin: 10, devMax: 19, gapMin: 0.45, gapMax: 0.7 },
};

export function pickDiff(trainerDifficulty) {
  if (trainerDifficulty === 'mista') return Math.random() < 0.5 ? 'media' : 'millimetrica';
  return trainerDifficulty;
}