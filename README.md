# MEPO — Crosschain Swap

A minimal, fully client-side front-end for moving assets across chains — **EVM,
Solana and TON** — built with **React + Vite**. It connects real wallets, reads
live balances, and (for the TON → Solana route) drives a real trust-minimized
bridge.

> **Testnet demo.** Not financial, investment, or security advice.

## Tabs

- **🏠 Home** — landing page (hero, features, milestones, team, blog).
- **🌉 Bridge** — pick source/destination chains, choose an asset, and send. Real
  on-chain deposits; TON → Solana shows a live deposit → proof → release status.
- **🔎 Explorer** — live network status, market prices/charts/sparklines, asset
  detail modals, tx lookup, and your bridge activity.
- **💰 Earn** — provide liquidity to pools (deposits real; APR/TVL simulated).
- **👛 Wallet** — connected wallets, per-network balances, receive QR codes, a
  recipients address book, and transaction history.
- **🛡️ Guard** — wallet risk analysis (spectral signature + score; simulated).
- **📡 Pulse** — live TON (per-transaction) and Solana (throughput) activity board.
- **📄 Docs** — in-app documentation and FAQ.

## Tech

React 18 · Vite 5 · ethers v6 (EVM) · @solana/web3.js (Solana) · @tonconnect/ui-react
+ @ton/core (TON) · CoinGecko prices · qrcode. Node globals are polyfilled for the
browser via `vite-plugin-node-polyfills`.

## Networks & wallets

EVM testnets (Ethereum Sepolia, Polygon Amoy, Arbitrum Sepolia, Optimism Sepolia,
BNB testnet), Solana Devnet, and TON Testnet — connected through MetaMask (EVM),
Phantom (Solana), and TonConnect / Tonkeeper (TON).

## The TON → Solana bridge

This route is wired end to end. Your TON deposit carries a `DEPO` payload with the
Solana recipient (see [`src/lib/tonBridge.js`](src/lib/tonBridge.js)); a relayer
watches the lock contract, generates a zero-knowledge proof of the deposit, and a
Solana program verifies it and releases test USDC. The Bridge tab polls
`/api/status` and shows the real lifecycle (detected → proving → released).

The relayer, prover, and Solana program run on a droplet and are **not part of this
repository** — this repo is the front-end only. The other source chains sign a real
deposit, but their destination release is not wired in this demo.

## Local development

```bash
npm ci
npm run dev      # http://localhost:5173
npm run lint     # ESLint (flat config)
npm run build    # production build to dist/
```

Node 20 (see `.nvmrc`).

## Configuration

Copy `.env.example` to `.env`. Key variables: `VITE_BASE` (asset base path, `/`
for the droplet), `VITE_TON_MANIFEST_URL` (TonConnect manifest URL), and
`VITE_BRIDGE_STATUS_URL` (bridge status endpoint, default `/api/status`).

## Deploy

Served from a droplet behind a Cloudflare Tunnel (not GitHub Pages). See
[DEPLOY.md](DEPLOY.md) — CI only lints/builds; deployment uses
[`scripts/deploy-droplet.sh`](scripts/deploy-droplet.sh).

## Privacy

No backend for the front-end, no analytics, no tracking cookies. Preferences,
saved recipients and demo state live in the browser's local storage.
