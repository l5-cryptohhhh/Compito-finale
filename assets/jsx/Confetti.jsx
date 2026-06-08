import { useEffect, useRef } from 'react'

/**
 * Confetti
 * Animazione confetti leggera disegnata su <canvas>, senza librerie esterne.
 * Si avvia al montaggio e si ferma da sola dopo qualche secondo.
 *
 * Props:
 *  - active: se true, lancia i confetti
 */
export default function Confetti({ active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Adatta il canvas alla dimensione dello schermo (con supporto retina).
    const dpr = window.devicePixelRatio || 1
    function resize() {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#5aa9e6', '#7fd8be', '#b8a9f0', '#ffd6a5', '#ffadad', '#a0e7e5']
    const W = window.innerWidth
    const H = window.innerHeight

    // Crea le particelle: partono dall'alto con velocità e rotazione casuali.
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vrot: -0.2 + Math.random() * 0.4,
    }))

    const start = performance.now()
    const duration = 4200 // i confetti cadono per ~4 secondi

    function frame(now) {
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)

      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        p.vy += 0.04 // leggera gravità

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        // Sbiadisce dolcemente verso la fine.
        ctx.globalAlpha = Math.max(0, 1 - elapsed / duration)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, W, H)
      }
    }
    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) return null

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}
