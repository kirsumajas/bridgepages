import { useEffect, useRef, useState } from 'react'
import { fetchRecentTxs, fetchMcSeqno, hashToInt, isMasterchain } from '../lib/tonPulse.js'

// Polls toncenter and exposes a drain-queue of fresh transaction "events" plus
// live stats. The canvas reads queueRef each animation frame (so the heavy
// render loop never triggers React re-renders).
export function usePulse() {
  const queueRef = useRef([])
  const seenRef = useRef(new Set())
  const arrivalsRef = useRef([])
  const [stats, setStats] = useState({ tps: 0, seqno: null, total: 0, connected: false })

  useEffect(() => {
    let cancelled = false
    let total = 0

    const poll = async () => {
      try {
        const txs = await fetchRecentTxs(80)
        const now = Date.now()
        const fresh = []
        for (const tx of txs) {
          if (!tx.hash || seenRef.current.has(tx.hash)) continue
          seenRef.current.add(tx.hash)
          fresh.push({ hashInt: hashToInt(tx.hash), master: isMasterchain(tx.account), t: now })
        }
        if (seenRef.current.size > 5000) {
          seenRef.current = new Set([...seenRef.current].slice(-2500))
        }
        // API returns newest-first; replay oldest-first so the board fills naturally.
        fresh.reverse()
        queueRef.current.push(...fresh)
        total += fresh.length

        for (let i = 0; i < fresh.length; i++) arrivalsRef.current.push(now)
        arrivalsRef.current = arrivalsRef.current.filter((t) => now - t < 10000)
        const tps = Math.round((arrivalsRef.current.length / 10) * 10) / 10

        if (!cancelled) setStats((s) => ({ ...s, tps, total, connected: true }))
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, connected: false }))
      }
    }

    const pollSeqno = async () => {
      try {
        const seqno = await fetchMcSeqno()
        if (!cancelled) setStats((s) => ({ ...s, seqno }))
      } catch {
        /* ignore */
      }
    }

    poll()
    pollSeqno()
    const id = setInterval(poll, 3000)
    const sid = setInterval(pollSeqno, 6000)
    return () => {
      cancelled = true
      clearInterval(id)
      clearInterval(sid)
    }
  }, [])

  return { queueRef, stats }
}
