import { useEffect, useState } from 'react'
import { fetchBridgeStatus, STAGE_INFO } from '../lib/tonBridge.js'

// Live TON->Solana bridge activity, polled from the droplet status API. Each deposit's real
// lifecycle stage (detected -> proving -> released) is shown as a circular progress ring.
const R = 19
const RING_C = 2 * Math.PI * R // circumference for the dash math

export default function BridgeStatus() {
  const [deposits, setDeposits] = useState([])
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const d = await fetchBridgeStatus()
        if (!cancelled) {
          setDeposits(d)
          setOffline(false)
        }
      } catch {
        if (!cancelled) setOffline(true)
      }
    }
    tick()
    const id = setInterval(tick, 8000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (!deposits.length && !offline) return null

  return (
    <div className="card bridge-status">
      <h3>Live bridge activity — TON → Solana</h3>
      {offline && <div className="muted">Status service unreachable.</div>}
      {deposits.slice(0, 8).map((d) => {
        const info = STAGE_INFO[d.stage] || { label: d.stage, pct: 0.1 }
        const usdc = Number(d.amount || 0) / 1e6
        const center = d.stage === 'released' ? '✓' : d.stage === 'failed' ? '✕' : `${Math.round(info.pct * 100)}%`
        return (
          <div key={d.lt} className="status-row">
            <div className="status-meta">
              <div className={`stage-label stage-${d.stage}`}>{info.label}</div>
              <div className="mono">lt {d.lt}</div>
              <div className="muted">
                {usdc ? `${usdc.toLocaleString()} USDC` : ''} → {(d.recipient || '').slice(0, 10)}…
                {d.txSig && (
                  <>
                    {' · '}
                    <a
                      href={`https://explorer.solana.com/tx/${d.txSig}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      release tx ↗
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className={`status-ring stage-${d.stage}${d.stage === 'proving' ? ' spinning' : ''}`}>
              <svg viewBox="0 0 44 44" className="ring-svg">
                <circle className="ring-track" cx="22" cy="22" r={R} />
                <circle
                  className="ring-fill"
                  cx="22"
                  cy="22"
                  r={R}
                  style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C * (1 - info.pct) }}
                />
              </svg>
              <span className="ring-center">{center}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}