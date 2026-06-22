import { useState } from 'react'
import { useWallet } from './hooks/useWallet.js'
import { useTheme } from './hooks/useTheme.js'
import { getChainById } from './config/chains.js'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import BridgeCard from './components/BridgeCard.jsx'
import BridgeBanner from './components/BridgeBanner.jsx'
import Explorer from './components/Explorer.jsx'
import Earn from './components/Earn.jsx'

export default function App() {
  const wallet = useWallet()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState('bridge')
  const onKnownChain = Boolean(getChainById(wallet.chainId))

  return (
    <div className="app">
      <div className="bg-glow" />
      <Header wallet={wallet} theme={theme} onToggleTheme={toggleTheme} />
      <Tabs active={tab} onChange={setTab} />

      <main className={`main ${tab === 'explorer' || tab === 'earn' ? 'main-wide' : ''}`}>
        {wallet.account && !onKnownChain && (
          <div className="banner banner-warn">
            Your wallet is on an unsupported network. Pick a route and we'll prompt you to
            switch.
          </div>
        )}
        {wallet.error && <div className="banner banner-error">{wallet.error}</div>}

        {tab === 'bridge' && (
          <>
            <BridgeBanner />
            <BridgeCard wallet={wallet} />
          </>
        )}
        {tab === 'explorer' && <Explorer />}
        {tab === 'earn' && <Earn wallet={wallet} />}
      </main>

      <footer className="footer">
        Built with React, Vite &amp; ethers · Testnet demo
      </footer>
    </div>
  )
}
