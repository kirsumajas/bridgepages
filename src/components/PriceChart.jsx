import { useMemo, useState } from 'react'
import { formatPrice } from '../lib/prices.js'

const W = 600
const H = 240
const PAD = 28

const fmtDate = (ts, period) => {
  const d = new Date(ts)
  if (period === '1')
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (period === '7' || period === '30')
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

export default function PriceChart({ data, period, loading, error }) {
  const [hover, setHover] = useState(null)

  const model = useMemo(() => {
    if (!data || data.length < 2) return null
    const prices = data.map((d) => d[1])
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const span = max - min || 1
    const n = data.length
    const points = data.map((d, i) => ({
      x: PAD + (i / (n - 1)) * (W - 2 * PAD),
      y: H - PAD - ((d[1] - min) / span) * (H - 2 * PAD),
      price: d[1],
      ts: d[0],
    }))
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L${points[n - 1].x.toFixed(1)} ${H - PAD} L${points[0].x.toFixed(1)} ${H - PAD} Z`
    const up = prices[n - 1] >= prices[0]
    return { points, line, area, min, max, up, n }
  }, [data])

  if (loading) return <div className="chart-state">Loading chart…</div>
  if (error) return <div className="chart-state">Couldn't load chart ({error}).</div>
  if (!model) return <div className="chart-state">No chart data.</div>

  const color = model.up ? 'var(--green)' : 'var(--red)'
  const active = hover != null ? model.points[hover] : null

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    const i = Math.max(0, Math.min(model.n - 1, Math.round(frac * (model.n - 1))))
    setHover(i)
  }

  return (
    <div className="chart-wrap" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={model.area} fill="url(#chartFill)" />
        <path d={model.line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {active && (
          <>
            <line
              x1={active.x}
              y1={PAD}
              x2={active.x}
              y2={H - PAD}
              stroke="var(--text-dim)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={active.x} cy={active.y} r="4" fill={color} stroke="var(--surface)" strokeWidth="2" />
          </>
        )}
      </svg>

      <div className="chart-axis chart-axis-max">{formatPrice(model.max)}</div>
      <div className="chart-axis chart-axis-min">{formatPrice(model.min)}</div>

      {active && (
        <div
          className="chart-tooltip"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <div className="chart-tooltip-price">{formatPrice(active.price)}</div>
          <div className="chart-tooltip-date">{fmtDate(active.ts, period)}</div>
        </div>
      )}
    </div>
  )
}
