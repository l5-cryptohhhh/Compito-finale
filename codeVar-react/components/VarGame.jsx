import { useState, useEffect, useRef, useCallback } from 'react';
import PitchCanvas from './PitchCanvas';
import { generateAction } from '../data/actionGenerator';
import styles from '../styles/VarGame.module.css';

const TOTAL_ACTIONS = 10;
const SPEEDS = [0.25, 0.5, 1];

export default function VarGame({ onFinishMatch }) {
  const [action, setAction] = useState(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [actionNumber, setActionNumber] = useState(0); // azioni completate
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errors, setErrors] = useState(0);

  const [phase, setPhase] = useState('idle'); // idle | watching | deciding | feedback | finished
  const [lastResult, setLastResult] = useState(null);

  const timerRef = useRef(null);

  // ── Animazione replay ──
  useEffect(() => {
    if (!playing || !action) return;
    const interval = 130 / speed;
    timerRef.current = setInterval(() => {
      setFrame((f) => {
        if (f >= action.frames.length - 1) {
          clearInterval(timerRef.current);
          setPlaying(false);
          setPhase('deciding');
          return action.frames.length - 1;
        }
        return f + 1;
      });
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, action]);

  // ── Genera nuova azione ──
  const handleGenerate = useCallback(() => {
    if (actionNumber >= TOTAL_ACTIONS) return;
    const a = generateAction();
    setAction(a);
    setFrame(0);
    setLastResult(null);
    setPhase('watching');
    setPlaying(true);
  }, [actionNumber]);

  // ── Controlli replay ──
  const play = () => { if (action) setPlaying(true); };
  const pause = () => { setPlaying(false); clearInterval(timerRef.current); };
  const replay = () => { if (action) { setFrame(0); setPlaying(true); } };
  const stepForward = () => {
    pause();
    setFrame((f) => Math.min(f + 1, action ? action.frames.length - 1 : 0));
  };
  const stepBack = () => {
    pause();
    setFrame((f) => Math.max(f - 1, 0));
  };

  // ── Decisione ──
  const handleDecision = (decision) => {
    if (phase !== 'deciding' || !action) return;
    const correct = decision === action.correct;
    const newScore = score + (correct ? 10 : 0);
    const newCorrect = correctCount + (correct ? 1 : 0);
    const newErrors = errors + (correct ? 0 : 1);
    const newActionNumber = actionNumber + 1;

    setScore(newScore);
    setCorrectCount(newCorrect);
    setErrors(newErrors);
    setActionNumber(newActionNumber);
    setLastResult({ correct, decision, action });
    setPhase('feedback');

    if (newActionNumber >= TOTAL_ACTIONS) {
      // partita finita
      setTimeout(() => {
        setPhase('finished');
        if (onFinishMatch) {
          onFinishMatch({
            score: newScore,
            correct: newCorrect,
            errors: newErrors,
            total: TOTAL_ACTIONS,
            accuracy: Math.round((newCorrect / TOTAL_ACTIONS) * 100),
          });
        }
      }, 2200);
    }
  };

  const nextAction = () => {
    setPhase('idle');
    setAction(null);
    setFrame(0);
    setLastResult(null);
  };

  const accuracy = actionNumber > 0 ? Math.round((correctCount / actionNumber) * 100) : 0;

  return (
    <div className={styles.game}>

      {/* HEADER PARTITA */}
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <span className={styles.kicker}>// AZIONE</span>
          <span className={styles.actionCounter}>
            {Math.min(actionNumber + (phase !== 'idle' && phase !== 'finished' ? 1 : 0), TOTAL_ACTIONS)}
            <span className={styles.total}>/ {TOTAL_ACTIONS}</span>
          </span>
        </div>
        <div className={styles.scoreboard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreNum}>{score}</span>
            <span className={styles.scoreLabel}>Punti</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreNum}>{accuracy}%</span>
            <span className={styles.scoreLabel}>Precisione</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreNum}>{correctCount}</span>
            <span className={styles.scoreLabel}>Corrette</span>
          </div>
        </div>
      </div>

      {/* CAMPO */}
      <div className={styles.pitchArea}>
        <PitchCanvas action={action} frameIndex={frame} />

        {action && (
          <div className={styles.frameBadge}>FRAME {frame + 1} / {action.frames.length}</div>
        )}
        {playing && <div className={styles.liveBadge}>● REPLAY</div>}

        {/* timeline */}
        {action && (
          <div className={styles.timeline}>
            <input
              type="range"
              min={0}
              max={action.frames.length - 1}
              value={frame}
              onChange={(e) => { pause(); setFrame(Number(e.target.value)); }}
              className={styles.timelineRange}
            />
          </div>
        )}
      </div>

      {/* CONTROLLI REPLAY */}
      {action && phase !== 'finished' && (
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <button className={styles.ctrlBtn} onClick={stepBack} title="Frame precedente">⏮</button>
            {playing
              ? <button className={styles.ctrlBtn} onClick={pause} title="Pausa">⏸</button>
              : <button className={styles.ctrlBtn} onClick={play} title="Play">▶</button>}
            <button className={styles.ctrlBtn} onClick={stepForward} title="Frame successivo">⏭</button>
            <button className={styles.ctrlBtn} onClick={replay} title="Replay">↺</button>
          </div>
          <div className={styles.speedGroup}>
            {SPEEDS.map((s) => (
              <button
                key={s}
                className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PANNELLO DECISIONE */}
      {phase === 'deciding' && (
        <div className={styles.decisionPanel}>
          <div className={styles.decisionQuestion}>{action.question}</div>
          <div className={styles.decisionBtns}>
            {action.options.map((opt) => (
              <button key={opt} className={styles.decisionBtn} onClick={() => handleDecision(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {phase === 'feedback' && lastResult && (
        <div className={`${styles.feedback} ${lastResult.correct ? styles.fbCorrect : styles.fbWrong}`}>
          <div className={styles.fbVerdict}>
            {lastResult.correct ? '✓ DECISIONE CORRETTA  +10' : '✗ DECISIONE ERRATA'}
          </div>
          <div className={styles.fbExplain}>{lastResult.action.explanation}</div>
          {actionNumber < TOTAL_ACTIONS && (
            <button className={styles.nextBtn} onClick={nextAction}>Prossima azione →</button>
          )}
        </div>
      )}

      {/* GENERA AZIONE (stato idle) */}
      {phase === 'idle' && (
        <div className={styles.generateArea}>
          <button className={styles.generateBtn} onClick={handleGenerate}>
            ⚽ Genera azione
          </button>
          <p className={styles.generateHint}>
            Analizza l'azione con i controlli replay, poi prendi la tua decisione VAR.
          </p>
        </div>
      )}

      {/* PARTITA FINITA */}
      {phase === 'finished' && (
        <div className={styles.finished}>
          <div className={styles.kicker}>// PARTITA COMPLETATA</div>
          <h2 className={styles.finishedTitle}>Risultato finale</h2>
          <div className={styles.finishedGrid}>
            <div className={styles.finishedStat}><span>{score}</span><small>Punti totali</small></div>
            <div className={styles.finishedStat}><span>{Math.round((correctCount / TOTAL_ACTIONS) * 100)}%</span><small>Precisione</small></div>
            <div className={styles.finishedStat}><span>{correctCount}</span><small>Corrette</small></div>
            <div className={styles.finishedStat}><span>{errors}</span><small>Errori</small></div>
          </div>
        </div>
      )}
    </div>
  );
}
