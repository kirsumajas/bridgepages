import { useCallback, useEffect, useState } from 'react'
import { formatUnits } from 'ethers'
import { getReadProvider } from '../lib/wallet.js'
import { getErc20 } from '../lib/erc20.js'

// Reads the balance of `account` for the selected asset on `chain`, using that
// chain's read-only RPC (so it works even when the wallet is on another chain).
// `token` null means the chain's native currency. `refreshKey` forces a re-fetch.
export function useBalance(chain, account, token, refreshKey = 0) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!chain || !account) {
      setBalance(null)
      return
    }
    setLoading(true)
    try {
      const provider = getReadProvider(chain.key)
      if (!token) {
        const raw = await provider.getBalance(account)
        setBalance(formatUnits(raw, chain.nativeCurrency.decimals))
      } else {
        const erc20 = getErc20(token.address, provider)
        const raw = await erc20.balanceOf(account)
        setBalance(formatUnits(raw, token.decimals))
      }
    } catch {
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [chain, account, token])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return { balance, loading, reload: load }
}
