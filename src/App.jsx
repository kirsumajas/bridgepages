import { useState } from 'react'
import { useWallets } from './hooks/useWallets.jsx'
import { useTheme } from './hooks/useTheme.js'
import { getChainById } from './config/chains.js'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import BridgeCard from './components/BridgeCard.jsx'
import BridgeBanner from './components/BridgeBanner.jsx'
import Explorer from './components/Explorer.jsx'
import Earn from './components/Earn.jsx'
import Wallets from './components/Wallets.jsx'

export default function App() {
  const wallets = useWallets()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState('bridge')

  const evm = wallets.evm
  const onKnownChain = Boolean(getChainById(evm.chainId))

  return (
    <div className="app">
      <div className="bg-glow" />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Tabs active={tab} onChange={setTab} />

      <main
        className={`main ${
          tab === 'explorer' ? 'main-explorer' : tab !== 'bridge' ? 'main-wide' : ''
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
      </main>

      <footer className="footer">Built with React, Vite &amp; ethers · Testnet demo</footer>
    </div>
  )
}
