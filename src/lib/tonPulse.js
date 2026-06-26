// Live TON activity feed for the Pulse visualization.
//
// Uses toncenter's v3 index API on MAINNET — testnet is almost idle, so the
// board would barely light up. This is read-only public data; it visualizes
// real mainnet transactions even though the rest of the app is on testnet.

const BASE = 'https://toncenter.com/api/v3'

export async function fetchRecentTxs(limit = 80) {
  const res = await fetch(`${BASE}/transactions?limit=${limit}&sort=desc`)
  if (!res.ok) throw new Error(`toncenter ${res.status}`)
  const data = await res.json()
  return data.transactions || []
}

export async function fetchMcSeqno() {
  const res = await fetch(`${BASE}/masterchainInfo`)
  if (!res.ok) throw new Error(`toncenter ${res.status}`)
  const data = await res.json()
  return data.last?.seqno ?? null
}

// Stable 32-bit int from a tx hash string (used to map a tx to a cell).
export function hashToInt(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Masterchain txns (workchain -1) are coloured differently from basechain (0).
export const isMasterchain = (account) => typeof account === 'string' && account.startsWith('-1:')
