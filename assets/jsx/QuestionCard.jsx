import { useState, useRef, useEffect } from 'react'

/**
 * QuestionCard
 * Mostra la domanda corrente, il campo risposta e il pulsante Conferma.
 * Viene rimontata a ogni domanda (tramite key nel GameBoard), così l'input
 * si svuota e riprende automaticamente il focus.
 *
 * Props:
 *  - question: { letter, category, clue, answer }
 *  - feedback: 'correct' | 'wrong' | null  -> guida glow/shake e il colore
 *  - revealedAnswer: stringa da mostrare quando la risposta è errata/scaduta
 *  - disabled: blocca input e pulsante durante la transizione
 *  - onSubmit(value): callback alla conferma
 */
export default function QuestionCard({ question, feedback, revealedAnswer, disabled, onSubmit }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  // Focus automatico sull'input all'apertura della domanda (accessibilità + UX).
  useEffect(() => {
    if (!disabled && inputRef.current) inputRef.current.focus()
  }, [disabled])

  function handleSubmit() {
    if (disabled) return
    onSubmit(value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const feedbackClass = feedback ? `is-${feedback}` : ''

  return (
    <div className={`question-card ${feedbackClass}`}>
      <div className="question-card__head">
        <span className="question-card__letter">{question.letter}</span>
        <div className="question-card__meta">
          <span className="question-card__prefix">Con la lettera {question.letter}</span>
          <span className="question-card__category">{question.category}</span>
        </div>
      </div>

      <p className="question-card__clue">{question.clue}</p>

      <div className="question-card__answer">
        <input
          ref={inputRef}
          type="text"
          className="question-card__input"
          placeholder="Inserisci la risposta"
          aria-label={`Risposta per la lettera ${question.letter}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn-soft btn-soft--primary question-card__confirm"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Conferma
        </button>
      </div>

      {/* Messaggio di esito (riserva spazio fisso per evitare salti di layout) */}
      <div className="question-card__result" aria-live="polite">
        {feedback === 'correct' && <span className="result-correct">Corretto! +10 punti</span>}
        {feedback === 'wrong' && (
          <span className="result-wrong">
            La risposta era: <strong>{revealedAnswer}</strong>
          </span>
        )}
      </div>
    </div>
  )
}
