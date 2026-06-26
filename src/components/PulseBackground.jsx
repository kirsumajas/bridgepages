import { useEffect, useRef } from 'react'

// Ambient, decorative background: a golden-angle (phyllotaxis) spiral of dots
// with a slow pulse wave rippling outward. Purely visual — no data behind it.
// Kept minimal and low-opacity so the bridge card stays the focus.
export default function PulseBackground({ theme }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    let W = 0
    let H = 0
    let t = 0

    const GOLDEN = Math.PI * (3 - Math.sqrt(5))
    const N = 520
    const base = theme === 'light' ? [50, 100, 220] : [130, 175, 255]

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

      for (let i = 0; i < N; i++) {
        const r = scale * Math.sqrt(i)
        if (r > maxR) continue
        const ang = i * GOLDEN
        const x = cx + r * Math.cos(ang)
        const y = cy + r * Math.sin(ang)

        // Pulse wave travelling outward; gentle fade toward the edges.
        const wave = 0.5 + 0.5 * Math.sin(r * 0.013 - t)
        const edgeFade = 1 - 0.7 * (r / maxR)
        const alpha = (0.14 + 0.45 * wave) * edgeFade
        const size = 1.4 + 1.8 * wave

        ctx.beginPath()
        ctx.fillStyle = `rgba(${base[0]},${base[1]},${base[2]},${alpha.toFixed(3)})`
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
  }, [theme])

  return <canvas ref={ref} className="pulse-bg" aria-hidden="true" />
}
