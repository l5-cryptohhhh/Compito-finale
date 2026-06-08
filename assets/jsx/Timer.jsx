/**
 * Timer
 * Mostra il countdown numerico e una barra di avanzamento.
 *
 * Props:
 *  - timeLeft: secondi rimanenti (numero decimale)
 *  - total: durata totale in secondi
 */
export default function Timer({ timeLeft, total }) {
  const pct = Math.max(0, Math.min(100, (timeLeft / total) * 100))
  // La barra cambia colore quando il tempo sta per scadere.
  const urgency = timeLeft <= 5 ? 'is-danger' : timeLeft <= 8 ? 'is-warning' : ''

  return (
    <div className="timer">
      <div className="timer__count" aria-live="off">
        {Math.ceil(timeLeft)}
        <span className="timer__unit">s</span>
      </div>
      <div
        className="timer__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.ceil(timeLeft)}
        aria-label="Tempo rimanente"
      >
        <div className={`timer__fill ${urgency}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
