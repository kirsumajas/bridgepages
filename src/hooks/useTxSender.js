import { useCallback, useState } from 'react'
import { transferTo, explorerTxUrl } from '../lib/bridge.js'
import { getPhantom, sendSol } from '../lib/solana.js'
import { tonToNano } from '../lib/ton.js'
import { buildDepositMessage } from '../lib/tonBridge.js'
import { useToast } from './useToast.jsx'

// VM-aware transaction flow. Given a destination `chain`, asset, amount, and
// recipient address `to`, it routes to the right wallet/SDK, tracks status for
// <TxStatus />, and returns { hash } (hash is null for TON, which returns a BOC).
export function useTxSender(wallets) {
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const send = useCallback(
    async ({ chain, token, amount, to, bridgeRecipient, successMsg, onConfirmed }) => {
      setSubmitting(true)
      setStatus(null)
      try {
        let hash = null

        if (chain.vm === 'evm') {
          const w = wallets.forVm('evm')
          if (!w.account) throw new Error('Connect your wallet first.')
          if (w.chain?.chainId !== chain.chainId) {
            setStatus({ state: 'pending', message: `Switch your wallet to ${chain.name}…` })
            await w.switchTo(chain)
          }
          setStatus({ state: 'pending', message: 'Confirm the transaction in your wallet…' })
          const signer = await w.getSigner()
          const net = await signer.provider.getNetwork()
          if (Number(net.chainId) !== chain.chainId) {
            throw new Error(`Wallet is on the wrong network. Please switch to ${chain.name}.`)
          }
          const tx = await transferTo({ signer, chain, token, amount, to })
          setStatus({
            state: 'pending',
            hash: tx.hash,
            message: 'Transaction sent. Waiting for confirmation…',
          })
          await tx.wait()
          hash = tx.hash
        } else if (chain.vm === 'solana') {
          const w = wallets.forVm('solana')
          const provider = getPhantom()
          if (!provider || !w.account) throw new Error('Connect Phantom first.')
          setStatus({ state: 'pending', message: 'Confirm the transaction in Phantom…' })
          hash = await sendSol({ provider, from: w.account, to, amount })
        } else if (chain.vm === 'ton') {
          const w = wallets.forVm('ton')
          if (!w.account) throw new Error('Connect your TON wallet first.')
          setStatus({ state: 'pending', message: 'Confirm the transaction in your TON wallet…' })
          // TON->Solana bridge deposit: send the real 'DEPO' payload to the lock contract with
          // the Solana recipient encoded, so the relayer detects it and the guest decodes it.
          // Falls back to a bare transfer if no bridge recipient (non-bridge send).
          const messages = bridgeRecipient
            ? [buildDepositMessage({ lockContract: to, solanaRecipient: bridgeRecipient, tonAmount: amount }).message]
            : [{ address: to, amount: tonToNano(amount) }]
          await w.tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages,
          })
          hash = null // TonConnect returns a BOC, not a tx hash.
        } else {
          throw new Error(`Unsupported chain type: ${chain.vm}`)
        }

        setStatus({ state: 'success', hash, message: successMsg })
        toast('success', successMsg, { link: hash ? explorerTxUrl(chain, hash) : undefined })
        onConfirmed?.({ hash })
        return { hash }
      } catch (err) {
        const msg =
          err?.code === 'ACTION_REJECTED' || err?.code === 4001
            ? 'Transaction rejected.'
            : err?.shortMessage || err?.message || 'Transaction failed.'
        setStatus({ state: 'error', message: msg })
        toast('error', msg)
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [wallets, toast],
  )

  return { status, submitting, send, setStatus }
}
