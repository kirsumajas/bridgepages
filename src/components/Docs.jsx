const SECTIONS = [
  {
    title: 'What is MEPO?',
    body: [
      'MEPO is a minimal, fully client-side front-end for moving assets across chains. It connects real wallets, reads live balances, and walks a transfer through a deposit → proof → release lifecycle.',
      'This is a testnet demo built to explore ideas. There is no backend — everything runs in your browser and deploys as static files.',
    ],
  },
  {
    title: 'Supported networks',
    body: [
      'EVM testnets (Ethereum Sepolia, Polygon Amoy, Arbitrum Sepolia, Optimism Sepolia, BNB testnet), Solana Devnet, and TON Testnet.',
      'Each network is connected through its native wallet: MetaMask for EVM, Phantom for Solana, and TonConnect (Tonkeeper) for TON.',
    ],
  },
  {
    title: 'How bridging works',
    body: [
      'A cross-chain transfer has two parts. First, a deposit is signed on the source chain — this is a real, on-chain testnet transaction. Second, a relayer observes the deposit, a proof is generated, and the asset is released on the destination chain.',
      'This demo implements the source-side deposit end-to-end and visualizes the proof/release lifecycle. The destination release requires bridge contracts and a relayer, which are out of scope for a static front-end.',
    ],
  },
  {
    title: 'Earn',
    body: [
      'Providing liquidity backs transfers on a chain and earns a share of fees. Deposits are real on-chain transactions; the APR, TVL and accrued-fee figures are simulated client-side for the demo.',
    ],
  },
  {
    title: 'Guard',
    body: [
      'Bridge Guard renders a wallet as a spectral signature with a risk score and counterparty breakdown. In this prototype the analysis is deterministically simulated from the address; the UI is built to drop in real on-chain heuristics later.',
    ],
  },
  {
    title: 'Pulse',
    body: [
      'Pulse visualizes live network activity. TON shows real per-transaction flares via toncenter; Solana shows real network throughput via performance samples. Switch networks and rendering modes at the top of the tab.',
    ],
  },
  {
    title: 'Privacy',
    body: [
      'No tracking cookies, no analytics, no backend. Preferences, saved recipients and demo state live in your browser’s local storage and never leave your device. See the Privacy & Cookies link in the footer for details.',
    ],
  },
]

const FAQ = [
  {
    q: 'Is this real money?',
    a: 'No. MEPO runs on testnets. Testnet tokens have no market value — USD figures use mainnet reference prices for display only.',
  },
  {
    q: 'Do you ever see my private keys?',
    a: 'Never. Wallet connections are read-only for addresses and balances, and every transaction requires your explicit approval in your own wallet.',
  },
  {
    q: 'Where do I get testnet funds?',
    a: 'From each network’s public faucet (e.g. a Sepolia or BNB testnet faucet, the Solana devnet airdrop, or a TON testnet faucet).',
  },
  {
    q: 'Why does the destination transfer not complete?',
    a: 'The source deposit is real, but the destination release needs a deployed bridge contract and relayer — intentionally out of scope for this demo.',
  },
]

export default function Docs() {
  return (
    <div className="stack docs">
      <div className="card">
        <h1 className="docs-title">Documentation</h1>
        <p className="docs-intro">Everything you need to understand and use MEPO.</p>
      </div>

      {SECTIONS.map((s) => (
        <div className="card" key={s.title}>
          <h2 className="section-title">{s.title}</h2>
          {s.body.map((p, i) => (
            <p className="docs-p" key={i}>
              {p}
            </p>
          ))}
        </div>
      ))}

      <div className="card">
        <h2 className="section-title">FAQ</h2>
        {FAQ.map((f) => (
          <details className="faq" key={f.q}>
            <summary>{f.q}</summary>
            <p className="docs-p">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="disclaimer">Testnet demo. Not financial, investment, or security advice.</p>
    </div>
  )
}
