import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import LetterCircle from './LetterCircle.jsx'
import Timer from './Timer.jsx'
import QuestionCard from './QuestionCard.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import { buildRound } from '../js/buildRound.js'
import { isAnswerCorrect } from '../js/answers.js'
import { useCountdown } from '../js/useCountdown.js'
import { playCorrect, playWrong } from '../js/sound.js'

const QUESTION_SECONDS = 15
const FEEDBACK_MS = 1100 // pausa per mostrare l'esito prima di avanzare

/**
 * GameBoard
 * Orchestra la partita: costruisce il round, gestisce indice/punteggio/stati,
 * timer e transizioni tra le lettere. Al termine della Z chiama onFinish.
 *
 * Props:
 *  - onFinish({ score, correct, total }): chiamata a fine partita
 */
export default function GameBoard({ onFinish }) {
  // Una sola costruzione del round per l'intera partita.
  const round = useMemo(() => buildRound(), [])
  const total = round.length

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  // Stato visivo di ogni lettera: 'idle' | 'current' | 'correct' | 'wrong'.
  const [statuses, setStatuses] = useState(() =>
    round.map((_, i) => (i === 0 ? 'current' : 'idle'))
  )
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [locked, setLocked] = useState(false)    // blocca input durante la transizione

  // Evita doppie risoluzioni della stessa domanda (es. submit + timeout).
  const resolvedRef = useRef(false)

  const current = round[index]

  // Avanza alla lettera successiva o termina la partita.
  const advance = useCallback(
    (nextScore, nextCorrect) => {
      const nextIndex = index + 1
      if (nextIndex >= total) {
        onFinish({ score: nextScore, correct: nextCorrect, total })
        return
      }
      setStatuses((prev) => {
        const updated = [...prev]
        updated[nextIndex] = 'current'
        return updated
      })
      setFeedback(null)
      setLocked(false)
      resolvedRef.current = false
      setIndex(nextIndex)
    },
    [index, total, onFinish]
  )

  // Risolve la domanda corrente (corretta o errata) e programma l'avanzamento.
  const resolve = useCallback(
    (wasCorrect) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      setLocked(true)

      const gained = wasCorrect ? 10 : 0
      const nextScore = score + gained
      const nextCorrect = correctCount + (wasCorrect ? 1 : 0)

      setScore(nextScore)
      setCorrectCount(nextCorrect)
      setFeedback(wasCorrect ? 'correct' : 'wrong')
      setStatuses((prev) => {
        const updated = [...prev]
        updated[index] = wasCorrect ? 'correct' : 'wrong'
        return updated
      })

      if (wasCorrect) playCorrect()
      else playWrong()

      setTimeout(() => advance(nextScore, nextCorrect), FEEDBACK_MS)
    },
    [score, correctCount, index, advance]
  )

  // Timer: allo scadere la domanda è considerata errata.
  const handleExpire = useCallback(() => resolve(false), [resolve])
  const { timeLeft, reset } = useCountdown(QUESTION_SECONDS, handleExpire)

  // Conferma della risposta da parte dell'utente.
  const handleSubmit = useCallback(
    (value) => {
      if (resolvedRef.current) return
      const ok = isAnswerCorrect(value, current)
      resolve(ok)
    },
    [current, resolve]
  )

  // Riavvia il timer ogni volta che cambia la domanda corrente.
  useEffect(() => {
    reset()
  }, [index, reset])

  return (
    <section className="game" aria-label="Partita in corso">
      <ScoreBoard
        score={score}
        correct={correctCount}
        answered={index}
        total={total}
      />

      <LetterCircle statuses={statuses} />

      <Timer timeLeft={timeLeft} total={QUESTION_SECONDS} />

      <QuestionCard
        key={index}
        question={current}
        feedback={feedback}
        revealedAnswer={current.answer}
        disabled={locked}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
