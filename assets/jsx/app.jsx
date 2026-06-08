import { useState } from 'react'
import HomeScreen from './HomeScreen.jsx'
import GameBoard from './GameBoard.jsx'
import FinalScreen from './FinalScreen.jsx'

/**
 * App
 * Router di schermata semplice basato su stato: 'home' -> 'game' -> 'final'.
 * Mantiene il risultato dell'ultima partita per la schermata finale.
 */
export default function App() {
  const [screen, setScreen] = useState('home')
  const [result, setResult] = useState({ score: 0, correct: 0, total: 26 })
  // Cambiando questa chiave forziamo il rimontaggio di GameBoard,
  // così ogni nuova partita ricostruisce un round con domande diverse.
  const [gameKey, setGameKey] = useState(0)

  function startGame() {
    setGameKey((k) => k + 1)
    setScreen('game')
  }

  function finishGame(finalResult) {
    setResult(finalResult)
    setScreen('final')
  }

  return (
    <div className="app">
      <div className="app__backdrop" aria-hidden="true" />

      <main className="app__content">
        {screen === 'home' && <HomeScreen onStart={startGame} />}

        {screen === 'game' && <GameBoard key={gameKey} onFinish={finishGame} />}

        {screen === 'final' && (
          <FinalScreen
            score={result.score}
            correct={result.correct}
            total={result.total}
            onRestart={startGame}
          />
        )}
      </main>

      <footer className="app__footer">
        <span>Codebanda · Quiz musicale 1990–2026</span>
      </footer>
    </div>
  )
}
