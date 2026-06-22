import { useEffect, useMemo, useState } from 'react'
import { CHAINS, CHAIN_LIST } from '../config/chains.js'
import { useBalance } from '../hooks/useBalance.js'
import { useTxSender } from '../hooks/useTxSender.js'
import { usePrices } from '../hooks/usePrices.jsx'
import { depositToBridge } from '../lib/bridge.js'
import { addHistory } from '../lib/history.js'
import { usdValue, formatUsd } from '../lib/prices.js'
import ChainSelect from './ChainSelect.jsx'
import TxStatus from './TxStatus.jsx'

const isAddress = (v) => /^0x[a-fA-F0-9]{40}$/.test(v)

export default function BridgeCard({ wallet }) {
  const { account } = wallet
  const { status, submitting, send } = useTxSender(wallet)
  const { prices } = usePrices()

  const [sourceKey, setSourceKey] = useState('sepolia')
  const [destKey, setDestKey] = useState('amoy')
  const [tokenIdx, setTokenIdx] = useState('native')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const source = CHAINS[sourceKey]
  const dest = CHAINS[destKey]

  // The selected asset: 'native' or an index into source.tokens.
  const token = useMemo(() => {
    if (tokenIdx === 'native') return null
    return source.tokens[Number(tokenIdx)] ?? null
  }, [tokenIdx, source])

  const assetSymbol = token ? token.symbol : source.nativeCurrency.symbol
  const assetId = token ? token.coingeckoId : source.nativeCurrency.coingeckoId
  const amountUsd = usdValue(amount, assetId, prices)

  const { balance, loading: balanceLoading } = useBalance(
    source,
    account,
    token,
    refreshKey,
  )

  // Reset token selection when the source chain changes.
  useEffect(() => {
    setTokenIdx('native')
  }, [sourceKey])

  // Default the recipient to the connected account.
  useEffect(() => {
    if (account && !recipient) setRecipient(account)
  }, [account, recipient])

  const handleSourceChange = (key) => {
    setSourceKey(key)
    if (key === destKey) {
      const other = CHAIN_LIST.find((c) => c.key !== key)
      if (other) setDestKey(other.key)
    }
  }

  const handleDestChange = (key) => {
    setDestKey(key)
    if (key === sourceKey) {
      const other = CHAIN_LIST.find((c) => c.key !== key)
      if (other) setSourceKey(other.key)
    }
  }

  const flip = () => {
    setSourceKey(destKey)
    setDestKey(sourceKey)
  }

  const setMax = () => {
    if (balance) setAmount(balance)
  }

  const amountNum = Number(amount)
  const balanceNum = balance ? Number(balance) : 0
  const overBalance = amountNum > balanceNum

  let disabledReason = null
  if (!account) disabledReason = 'Connect your wallet'
  else if (!amount || amountNum <= 0) disabledReason = 'Enter an amount'
  else if (overBalance) disabledReason = 'Insufficient balance'
  else if (!isAddress(recipient)) disabledReason = 'Enter a valid recipient address'

  const onBridge = async () => {
    if (disabledReason) return
    await send({
      chain: source,
      build: (signer) =>
        depositToBridge({ signer, sourceChain: source, token, amount, recipient }),
      successMsg: `Deposited ${amount} ${assetSymbol} on ${source.short}. Bridging to ${dest.short} is handled by the relayer.`,
      onConfirmed: (tx) => {
        addHistory({
          type: 'bridge',
          hash: tx.hash,
          sourceKey: source.key,
          destKey: dest.key,
          asset: assetSymbol,
          amount,
          account,
          recipient,
          ts: Date.now(),
        })
        setAmount('')
        setRefreshKey((k) => k + 1)
      },
    })
  }

  return (
    <div className="card">
      <div className="card-head">
        <h1>Bridge assets</h1>
        <p>Move testnet tokens across chains.</p>
      </div>

      <div className="route">
        <ChainSelect
          label="From"
          value={source}
          onChange={handleSourceChange}
          disabledKey={destKey}
        />
        <button className="flip-btn" onClick={flip} title="Swap chains" aria-label="Swap chains">
          ⇅
        </button>
        <ChainSelect
          label="To"
          value={dest}
          onChange={handleDestChange}
          disabledKey={sourceKey}
        />
      </div>

      <label className="field">
        <span className="field-label">Asset</span>
        <select
          className="select select-plain"
          value={tokenIdx}
          onChange={(e) => setTokenIdx(e.target.value)}
        >
          <option value="native">{source.nativeCurrency.symbol} (native)</option>
          {source.tokens.map((t, i) => (
            <option key={t.address} value={String(i)}>
              {t.symbol}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <div className="amount-head">
          <span className="field-label">Amount</span>
          <span className="balance">
            Balance:{' '}
            {account
              ? balanceLoading
                ? '…'
                : `${balance ? Number(balance).toFixed(5) : '0'} ${assetSymbol}`
              : '—'}
            {account && balance && Number(balance) > 0 && (
              <button className="max-btn" onClick={setMax}>
                MAX
              </button>
            )}
          </span>
        </div>
        <div className="amount-input">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="amount-symbol">{assetSymbol}</span>
        </div>
        {amountUsd != null && amountUsd > 0 && (
          <div className="usd-hint">≈ {formatUsd(amountUsd)}</div>
        )}
      </div>

      <label className="field">
        <span className="field-label">Recipient on {dest.short}</span>
        <input
          className="text-input"
          placeholder="0x…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          spellCheck={false}
        />
      </label>

      <button
        className="btn btn-primary btn-block"
        onClick={onBridge}
        disabled={Boolean(disabledReason) || submitting}
      >
        {submitting ? 'Processing…' : disabledReason || `Bridge ${assetSymbol}`}
      </button>

      <TxStatus status={status} chain={source} />

      <p className="disclaimer">
        Testnet only. The source-chain deposit is a real on-chain transaction; the
        destination release requires a relayer — see the project README.
      </p>
    </div>
  )
}
