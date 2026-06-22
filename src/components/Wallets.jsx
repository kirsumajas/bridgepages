import { useState } from 'react'
import { CHAIN_LIST } from '../config/chains.js'
import { useWallets } from '../hooks/useWallets.jsx'
import { usePrices } from '../hooks/usePrices.jsx'
import { useWalletBalances } from '../hooks/useWalletBalances.js'
import { priceOf, formatUsd } from '../lib/prices.js'

const shorten = (a, n = 10) => (a ? `${a.slice(0, n)}…${a.slice(-6)}` : '')

const ECOSYSTEMS = [
  { vm: 'evm', name: 'EVM Wallet', sub: 'MetaMask / injected', network: 'Multiple testnets', color: '#627eea' },
  { vm: 'solana', name: 'Solana', sub: 'Phantom', network: 'Devnet', color: '#14f195' },
  { vm: 'ton', name: 'TON', sub: 'Tonkeeper / TonConnect', network: 'Testnet', color: '#0098ea' },
]

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
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

function EcosystemCard({ eco, wallet, balances, prices }) {
  const chains = CHAIN_LIST.filter((c) => c.vm === eco.vm)
  const connected = Boolean(wallet.account)

  const subtotal = chains.reduce((sum, c) => {
    const bal = balances[c.key]
    const price = priceOf(prices, c.nativeCurrency.coingeckoId)
    if (bal == null || price == null) return sum
    return sum + bal * price
  }, 0)

  return (
    <div className="card wallet-card">
      <div className="wallet-card-head">
        <span className="chain-dot lg" style={{ background: eco.color }} />
        <div className="wallet-card-title">
          <div className="wallet-card-name">{eco.name}</div>
          <div className="wallet-card-sub">{eco.sub}</div>
        </div>
        {connected ? (
          <button className="btn btn-ghost btn-sm" onClick={wallet.disconnect}>
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
          <div className="wallet-addr">
            <span className="addr-mono">{shorten(wallet.account)}</span>
            <CopyButton value={wallet.account} />
          </div>
          <div className="wallet-meta">
            <span>
              Network: <strong>{eco.vm === 'evm' && wallet.chain ? wallet.chain.name : eco.network}</strong>
            </span>
            <span className="wallet-subtotal">{formatUsd(subtotal)}</span>
          </div>

          <div className="wallet-balances">
            {chains.map((c) => {
              const bal = balances[c.key]
              const price = priceOf(prices, c.nativeCurrency.coingeckoId)
              const usd = bal != null && price != null ? bal * price : null
              return (
                <div className="wallet-bal-row" key={c.key}>
                  <span className="wallet-bal-chain">
                    <span className="chain-dot" style={{ background: c.color }} />
                    {c.short}
                  </span>
                  <span className="wallet-bal-amt">
                    {bal == null ? '…' : `${bal.toFixed(4)} ${c.nativeCurrency.symbol}`}
                  </span>
                  <span className="wallet-bal-usd">{usd != null ? formatUsd(usd) : '—'}</span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="wallet-disconnected">
          Not connected. Connect to view your {eco.name} address and balances.
        </p>
      )}
    </div>
  )
}

export default function Wallets() {
  const wallets = useWallets()
  const { prices } = usePrices()
  const [refreshKey, setRefreshKey] = useState(0)
  const { pairs, balances, loading } = useWalletBalances(refreshKey)

  const connectedCount = wallets.list.filter((w) => w.account).length

  const totalUsd = pairs.reduce((sum, p) => {
    const bal = balances[p.chain.key]
    const price = priceOf(prices, p.chain.nativeCurrency.coingeckoId)
    if (bal == null || price == null) return sum
    return sum + bal * price
  }, 0)

  return (
    <div className="stack">
      <div className="card wallet-hero">
        <div className="wallet-hero-head">
          <h1>Your wallets</h1>
          <button
            className="link-btn"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="wallet-hero-stats">
          <div>
            <div className="stat-label">Total balance</div>
            <div className="stat-value wallet-total">{formatUsd(totalUsd)}</div>
          </div>
          <div>
            <div className="stat-label">Connected wallets</div>
            <div className="stat-value">{connectedCount} / 3</div>
          </div>
        </div>
      </div>

      {ECOSYSTEMS.map((eco) => (
        <EcosystemCard
          key={eco.vm}
          eco={eco}
          wallet={wallets.forVm(eco.vm)}
          balances={balances}
          prices={prices}
        />
      ))}

      <p className="disclaimer">
        Balances are read live from each network's testnet RPC. USD values use mainnet
        reference prices (testnet tokens have no market value).
      </p>
    </div>
  )
}
