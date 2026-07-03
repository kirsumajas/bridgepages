import { useEffect, useState } from 'react'
import { fetchBridgeStatus, STAGE_INFO } from '../lib/tonBridge.js'

// Live TON->Solana bridge activity, polled from the droplet status API. Shows each deposit's
// real lifecycle stage (detected -> proving -> released) with a link to the Solana release tx.
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
        return (
          <div key={d.lt} className="status-row">
            <div className="status-meta">
              <div className="mono">lt {d.lt}</div>
              <div className="muted">
                {usdc ? `${usdc.toLocaleString()} USDC` : ''} → {(d.recipient || '').slice(0, 10)}…
              </div>
            </div>
            <div className="status-stage">
              <div className="stage-row">
                <span className={`stage-label stage-${d.stage}`}>{info.label}</span>
                {d.txSig && (
                  <a
                    href={`https://explorer.solana.com/tx/${d.txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    release tx ↗
                  </a>
                )}
              </div>
              <div className="progress">
                <div
                  className={`progress-fill ${d.stage === 'failed' ? 'failed' : ''}`}
                  style={{ width: `${Math.round(info.pct * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}