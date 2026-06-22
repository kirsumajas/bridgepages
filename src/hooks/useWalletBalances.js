import { useEffect, useMemo, useState } from 'react'
import { CHAIN_LIST } from '../config/chains.js'
import { getNativeBalance } from '../lib/balances.js'
import { useWallets } from './useWallets.jsx'

// Fetches the native balance of every chain whose wallet is currently
// connected. Returns the {chain, account} pairs and a { chainKey: number|null }
// balance map. `refreshKey` forces a re-fetch.
export function useWalletBalances(refreshKey = 0) {
  const wallets = useWallets()
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(false)

  const pairs = useMemo(() => {
    const out = []
    CHAIN_LIST.forEach((chain) => {
      const w = wallets.forChain(chain)
      if (w?.account) out.push({ chain, account: w.account })
    })
    return out
  }, [wallets])

  // Stable dependency signature so the effect only re-runs when the set of
  // (chain, account) pairs actually changes.
  const sig = pairs.map((p) => `${p.chain.key}:${p.account}`).join('|')

  useEffect(() => {
    let cancelled = false
    if (!pairs.length) {
      setBalances({})
      return
    }
    setLoading(true)
    Promise.all(
      pairs.map(async (p) => {
        try {
          return [p.chain.key, await getNativeBalance(p.chain, p.account)]
        } catch {
          return [p.chain.key, null]
        }
      }),
    ).then((entries) => {
      if (!cancelled) {
        setBalances(Object.fromEntries(entries))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, refreshKey])

  return { pairs, balances, loading }
}
