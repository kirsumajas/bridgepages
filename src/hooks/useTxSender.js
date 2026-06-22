import { useCallback, useState } from 'react'

// Shared transaction flow: ensure the wallet is on `chain`, get a signer,
// verify the network, send the built tx, wait for confirmation, and track
// status throughout (consumed by <TxStatus />).
export function useTxSender(wallet) {
  const { chain: walletChain, switchTo, getSigner } = wallet
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const send = useCallback(
    async ({ chain, build, onConfirmed, successMsg }) => {
      setSubmitting(true)
      setStatus(null)
      try {
        if (walletChain?.chainId !== chain.chainId) {
          setStatus({ state: 'pending', message: `Switch your wallet to ${chain.name}…` })
          await switchTo(chain)
        }

        setStatus({ state: 'pending', message: 'Confirm the transaction in your wallet…' })
        const signer = await getSigner()

        const net = await signer.provider.getNetwork()
        if (Number(net.chainId) !== chain.chainId) {
          throw new Error(`Wallet is on the wrong network. Please switch to ${chain.name}.`)
        }

        const tx = await build(signer)
        setStatus({
          state: 'pending',
          hash: tx.hash,
          message: 'Transaction sent. Waiting for confirmation…',
        })
        await tx.wait()

        setStatus({ state: 'success', hash: tx.hash, message: successMsg })
        onConfirmed?.(tx)
        return tx
      } catch (err) {
        const msg =
          err?.code === 'ACTION_REJECTED' || err?.code === 4001
            ? 'Transaction rejected.'
            : err?.shortMessage || err?.message || 'Transaction failed.'
        setStatus({ state: 'error', message: msg })
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [walletChain, switchTo, getSigner],
  )

  return { status, submitting, send, setStatus }
}
