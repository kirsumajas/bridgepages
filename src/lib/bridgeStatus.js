import { CHAIN_LIST } from '../config/chains.js'

// Simulated proof-generation duration for a transfer (30–90s). The destination
// release in a real ZK bridge waits on a prover; we mock that timing here.
export const randomProofMs = () => 30000 + Math.floor(Math.random() * 60000)

// Derive the current lifecycle stage of a bridge entry at time `now` (ms).
// Stages: confirming (source) → proving (proof gen) → completed (released).
export function deriveStage(h, now) {
  const elapsed = now - h.ts
  const confirmMs = h.confirmMs ?? 0
  const proofMs = h.proofMs ?? 0

  if (elapsed < confirmMs) {
    return { key: 'confirming', label: 'Confirming', progress: confirmMs ? elapsed / confirmMs : 1 }
  }
  const proofElapsed = elapsed - confirmMs
  if (proofElapsed < proofMs) {
    return {
      key: 'proving',
      label: 'Generating proof',
      progress: proofMs ? proofElapsed / proofMs : 1,
      remainingSec: Math.max(1, Math.ceil((proofMs - proofElapsed) / 1000)),
    }
  }
  return { key: 'completed', label: 'Completed', progress: 1 }
}

// A random demo transfer (no real tx hash) so the lifecycle can be showcased.
export function mockTransfer() {
  const pick = () => CHAIN_LIST[Math.floor(Math.random() * CHAIN_LIST.length)]
  const src = pick()
  let dst = pick()
  while (dst.key === src.key) dst = pick()
  return {
    type: 'bridge',
    hash: null,
    sourceKey: src.key,
    destKey: dst.key,
    asset: src.nativeCurrency.symbol,
    amount: (Math.random() * 2 + 0.01).toFixed(3),
    mock: true,
    ts: Date.now(),
    confirmMs: 6000 + Math.floor(Math.random() * 8000), // 6–14s
    proofMs: randomProofMs(),
  }
}
