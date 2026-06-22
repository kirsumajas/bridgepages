import { useCallback, useEffect, useState } from 'react'
import {
  hasMetaMask,
  getBrowserProvider,
  requestAccounts,
  switchChain as switchChainRequest,
} from '../lib/wallet.js'
import { getChainById } from '../config/chains.js'

export function useWallet() {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  const installed = hasMetaMask()

  const refreshChain = useCallback(async () => {
    if (!installed) return
    const hex = await window.ethereum.request({ method: 'eth_chainId' })
    setChainId(Number(hex))
  }, [installed])

  const connect = useCallback(async () => {
    setError(null)
    if (!installed) {
      setError('MetaMask (or another injected wallet) is not installed.')
      return
    }
    try {
      setConnecting(true)
      const accounts = await requestAccounts()
      setAccount(accounts[0] ?? null)
      await refreshChain()
    } catch (err) {
      setError(err?.message ?? 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [installed, refreshChain])

  const disconnect = useCallback(() => {
    setAccount(null)
    setError(null)
  }, [])

  const switchTo = useCallback(async (chain) => {
    setError(null)
    try {
      await switchChainRequest(chain)
    } catch (err) {
      if (err?.code !== 4001) {
        setError(err?.message ?? 'Failed to switch chain')
      }
    }
  }, [])

  const getSigner = useCallback(async () => {
    const provider = getBrowserProvider()
    return provider.getSigner()
  }, [])

  // Reconnect silently if the wallet already authorized this site, and wire up
  // account / chain change listeners.
  useEffect(() => {
    if (!installed) return
    let cancelled = false

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (cancelled) return
        if (accounts?.length) {
          setAccount(accounts[0])
          refreshChain()
        }
      })
      .catch(() => {})

    const onAccountsChanged = (accounts) => {
      setAccount(accounts?.[0] ?? null)
    }
    const onChainChanged = (hex) => setChainId(Number(hex))

    window.ethereum.on('accountsChanged', onAccountsChanged)
    window.ethereum.on('chainChanged', onChainChanged)

    return () => {
      cancelled = true
      window.ethereum.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener('chainChanged', onChainChanged)
    }
  }, [installed, refreshChain])

  return {
    installed,
    account,
    chainId,
    chain: getChainById(chainId),
    connecting,
    error,
    connect,
    disconnect,
    switchTo,
    getSigner,
  }
}
