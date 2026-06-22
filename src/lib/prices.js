import { CHAIN_LIST } from '../config/chains.js'

// Prices come from CoinGecko. Note: testnet tokens have no market value, so we
// price the *mainnet equivalent* asset (ETH/POL/BNB/USDC) via its `coingeckoId`
// and use that for display. Balances stay testnet; only the per-unit price is
// real. See README.

// Every distinct CoinGecko id referenced by a supported asset.
export function allCoingeckoIds() {
  const ids = new Set()
  CHAIN_LIST.forEach((c) => {
    if (c.nativeCurrency.coingeckoId) ids.add(c.nativeCurrency.coingeckoId)
    c.tokens.forEach((t) => t.coingeckoId && ids.add(t.coingeckoId))
  })
  return [...ids]
}

// Uses the markets endpoint so a single request yields price, 24h change,
// market cap, and a 7-day sparkline. Mapped to a { id: {...} } shape that keeps
// the `.usd` / `.usd_24h_change` / `.usd_market_cap` keys older code relies on.
export async function fetchPrices(ids) {
  if (!ids.length) return {}
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
    ',',
  )}&sparkline=true&price_change_percentage=24h`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Price API returned ${res.status}`)
  const rows = await res.json()
  const map = {}
  rows.forEach((m) => {
    map[m.id] = {
      usd: m.current_price,
      usd_24h_change: m.price_change_percentage_24h,
      usd_market_cap: m.market_cap,
      sparkline: m.sparkline_in_7d?.price || [],
    }
  })
  return map
}

// Full coin detail (description, market data, links) for the asset modal.
export async function fetchCoinDetail(id) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Detail API returned ${res.status}`)
  return res.json()
}

// Historical price series: returns [[timestampMs, price], …] for `days`.
export async function fetchMarketChart(id, days) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Chart API returned ${res.status}`)
  const data = await res.json()
  return data.prices || []
}

export const priceOf = (prices, id) => prices?.[id]?.usd ?? null

export function usdValue(amount, id, prices) {
  const p = priceOf(prices, id)
  if (p == null || amount === '' || amount == null) return null
  const v = Number(amount) * p
  return isFinite(v) ? v : null
}

export function formatUsd(v) {
  if (v == null || !isFinite(v)) return '—'
  if (v === 0) return '$0.00'
  if (v > 0 && v < 0.01) return '<$0.01'
  if (v < 1000)
    return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function formatPrice(v) {
  if (v == null || !isFinite(v)) return '—'
  if (v >= 1)
    return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
}

export function formatCompactUsd(v) {
  if (v == null || !isFinite(v)) return '—'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`
  return `$${v.toFixed(2)}`
}

export function formatChange(v) {
  if (v == null || !isFinite(v)) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}
