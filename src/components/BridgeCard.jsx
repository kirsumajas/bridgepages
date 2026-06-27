import { useEffect, useMemo, useState } from 'react'
import { CHAINS, CHAIN_LIST } from '../config/chains.js'
import { useBalance } from '../hooks/useBalance.js'
import { useTxSender } from '../hooks/useTxSender.js'
import { useWallets } from '../hooks/useWallets.jsx'
import { usePrices } from '../hooks/usePrices.jsx'
import { addHistory } from '../lib/history.js'
import { randomProofMs } from '../lib/bridgeStatus.js'
import { usdValue, formatUsd } from '../lib/prices.js'
import { isSolanaAddress } from '../lib/solana.js'
import { isTonAddress } from '../lib/ton.js'
import { looksLikeEns, resolveEns } from '../lib/ens.js'
import ChainSelect from './ChainSelect.jsx'
import TxStatus from './TxStatus.jsx'

const isEvmAddress = (v) => /^0x[a-fA-F0-9]{40}$/.test(v)

// Recipient validator + connect label per VM.
const validateFor = (vm, v) =>
  vm === 'solana' ? isSolanaAddress(v) : vm === 'ton' ? isTonAddress(v) : isEvmAddress(v)

const CONNECT_LABEL = {
  evm: 'Connect Wallet',
  solana: 'Connect Phantom',
  ton: 'Connect TON Wallet',
}

export default function BridgeCard({ onSourceChange, prefill, onPrefillDone }) {
  const wallets = useWallets()
  const { status, submitting, send } = useTxSender(wallets)
  const { prices } = usePrices()

  const [sourceKey, setSourceKey] = useState('sepolia')
  const [destKey, setDestKey] = useState('solanaDevnet')
  const [tokenIdx, setTokenIdx] = useState('native')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [ensAddr, setEnsAddr] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const source = CHAINS[sourceKey]
  const dest = CHAINS[destKey]
  const sourceWallet = wallets.forChain(source)
  const account = sourceWallet.account

  const token = useMemo(() => {
    if (tokenIdx === 'native') return null
    return source.tokens[Number(tokenIdx)] ?? null
  }, [tokenIdx, source])

  const assetSymbol = token ? token.symbol : source.nativeCurrency.symbol
  const assetId = token ? token.coingeckoId : source.nativeCurrency.coingeckoId
  const amountUsd = usdValue(amount, assetId, prices)

  const { balance, loading: balanceLoading } = useBalance(source, account, token, refreshKey)

  useEffect(() => {
    setTokenIdx('native')
  }, [sourceKey])

  // Tint the page background with the source chain's colour.
  useEffect(() => {
    onSourceChange?.(source.color)
  }, [source, onSourceChange])

  // Default the recipient to the connected account on the destination chain
  // (only when it'd be a valid address for that chain).
  useEffect(() => {
    const destAccount = wallets.forChain(dest).account
    if (destAccount && !recipient) setRecipient(destAccount)
  }, [dest, wallets, recipient])

  // Resolve ENS names for EVM destinations (debounced).
  useEffect(() => {
    setEnsAddr(null)
    if (dest.vm !== 'evm' || !looksLikeEns(recipient)) return
    let cancelled = false
    const id = setTimeout(async () => {
      const addr = await resolveEns(recipient)
      if (!cancelled) setEnsAddr(addr)
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [recipient, dest])

  // Prefill recipient from the Wallet page "Use" action.
  useEffect(() => {
    if (!prefill) return
    setRecipient(prefill.address)
    const destChain = CHAIN_LIST.find((c) => c.vm === prefill.vm)
    if (destChain) {
      setDestKey(destChain.key)
      if (destChain.key === sourceKey) {
        const other = CHAIN_LIST.find((c) => c.key !== destChain.key)
        if (other) setSourceKey(other.key)
      }
    }
    onPrefillDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

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
    setRecipient('')
  }

  const setMax = () => {
    if (balance) setAmount(balance)
  }

  const amountNum = Number(amount)
  const balanceNum = balance ? Number(balance) : 0
  const overBalance = amountNum > balanceNum
  const needsConnect = !account

  const recipientValid = validateFor(dest.vm, recipient) || (dest.vm === 'evm' && !!ensAddr)

  let disabledReason = null
  if (!amount || amountNum <= 0) disabledReason = 'Enter an amount'
  else if (overBalance) disabledReason = 'Insufficient balance'
  else if (!recipientValid) disabledReason = `Enter a valid ${dest.short} address`

  const onBridge = async () => {
    if (disabledReason) return
    await send({
      chain: source,
      token,
      amount,
      to: source.bridgeAddress,
      successMsg: `Deposited ${amount} ${assetSymbol} on ${source.short}. Bridging to ${dest.short} is handled by the relayer.`,
      onConfirmed: ({ hash }) => {
        addHistory({
          type: 'bridge',
          hash,
          sourceKey: source.key,
          destKey: dest.key,
          asset: assetSymbol,
          amount,
          account,
          recipient,
          ts: Date.now(),
          confirmMs: 0, // source tx already confirmed before we record it
          proofMs: randomProofMs(), // simulated destination proof generation
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
        <p>Move testnet tokens across chains — EVM, Solana &amp; TON.</p>
      </div>

      <div className="route">
        <ChainSelect label="From" value={source} onChange={handleSourceChange} disabledKey={destKey} />
        <button className="flip-btn" onClick={flip} title="Swap chains" aria-label="Swap chains">
          ⇅
        </button>
        <ChainSelect label="To" value={dest} onChange={handleDestChange} disabledKey={sourceKey} />
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
          placeholder={dest.vm === 'evm' ? '0x…' : dest.vm === 'ton' ? 'EQ… / UQ…' : 'Solana address'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          spellCheck={false}
        />
        {ensAddr && <div className="usd-hint">→ {ensAddr.slice(0, 6)}…{ensAddr.slice(-4)}</div>}
      </label>

      {needsConnect ? (
        <button
          className="btn btn-primary btn-block"
          onClick={sourceWallet.connect}
          disabled={sourceWallet.connecting}
        >
          {sourceWallet.connecting ? 'Connecting…' : CONNECT_LABEL[source.vm]}
        </button>
      ) : (
        <button
          className="btn btn-primary btn-block"
          onClick={onBridge}
          disabled={Boolean(disabledReason) || submitting}
        >
          {submitting ? 'Processing…' : disabledReason || `Bridge ${assetSymbol}`}
        </button>
      )}

      {sourceWallet.error && <div className="banner banner-error" style={{ marginTop: 12 }}>{sourceWallet.error}</div>}

      <TxStatus status={status} chain={source} />

      <p className="disclaimer">
        Testnet only. The source-chain deposit is a real on-chain transaction; the
        destination release requires a relayer — see the project README.
      </p>
    </div>
  )
}
