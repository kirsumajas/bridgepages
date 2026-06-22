// A tiny inline 7-day price sparkline. Green if the period closed up, red if
// down. Renders nothing if there isn't enough data.
export default function Sparkline({ data, width = 72, height = 24 }) {
  if (!data || data.length < 2) return <span className="spark-empty" />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const n = data.length

  const points = data
    .map((v, i) => {
      const x = (i / (n - 1)) * width
      const y = height - 1 - ((v - min) / span) * (height - 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const up = data[n - 1] >= data[0]
  const color = up ? 'var(--green)' : 'var(--red)'

  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
