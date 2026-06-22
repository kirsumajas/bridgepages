import { useState } from 'react'
import { CHAIN_LIST } from '../config/chains.js'
import { usePrices } from '../hooks/usePrices.jsx'
import { formatPrice, formatCompactUsd, formatChange } from '../lib/prices.js'
import AssetModal from './AssetModal.jsx'
import Sparkline from './Sparkline.jsx'

// Distinct assets to show, derived from the supported chains/tokens.
const ASSETS = (() => {
  const seen = new Set()
  const list = []
  const add = (id, symbol, color) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    list.push({ id, symbol, color })
  }
  CHAIN_LIST.forEach((c) => {
    const n = c.nativeCurrency
    add(n.coingeckoId, n.priceSymbol || n.symbol, c.color)
    c.tokens.forEach((t) => add(t.coingeckoId, t.symbol, '#8b95ad'))
  })
  return list
})()

export default function MarketStats() {
  const { prices, loading, error } = usePrices()
  const [selected, setSelected] = useState(null)

  return (
    <div className="card">
      <h2 className="section-title">Market prices</h2>

      {error && (
        <div className="banner banner-warn" style={{ marginBottom: 12 }}>
          Couldn't load live prices ({error}). They'll retry shortly.
        </div>
      )}

      <div className="market-head">
        <span>Asset</span>
        <span className="market-spark-col">7d</span>
        <span className="market-col">Price</span>
        <span className="market-col">24h</span>
        <span className="market-col market-cap-col">Market cap</span>
      </div>

      <div className="market-list">
        {ASSETS.map((a) => {
          const row = prices[a.id]
          const change = row?.usd_24h_change
          const up = change >= 0
          return (
            <button className="market-row" key={a.id} onClick={() => setSelected(a)}>
              <span className="market-asset">
                <span className="chain-dot" style={{ background: a.color }} />
                {a.symbol}
              </span>
              <span className="market-spark-col">
                <Sparkline data={row?.sparkline} />
              </span>
              <span className="market-col market-price">
                {loading && !row ? '…' : formatPrice(row?.usd)}
              </span>
              <span className={`market-col ${change == null ? '' : up ? 'up' : 'down'}`}>
                {row ? formatChange(change) : '—'}
              </span>
              <span className="market-col market-cap-col">
                {formatCompactUsd(row?.usd_market_cap)}
              </span>
            </button>
          )
        })}
      </div>

      <p className="market-note">Mainnet reference prices via CoinGecko · tap an asset for details.</p>

      {selected && <AssetModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
