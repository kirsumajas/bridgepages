import { useEffect, useState } from 'react'
import {
  fetchCoinDetail,
  fetchMarketChart,
  formatPrice,
  formatCompactUsd,
  formatChange,
} from '../lib/prices.js'
import PriceChart from './PriceChart.jsx'

const PERIODS = [
  { label: '1D', days: '1' },
  { label: '7D', days: '7' },
  { label: '1M', days: '30' },
  { label: '3M', days: '90' },
  { label: '1Y', days: '365' },
]

const stripHtml = (html) => {
  if (!html) return ''
  try {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
  } catch {
    return html
  }
}

export default function AssetModal({ asset, onClose }) {
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState(null)
  const [period, setPeriod] = useState('7')
  const [chart, setChart] = useState(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState(null)
  const [expanded, setExpanded] = useState(false)

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Load coin detail once.
  useEffect(() => {
    let cancelled = false
    fetchCoinDetail(asset.id)
      .then((d) => !cancelled && setDetail(d))
      .catch((e) => !cancelled && setDetailError(e?.message || 'Failed to load'))
    return () => {
      cancelled = true
    }
  }, [asset.id])

  // Load chart whenever the period changes.
  useEffect(() => {
    let cancelled = false
    setChartLoading(true)
    setChartError(null)
    fetchMarketChart(asset.id, period)
      .then((p) => !cancelled && setChart(p))
      .catch((e) => !cancelled && setChartError(e?.message || 'Failed to load'))
      .finally(() => !cancelled && setChartLoading(false))
    return () => {
      cancelled = true
    }
  }, [asset.id, period])

  const md = detail?.market_data
  const price = md?.current_price?.usd
  const change = md?.price_change_percentage_24h
  const name = detail?.name || asset.symbol
  const description = stripHtml(detail?.description?.en)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-head">
          <span className="chain-dot lg" style={{ background: asset.color }} />
          <div className="modal-title">
            <div className="modal-name">
              {name} <span className="modal-symbol">{asset.symbol}</span>
            </div>
            {detailError ? (
              <div className="modal-price-error">Couldn't load details ({detailError})</div>
            ) : (
              <div className="modal-price-row">
                <span className="modal-price">{price != null ? formatPrice(price) : '…'}</span>
                {change != null && (
                  <span className={change >= 0 ? 'up' : 'down'}>{formatChange(change)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              className={`period-tab ${period === p.days ? 'period-active' : ''}`}
              onClick={() => setPeriod(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <PriceChart data={chart} period={period} loading={chartLoading} error={chartError} />

        {md && (
          <div className="modal-stats">
            <Stat label="Market cap" value={formatCompactUsd(md.market_cap?.usd)} />
            <Stat label="24h volume" value={formatCompactUsd(md.total_volume?.usd)} />
            <Stat label="24h high" value={formatPrice(md.high_24h?.usd)} />
            <Stat label="24h low" value={formatPrice(md.low_24h?.usd)} />
            <Stat
              label="Circulating"
              value={
                md.circulating_supply
                  ? `${Math.round(md.circulating_supply).toLocaleString()} ${asset.symbol}`
                  : '—'
              }
            />
            <Stat label="All-time high" value={formatPrice(md.ath?.usd)} />
          </div>
        )}

        {description && (
          <div className="modal-desc">
            <p className={expanded ? '' : 'clamp'}>{description}</p>
            {description.length > 240 && (
              <button className="link-btn" onClick={() => setExpanded((v) => !v)}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        <p className="market-note">Data via CoinGecko · mainnet reference figures.</p>
      </div>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div className="modal-stat">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
)
