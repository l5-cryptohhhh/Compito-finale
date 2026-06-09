import { useState, useEffect, useRef, useCallback } from 'react';
import Scene3D from './Scene3D';
import { generateAction } from '../data/actionGenerator';
import styles from '../styles/MatchGame.module.css';

const TOTAL = 10;
const SPEEDS = [0.25, 0.5, 1];
const CAMERAS = [
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'offside', label: 'Linea VAR' },
  { id: 'aerial', label: 'Aerea' },
];

export default function MatchGame({ onFinish, isGuest }) {
  const [action, setAction] = useState(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [camera, setCamera] = useState('broadcast');

  const [num, setNum] = useState(0);       // azioni completate
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);

  const [phase, setPhase] = useState('idle'); // idle | watching | deciding | feedback | finished
  const [result, setResult] = useState(null);

  const rafRef = useRef(null);
  const lastRef = useRef(0);

  // Animazione con requestAnimationFrame
  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();
    const loop = (now) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt * 0.35 * speed;
        if (next >= 1) {
          setPlaying(false);
          setPhase('deciding');
          return 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed]);

  const generate = useCallback(() => {
    if (num >= TOTAL) return;
    setAction(generateAction());
    setT(0);
    setResult(null);
    setCamera('broadcast');
    setPhase('watching');
    setPlaying(true);
  }, [num]);

  // controlli
  const togglePlay = () => action && setPlaying((p) => !p);
  const stepF = () => { setPlaying(false); setT((v) => Math.min(v + 0.03, 1)); };
  const stepB = () => { setPlaying(false); setT((v) => Math.max(v - 0.03, 0)); };
  const replay = () => { if (action) { setT(0); setPlaying(true); setPhase('watching'); } };

  const decide = (decision) => {
    if (phase !== 'deciding' || !action) return;
    const ok = decision === action.correct;
    const nScore = score + (ok ? 10 : 0);
    const nCorrect = correct + (ok ? 1 : 0);
    const nErrors = errors + (ok ? 0 : 1);
    const nNum = num + 1;
    setScore(nScore); setCorrect(nCorrect); setErrors(nErrors); setNum(nNum);
    setResult({ ok, decision });
    setPhase('feedback');

    if (nNum >= TOTAL) {
      setTimeout(() => {
        setPhase('finished');
        onFinish?.({ score: nScore, correct: nCorrect, errors: nErrors, totalActions: TOTAL });
      }, 2200);
    }
  };

  const next = () => { setPhase('idle'); setAction(null); setT(0); };

  const accuracy = num > 0 ? Math.round((correct / num) * 100) : 0;

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>// AZIONE</div>
          <div className={styles.counter}>
            {Math.min(num + (phase !== 'idle' && phase !== 'finished' ? 1 : 0), TOTAL)}
            <span>/ {TOTAL}</span>
          </div>
        </div>
        <div className={styles.scoreboard}>
          <Stat n={score} l="Punti" />
          <Stat n={`${accuracy}%`} l="Precisione" />
          <Stat n={correct} l="Corrette" />
        </div>
      </div>

      <div className={styles.stage}>
        <Scene3D action={action} t={t} camera={camera} />
        {action && <div className={styles.frameTag}>{Math.round(t * 100)}%</div>}
        {playing && <div className={styles.liveTag}>● LIVE</div>}
        {phase === 'feedback' || phase === 'deciding' ? (
          action && (
            <div className={`${styles.verdictLine} ${action.correct === 'Annulla Gol' || action.correct === 'Assegna Rigore' || action.correct === 'Cartellino Giallo' || action.correct === 'Cartellino Rosso' ? styles.vOff : styles.vOk}`}>
              {action.verdictText}
            </div>
          )
        ) : null}
      </div>

      {action && phase !== 'finished' && (
        <>
          <div className={styles.timeline}>
            <input type="range" min="0" max="100" value={Math.round(t * 100)}
              onChange={(e) => { setPlaying(false); setT(e.target.value / 100); }} />
          </div>

          <div className={styles.controls}>
            <div className={styles.group}>
              <button className={styles.ctrl} onClick={stepB} title="Indietro">⏮</button>
              <button className={styles.ctrl} onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
              <button className={styles.ctrl} onClick={stepF} title="Avanti">⏭</button>
              <button className={styles.ctrl} onClick={replay} title="Replay">↺</button>
            </div>
            <div className={styles.group}>
              {SPEEDS.map((s) => (
                <button key={s} className={`${styles.speed} ${speed === s ? styles.active : ''}`}
                  onClick={() => setSpeed(s)}>{s}x</button>
              ))}
            </div>
            <div className={styles.group}>
              {CAMERAS.map((c) => (
                <button key={c.id} className={`${styles.cam} ${camera === c.id ? styles.active : ''}`}
                  onClick={() => setCamera(c.id)}>{c.label}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {phase === 'deciding' && (
        <div className={styles.decision}>
          <div className={styles.q}>{action.question}</div>
          <div className={styles.dBtns}>
            {action.options.map((o) => (
              <button key={o} className={styles.dBtn} onClick={() => decide(o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {phase === 'feedback' && result && (
        <div className={`${styles.feedback} ${result.ok ? styles.fbOk : styles.fbWrong}`}>
          <div className={styles.fbV}>{result.ok ? '✓ Decisione corretta  +10' : '✗ Decisione errata'}</div>
          <div className={styles.fbE}>{action.explanation}</div>
          {num < TOTAL && <button className={styles.next} onClick={next}>Prossima azione →</button>}
        </div>
      )}

      {phase === 'idle' && (
        <div className={styles.genArea}>
          <button className={styles.gen} onClick={generate}>⚽ Genera azione</button>
          <p className={styles.hint}>Analizza con i replay e le telecamere, poi decidi. Nessun timer.</p>
        </div>
      )}

      {phase === 'finished' && (
        <div className={styles.finished}>
          <div className={styles.kicker}>// PARTITA COMPLETATA</div>
          <h2>Risultato finale</h2>
          <div className={styles.fGrid}>
            <FStat n={score} l="Punti" />
            <FStat n={`${Math.round((correct / TOTAL) * 100)}%`} l="Precisione" />
            <FStat n={correct} l="Corrette" />
            <FStat n={errors} l="Errori" />
          </div>
          {isGuest && <p className={styles.guestNote}>Modalità ospite: i progressi non vengono salvati.</p>}
        </div>
      )}
    </div>
  );
}

function Stat({ n, l }) {
  return <div className={styles.stat}><span>{n}</span><small>{l}</small></div>;
}
function FStat({ n, l }) {
  return <div className={styles.fStat}><span>{n}</span><small>{l}</small></div>;
}
