import { unlockAudio } from '../js/sound.js'

/**
 * HomeScreen
 * Schermata iniziale: titolo, sottotitolo e pulsante per iniziare.
 *
 * Props:
 *  - onStart: avvia la partita
 */
export default function HomeScreen({ onStart }) {
  function handleStart() {
    // Sblocca l'audio in seguito al gesto utente (policy dei browser).
    unlockAudio()
    onStart()
  }

  return (
    <section className="home" aria-labelledby="home-title">
      <div className="home__badge" aria-hidden="true">♪</div>

      <h1 id="home-title" className="home__title">CODEBANDA</h1>
      <p className="home__subtitle">Il grande quiz musicale dal 1990 al 2026</p>

      <button type="button" className="btn-soft btn-soft--primary home__cta" onClick={handleStart}>
        INIZIA PARTITA
      </button>

      <p className="home__hint">
        26 domande, una per ogni lettera dalla A alla Z. Hai 15 secondi per ciascuna:
        la risposta deve iniziare con la lettera attiva.
      </p>
    </section>
  )
}
