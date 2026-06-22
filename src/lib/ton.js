import { CHAINS } from '../config/chains.js'

// Balance via the toncenter HTTP API. Returns TON (converted from nanotons).
export async function getTonBalance(address) {
  const base = CHAINS.tonTestnet.rpcUrls[0]
  const res = await fetch(`${base}/getAddressBalance?address=${encodeURIComponent(address)}`)
  if (!res.ok) throw new Error(`TON balance ${res.status}`)
  const data = await res.json()
  return Number(data.result) / 1e9
}

// Accepts a user-friendly address (48-char base64url) or a raw "wc:hex" address.
export function isTonAddress(value) {
  if (!value) return false
  if (/^[A-Za-z0-9_-]{48}$/.test(value)) return true
  if (/^-?\d+:[A-Fa-f0-9]{64}$/.test(value)) return true
  return false
}

export const tonToNano = (amount) =>
  BigInt(Math.round(Number(amount) * 1e9)).toString()

// Latest masterchain block seqno (used as TON's "block height").
export async function getTonSeqno() {
  const base = CHAINS.tonTestnet.rpcUrls[0]
  const res = await fetch(`${base}/getMasterchainInfo`)
  if (!res.ok) throw new Error(`TON info ${res.status}`)
  const data = await res.json()
  return data.result?.last?.seqno
}
