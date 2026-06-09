// ═══════════════════════════════════════════
//  CodeVAR — actionGenerator.js
//  Genera azioni 3D. Il verdetto NON è deciso a priori:
//  viene calcolato dalla posizione reale dei giocatori
//  nell'istante esatto del passaggio/contatto.
// ═══════════════════════════════════════════

export const ACTION_TYPES = {
  FUORIGIOCO: 'fuorigioco',
  RIGORE: 'rigore',
  FALLO: 'fallo',
  GOL: 'gol',
};

export const DECISIONS = {
  CONFERMA_GOL: 'Conferma Gol',
  ANNULLA_GOL: 'Annulla Gol',
  ASSEGNA_RIGORE: 'Assegna Rigore',
  NESSUN_RIGORE: 'Nessun Rigore',
  CARTELLINO_GIALLO: 'Cartellino Giallo',
  CARTELLINO_ROSSO: 'Cartellino Rosso',
  NESSUNA_INFRAZIONE: 'Nessuna Infrazione',
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Istante chiave dell'azione (0..1)
export const KEY_T = 0.45;

// ───────────────────────────────────────────
//  FUORIGIOCO
//  La posizione dell'attaccante al momento KEY_T determina il verdetto.
// ───────────────────────────────────────────
function buildOffside() {
  // Linea dell'ultimo difensore (coordinata X nel mondo 3D)
  const defLineX = rand(18, 28);

  // Decidiamo che TIPO di scenario vogliamo mostrare (per varietà),
  // ma il verdetto reale lo calcoliamo DOPO dalla posizione effettiva.
  const scenario = pick(['netto', 'millimetrico', 'regolare']);
  let attackerKeyX;
  if (scenario === 'netto')        attackerKeyX = defLineX + rand(2.5, 4.5);
  else if (scenario === 'millimetrico') attackerKeyX = defLineX + rand(0.3, 1.0);
  else /* regolare */               attackerKeyX = defLineX - rand(1.5, 4);

  // Posizioni di partenza e arrivo per l'animazione
  const attZ = rand(-12, 12);
  // L'attaccante parte più indietro e al momento KEY_T si trova ESATTAMENTE in attackerKeyX
  const attStartX = attackerKeyX - 10;
  const attEndX = attackerKeyX + 7; // prosegue dopo il passaggio

  const passerX = defLineX - rand(22, 30);
  const passerZ = rand(-14, 14);

  // VERDETTO CALCOLATO dalla posizione reale al momento del passaggio:
  // fuorigioco se l'attaccante è OLTRE la linea (X maggiore).
  const margin = attackerKeyX - defLineX;
  const isOffside = margin > 0;

  // Etichetta coerente con il margine effettivo
  let label;
  if (!isOffside) label = 'regolare';
  else if (margin < 1.2) label = 'millimetrico';
  else label = 'netto';

  return {
    type: ACTION_TYPES.FUORIGIOCO,
    variant: label,
    keyT: KEY_T,
    keyLabel: 'PASSAGGIO',
    // dati per la scena 3D
    setup: {
      defLineX,
      attStartX, attEndX, attZ,
      attackerKeyX,           // dove sta l'attaccante al passaggio
      passerX, passerZ,
      defZ: [rand(-15, 15), rand(-15, 15), rand(-15, 15)],
    },
    correct: isOffside ? DECISIONS.ANNULLA_GOL : DECISIONS.CONFERMA_GOL,
    question: 'L\'attaccante era in fuorigioco al momento del passaggio?',
    options: [DECISIONS.ANNULLA_GOL, DECISIONS.CONFERMA_GOL],
    verdictText: isOffside ? `FUORIGIOCO ${label.toUpperCase()}` : 'POSIZIONE REGOLARE',
    explanation: isOffside
      ? `Fuorigioco ${label}: al momento del passaggio l'attaccante era ${margin.toFixed(1)} metri oltre la linea dell'ultimo difensore.`
      : `Posizione regolare: al momento del passaggio l'attaccante era ${Math.abs(margin).toFixed(1)} metri dietro la linea dell'ultimo difensore.`,
  };
}

// ───────────────────────────────────────────
//  RIGORE
//  Il contatto (o l'assenza di contatto) determina il verdetto.
// ───────────────────────────────────────────
function buildRigore() {
  const contactX = rand(36, 44);   // dentro l'area (destra)
  const contactZ = rand(-12, 12);
  // Scenario: contatto reale oppure simulazione/no contatto
  const hasContact = Math.random() > 0.45;

  return {
    type: ACTION_TYPES.RIGORE,
    variant: hasContact ? 'contatto' : 'simulazione',
    keyT: 0.55,
    keyLabel: 'CONTATTO',
    setup: {
      contactX, contactZ, hasContact,
      attStartX: contactX - 14, attStartZ: contactZ + rand(-6, 6),
      defStartX: contactX + 6,  defStartZ: contactZ + rand(-4, 4),
      keeperX: 47, keeperZ: contactZ * 0.3,
    },
    correct: hasContact ? DECISIONS.ASSEGNA_RIGORE : DECISIONS.NESSUN_RIGORE,
    question: 'C\'è un contatto falloso in area di rigore?',
    options: [DECISIONS.ASSEGNA_RIGORE, DECISIONS.NESSUN_RIGORE],
    verdictText: hasContact ? 'CONTATTO FALLOSO' : 'NESSUN CONTATTO',
    explanation: hasContact
      ? 'Il difensore colpisce l\'attaccante prima della palla: calcio di rigore.'
      : 'L\'attaccante cade senza contatto reale: nessun rigore, si prosegue.',
  };
}

// ───────────────────────────────────────────
//  FALLO / CARTELLINO
// ───────────────────────────────────────────
function buildFallo() {
  const variant = pick(['regolare', 'tattico', 'grave']);
  const midX = rand(-10, 20);
  const midZ = rand(-15, 15);
  let correct, verdictText, explanation;
  if (variant === 'regolare') {
    correct = DECISIONS.NESSUNA_INFRAZIONE;
    verdictText = 'CONTRASTO REGOLARE';
    explanation = 'Intervento pulito sulla palla: nessuna infrazione.';
  } else if (variant === 'tattico') {
    correct = DECISIONS.CARTELLINO_GIALLO;
    verdictText = 'FALLO TATTICO';
    explanation = 'Fallo che interrompe un\'azione promettente: cartellino giallo.';
  } else {
    correct = DECISIONS.CARTELLINO_ROSSO;
    verdictText = 'FALLO GRAVE';
    explanation = 'Intervento a gamba tesa con pericolo per l\'avversario: cartellino rosso.';
  }

  return {
    type: ACTION_TYPES.FALLO,
    variant,
    keyT: 0.55,
    keyLabel: 'CONTRASTO',
    setup: {
      midX, midZ, fall: variant !== 'regolare',
      attStartX: midX - 12, attStartZ: midZ + rand(-6, 6),
      defStartX: midX + 12, defStartZ: midZ + rand(-4, 4),
    },
    correct,
    question: 'Che provvedimento prendi sull\'intervento?',
    options: [DECISIONS.NESSUNA_INFRAZIONE, DECISIONS.CARTELLINO_GIALLO, DECISIONS.CARTELLINO_ROSSO],
    verdictText,
    explanation,
  };
}

// ───────────────────────────────────────────
//  GOL (valido / da annullare)
// ───────────────────────────────────────────
function buildGol() {
  const valid = Math.random() > 0.45;
  const reason = valid ? null : pick(['fuorigioco', 'fallo', 'tocco di mano']);

  return {
    type: ACTION_TYPES.GOL,
    variant: valid ? 'valido' : reason,
    keyT: 0.9,
    keyLabel: 'GOL',
    setup: {
      startX: rand(8, 22), startZ: rand(-12, 12),
      goalX: 48, goalZ: rand(-3, 3),
    },
    correct: valid ? DECISIONS.CONFERMA_GOL : DECISIONS.ANNULLA_GOL,
    question: 'Il gol è regolare?',
    options: [DECISIONS.CONFERMA_GOL, DECISIONS.ANNULLA_GOL],
    verdictText: valid ? 'GOL REGOLARE' : `IRREGOLARE · ${reason.toUpperCase()}`,
    explanation: valid
      ? 'Nessuna irregolarità nell\'azione: gol convalidato.'
      : `Gol da annullare per ${reason} nell\'azione che precede la rete.`,
  };
}

const BUILDERS = [buildOffside, buildRigore, buildFallo, buildGol];

export function generateAction() {
  return pick(BUILDERS)();
}
