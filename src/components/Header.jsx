import ConnectButton from './ConnectButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ wallet, theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-logo">🌉</span>
        <div>
          <div className="brand-name">Crosschain Bridge</div>
          <div className="brand-sub">Testnet</div>
        </div>
      </div>
      <div className="header-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <ConnectButton wallet={wallet} />
      </div>
    </header>
  )
}
