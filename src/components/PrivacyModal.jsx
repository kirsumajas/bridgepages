import { useEffect } from 'react'

export default function PrivacyModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal privacy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="section-title">Privacy &amp; Cookies</h2>

        <div className="privacy-body">
          <p>
            Crosschain Bridge is a static, client-side application. There is no backend
            server that collects your data, no analytics, no advertising, and no tracking
            cookies.
          </p>

          <h3>What we store on your device</h3>
          <p>
            We use your browser&apos;s <strong>local storage</strong> only to remember
            preferences and demo state. This data never leaves your device and you can clear
            it anytime via your browser:
          </p>
          <ul>
            <li>Theme choice (light/dark)</li>
            <li>Your bridge activity log and Earn positions (demo data)</li>
            <li>Dismissed notices and your cookie acknowledgement</li>
          </ul>

          <h3>Cookies</h3>
          <p>
            We do not set tracking or advertising cookies. The items above use local
            storage, not cookies, and are strictly functional.
          </p>

          <h3>Wallets</h3>
          <p>
            Connecting a wallet (MetaMask, Phantom, TonConnect) is read-only for addresses
            and balances. We never receive your private keys or seed phrase, and every
            transaction requires your explicit approval in your own wallet.
          </p>

          <h3>Third-party services</h3>
          <p>
            Your browser calls these services directly to fetch public data. They may
            receive your IP address and request details under their own privacy policies:
          </p>
          <ul>
            <li>CoinGecko — token prices, charts, and market data</li>
            <li>Public blockchain RPC endpoints — balances and transactions</li>
            <li>toncenter — TON network data and the Pulse visualization</li>
          </ul>

          <h3>Disclaimer</h3>
          <p>
            This is a testnet demo for demonstration purposes only. Nothing here is
            financial, investment, or security advice.
          </p>
        </div>

        <button className="btn btn-primary btn-block" onClick={onClose} style={{ marginTop: 8 }}>
          Close
        </button>
      </div>
    </div>
  )
}
