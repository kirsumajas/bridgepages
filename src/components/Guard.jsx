import { useState } from 'react'
import { analyzeAddress } from '../lib/guard.js'
import { useWallets } from '../hooks/useWallets.jsx'
import RadarChart from './RadarChart.jsx'

const VERDICT_COLOR = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' }
const shorten = (a, n = 8) => (a ? `${a.slice(0, n)}…${a.slice(-6)}` : '')

function ScoreRing({ score, verdict }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - score / 100)
  const color = VERDICT_COLOR[verdict.key]
  return (
    <div className="score-ring">
      <svg viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} className="ring-track" />
        <circle
          cx="65"
          cy="65"
          r={r}
          className="ring-value"
          style={{ stroke: color, strokeDasharray: c, strokeDashoffset: offset }}
        />
        <text x="65" y="60" className="ring-score" style={{ fill: color }}>
          {score}
        </text>
        <text x="65" y="82" className="ring-sub">
          / 100
        </text>
      </svg>
      <span className="badge" style={{ background: `${color}22`, color }}>
        {verdict.label}
      </span>
    </div>
  )
}

function Spectrum({ values }) {
  return (
    <div className="spectrum" title="Transaction-frequency spectrum (simulated)">
      {values.map((v, i) => (
        <span key={i} className="spectrum-bar" style={{ height: `${Math.round(v * 100)}%` }} />
      ))}
    </div>
  )
}

const riskClass = (r) => (r < 34 ? 'low' : r < 67 ? 'medium' : 'high')

export default function Guard() {
  const wallets = useWallets()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const run = (addr) => {
    const value = (addr ?? input).trim()
    if (value.length < 8) return
    setInput(value)
    setResult(analyzeAddress(value))
  }

  return (
    <div className="stack">
      <div className="card guard-hero">
        <div className="guard-title">
          <span className="guard-logo">🛡️</span>
          <div>
            <h1>Bridge Guard</h1>
            <p>Spectral + ML wallet risk analysis. Inspect any address before you interact.</p>
          </div>
        </div>

        <div className="lookup-row">
          <input
            className="text-input"
            placeholder="Paste a wallet or contract address…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            spellCheck={false}
          />
          <button className="btn btn-primary" onClick={() => run()}>
            Analyze
          </button>
        </div>
        <div className="guard-quick">
          {wallets.evm.account && (
            <button className="link-btn" onClick={() => run(wallets.evm.account)}>
              Use my wallet
            </button>
          )}
          <button
            className="link-btn"
            onClick={() => run('0x' + 'a3f9c2'.repeat(6) + 'b1d4')}
          >
            Try a sample
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="card guard-summary">
            <ScoreRing score={result.riskScore} verdict={result.verdict} />
            <div className="guard-summary-main">
              <div className="guard-addr">
                <span className="addr-mono">{shorten(result.address, 12)}</span>
                <span className="badge badge-pending">{result.type}</span>
              </div>
              <div className="guard-labels">
                {result.labels.map((l) => (
                  <span className="ml-chip" key={l.text}>
                    {l.text} <span className="ml-conf">{l.conf}%</span>
                  </span>
                ))}
              </div>
              <Spectrum values={result.spectrum} />
              <span className="spectrum-caption">Transaction-frequency spectrum</span>
            </div>
          </div>

          <div className="guard-cols">
            <div className="card">
              <h2 className="section-title">Spectral signature</h2>
              <RadarChart axes={result.axes} color={VERDICT_COLOR[result.verdict.key]} />
              <div className="radar-legend">
                {result.axes.map((a) => (
                  <span key={a.label}>
                    {a.label} <strong>{a.value}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Wallet metrics</h2>
              <div className="guard-metrics">
                <Metric label="Balance" value={`${result.metrics.balance} (native)`} />
                <Metric label="Transactions" value={result.metrics.txCount.toLocaleString()} />
                <Metric label="First seen" value={`${result.metrics.ageDays} days ago`} />
                <Metric label="Last active" value={`${result.metrics.lastActiveDays} days ago`} />
                <Metric label="Counterparties" value={result.metrics.counterpartyCount.toLocaleString()} />
                <Metric label="Type" value={result.type} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Counterparties analyzed</h2>
            <div className="cp-list">
              {result.counterparties.map((cp) => (
                <div className="cp-row" key={cp.address}>
                  <span className="addr-mono cp-addr">{shorten(cp.address)}</span>
                  <span className="cp-label">{cp.label}</span>
                  <span className="cp-int">{cp.interactions} txns</span>
                  <span className={`cp-risk cp-${riskClass(cp.risk)}`}>{cp.risk}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="disclaimer">
            ⚠️ Prototype — this analysis is <strong>simulated</strong> (deterministically generated
            from the address) for demonstration. It does not use real on-chain data, ML models, or
            spectral graph analysis, and is not security or financial advice.
          </p>
        </>
      )}
    </div>
  )
}

const Metric = ({ label, value }) => (
  <div className="guard-metric">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
)
