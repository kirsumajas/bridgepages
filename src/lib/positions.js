// Tracks Earn (liquidity) positions in localStorage, keyed by pool + account.
// Deposits/withdrawals are real on-chain transactions, but the position
// bookkeeping and fee accrual are simulated client-side for this demo — there
// is no real LP contract or indexer behind it (see README).

const KEY = 'cb_positions_v1'
const EVENT = 'cb-positions-changed'

const idFor = (poolId, account) => `${poolId}:${account.toLowerCase()}`

export function loadPositions() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function save(map) {
  localStorage.setItem(KEY, JSON.stringify(map))
  window.dispatchEvent(new Event(EVENT))
}

export function getPosition(poolId, account) {
  if (!account) return null
  return loadPositions()[idFor(poolId, account)] || null
}

export function addToPosition(poolId, account, amount, nowMs) {
  const map = loadPositions()
  const id = idFor(poolId, account)
  const existing = map[id]
  map[id] = {
    poolId,
    account: account.toLowerCase(),
    amount: (existing ? Number(existing.amount) : 0) + Number(amount),
    since: existing?.since ?? nowMs,
  }
  save(map)
  return map[id]
}

export function removePosition(poolId, account) {
  const map = loadPositions()
  delete map[idFor(poolId, account)]
  save(map)
}

// Simulated fees earned: principal × APR × elapsed-fraction-of-a-year.
export function accruedFees(position, apr, nowMs) {
  if (!position) return 0
  const elapsedYears = (nowMs - position.since) / (365 * 24 * 60 * 60 * 1000)
  return Number(position.amount) * (apr / 100) * elapsedYears
}

export const POSITIONS_EVENT = EVENT
