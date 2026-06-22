import { useState } from 'react'
import { POOLS, poolChain, poolSymbol } from '../config/pools.js'
import { useBalance } from '../hooks/useBalance.js'
import { useTxSender } from '../hooks/useTxSender.js'
import { useWallets } from '../hooks/useWallets.jsx'
import { usePositions, useTicker } from '../hooks/usePositions.js'
import { usePrices } from '../hooks/usePrices.jsx'
import { accruedFees, addToPosition, removePosition } from '../lib/positions.js'
import { priceOf, formatUsd, formatCompactUsd } from '../lib/prices.js'
import TxStatus from './TxStatus.jsx'

const fmt = (n, dp = 6) => {
  const v = Number(n)
  if (!isFinite(v)) return '0'
  if (v === 0) return '0'
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (v >= 1) return v.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return v.toFixed(dp)
}

function PoolCard({ pool, position }) {
  const wallets = useWallets()
  const chain = poolChain(pool) // pools are EVM
  const evm = wallets.forVm('evm')
  const account = evm.account
  const symbol = poolSymbol(pool)
  const [amount, setAmount] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const { status, submitting, send } = useTxSender(wallets)
  const { balance } = useBalance(chain, account, pool.token, refreshKey)
  const { prices } = usePrices()

  const assetId = pool.token ? pool.token.coingeckoId : chain.nativeCurrency.coingeckoId
  const price = priceOf(prices, assetId)
  const inUsd = (amt) => (price != null && amt != null ? Number(amt) * price : null)

  const earned = position ? accruedFees(position, pool.apr, Date.now()) : 0
  const amountNum = Number(amount)
  const balanceNum = balance ? Number(balance) : 0

  let disabledReason = null
  if (!amount || amountNum <= 0) disabledReason = 'Enter an amount'
  else if (amountNum > balanceNum) disabledReason = 'Insufficient balance'

  const onDeposit = async () => {
    if (disabledReason) return
    await send({
      chain,
      token: pool.token,
      amount,
      to: pool.poolAddress,
      successMsg: `Provided ${amount} ${symbol} to the ${chain.short} pool. You're now earning fees.`,
      onConfirmed: () => {
        addToPosition(pool.id, account, amount, Date.now())
        setAmount('')
        setRefreshKey((k) => k + 1)
      },
    })
  }

  const onWithdraw = () => {
    if (!position) return
    const ok = window.confirm(
      `Stop providing liquidity to the ${chain.short} pool?\n\n` +
        `This clears your tracked position in this demo. (A real pool contract ` +
        `would return your ${symbol} plus earned fees on-chain.)`,
    )
    if (ok) removePosition(pool.id, account)
  }

  return (
    <div className="card pool-card">
      <div className="pool-head">
        <span className="chain-dot lg" style={{ background: chain.color }} />
        <div className="pool-title">
          <div className="pool-name">{symbol}</div>
          <div className="pool-chain">{chain.name}</div>
        </div>
        <div className="pool-apr">
          <div className="apr-value">{pool.apr}%</div>
          <div className="apr-label">APR</div>
        </div>
      </div>

      <div className="pool-stats">
        <div>
          <div className="stat-label">Pool TVL</div>
          <div className="stat-value">
            {pool.tvl.toLocaleString()} {symbol}
          </div>
          {price != null && <div className="stat-usd">{formatCompactUsd(inUsd(pool.tvl))}</div>}
        </div>
        <div>
          <div className="stat-label">Your liquidity</div>
          <div className="stat-value">
            {position ? `${fmt(position.amount)} ${symbol}` : '—'}
          </div>
          {position && price != null && (
            <div className="stat-usd">{formatUsd(inUsd(position.amount))}</div>
          )}
        </div>
        <div>
          <div className="stat-label">Fees earned</div>
          <div className="stat-value earned">
            {position ? `${fmt(earned, 8)} ${symbol}` : '—'}
          </div>
          {position && price != null && (
            <div className="stat-usd">{formatUsd(inUsd(earned))}</div>
          )}
        </div>
      </div>

      <div className="amount-input pool-amount">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="max-btn" onClick={() => balance && setAmount(balance)} disabled={!balance}>
          MAX
        </button>
        <span className="amount-symbol">{symbol}</span>
      </div>
      <div className="pool-balance">
        Wallet: {account ? `${balance ? fmt(balance) : '0'} ${symbol}` : '—'}
      </div>

      <div className="pool-actions">
        {account ? (
          <button
            className="btn btn-primary btn-block"
            onClick={onDeposit}
            disabled={Boolean(disabledReason) || submitting}
          >
            {submitting ? 'Processing…' : disabledReason || 'Provide liquidity'}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={evm.connect}
            disabled={evm.connecting}
          >
            {evm.connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
        {position && (
          <button className="btn btn-ghost" onClick={onWithdraw} disabled={submitting}>
            Withdraw
          </button>
        )}
      </div>

      <TxStatus status={status} chain={chain} />
    </div>
  )
}

export default function Earn() {
  const wallets = useWallets()
  const account = wallets.forVm('evm').account
  const positions = usePositions()
  const { prices } = usePrices()
  useTicker(1000) // re-render so fee accrual ticks live

  const key = (pool) => (account ? `${pool.id}:${account.toLowerCase()}` : null)

  const myPositions = POOLS.map((p) => ({ pool: p, pos: account ? positions[key(p)] : null }))
  const activeCount = myPositions.filter((m) => m.pos).length

  // Fees accrue per-pool in different assets, so total them in USD.
  const totalEarnedUsd = myPositions.reduce((sum, m) => {
    if (!m.pos) return sum
    const id = m.pool.token ? m.pool.token.coingeckoId : poolChain(m.pool).nativeCurrency.coingeckoId
    const price = priceOf(prices, id)
    if (price == null) return sum
    return sum + accruedFees(m.pos, m.pool.apr, Date.now()) * price
  }, 0)

  return (
    <div className="stack">
      <div className="card earn-hero">
        <h1>Earn from bridge fees</h1>
        <p>
          Provide liquidity to power cross-chain transfers. Your deposited assets back
          bridge transactions on that chain, and you earn a share of every transfer's fee.
        </p>
        <div className="earn-summary">
          <div>
            <div className="stat-label">Active positions</div>
            <div className="stat-value">{activeCount}</div>
          </div>
          <div>
            <div className="stat-label">Total fees earned</div>
            <div className="stat-value earned">{formatUsd(totalEarnedUsd)}</div>
          </div>
        </div>
      </div>

      {myPositions.map(({ pool, pos }) => (
        <PoolCard key={pool.id} pool={pool} position={pos} />
      ))}

      <p className="disclaimer">
        Earn pools are EVM-only for now. Testnet only — deposits are real on-chain
        transactions to the pool address; APR, TVL, and earned fees are simulated
        client-side for this demo. See the README to wire a real pool contract.
      </p>
    </div>
  )
}
