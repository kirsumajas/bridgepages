import { useCallback, useEffect, useState } from 'react'
import { getPhantom } from '../lib/solana.js'

// Connection state for the injected Phantom (Solana) wallet.
export function useSolanaWallet() {
  const [account, setAccount] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const installed = Boolean(getPhantom())

  const connect = useCallback(async () => {
    setError(null)
    const p = getPhantom()
    if (!p) {
      setError('Phantom wallet is not installed.')
      return
    }
    try {
      setConnecting(true)
      const res = await p.connect()
      setAccount(res.publicKey.toString())
    } catch (e) {
      if (e?.code !== 4001) setError(e?.message || 'Failed to connect Phantom')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await getPhantom()?.disconnect()
    } catch {
      /* ignore */
    }
    setAccount(null)
  }, [])

  // Do NOT auto-connect on load — Phantom should only be invoked when the user
  // explicitly clicks Connect. We just track account/disconnect changes so state
  // stays in sync once a connection exists.
  useEffect(() => {
    const p = getPhantom()
    if (!p) return
    const onAccountChanged = (pk) => setAccount(pk ? pk.toString() : null)
    p.on?.('accountChanged', onAccountChanged)
    p.on?.('disconnect', () => setAccount(null))
    return () => p.off?.('accountChanged', onAccountChanged)
  }, [])

  return { vm: 'solana', installed, account, connecting, error, connect, disconnect }
}
