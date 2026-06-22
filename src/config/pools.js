// Liquidity pools shown on the Earn tab. Providing liquidity "powers" the
// bridge: your deposited assets back transfers on that chain, and you earn a
// share of the bridge's transaction fees (APR below).
//
// `poolAddress` is where the deposit is sent — a placeholder burn address until
// you deploy a real pool contract (same pattern as the bridge address).
// `apr` / `tvl` are illustrative demo figures; wire a real contract/indexer for
// live numbers.

import { CHAINS } from './chains.js'

export const POOLS = [
  {
    id: 'sepolia-eth',
    chainKey: 'sepolia',
    token: null, // native
    apr: 8.2,
    tvl: 1240,
    poolAddress: '0x000000000000000000000000000000000000dEaD',
  },
  {
    id: 'amoy-pol',
    chainKey: 'amoy',
    token: null,
    apr: 12.5,
    tvl: 86000,
    poolAddress: '0x000000000000000000000000000000000000dEaD',
  },
  {
    id: 'arbitrum-eth',
    chainKey: 'arbitrumSepolia',
    token: null,
    apr: 9.7,
    tvl: 540,
    poolAddress: '0x000000000000000000000000000000000000dEaD',
  },
  {
    id: 'bsc-tbnb',
    chainKey: 'bscTestnet',
    token: null,
    apr: 6.4,
    tvl: 3200,
    poolAddress: '0x000000000000000000000000000000000000dEaD',
  },
]

export const poolChain = (pool) => CHAINS[pool.chainKey]
export const poolSymbol = (pool) =>
  pool.token ? pool.token.symbol : poolChain(pool).nativeCurrency.symbol
