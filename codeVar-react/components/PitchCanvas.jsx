import { useRef, useEffect } from 'react';
import { PITCH } from '../data/actionGenerator';
import styles from '../styles/PitchCanvas.module.css';

const { W, H } = PITCH;

/**
 * Disegna il campo e un singolo frame dell'azione sul canvas.
 */
export default function PitchCanvas({ action, frameIndex }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    drawPitch(ctx);

    if (!action) {
      drawIdle(ctx);
      return;
    }

    const f = action.frames[frameIndex];
    if (!f) return;

    // Linea fuorigioco (solo per azioni di tipo fuorigioco)
    if (f.showLine) drawOffsideLine(ctx, f);

    // Difensori
    (f.defenders || []).forEach((d, i) => {
      let color = '#1a4db5';
      let label = 'D' + (i + 1);
      if (d.isGK) { color = '#e67e00'; label = 'GK'; }
      else if (d.isLine) { color = '#29b6f6'; label = 'ULT'; }
      drawPlayer(ctx, d.x, d.y, color, label, d.isLine && f.showLine);
    });

    // Attaccante
    if (f.attacker) {
      drawPlayer(ctx, f.attacker.x, f.attacker.y, '#c0112a', 'A', false, f.attacker.fallen);
    }

    // Palla
    if (f.ball) drawBall(ctx, f.ball.x, f.ball.y);

    // Evidenziatori del momento chiave
    if (f.isPassMoment) flashMoment(ctx, f.ball.x, 'PASSAGGIO');
    if (f.isContactMoment) flashMoment(ctx, f.attacker.x, 'CONTATTO');
    if (f.isGoalMoment) flashMoment(ctx, f.ball.x, 'GOL');
  }, [action, frameIndex]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={styles.canvas}
    />
  );
}

// ── funzioni di disegno ──
function drawPitch(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a4a1a');
  grad.addColorStop(0.5, '#1e5520');
  grad.addColorStop(1, '#1a4a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) ctx.fillRect(i * (W / 10), 0, W / 10, H);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 18, W - 56, H - 36);
  ctx.beginPath();
  ctx.moveTo(W / 2, 18);
  ctx.lineTo(W / 2, H - 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeRect(28, H / 2 - 65, 85, 130);
  ctx.strokeRect(28, H / 2 - 32, 38, 64);
  ctx.strokeRect(W - 113, H / 2 - 65, 85, 130);
  ctx.strokeRect(W - 66, H / 2 - 32, 38, 64);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeRect(0, H / 2 - 28, 28, 56);
  ctx.strokeRect(W - 28, H / 2 - 28, 28, 56);
}

function drawIdle(ctx) {
  ctx.fillStyle = 'rgba(5,13,26,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PREMI "GENERA AZIONE" PER INIZIARE', W / 2, H / 2);
}

function drawPlayer(ctx, x, y, color, label, highlight, fallen) {
  ctx.beginPath();
  ctx.ellipse(x, y + 13, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fill();

  ctx.save();
  if (fallen) {
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 2.4);
    ctx.translate(-x, -y);
  }
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = highlight ? 'white' : 'rgba(255,255,255,0.3)';
  ctx.lineWidth = highlight ? 2 : 1.2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.textBaseline = 'alphabetic';
}

function drawBall(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawOffsideLine(ctx, f) {
  const offColor = '#ff3333';
  ctx.save();
  ctx.strokeStyle = '#29b6f6';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([7, 4]);
  ctx.beginPath();
  ctx.moveTo(f.defLineX, 18);
  ctx.lineTo(f.defLineX, H - 18);
  ctx.stroke();
  ctx.setLineDash([]);
  if (f.attacker) {
    ctx.strokeStyle = offColor;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(f.attacker.x, f.attacker.y - 15);
    ctx.lineTo(f.attacker.x, H - 18);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#29b6f6';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LINEA · ULTIMO UOMO', f.defLineX, 14);
  ctx.restore();
}

function flashMoment(ctx, x, label) {
  ctx.fillStyle = 'rgba(245,197,24,0.08)';
  ctx.fillRect(x - 20, 0, 40, H);
  ctx.fillStyle = 'rgba(245,197,24,0.85)';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('// ' + label, x, 13);
}
