import { useEffect, useState } from 'react'
import { formatEther } from 'ethers'
import { CHAIN_LIST, CHAINS, getChainByKey } from '../config/chains.js'
import { getReadProvider } from '../lib/wallet.js'
import { explorerTxUrl } from '../lib/bridge.js'
import { getSolBlockHeight } from '../lib/solana.js'
import { getTonSeqno } from '../lib/ton.js'
import { useHistory } from '../hooks/useHistory.js'
import { useTicker } from '../hooks/usePositions.js'
import { addHistory, clearHistory } from '../lib/history.js'
import { deriveStage, mockTransfer } from '../lib/bridgeStatus.js'
import MarketStats from './MarketStats.jsx'

const STAGE_BADGE = { confirming: 'badge-pending', proving: 'badge-warn', completed: 'badge-success' }

// Latest block/slot/seqno for a chain, dispatched by VM.
const fetchHeight = (chain) => {
  if (chain.vm === 'solana') return getSolBlockHeight()
  if (chain.vm === 'ton') return getTonSeqno()
  return getReadProvider(chain.key).getBlockNumber()
}

const shorten = (s, n = 6) => (s ? `${s.slice(0, n)}…${s.slice(-4)}` : '')

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function NetworkStatus() {
  const [blocks, setBlocks] = useState({})

  useEffect(() => {
    let cancelled = false
    const fetchBlocks = () => {
      CHAIN_LIST.forEach(async (chain) => {
        try {
          const bn = await fetchHeight(chain)
          if (!cancelled) setBlocks((prev) => ({ ...prev, [chain.key]: Number(bn) }))
        } catch {
          if (!cancelled) setBlocks((prev) => ({ ...prev, [chain.key]: 'offline' }))
        }
      })
    }
    fetchBlocks()
    const id = setInterval(fetchBlocks, 12000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <div className="card">
      <h2 className="section-title">Network status</h2>
      <div className="net-grid">
        {CHAIN_LIST.map((chain) => {
          const block = blocks[chain.key]
          const offline = block === 'offline'
          return (
            <div className="net-row" key={chain.key}>
              <span className="chain-dot" style={{ background: chain.color }} />
              <span className="net-name">{chain.name}</span>
              <span className={`net-block ${offline ? 'net-offline' : ''}`}>
                {block === undefined ? '…' : offline ? 'offline' : `#${block.toLocaleString()}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TxLookup() {
  const [chainKey, setChainKey] = useState('sepolia')
  const [hash, setHash] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    setError(null)
    setResult(null)
    const h = hash.trim()
    if (!/^0x[a-fA-F0-9]{64}$/.test(h)) {
      setError('Enter a valid 0x… transaction hash (66 characters).')
      return
    }
    setLoading(true)
    try {
      const provider = getReadProvider(chainKey)
      const [tx, receipt] = await Promise.all([
        provider.getTransaction(h),
        provider.getTransactionReceipt(h),
      ])
      if (!tx) {
        setError('Transaction not found on this chain.')
        return
      }
      setResult({ tx, receipt })
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  const chain = getChainByKey(chainKey)

  return (
    <div className="card">
      <h2 className="section-title">Look up a transaction</h2>
      <label className="field">
        <span className="field-label">Chain</span>
        <select
          className="select select-plain"
          value={chainKey}
          onChange={(e) => setChainKey(e.target.value)}
        >
          {CHAIN_LIST.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="lookup-row">
        <input
          className="text-input"
          placeholder="0x… transaction hash"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          spellCheck={false}
        />
        <button className="btn btn-primary" onClick={lookup} disabled={loading}>
          {loading ? '…' : 'Look up'}
        </button>
      </div>

      {error && <div className="banner banner-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="tx-detail">
          <Row label="Status">
            {!result.receipt ? (
              <span className="badge badge-pending">Pending</span>
            ) : result.receipt.status === 1 ? (
              <span className="badge badge-success">Success</span>
            ) : (
              <span className="badge badge-error">Failed</span>
            )}
          </Row>
          <Row label="From">{shorten(result.tx.from)}</Row>
          <Row label="To">{shorten(result.tx.to)}</Row>
          <Row label="Value">
            {formatEther(result.tx.value)} {chain.nativeCurrency.symbol}
          </Row>
          <Row label="Block">{result.tx.blockNumber ?? '—'}</Row>
          {result.receipt && <Row label="Gas used">{result.receipt.gasUsed.toString()}</Row>}
          <a
            className="tx-detail-link"
            href={explorerTxUrl(chain, result.tx.hash)}
            target="_blank"
            rel="noreferrer"
          >
            View on {chain.short} explorer ↗
          </a>
        </div>
      )}
    </div>
  )
}

const Row = ({ label, children }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{children}</span>
  </div>
)

function ActivityRow({ h }) {
  const src = CHAINS[h.sourceKey]
  const dst = CHAINS[h.destKey]
  const stage = deriveStage(h, Date.now())
  const inProgress = stage.key !== 'completed'

  return (
    <div className="activity-row activity-row-static">
      <div className="activity-top">
        <div className="activity-route">
          <span className="chain-dot" style={{ background: src?.color }} />
          {src?.short}
          <span className="arrow">→</span>
          <span className="chain-dot" style={{ background: dst?.color }} />
          {dst?.short}
        </div>
        <div className="activity-meta">
          <span className="activity-amount">
            {h.amount} {h.asset}
          </span>
          <span className="activity-time">{timeAgo(h.ts)}</span>
        </div>
      </div>

      <div className="activity-status">
        <span className={`badge ${STAGE_BADGE[stage.key]}`}>
          {stage.key === 'proving' ? `${stage.label} · ~${stage.remainingSec}s` : stage.label}
        </span>

        {inProgress ? (
          <div className="proof-bar">
            <div
              className="proof-bar-fill"
              style={{ width: `${Math.min(100, Math.round(stage.progress * 100))}%` }}
            />
          </div>
        ) : src && h.hash ? (
          <a className="activity-link" href={explorerTxUrl(src, h.hash)} target="_blank" rel="noreferrer">
            View ↗
          </a>
        ) : (
          <span className="activity-mock-tag">{h.mock ? 'demo' : 'released'}</span>
        )}
      </div>
    </div>
  )
}

function Activity() {
  const history = useHistory()
  useTicker(1000) // re-render so stage countdowns/progress update live

  return (
    <div className="card">
      <div className="section-head">
        <h2 className="section-title">Your bridge activity</h2>
        <div className="section-actions">
          <button className="link-btn" onClick={() => addHistory(mockTransfer())}>
            + Simulate transfer
          </button>
          {history.length > 0 && (
            <button className="link-btn" onClick={clearHistory}>
              Clear
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <p className="empty">
          No transfers yet. Bridge something, or hit “Simulate transfer” to watch the
          deposit → proof → release lifecycle.
        </p>
      ) : (
        <div className="activity-list">
          {history.map((h, i) => (
            <ActivityRow key={`${h.ts}-${i}`} h={h} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Explorer() {
  return (
    <div className="explorer-grid">
      <div className="span-2">
        <MarketStats />
      </div>
      <NetworkStatus />
      <TxLookup />
      <div className="span-2">
        <Activity />
      </div>
    </div>
  )
}
