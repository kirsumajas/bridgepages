import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { CHAIN_LIST, CHAINS } from '../config/chains.js'
import { useWallets } from '../hooks/useWallets.jsx'
import { usePrices } from '../hooks/usePrices.jsx'
import { useWalletBalances } from '../hooks/useWalletBalances.js'
import { useHistory } from '../hooks/useHistory.js'
import { priceOf, formatUsd } from '../lib/prices.js'
import { deriveStage } from '../lib/bridgeStatus.js'

const shorten = (a, n = 6) => (a ? `${a.slice(0, n)}…${a.slice(-4)}` : '')

const VM_COLOR = { evm: '#627eea', solana: '#14f195', ton: '#0098ea' }
const VM_LABEL = { evm: 'EVM', solana: 'Solana', ton: 'TON' }

const ECOSYSTEMS = [
  { vm: 'evm', name: 'EVM', sub: 'MetaMask', network: 'Multiple testnets' },
  { vm: 'solana', name: 'Solana', sub: 'Phantom', network: 'Devnet' },
  { vm: 'ton', name: 'TON', sub: 'Tonkeeper', network: 'Testnet' },
]

// --- Recipients (address book), persisted in localStorage ---
const REC_KEY = 'cb_recipients_v1'
const DEFAULT_RECIPIENTS = [
  { id: 'r1', label: 'Team Treasury', vm: 'evm', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { id: 'r2', label: 'My Phantom', vm: 'solana', address: 'Dyu1mJ9bQk7sR2vN8pX4tWcZ3aLfHgE6oU5nKqP0sBd' },
  { id: 'r3', label: 'TON Savings', vm: 'ton', address: 'UQCJ8s1k0e7nQvQ3m1aJpZ8sLrXyT4hW6dF2gK0bN5cMxYpQ' },
]
const loadRecipients = () => {
  try {
    const s = localStorage.getItem(REC_KEY)
    if (s) return JSON.parse(s)
  } catch {
    /* ignore */
  }
  return DEFAULT_RECIPIENTS
}
const saveRecipients = (list) => {
  try {
    localStorage.setItem(REC_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

const STAGE_BADGE = { confirming: 'badge-pending', proving: 'badge-warn', completed: 'badge-success' }

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }
  return (
    <button className="copy-btn" onClick={copy} title="Copy address">
      {copied ? '✓' : 'Copy'}
    </button>
  )
}

function WalletCard({ eco, wallet, balances, prices, onReceive }) {
  const chains = CHAIN_LIST.filter((c) => c.vm === eco.vm)
  const connected = Boolean(wallet.account)
  const subtotal = chains.reduce((sum, c) => {
    const bal = balances[c.key]
    const price = priceOf(prices, c.nativeCurrency.coingeckoId)
    return bal != null && price != null ? sum + bal * price : sum
  }, 0)

  return (
    <div className="card wallet-card-c">
      <div className="wc-head">
        <span className="chain-dot lg" style={{ background: VM_COLOR[eco.vm] }} />
        <div className="wc-title">
          <div className="wc-name">{eco.name}</div>
          <div className="wc-sub">{eco.sub}</div>
        </div>
        {connected ? (
          <button className="copy-btn" onClick={wallet.disconnect}>
            Disconnect
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={wallet.connect} disabled={wallet.connecting}>
            {wallet.connecting ? '…' : 'Connect'}
          </button>
        )}
      </div>

      {connected ? (
        <>
          <div className="wc-addr">
            <span className="addr-mono">{shorten(wallet.account, 8)}</span>
            <CopyButton value={wallet.account} />
            <button className="copy-btn" onClick={() => onReceive(wallet.account, eco.name)}>
              QR
            </button>
          </div>
          <div className="wc-subtotal">{formatUsd(subtotal)}</div>
          <div className="wc-balances">
            {chains.map((c) => {
              const bal = balances[c.key]
              return (
                <div className="wc-bal" key={c.key}>
                  <span className="chain-dot" style={{ background: c.color }} />
                  <span className="wc-bal-chain">{c.short}</span>
                  <span className="wc-bal-amt">
                    {bal == null ? '…' : `${bal.toFixed(3)} ${c.nativeCurrency.symbol}`}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="wc-empty">Not connected</p>
      )}
    </div>
  )
}

function ReceiveModal({ address, label, onClose }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    QRCode.toDataURL(address, { margin: 1, width: 240, color: { dark: '#0b1411', light: '#ffffff' } })
      .then(setSrc)
      .catch(() => {})
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [address, onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal receive-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="section-title">Receive · {label}</h2>
        <div className="qr-box">{src && <img src={src} alt="address QR" width="220" height="220" />}</div>
        <div className="wallet-addr">
          <span className="addr-mono">{address}</span>
          <CopyButton value={address} />
        </div>
      </div>
    </div>
  )
}

function Recipients({ onUseRecipient }) {
  const [list, setList] = useState(loadRecipients)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [vm, setVm] = useState('evm')

  const update = (next) => {
    setList(next)
    saveRecipients(next)
  }
  const add = () => {
    if (label.trim().length < 1 || address.trim().length < 6) return
    update([{ id: `r${Date.now()}`, label: label.trim(), vm, address: address.trim() }, ...list])
    setLabel('')
    setAddress('')
  }
  const remove = (id) => update(list.filter((r) => r.id !== id))

  return (
    <div className="card">
      <h2 className="section-title">Recipients</h2>
      <div className="rec-list">
        {list.length === 0 && <p className="empty">No saved recipients yet.</p>}
        {list.map((r) => (
          <div className="rec-row" key={r.id}>
            <span className="chain-dot" style={{ background: VM_COLOR[r.vm] }} />
            <div className="rec-info">
              <div className="rec-label">{r.label}</div>
              <div className="addr-mono rec-addr">{shorten(r.address, 8)}</div>
            </div>
            <span className="rec-net">{VM_LABEL[r.vm]}</span>
            <button className="copy-btn" onClick={() => onUseRecipient(r)} title="Use in bridge">
              Use
            </button>
            <CopyButton value={r.address} />
            <button className="icon-btn" onClick={() => remove(r.id)} title="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="rec-add">
        <input
          className="text-input"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <select className="select select-plain" value={vm} onChange={(e) => setVm(e.target.value)}>
          <option value="evm">EVM</option>
          <option value="solana">Solana</option>
          <option value="ton">TON</option>
        </select>
        <input
          className="text-input"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
        />
        <button className="btn btn-primary btn-sm" onClick={add}>
          Add
        </button>
      </div>
    </div>
  )
}

function History() {
  const history = useHistory()

  return (
    <div className="card">
      <h2 className="section-title">Transaction history</h2>
      {history.length === 0 ? (
        <p className="empty">No transfers yet — bridges you make appear here.</p>
      ) : (
        <div className="txh-list">
          {history.map((h, i) => {
            const src = CHAINS[h.sourceKey]
            const dst = CHAINS[h.destKey]
            const stage = deriveStage(h, Date.now())
            return (
              <div className="txh-row" key={`${h.ts}-${i}`}>
                <div className="txh-route">
                  <span className="chain-dot" style={{ background: src?.color }} />
                  {src?.short}
                  <span className="arrow">→</span>
                  <span className="chain-dot" style={{ background: dst?.color }} />
                  {dst?.short}
                </div>
                <div className="txh-amt">
                  {h.amount} {h.asset}
                </div>
                <span className={`badge ${STAGE_BADGE[stage.key]}`}>{stage.label}</span>
                <span className="txh-time">{timeAgo(h.ts)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Wallets({ onUseRecipient }) {
  const wallets = useWallets()
  const { prices } = usePrices()
  const [refreshKey, setRefreshKey] = useState(0)
  const [receive, setReceive] = useState(null)
  const { pairs, balances, loading } = useWalletBalances(refreshKey)

  const connectedCount = wallets.list.filter((w) => w.account).length
  const totalUsd = pairs.reduce((sum, p) => {
    const bal = balances[p.chain.key]
    const price = priceOf(prices, p.chain.nativeCurrency.coingeckoId)
    return bal != null && price != null ? sum + bal * price : sum
  }, 0)

  return (
    <div className="stack">
      <div className="card wallet-hero wallet-hero-c">
        <div>
          <div className="stat-label">Total balance</div>
          <div className="stat-value wallet-total">{formatUsd(totalUsd)}</div>
        </div>
        <div>
          <div className="stat-label">Connected</div>
          <div className="stat-value">{connectedCount} / 3</div>
        </div>
        <button className="link-btn wallet-refresh" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="wallet-grid">
        {ECOSYSTEMS.map((eco) => (
          <WalletCard
            key={eco.vm}
            eco={eco}
            wallet={wallets.forVm(eco.vm)}
            balances={balances}
            prices={prices}
            onReceive={(address, label) => setReceive({ address, label })}
          />
        ))}
      </div>

      <Recipients onUseRecipient={onUseRecipient} />
      <History />

      {receive && (
        <ReceiveModal address={receive.address} label={receive.label} onClose={() => setReceive(null)} />
      )}

      <p className="disclaimer">
        Balances are read live from each network's testnet RPC; USD uses mainnet reference
        prices. Recipients are stored locally in your browser. Transaction history is sample
        data for now.
      </p>
    </div>
  )
}
