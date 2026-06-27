import { useEffect, useRef, useState } from 'react'
import { usePulse } from '../hooks/usePulse.js'

const MODES = [
  { key: 'matrix', label: 'LED matrix' },
  { key: 'radial', label: 'Radial' },
  { key: 'hex', label: 'Hex shards' },
]

const NETWORKS = [
  { key: 'ton', label: 'TON' },
  { key: 'solana', label: 'Solana' },
]

// Colour ramp off → brand → hot, by intensity v in [0,1].
const makeRamp = (off, mid, hot) => (v) => {
  const lerp = (a, b, t) => Math.round(a + (b - a) * t)
  const [a, b, t] = v < 0.5 ? [off, mid, v / 0.5] : [mid, hot, (v - 0.5) / 0.5]
  return `rgb(${lerp(a[0], b[0], t)},${lerp(a[1], b[1], t)},${lerp(a[2], b[2], t)})`
}

const RAMP = {
  ton: makeRamp([16, 26, 46], [0, 152, 234], [174, 240, 255]),
  solana: makeRamp([14, 30, 26], [20, 241, 149], [200, 255, 225]),
}
// Radial dot colours [alt-true, alt-false] per network.
const RAD = {
  ton: ['#ffce5a', '#36c6ff'],
  solana: ['#b07cff', '#19f59a'],
}

export default function TonPulse() {
  const [network, setNetwork] = useState('ton')
  const [mode, setMode] = useState('matrix')
  const { queueRef, stats } = usePulse(network)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const ramp = RAMP[network]
    const rad = RAD[network]
    let raf
    let W = 0
    let H = 0

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

    const COLS = 32
    const ROWS = 16
    const matrix = new Float32Array(COLS * ROWS)
    const HCOLS = 11
    const HROWS = 7
    const hex = new Float32Array(HCOLS * HROWS)
    let particles = []
    let ripples = []

    const drainMatrix = () => {
      const q = queueRef.current
      queueRef.current = []
      for (const ev of q) matrix[ev.hashInt % matrix.length] = 1
    }
    const drainHex = () => {
      const q = queueRef.current
      queueRef.current = []
      for (const ev of q) hex[ev.hashInt % hex.length] = 1
    }
    const drainRadial = () => {
      const q = queueRef.current
      queueRef.current = []
      for (const ev of q) {
        particles.push({ angle: ((ev.hashInt % 3600) / 3600) * Math.PI * 2, r: 6, alt: ev.alt })
      }
      if (q.length) ripples.push({ r: 6 })
      if (particles.length > 1400) particles = particles.slice(-1400)
    }

    const drawMatrix = () => {
      drainMatrix()
      const cw = W / COLS
      const ch = H / ROWS
      const pad = Math.max(1, Math.min(cw, ch) * 0.12)
      for (let i = 0; i < matrix.length; i++) {
        const v = (matrix[i] *= 0.95)
        const c = i % COLS
        const r = (i / COLS) | 0
        const x = c * cw + pad
        const y = r * ch + pad
        ctx.fillStyle = ramp(v < 0.02 ? 0 : v)
        ctx.fillRect(x, y, cw - pad * 2, ch - pad * 2)
      }
    }

    const drawHex = () => {
      drainHex()
      const radW = W / ((HCOLS + 0.5) * Math.sqrt(3))
      const radH = H / ((HROWS - 1) * 1.5 + 2)
      const rd = Math.min(radW, radH) * 0.96
      const hw = Math.sqrt(3) * rd
      const gridW = hw * (HCOLS + 0.5)
      const gridH = 1.5 * rd * (HROWS - 1) + 2 * rd
      const ox = (W - gridW) / 2 + hw / 2
      const oy = (H - gridH) / 2 + rd
      for (let i = 0; i < hex.length; i++) {
        const v = (hex[i] *= 0.94)
        const col = i % HCOLS
        const row = (i / HCOLS) | 0
        const cx = ox + col * hw + (row % 2) * (hw / 2)
        const cy = oy + row * 1.5 * rd
        ctx.beginPath()
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 180) * (60 * k - 90)
          const px = cx + rd * 0.9 * Math.cos(a)
          const py = cy + rd * 0.9 * Math.sin(a)
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fillStyle = ramp(v < 0.02 ? 0 : v)
        ctx.fill()
      }
    }

    const drawRadial = () => {
      drainRadial()
      const cx = W / 2
      const cy = H / 2
      const maxR = Math.min(W, H) / 2 - 8

      ctx.strokeStyle = 'rgba(140,170,210,0.10)'
      ctx.lineWidth = 1
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (maxR * k) / 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      ripples = ripples.filter((rp) => {
        rp.r += 2.2
        const alpha = Math.max(0, 0.25 * (1 - rp.r / maxR))
        if (alpha <= 0) return false
        ctx.strokeStyle = `rgba(160,200,255,${alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2)
        ctx.stroke()
        return true
      })

      particles = particles.filter((p) => {
        p.r += 1.7
        const alpha = 1 - p.r / maxR
        if (alpha <= 0) return false
        const x = cx + Math.cos(p.angle) * p.r
        const y = cy + Math.sin(p.angle) * p.r
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.alt ? rad[0] : rad[1]
        ctx.beginPath()
        ctx.arc(x, y, p.alt ? 3 : 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        return true
      })
    }

    const frame = () => {
      ctx.fillStyle = '#070b14'
      ctx.fillRect(0, 0, W, H)
      if (mode === 'matrix') drawMatrix()
      else if (mode === 'hex') drawHex()
      else drawRadial()
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [mode, network, queueRef])

  const isSol = network === 'solana'

  return (
    <div className="stack">
      <div className="card pulse-card">
        <div className="pulse-head">
          <div>
            <h1>{isSol ? 'Solana Pulse' : 'TON Pulse'}</h1>
            <p>
              {isSol
                ? 'Live Solana mainnet throughput, pulsing in real time.'
                : 'Every cell is a live TON mainnet transaction, flaring as it lands.'}
            </p>
          </div>
          <div className="pulse-controls">
            <div className="pulse-networks">
              {NETWORKS.map((n) => (
                <button
                  key={n.key}
                  className={`period-tab ${network === n.key ? 'period-active' : ''}`}
                  onClick={() => setNetwork(n.key)}
                >
                  {n.label}
                </button>
              ))}
            </div>
            <div className="pulse-modes">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  className={`period-tab ${mode === m.key ? 'period-active' : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pulse-stage">
          <canvas ref={canvasRef} className="pulse-canvas" />
        </div>

        <div className="pulse-stats">
          <span className={`pulse-live ${stats.connected ? 'on' : 'off'}`}>
            <span className="pulse-dot" /> {stats.connected ? 'LIVE' : 'reconnecting…'}
          </span>
          <Stat label="~TPS (sampled)" value={stats.tps} />
          <Stat label={isSol ? 'Slot' : 'MC seqno'} value={stats.height ? stats.height.toLocaleString() : '…'} />
          <Stat label="Txns seen" value={stats.total.toLocaleString()} />
          <span className="pulse-legend">
            <span className="lg" style={{ background: RAD[network][1] }} />
            <span className="lg" style={{ background: RAD[network][0], marginLeft: 10 }} />
            {isSol ? 'SPL token activity' : 'base / masterchain'}
          </span>
        </div>
      </div>

      <p className="disclaimer">
        {isSol
          ? 'Live throughput from Solana mainnet RPC (recent performance samples). The flare rate tracks real network TPS; exact cell positions are illustrative.'
          : 'Live data from toncenter (TON mainnet). Cell positions are a hash-based mapping for visual effect; brightness reflects real, recent transaction activity.'}
      </p>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <span className="pulse-stat">
    <span className="pulse-stat-value">{value}</span>
    <span className="pulse-stat-label">{label}</span>
  </span>
)
