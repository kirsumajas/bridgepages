import { useEffect, useState } from 'react'

const REPO = 'https://github.com/kirsumajas/bridgepages'

const FEATURES = [
  { tab: 'bridge', icon: '🌉', title: 'Bridge', desc: 'Move assets across EVM, Solana & TON testnets.' },
  { tab: 'explorer', icon: '🔎', title: 'Explorer', desc: 'Live prices, charts, network state & activity.' },
  { tab: 'earn', icon: '💰', title: 'Earn', desc: 'Provide liquidity and earn a share of fees.' },
  { tab: 'wallet', icon: '👛', title: 'Wallet', desc: 'See all connected wallets and balances.' },
  { tab: 'guard', icon: '🛡️', title: 'Guard', desc: 'Spectral + ML wallet risk analysis.' },
  { tab: 'pulse', icon: '📡', title: 'Pulse', desc: 'Watch live TON transactions light up.' },
]

const STATS = [
  { value: '3', label: 'Ecosystems' },
  { value: '7', label: 'Testnets' },
  { value: 'Live', label: 'Market data' },
  { value: '100%', label: 'Client-side' },
]

const POSTS = [
  {
    id: 'intro',
    tag: 'Product',
    date: 'Jun 22, 2026',
    title: 'Introducing Crosschain Bridge',
    excerpt:
      'A single, minimal front-end to move testnet assets across EVM, Solana and TON — with live prices, analytics and a few experiments.',
    body: [
      'Crosschain Bridge started as a simple question: what would a clean, modern bridge UI feel like if it treated EVM, Solana and TON as first-class citizens from day one?',
      'The result is a fully client-side app — no backend, no tracking — that connects real wallets, reads live balances from each network, and walks a transfer through a deposit → proof → release lifecycle.',
      'Everything you see here runs in your browser and deploys as static files. It is a testnet demo built to explore ideas, not a production bridge.',
    ],
  },
  {
    id: 'multichain',
    tag: 'Engineering',
    date: 'Jun 24, 2026',
    title: 'One UI, three virtual machines',
    excerpt:
      'EVM, Solana and TON could not be more different under the hood. Here is how the wallet, balance and transaction layers stay unified.',
    body: [
      'Each chain declares a "vm" tag — evm, solana or ton — and the wallet, balance and transaction layers dispatch on it. MetaMask, Phantom and TonConnect all live behind one interface.',
      'That means a component never cares which ecosystem it is talking to: it asks for "the wallet for this chain" and gets a consistent shape back — account, connect, balance, send.',
      'The hardest part was honesty: keeping the EVM path real while clearly marking where Solana and TON flows still need real-wallet testing.',
    ],
  },
  {
    id: 'guard',
    tag: 'Security',
    date: 'Jun 25, 2026',
    title: 'Bridge Guard: reading a wallet at a glance',
    excerpt:
      'A spectral signature, a risk score and a counterparty breakdown — a prototype for understanding an address before you interact.',
    body: [
      'Bridge Guard renders a wallet as a "spectral signature" — a radar across activity, age, liquidity, contract exposure, peer risk and anomaly.',
      'In this prototype the analysis is deterministically simulated from the address, so it is stable and demonstrable. The UI is built to drop in real on-chain heuristics — and later real models — without changing.',
      'The goal is a glanceable read on risk: green, amber or red, with the reasoning shown rather than hidden.',
    ],
  },
  {
    id: 'pulse',
    tag: 'Design',
    date: 'Jun 26, 2026',
    title: 'Visualizing TON as a wall of light',
    excerpt:
      'Pulse turns real mainnet transactions into a living LED board — matrix, radial and hex-shard views of the chain breathing.',
    body: [
      'Pulse polls toncenter for real mainnet transactions and maps each one to a cell that flares and fades. The board shimmers as blocks land.',
      'Three modes reframe the same data: an LED matrix, a radial sonar, and a hex-shard map. Masterchain transactions glow gold, basechain blue.',
      'It is the most playful corner of the app — proof that raw chain data can feel alive with the right rendering.',
    ],
  },
]

const MILESTONES = [
  { when: 'Q2 2026', status: 'done', title: 'Testnet launch', desc: 'Multichain swap interface across EVM, Solana and TON with live data.' },
  { when: 'Q3 2026', status: 'active', title: 'ZK proof layer', desc: 'Trustless verification of cross-chain messages and transfers.' },
  { when: 'Q4 2026', status: 'planned', title: 'Mainnet beta', desc: 'Audited contracts and the first production swap routes.' },
  { when: 'Q1 2027', status: 'planned', title: 'Liquidity network', desc: 'Incentivized liquidity program with on-chain fee sharing.' },
  { when: 'Q2 2027', status: 'planned', title: 'SDK & partners', desc: 'Embeddable swap widget and deep partner integrations.' },
]

const STATUS_LABEL = { done: 'Shipped', active: 'In progress', planned: 'Planned' }

const PARTNERS = ['Nimbus Capital', 'ChainForge', 'Helix Labs', 'Aether Ventures', 'Quanta', 'Northwind']

const ADVISERS = [
  { name: 'Lena Park', role: 'Cryptography Adviser' },
  { name: 'Marco Silva', role: 'DeFi Strategy' },
  { name: 'Aisha Bello', role: 'Security & Audits' },
  { name: 'Yuki Tanaka', role: 'Tokenomics' },
]

const POSITIONS = [
  { role: 'Senior Smart Contract Engineer', meta: 'Remote · Full-time', desc: 'Design and ship cross-chain contracts in Solidity and Rust.' },
  { role: 'Frontend Engineer (React)', meta: 'Remote · Full-time', desc: 'Build the dApp experience and wallet integrations.' },
  { role: 'Protocol Researcher', meta: 'Remote · Contract', desc: 'Advance our ZK and interoperability research.' },
  { role: 'Developer Relations', meta: 'Remote · Full-time', desc: 'Own docs, the SDK and our developer community.' },
]

const TEAM = [
  { name: 'Alex Rivera', role: 'Founder & CEO' },
  { name: 'Sofia Kim', role: 'CTO' },
  { name: 'Daniel Okafor', role: 'Head of Protocol' },
  { name: 'Mira Petrova', role: 'Head of Design' },
]

const VISION =
  "We believe the multichain world should feel like a single network. MEPO's mission is to make moving value between chains as simple, trustless and verifiable as sending a message — so builders and users never have to think about which chain they're on."

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

function PostModal({ post, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="post-meta">
          <span className="post-tag">{post.tag}</span>
          <span className="post-date">{post.date}</span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        <div className="post-body">
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

function SwapPreview({ onNavigate }) {
  return (
    <div className="card swap-preview">
      <div className="sp-title">Swap assets</div>
      <div className="sp-sub">
        <span className="sp-pill">2 USDT ▾</span>
        <span>Includes 0.52% fee</span>
      </div>

      <div className="sp-route">
        <div className="sp-chain">
          <span className="sp-coin eth">Ξ</span> Ethereum
        </div>
        <span className="sp-swap">⇅</span>
        <div className="sp-chain">
          <span className="sp-coin sol">◎</span> Solana
        </div>
      </div>

      <span className="sp-label">Asset</span>
      <div className="sp-field">
        ETH (native) <span className="sp-caret">▾</span>
      </div>

      <div className="sp-amounthead">
        <span>Amount</span>
        <span>Balance:---</span>
      </div>
      <div className="sp-field">
        0.0 <span className="sp-unit">ETH</span>
      </div>

      <span className="sp-label">Recipient on Solana</span>
      <div className="sp-field muted">Solana address</div>

      <button className="sp-cta" onClick={() => onNavigate('bridge')}>
        Connect Wallet
      </button>
    </div>
  )
}

export default function Home({ onNavigate }) {
  const [post, setPost] = useState(null)

  return (
    <div className="home">
      <section className="hero-split">
        <div className="hero-left">
          <span className="hero-badge">EVM · Solana · TON</span>
          <h1 className="hero-headline">Swap Crypto</h1>
          <p className="hero-blurb">
            Uniting the multichain ecosystem through a trustless, <strong>ZK-powered</strong>{' '}
            interoperability protocol—where verifiable security meets seamless asset mobility
            between every major network.
          </p>
          <div className="home-ctas">
            <button className="btn btn-primary" onClick={() => onNavigate('bridge')}>
              Launch app →
            </button>
            <a className="btn btn-ghost" href={REPO} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>
        <div className="hero-right">
          <SwapPreview onNavigate={onNavigate} />
        </div>
      </section>

      <div className="home-stats">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="home-stat-value">{s.value}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="home-section-title">Everything in one place</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <button key={f.tab} className="feature-card" onClick={() => onNavigate(f.tab)}>
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-title">{f.title}</span>
              <span className="feature-desc">{f.desc}</span>
              <span className="feature-go">Open →</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">From the blog</h2>
        <div className="blog-grid">
          {POSTS.map((p) => (
            <button key={p.id} className="blog-card" onClick={() => setPost(p)}>
              <div className="post-meta">
                <span className="post-tag">{p.tag}</span>
                <span className="post-date">{p.date}</span>
              </div>
              <div className="blog-title">{p.title}</div>
              <div className="blog-excerpt">{p.excerpt}</div>
              <span className="feature-go">Read →</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Milestones</h2>
        <div className="timeline">
          {MILESTONES.map((m) => (
            <div className={`tl-item tl-${m.status}`} key={m.when}>
              <span className="tl-dot" />
              <div className="tl-content">
                <div className="tl-top">
                  <span className="tl-when">{m.when}</span>
                  <span className="tl-status">{STATUS_LABEL[m.status]}</span>
                </div>
                <div className="tl-title">{m.title}</div>
                <div className="tl-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Partners &amp; advisers</h2>
        <div className="logo-grid">
          {PARTNERS.map((p) => (
            <div className="logo-item" key={p}>
              <span className="logo-monogram">{initials(p)}</span>
              <span className="logo-name">{p}</span>
            </div>
          ))}
        </div>
        <div className="people-grid">
          {ADVISERS.map((a) => (
            <div className="person" key={a.name}>
              <span className="person-avatar">{initials(a.name)}</span>
              <div>
                <div className="person-name">{a.name}</div>
                <div className="person-role">{a.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Open positions</h2>
        <div className="positions">
          {POSITIONS.map((p) => (
            <div className="position-row" key={p.role}>
              <div className="position-info">
                <div className="position-role">{p.role}</div>
                <div className="position-desc">{p.desc}</div>
              </div>
              <span className="position-meta">{p.meta}</span>
              <a
                className="btn btn-ghost btn-sm"
                href={`mailto:careers@mepo.app?subject=${encodeURIComponent(p.role)}`}
              >
                Apply →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Our team &amp; vision</h2>
        <p className="vision">{VISION}</p>
        <div className="people-grid">
          {TEAM.map((t) => (
            <div className="person" key={t.name}>
              <span className="person-avatar">{initials(t.name)}</span>
              <div>
                <div className="person-name">{t.name}</div>
                <div className="person-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="disclaimer home-disclaimer">
        Testnet demo for demonstration only. Team, partners, roadmap and roles shown are
        illustrative placeholders. Not financial, investment, or security advice.
      </p>

      {post && <PostModal post={post} onClose={() => setPost(null)} />}
    </div>
  )
}
