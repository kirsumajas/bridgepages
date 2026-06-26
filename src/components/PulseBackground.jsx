import { useEffect, useRef } from 'react'

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const themeFallback = (theme) => (theme === 'light' ? [50, 100, 220] : [130, 175, 255])

// Ambient phyllotaxis spiral with a slow outward pulse. The dot colour follows
// `accent` (the bridge's source-chain colour) and crossfades smoothly when it
// changes — so bridging from Solana glows green, from TON blue, and so on.
export default function PulseBackground({ theme, accent }) {
  const canvasRef = useRef(null)
  const targetRef = useRef(themeFallback(theme))

  // Update the target colour without restarting the animation loop.
  useEffect(() => {
    targetRef.current = accent ? hexToRgb(accent) : themeFallback(theme)
  }, [accent, theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let W = 0
    let H = 0
    let t = 0
    const current = [...targetRef.current]

    const GOLDEN = Math.PI * (3 - Math.sqrt(5))
    const N = 520

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2
      const maxR = Math.hypot(W, H) / 2
      const scale = (maxR / Math.sqrt(N)) * 1.08
      t += reduce ? 0 : 0.018

      // Ease the colour toward the current target for a smooth crossfade.
      const tgt = targetRef.current
      for (let k = 0; k < 3; k++) current[k] += (tgt[k] - current[k]) * 0.06
      const cr = Math.round(current[0])
      const cg = Math.round(current[1])
      const cb = Math.round(current[2])

      ctx.lineWidth = 0.9
      const SEG = 12
      for (let i = 0; i < N; i++) {
        const r = scale * Math.sqrt(i)
        if (r > maxR || r < 1) continue
        const ang = i * GOLDEN
        const x = cx + r * Math.cos(ang)
        const y = cy + r * Math.sin(ang)

        const wave = 0.5 + 0.5 * Math.sin(r * 0.013 - t)
        const edgeFade = 1 - 0.7 * (r / maxR)

        // Unit vector origin→dot and its perpendicular (string displacement axis).
        const ux = (x - cx) / r
        const uy = (y - cy) / r
        const px = -uy
        const py = ux

        // Vibrating string: fixed at both ends (sin(pi*f)), swelling with the
        // pulse wave, each string phase-offset so the web shimmers.
        const amp = Math.min(r * 0.06, 14) * (0.35 + 0.75 * wave)
        const vib = Math.sin(t * 6 + i * 0.7)

        const lineAlpha = (0.06 + 0.2 * wave) * edgeFade
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${lineAlpha.toFixed(3)})`
        ctx.beginPath()
        for (let s = 0; s <= SEG; s++) {
          const f = s / SEG
          const d = amp * Math.sin(Math.PI * f) * vib
          const lx = cx + (x - cx) * f + px * d
          const ly = cy + (y - cy) * f + py * d
          s === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly)
        }
        ctx.stroke()

        const alpha = (0.18 + 0.5 * wave) * edgeFade
        const size = 1.5 + 1.9 * wave
        ctx.beginPath()
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="pulse-bg" aria-hidden="true" />
}
