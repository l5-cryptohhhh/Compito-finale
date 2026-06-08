import { useEffect } from 'react'
import Confetti from '../jsx/Confetti.jsx'
import { playFinish } from '../js/sound.js'

/**
 * FinalScreen
 * Schermata finale: messaggio, punteggio, statistiche e pulsante "Gioca ancora".
 * Avvia il suono celebrativo e i confetti al montaggio.
 *
 * Props:
 *  - score: punteggio totale
 *  - correct: numero di risposte corrette
 *  - total: numero totale di domande (26)
 *  - onRestart: avvia una nuova partita
 */
export default function FinalScreen({ score, correct, total, onRestart }) {
  const wrong = total - correct
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  // Messaggio di valutazione in base alla percentuale.
  let verdict = 'Continua ad allenare il tuo orecchio musicale!'
  if (percentage >= 85) verdict = 'Performance da vero intenditore!'
  else if (percentage >= 60) verdict = 'Ottimo ritmo, ci sei quasi!'
  else if (percentage >= 35) verdict = 'Buona base, puoi alzare il volume!'

  useEffect(() => {
    playFinish()
  }, [])

  return (
    <section className="final" aria-labelledby="final-title">
      <Confetti active />

      <h1 id="final-title" className="final__title">PARTITA COMPLETATA</h1>
      <p className="final__verdict">{verdict}</p>

      <div className="final__score">
        <span className="final__score-value">{score}</span>
        <span className="final__score-label">punti totali</span>
      </div>

      <div className="final__stats">
        <div className="final__stat">
          <span className="final__stat-value final__stat-value--correct">{correct}</span>
          <span className="final__stat-label">Corrette</span>
        </div>
        <div className="final__stat">
          <span className="final__stat-value final__stat-value--wrong">{wrong}</span>
          <span className="final__stat-label">Errate</span>
        </div>
        <div className="final__stat">
          <span className="final__stat-value">{percentage}%</span>
          <span className="final__stat-label">Precisione</span>
        </div>
      </div>

      <button type="button" className="btn-soft btn-soft--primary final__cta" onClick={onRestart}>
        GIOCA ANCORA
      </button>
    </section>
  )
}
