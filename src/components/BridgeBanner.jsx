import { useState } from 'react'

const KEY = 'cb_bridge_banner_dismissed'

// Small dismissible notice on the Bridge tab. Stays dismissed across reloads.
export default function BridgeBanner() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  if (hidden) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  return (
    <div className="info-banner">
      <span className="info-banner-icon">💡</span>
      <span className="info-banner-text">
        Testnet demo — you'll need test funds first. Grab some from a{' '}
        <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer">
          faucet
        </a>{' '}
        before bridging.
      </span>
      <button className="info-banner-close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
