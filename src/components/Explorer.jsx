import { useEffect, useState } from 'react'
import { formatEther } from 'ethers'
import { CHAIN_LIST, CHAINS, getChainByKey } from '../config/chains.js'
import { getReadProvider } from '../lib/wallet.js'
import { explorerTxUrl } from '../lib/bridge.js'
import { getSolBlockHeight } from '../lib/solana.js'
import { getTonSeqno } from '../lib/ton.js'
import { useHistory } from '../hooks/useHistory.js'
import { clearHistory } from '../lib/history.js'
import MarketStats from './MarketStats.jsx'

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

function Activity() {
  const history = useHistory()

  return (
    <div className="card">
      <div className="section-head">
        <h2 className="section-title">Your bridge activity</h2>
        {history.length > 0 && (
          <button className="link-btn" onClick={clearHistory}>
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="empty">
          No transfers yet. Bridges you make in this browser show up here.
        </p>
      ) : (
        <div className="activity-list">
          {history.map((h, i) => {
            const src = CHAINS[h.sourceKey]
            const dst = CHAINS[h.destKey]
            const linkable = src && h.hash
            const inner = (
              <>
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
              </>
            )
            return linkable ? (
              <a
                key={`${h.ts}-${i}`}
                className="activity-row"
                href={explorerTxUrl(src, h.hash)}
                target="_blank"
                rel="noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div key={`${h.ts}-${i}`} className="activity-row activity-row-static">
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Explorer() {
  return (
    <div className="stack">
      <MarketStats />
      <NetworkStatus />
      <Activity />
      <TxLookup />
    </div>
  )
}
