import { useEffect, useRef, useState } from 'react'
import { fetchRecentTxs, fetchMcSeqno, hashToInt, isMasterchain } from '../lib/tonPulse.js'
import { fetchSolTps, fetchSolSlot } from '../lib/solanaPulse.js'

// Polls the chosen network and exposes a drain-queue of fresh transaction
// "events" plus live stats. The canvas reads queueRef each animation frame.
export function usePulse(network) {
  const queueRef = useRef([])
  const seenRef = useRef(new Set())
  const arrivalsRef = useRef([])
  const [stats, setStats] = useState({ tps: 0, height: null, total: 0, connected: false })

  useEffect(() => {
    let cancelled = false
    let total = 0

    // Reset on network switch.
    queueRef.current = []
    seenRef.current = new Set()
    arrivalsRef.current = []
    setStats({ tps: 0, height: null, total: 0, connected: false })

    const poll = async () => {
      try {
        const now = Date.now()

        if (network === 'solana') {
          // Real TPS (incl. votes) drives a proportional, bounded flare rate.
          const tps = await fetchSolTps()
          const n = Math.min(90, Math.max(10, Math.round(tps / 40)))
          const fresh = []
          for (let i = 0; i < n; i++) {
            fresh.push({
              hashInt: (Math.random() * 4294967296) >>> 0,
              alt: Math.random() < 0.5,
              t: now,
            })
          }
          queueRef.current.push(...fresh)
          total += n
          if (!cancelled) setStats((s) => ({ ...s, tps: Math.round(tps), total, connected: true }))
          return
        }

        // TON: real per-transaction feed, deduped by hash.
        const txs = await fetchRecentTxs(80)
        const fresh = []
        for (const t of txs) {
          if (!t.hash || seenRef.current.has(t.hash)) continue
          seenRef.current.add(t.hash)
          fresh.push({ hashInt: hashToInt(t.hash), alt: isMasterchain(t.account), t: now })
        }
        if (seenRef.current.size > 5000) {
          seenRef.current = new Set([...seenRef.current].slice(-2500))
        }
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

    const pollHeight = async () => {
      try {
        const h = network === 'solana' ? await fetchSolSlot() : await fetchMcSeqno()
        if (!cancelled) setStats((s) => ({ ...s, height: h }))
      } catch {
        /* ignore */
      }
    }

    poll()
    pollHeight()
    const id = setInterval(poll, 3000)
    const sid = setInterval(pollHeight, 6000)
    return () => {
      cancelled = true
      clearInterval(id)
      clearInterval(sid)
    }
  }, [network])

  return { queueRef, stats }
}
