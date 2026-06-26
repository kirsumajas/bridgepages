import { useState } from 'react'

const KEY = 'cb_consent'

// Honest notice: this app stores only local preferences (no tracking cookies,
// no analytics). The banner just acknowledges that and links the policy.
export default function CookieConsent({ onOpenPrivacy }) {
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  if (accepted) return null

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    setAccepted(true)
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-text">
        🍪 This app stores only <strong>local preferences</strong> (theme, activity) on your
        device — no tracking cookies, analytics, or ads.{' '}
        <button className="link-btn" onClick={onOpenPrivacy}>
          Privacy &amp; Cookies
        </button>
      </div>
      <button className="btn btn-primary btn-sm" onClick={accept}>
        Got it
      </button>
    </div>
  )
}
