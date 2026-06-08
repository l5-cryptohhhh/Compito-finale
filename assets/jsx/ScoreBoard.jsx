/**
 * ScoreBoard
 * Pannello compatto con il punteggio e l'avanzamento della partita.
 *
 * Props:
 *  - score: punteggio corrente
 *  - correct: numero di risposte corrette
 *  - answered: numero di domande già giocate
 *  - total: numero totale di domande (26)
 */
export default function ScoreBoard({ score, correct, answered, total }) {
  return (
    <div className="scoreboard" role="status" aria-live="polite">
      <div className="scoreboard__item">
        <span className="scoreboard__value">{score}</span>
        <span className="scoreboard__label">Punti</span>
      </div>
      <div className="scoreboard__divider" aria-hidden="true" />
      <div className="scoreboard__item">
        <span className="scoreboard__value">{correct}</span>
        <span className="scoreboard__label">Corrette</span>
      </div>
      <div className="scoreboard__divider" aria-hidden="true" />
      <div className="scoreboard__item">
        <span className="scoreboard__value">
          {answered}<span className="scoreboard__sub">/{total}</span>
        </span>
        <span className="scoreboard__label">Lettere</span>
      </div>
    </div>
  )
}
