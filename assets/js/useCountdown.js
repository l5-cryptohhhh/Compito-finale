import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook per il countdown della domanda.
 *
 * @param {number} seconds - durata in secondi (es. 15)
 * @param {function} onExpire - callback invocata quando il tempo finisce
 *
 * Ritorna { timeLeft, reset } dove timeLeft è in secondi (decimali per
 * la barra di avanzamento fluida) e reset() riavvia il conto.
 *
 * Implementazione: usa un timestamp di riferimento e requestAnimationFrame
 * così la barra scende in modo fluido e il valore non "deriva" nel tempo.
 */
export function useCountdown(seconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const rafRef = useRef(null)
  const endRef = useRef(0)
  const expiredRef = useRef(false)
  // Manteniamo onExpire in un ref per non dover ricreare il loop a ogni render.
  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const tick = useCallback(() => {
    const remaining = Math.max(0, (endRef.current - Date.now()) / 1000)
    setTimeLeft(remaining)
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current && onExpireRef.current()
      }
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    expiredRef.current = false
    endRef.current = Date.now() + seconds * 1000
    setTimeLeft(seconds)
    rafRef.current = requestAnimationFrame(tick)
  }, [seconds, tick])

  // Avvia al montaggio, pulisce allo smontaggio.
  useEffect(() => {
    reset()
    return () => cancelAnimationFrame(rafRef.current)
  }, [reset])

  return { timeLeft, reset }
}
