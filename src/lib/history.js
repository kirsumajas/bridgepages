// Records bridge transfers made through this app in localStorage so the
// Explorer tab can show them. (A production app would read these from a bridge
// indexer/subgraph instead.)

const KEY = 'cb_history_v1'
const EVENT = 'cb-history-changed'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function addHistory(entry) {
  const list = loadHistory()
  list.unshift(entry)
  const trimmed = list.slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
  window.dispatchEvent(new Event(EVENT))
  return trimmed
}

export function clearHistory() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}

export const HISTORY_EVENT = EVENT
