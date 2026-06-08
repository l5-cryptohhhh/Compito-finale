/**
 * Utility per il confronto delle risposte.
 * Il confronto è volutamente tollerante: il giocatore non deve essere
 * penalizzato per accenti, maiuscole, punteggiatura o articoli iniziali.
 */

// Articoli iniziali da ignorare (italiano + inglese) per essere clementi.
const LEADING_ARTICLES = ['the', 'il', 'lo', 'la', 'gli', 'le', 'i', 'a', 'an', 'los', 'las', 'el']

/**
 * Normalizza una stringa: minuscolo, niente accenti, niente punteggiatura,
 * spazi compattati e articolo iniziale rimosso.
 */
export function normalize(value) {
  if (!value) return ''
  let s = value
    .toLowerCase()
    .normalize('NFD')               // separa i caratteri dagli accenti
    .replace(/[\u0300-\u036f]/g, '') // rimuove i segni diacritici
    .replace(/[^a-z0-9\s]/g, ' ')    // sostituisce la punteggiatura con spazi
    .replace(/\s+/g, ' ')            // compatta gli spazi multipli
    .trim()

  const parts = s.split(' ')
  if (parts.length > 1 && LEADING_ARTICLES.includes(parts[0])) {
    parts.shift()
    s = parts.join(' ')
  }
  return s
}

/**
 * Verifica se la risposta dell'utente è corretta per una data domanda.
 * Confronta la versione normalizzata con la risposta ufficiale e con
 * tutte le varianti accettate dichiarate nel dataset.
 */
export function isAnswerCorrect(userInput, question) {
  const guess = normalize(userInput)
  if (!guess) return false

  const candidates = [question.answer, ...(question.accept || [])]
  return candidates.some((c) => normalize(c) === guess)
}
