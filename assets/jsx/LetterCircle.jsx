import { ALPHABET } from '../data/questions.js'

/**
 * LetterCircle
 * Dispone le 26 lettere (A-Z) in cerchio, in senso orario partendo dall'alto.
 *
 * Props:
 *  - statuses: array di 26 stringhe con lo stato di ogni lettera
 *              ('idle' | 'current' | 'correct' | 'wrong')
 */
export default function LetterCircle({ statuses }) {
  const total = ALPHABET.length

  return (
    <div className="letter-circle" role="img" aria-label="Cerchio delle lettere del quiz">
      {/* Cerchio decorativo interno */}
      <div className="letter-circle__ring" aria-hidden="true" />

      {ALPHABET.map((letter, i) => {
        // Angolo: parte da -90° (alto) e procede in senso orario.
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2
        const radiusPct = 44 // raggio in % rispetto al contenitore
        const x = 50 + radiusPct * Math.cos(angle)
        const y = 50 + radiusPct * Math.sin(angle)
        const status = statuses[i] || 'idle'

        return (
          <span
            key={letter}
            className={`letter-circle__item is-${status}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Lettera ${letter}: ${statusLabel(status)}`}
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}

// Etichetta accessibile per lo stato della lettera.
function statusLabel(status) {
  switch (status) {
    case 'current':
      return 'in gioco'
    case 'correct':
      return 'corretta'
    case 'wrong':
      return 'errata'
    default:
      return 'non ancora giocata'
  }
}
