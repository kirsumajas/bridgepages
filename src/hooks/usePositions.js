import { useEffect, useState } from 'react'
import { loadPositions, POSITIONS_EVENT } from '../lib/positions.js'

export function usePositions() {
  const [positions, setPositions] = useState(loadPositions)

  useEffect(() => {
    const update = () => setPositions(loadPositions())
    window.addEventListener(POSITIONS_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(POSITIONS_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return positions
}

// A clock that re-renders every `ms` so simulated fee accrual ticks live.
export function useTicker(ms = 1000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}
