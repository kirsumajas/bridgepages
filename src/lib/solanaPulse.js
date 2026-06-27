import { Connection } from '@solana/web3.js'

// Live Solana activity for the Pulse board.
//
// The public api.mainnet-beta endpoint blocks heavy methods like
// getSignaturesForAddress from browsers, so instead we use the lightweight,
// widely-allowed getRecentPerformanceSamples (real network throughput) via a
// CORS-friendly PublicNode RPC. The board's flare rate is driven by this real
// TPS; exact cell positions are illustrative.
const RPC = 'https://solana-rpc.publicnode.com'

let _conn
const conn = () => {
  if (!_conn) _conn = new Connection(RPC, 'confirmed')
  return _conn
}

// Real transactions-per-second over the most recent sample window.
export async function fetchSolTps() {
  const samples = await conn().getRecentPerformanceSamples(1)
  if (!samples || !samples.length) return 0
  const { numTransactions, samplePeriodSecs } = samples[0]
  return samplePeriodSecs ? numTransactions / samplePeriodSecs : 0
}

export const fetchSolSlot = () => conn().getSlot()
