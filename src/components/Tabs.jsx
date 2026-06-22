const TABS = [
  { key: 'bridge', label: 'Bridge', icon: '🌉' },
  { key: 'explorer', label: 'Explorer', icon: '🔎' },
  { key: 'earn', label: 'Earn', icon: '💰' },
  { key: 'wallet', label: 'Wallet', icon: '👛' },
]

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab ${active === tab.key ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
