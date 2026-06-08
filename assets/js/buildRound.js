import { QUESTIONS, ALPHABET } from '../data/questions.js'

/**
 * Costruisce una partita: una domanda casuale per ogni lettera A-Z,
 * nell'ordine alfabetico obbligatorio. Pescando a caso dal pool, ogni
 * nuova partita propone (in larga parte) domande diverse.
 *
 * Ritorna un array di 26 elementi nell'ordine A, B, C, ... Z.
 */
export function buildRound() {
  // Raggruppa le domande per lettera una sola volta.
  const byLetter = {}
  for (const q of QUESTIONS) {
    if (!byLetter[q.letter]) byLetter[q.letter] = []
    byLetter[q.letter].push(q)
  }

  return ALPHABET.map((letter) => {
    const pool = byLetter[letter] || []
    if (pool.length === 0) {
      // Fallback di sicurezza: nessuna domanda per la lettera.
      return {
        letter,
        category: 'Cultura musicale',
        clue: 'Domanda non disponibile per questa lettera',
        answer: '',
        accept: [],
      }
    }
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return { ...picked }
  })
}
