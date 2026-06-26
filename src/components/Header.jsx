import ConnectButton from './ConnectButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Tabs from './Tabs.jsx'
import { useHideOnScroll } from '../hooks/useHideOnScroll.js'

export default function Header({ theme, onToggleTheme, active, onChange }) {
  const { hidden, scrolled } = useHideOnScroll()

  return (
    <div
      className={`header-bar${hidden ? ' header-hidden' : ''}${scrolled ? ' header-scrolled' : ''}`}
    >
      <header className="header">
        <div className="brand">
          <span className="brand-logo">🌉</span>
          <div>
            <div className="brand-name">Crosschain Bridge</div>
            <div className="brand-sub">Testnet</div>
          </div>
        </div>
        <Tabs active={active} onChange={onChange} />
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <ConnectButton />
        </div>
      </header>
    </div>
  )
}
