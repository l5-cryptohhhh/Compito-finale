/**
 * Effetti sonori generati con la Web Audio API.
 *
 * Scelta progettuale: invece di includere file audio esterni (che
 * andrebbero scaricati, possono mancare o avere problemi di licenza),
 * i suoni vengono sintetizzati al volo. Risultato: zero dipendenze,
 * funziona offline e il progetto resta immediatamente eseguibile.
 */

let audioCtx = null

// L'AudioContext va creato/ripreso a seguito di un gesto utente (policy browser).
function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// Riproduce una singola nota con piccola inviluppatura (fade out).
function playTone(freq, startTime, duration, type = 'sine', volume = 0.2) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

// Suono positivo: due note ascendenti allegre.
export function playCorrect() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playTone(587.33, t, 0.15, 'sine', 0.25)        // Re5
  playTone(880.0, t + 0.12, 0.25, 'sine', 0.25)  // La5
}

// Suono negativo: due note discendenti "buzz".
export function playWrong() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playTone(220.0, t, 0.18, 'sawtooth', 0.18)     // La3
  playTone(155.56, t + 0.16, 0.3, 'sawtooth', 0.18) // Re#3
}

// Suono celebrativo: piccolo arpeggio maggiore.
export function playFinish() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // Do-Mi-Sol-Do (arpeggio)
  notes.forEach((f, i) => playTone(f, t + i * 0.13, 0.3, 'triangle', 0.22))
}

// "Sveglia" l'audio dopo il primo gesto utente (chiamato all'avvio partita).
export function unlockAudio() {
  getCtx()
}
