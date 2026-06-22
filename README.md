# 🌉 Crosschain Bridge

A front-end for bridging assets across blockchains, built with **React + Vite + ethers v6**. It connects a real wallet (MetaMask / any EIP-1193 injected wallet) and operates on public **testnets**.

## Features

The app has three tabs:

- **🌉 Bridge** — pick a source and destination chain, choose a native or ERC-20 asset, and move it across chains. Live balances, one-click chain flip, automatic network switching, real on-chain deposits with status + explorer links.
- **🔎 Explorer** — live per-chain block heights, your bridge activity (recorded locally), and a real transaction lookup that reads any tx hash straight from a chain's RPC.
- **💰 Earn** — provide liquidity to bridge pools to "power" cross-chain transfers and earn a share of transaction fees. Per-pool APR/TVL, your position, and live-ticking accrued fees.

Shared across tabs:

- **Wallet connection** with auto-reconnect and live account/network change handling.
- **Native + ERC-20 assets** with balances read directly from each chain's RPC (works even when your wallet is on a different chain).
- **Automatic network switching** — the app prompts MetaMask to switch (or add) the right chain before signing.
- **Live prices** from CoinGecko — USD values next to amounts/balances, USD pool TVL/liquidity/fees, a light/dark theme switcher, and a market-prices panel (price, 24h change, market cap) on the Explorer tab.

## Prices

Prices come from the free CoinGecko API and refresh every 60s ([`src/lib/prices.js`](src/lib/prices.js), [`src/hooks/usePrices.jsx`](src/hooks/usePrices.jsx)). Each asset carries a `coingeckoId` in [`src/config/chains.js`](src/config/chains.js).

Because **testnet tokens have no market value**, the app prices the *mainnet equivalent* asset (ETH, POL, BNB, USDC) and uses that for USD display — balances stay testnet, only the per-unit price is real. For production, proxy CoinGecko through a small backend to add caching and avoid browser rate limits.

## Supported testnets

| Chain | Chain ID | Faucet |
| --- | --- | --- |
| Ethereum Sepolia | 11155111 | [sepoliafaucet.com](https://sepoliafaucet.com) |
| Polygon Amoy | 80002 | [faucet.polygon.technology](https://faucet.polygon.technology) |
| Arbitrum Sepolia | 421614 | bridge from Sepolia |
| Optimism Sepolia | 11155420 | bridge from Sepolia |
| BNB Smart Chain Testnet | 97 | [testnet.bnbchain.org/faucet-smart](https://testnet.bnbchain.org/faucet-smart) |

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173, connect MetaMask, and make sure you have some testnet funds (see faucets above).

## How the bridge works

A cross-chain transfer is two steps:

1. **Source-chain deposit** *(implemented here)* — the user locks funds by sending them to the bridge/escrow address on the source chain. This is a real, signed, on-chain transaction.
2. **Destination-chain release** *(out of scope for this front-end)* — a relayer/validator watches the bridge contract and mints or releases the equivalent asset to the recipient on the destination chain.

This project implements step 1 end-to-end against testnets. To make it a fully functioning bridge you need to:

- Deploy a bridge/escrow contract on each chain and set its address in [`src/config/chains.js`](src/config/chains.js) (`bridgeAddress`). The defaults are the burn address `0x…dEaD` as a safe placeholder.
- Run a relayer that listens for deposits and performs the release on the destination chain.

> ⚠️ **Testnet only.** Do not point this at mainnet or send real funds. The placeholder bridge address is a burn address — configure your own contract first.

## The Earn tab

Providing liquidity backs the bridge on a given chain and earns a share of transfer fees. As with the bridge:

- **Deposits are real on-chain transactions** to the pool address (`poolAddress` in [`src/config/pools.js`](src/config/pools.js)) — a placeholder burn address until you deploy a real pool contract.
- **APR, TVL, positions, and accrued fees are simulated client-side** for this demo (stored in your browser). There is no real LP contract or indexer behind the numbers — wire one up to make them real.

## Project structure

```
src/
├── config/
│   ├── chains.js         # testnet definitions, tokens, bridge addresses
│   └── pools.js          # Earn liquidity pools (APR/TVL/pool address)
├── lib/
│   ├── wallet.js         # provider + chain switching (EIP-1193)
│   ├── erc20.js          # minimal ERC-20 ABI helpers
│   ├── bridge.js         # transfer + source-chain deposit logic
│   ├── history.js        # local bridge-activity store (Explorer)
│   └── positions.js      # local Earn positions + simulated fee accrual
├── hooks/
│   ├── useWallet.js      # connection state + wallet events
│   ├── useBalance.js     # per-chain balance reads
│   ├── useTxSender.js    # shared switch → sign → confirm flow
│   ├── useHistory.js     # subscribe to bridge-activity store
│   └── usePositions.js   # subscribe to positions store + live ticker
└── components/           # Header, Tabs, BridgeCard, Explorer, Earn, …
```

## Customising

- **Add a chain:** add an entry to `CHAINS` in `src/config/chains.js`.
- **Add a token:** push to a chain's `tokens` array (`{ symbol, address, decimals }`).
- **Wire a real bridge:** replace `bridgeAddress` per chain and (optionally) swap the `depositToBridge` logic in `src/lib/bridge.js` to call your contract's `deposit`/`lock` method.
