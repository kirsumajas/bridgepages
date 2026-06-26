// Hexagonal radar ("spectral signature") for the Guard analysis.
const SIZE = 260
const CX = SIZE / 2
const CY = SIZE / 2 + 6
const R = 86

const pointAt = (i, n, frac) => {
  const angle = -Math.PI / 2 + (i / n) * Math.PI * 2
  return [CX + R * frac * Math.cos(angle), CY + R * frac * Math.sin(angle)]
}

const polygon = (n, frac) =>
  Array.from({ length: n }, (_, i) => pointAt(i, n, frac).map((v) => v.toFixed(1)).join(','))
    .join(' ')

export default function RadarChart({ axes, color = 'var(--primary)' }) {
  const n = axes.length
  const dataPoints = axes
    .map((a, i) => pointAt(i, n, a.value / 100).map((v) => v.toFixed(1)).join(','))
    .join(' ')

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar">
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} className="radar-grid" points={polygon(n, f)} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, n, 1)
        return <line key={i} className="radar-spoke" x1={CX} y1={CY} x2={x} y2={y} />
      })}
      <polygon className="radar-area" points={dataPoints} style={{ fill: color, stroke: color }} />
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, n, 1.18)
        return (
          <text
            key={a.label}
            x={x}
            y={y}
            className="radar-label"
            textAnchor={x < CX - 5 ? 'end' : x > CX + 5 ? 'start' : 'middle'}
            dominantBaseline="middle"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
