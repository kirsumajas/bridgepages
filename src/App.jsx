import { useState } from 'react'
import { useWallets } from './hooks/useWallets.jsx'
import { useTheme } from './hooks/useTheme.js'
import { getChainById } from './config/chains.js'
import Header from './components/Header.jsx'
import BridgeCard from './components/BridgeCard.jsx'
import BridgeBanner from './components/BridgeBanner.jsx'
import Explorer from './components/Explorer.jsx'
import Earn from './components/Earn.jsx'
import Wallets from './components/Wallets.jsx'
import Guard from './components/Guard.jsx'
import TonPulse from './components/TonPulse.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import PrivacyModal from './components/PrivacyModal.jsx'
import PulseBackground from './components/PulseBackground.jsx'

export default function App() {
  const wallets = useWallets()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState('bridge')
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const evm = wallets.evm
  const onKnownChain = Boolean(getChainById(evm.chainId))

  return (
    <div className="app">
      <div className="bg-glow" />
      {tab === 'bridge' && <PulseBackground theme={theme} />}
      <Header theme={theme} onToggleTheme={toggleTheme} active={tab} onChange={setTab} />

      <main
        className={`main ${
          tab === 'explorer' || tab === 'guard' || tab === 'pulse'
            ? 'main-explorer'
            : tab !== 'bridge'
              ? 'main-wide'
              : ''
        }`}
      >
        {evm.account && !onKnownChain && (
          <div className="banner banner-warn">
            Your EVM wallet is on an unsupported network. Pick an EVM route and we'll prompt
            you to switch.
          </div>
        )}

        {tab === 'bridge' && (
          <>
            <BridgeBanner />
            <BridgeCard />
          </>
        )}
        {tab === 'explorer' && <Explorer />}
        {tab === 'earn' && <Earn />}
        {tab === 'wallet' && <Wallets />}
        {tab === 'guard' && <Guard />}
        {tab === 'pulse' && <TonPulse />}
      </main>

      <footer className="footer">
        <span>Built with React, Vite &amp; ethers · Testnet demo</span>
        <button className="footer-link" onClick={() => setPrivacyOpen(true)}>
          Privacy &amp; Cookies
        </button>
      </footer>

      <CookieConsent onOpenPrivacy={() => setPrivacyOpen(true)} />
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </div>
  )
}
