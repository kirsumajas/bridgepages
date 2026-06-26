// Bridge Guard — SIMULATED wallet analysis for the prototype.
//
// Everything here is deterministic mock data seeded from the address string, so
// the same address always produces the same "analysis" (which makes the demo
// feel real). There is no real ML, spectral graph analysis, or on-chain data
// behind these numbers — see the Guard tab disclaimer.

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Small deterministic PRNG.
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CATEGORIES = [
  { label: 'Centralized exchange', lo: 4, hi: 22, weight: 4 },
  { label: 'DeFi protocol', lo: 8, hi: 38, weight: 4 },
  { label: 'NFT marketplace', lo: 10, hi: 42, weight: 3 },
  { label: 'Bridge contract', lo: 6, hi: 30, weight: 3 },
  { label: 'Unknown wallet', lo: 28, hi: 68, weight: 4 },
  { label: 'New / low-history wallet', lo: 40, hi: 75, weight: 2 },
  { label: 'Mixer / tumbler', lo: 72, hi: 96, weight: 1 },
  { label: 'Flagged address', lo: 82, hi: 99, weight: 1 },
]

function pickCategory(rng) {
  const total = CATEGORIES.reduce((s, c) => s + c.weight, 0)
  let r = rng() * total
  for (const c of CATEGORIES) {
    r -= c.weight
    if (r <= 0) return c
  }
  return CATEGORIES[0]
}

function fakeAddress(rng) {
  const hex = '0123456789abcdef'
  let s = '0x'
  for (let i = 0; i < 40; i++) s += hex[Math.floor(rng() * 16)]
  return s
}

export function analyzeAddress(input) {
  const addr = input.trim()
  const rng = mulberry32(hashStr(addr.toLowerCase()))
  const rint = (max) => Math.floor(rng() * max)
  const rrange = (a, b) => a + rng() * (b - a)

  const isContract = rng() < 0.32
  const ageDays = rint(1500) + 5
  const txCount = rint(isContract ? 60000 : 4000) + 1
  const balance = rrange(0, 60)
  const lastActiveDays = rint(Math.min(ageDays, 90))
  const counterpartyCount = rint(isContract ? 2500 : 400) + 2

  // Spectral axes (0–100).
  const activity = clamp((Math.log10(txCount + 1) / Math.log10(60000)) * 100)
  const age = clamp((ageDays / 1500) * 100)
  const liquidity = clamp((Math.log10(balance + 1) / Math.log10(61)) * 100)
  const contractExposure = isContract ? rrange(55, 95) : rrange(5, 60)
  const counterpartyRisk = rrange(2, 100)
  const anomaly = rrange(0, 100)

  const axes = [
    { label: 'Activity', value: Math.round(activity) },
    { label: 'Age', value: Math.round(age) },
    { label: 'Liquidity', value: Math.round(liquidity) },
    { label: 'Contract exp.', value: Math.round(contractExposure) },
    { label: 'Peer risk', value: Math.round(counterpartyRisk) },
    { label: 'Anomaly', value: Math.round(anomaly) },
  ]

  const riskScore = clamp(
    Math.round(
      0.36 * anomaly +
        0.3 * counterpartyRisk +
        0.18 * contractExposure +
        0.12 * (100 - age) -
        0.12 * activity +
        12,
    ),
  )
  const verdict =
    riskScore < 34
      ? { key: 'low', label: 'Low risk' }
      : riskScore < 67
        ? { key: 'medium', label: 'Caution' }
        : { key: 'high', label: 'High risk' }

  // ML-style classification labels with confidences.
  const labels = []
  labels.push(
    isContract
      ? { text: 'Smart contract', conf: 90 + rint(9) }
      : { text: 'Personal wallet (EOA)', conf: 78 + rint(20) },
  )
  if (activity > 65) labels.push({ text: 'Active trader', conf: 70 + rint(25) })
  if (liquidity > 60) labels.push({ text: 'High liquidity', conf: 65 + rint(30) })
  if (anomaly > 70) labels.push({ text: 'Anomalous tx pattern', conf: 60 + rint(35) })
  else if (counterpartyRisk < 35) labels.push({ text: 'Clean interaction graph', conf: 72 + rint(24) })
  if (counterpartyRisk > 72) labels.push({ text: 'Risky counterparties', conf: 64 + rint(32) })

  // Transaction-frequency "spectrum" (FFT-style bars), deterministic.
  const spectrum = Array.from({ length: 28 }, () => 0.12 + rng() * 0.88)

  // Counterparties it interacts with.
  const counterparties = Array.from({ length: 6 }, () => {
    const c = pickCategory(rng)
    return {
      address: fakeAddress(rng),
      label: c.label,
      risk: Math.round(rrange(c.lo, c.hi)),
      interactions: rint(250) + 1,
    }
  }).sort((a, b) => b.risk - a.risk)

  return {
    address: addr,
    type: isContract ? 'Contract' : 'EOA',
    riskScore,
    verdict,
    axes,
    spectrum,
    labels: labels.slice(0, 4),
    counterparties,
    metrics: {
      balance: balance.toFixed(3),
      txCount,
      ageDays,
      lastActiveDays,
      counterpartyCount,
    },
  }
}
