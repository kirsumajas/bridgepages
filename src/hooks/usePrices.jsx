import { createContext, useContext, useEffect, useState } from 'react'
import { allCoingeckoIds, fetchPrices } from '../lib/prices.js'

const PricesContext = createContext({ prices: {}, loading: true, error: null })

// Fetches all supported-asset prices from CoinGecko once on mount, then every
// 60s (free-tier rate limits are tight), and shares them across the app.
export function PricesProvider({ children }) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const ids = allCoingeckoIds()

    const load = async () => {
      try {
        const data = await fetchPrices(ids)
        if (!cancelled) {
          setPrices(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load prices')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 60000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <PricesContext.Provider value={{ prices, loading, error }}>
      {children}
    </PricesContext.Provider>
  )
}

export const usePrices = () => useContext(PricesContext)
