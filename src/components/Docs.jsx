const SECTIONS = [
  {
    title: 'What is MEPO?',
    body: [
      'MEPO is a minimal, fully client-side front-end for moving assets across chains. It connects real wallets, reads live balances, and walks a transfer through a deposit → proof → release lifecycle.',
      'This is a testnet demo. The front-end is fully client-side and deploys as static files; the TON → Solana route is a real trust-minimized bridge, backed by a live relayer, an SP1 zero-knowledge prover, and a Solana bridge program that releases test USDC.',
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
      'A cross-chain transfer has two parts. First, a deposit is signed on the source chain — this is a real, on-chain testnet transaction. Second, a relayer observes the deposit, a zero-knowledge proof of the deposit is generated, and the asset is released on the destination chain.',
      'TON → Solana is implemented end to end. A live relayer watches the TON lock contract; on each deposit it proves — inside an SP1 zkVM — that the deposit is committed in a TON masterchain block signed by ≥2/3 of validators, wraps that into a Groth16 proof, and a Solana program verifies the proof (a single BN254 pairing) and releases test USDC to your Solana address. The lifecycle panel shows the real stages: detected → proving → released. The other source chains sign a real deposit, but their destination release is not wired in this demo.',
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
    q: 'Does the destination transfer actually complete?',
    a: 'For TON → Solana, yes — a live relayer, an SP1 zero-knowledge proof of TON consensus, and on-chain Groth16 verification release test USDC to your Solana (devnet) address; watch the live status panel on the Bridge tab. For the EVM source chains, the deposit is real but the destination release is not wired in this demo.',
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
