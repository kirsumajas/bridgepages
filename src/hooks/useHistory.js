import { useEffect, useState } from 'react'
import { loadHistory, HISTORY_EVENT } from '../lib/history.js'

export function useHistory() {
  const [history, setHistory] = useState(loadHistory)

  useEffect(() => {
    const update = () => setHistory(loadHistory())
    window.addEventListener(HISTORY_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(HISTORY_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return history
}
