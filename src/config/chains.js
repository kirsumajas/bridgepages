// Chain definitions used across the app.
//
// Each chain declares a `vm` ("evm" | "solana" | "ton") so the wallet, balance,
// and transaction layers know how to talk to it. EVM chains additionally carry
// `chainId`/`chainIdHex` for wallet network switching.
//
// `bridgeAddress` is the escrow/bridge address that receives the deposit on the
// source chain — a placeholder (burn/incinerator address) until you deploy a
// real bridge. Deposits are still real, signed, on-chain testnet transactions.

export const CHAINS = {
  sepolia: {
    key: 'sepolia',
    vm: 'evm',
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Ethereum Sepolia',
    short: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18, coingeckoId: 'ethereum' },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    color: '#627eea',
    bridgeAddress: '0x000000000000000000000000000000000000dEaD',
    tokens: [
      { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6, coingeckoId: 'usd-coin' },
    ],
  },
  amoy: {
    key: 'amoy',
    vm: 'evm',
    chainId: 80002,
    chainIdHex: '0x13882',
    name: 'Polygon Amoy',
    short: 'Amoy',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18, coingeckoId: 'polygon-ecosystem-token' },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
    color: '#8247e5',
    bridgeAddress: '0x000000000000000000000000000000000000dEaD',
    tokens: [],
  },
  arbitrumSepolia: {
    key: 'arbitrumSepolia',
    vm: 'evm',
    chainId: 421614,
    chainIdHex: '0x66eee',
    name: 'Arbitrum Sepolia',
    short: 'Arb Sepolia',
    nativeCurrency: { name: 'Arbitrum Sepolia Ether', symbol: 'ETH', decimals: 18, coingeckoId: 'ethereum' },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
    color: '#28a0f0',
    bridgeAddress: '0x000000000000000000000000000000000000dEaD',
    tokens: [],
  },
  optimismSepolia: {
    key: 'optimismSepolia',
    vm: 'evm',
    chainId: 11155420,
    chainIdHex: '0xaa37dc',
    name: 'Optimism Sepolia',
    short: 'OP Sepolia',
    nativeCurrency: { name: 'Optimism Sepolia Ether', symbol: 'ETH', decimals: 18, coingeckoId: 'ethereum' },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
    color: '#ff0420',
    bridgeAddress: '0x000000000000000000000000000000000000dEaD',
    tokens: [],
  },
  bscTestnet: {
    key: 'bscTestnet',
    vm: 'evm',
    chainId: 97,
    chainIdHex: '0x61',
    name: 'BNB Smart Chain Testnet',
    short: 'BSC Testnet',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18, coingeckoId: 'binancecoin', priceSymbol: 'BNB' },
    rpcUrls: ['https://bsc-testnet-rpc.publicnode.com'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    color: '#f0b90b',
    bridgeAddress: '0x000000000000000000000000000000000000dEaD',
    tokens: [],
  },
  solanaDevnet: {
    key: 'solanaDevnet',
    vm: 'solana',
    name: 'Solana Devnet',
    short: 'Solana',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9, coingeckoId: 'solana' },
    rpcUrls: ['https://api.devnet.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    explorerCluster: 'devnet', // appended as ?cluster=devnet
    color: '#14f195',
    // Solana's official incinerator (burn) account — placeholder bridge address.
    bridgeAddress: '1nc1nerator11111111111111111111111111111111',
    tokens: [],
  },
  tonTestnet: {
    key: 'tonTestnet',
    vm: 'ton',
    name: 'TON Testnet',
    short: 'TON',
    nativeCurrency: { name: 'Toncoin', symbol: 'TON', decimals: 9, coingeckoId: 'the-open-network' },
    // toncenter HTTP balance endpoint (testnet). A public key is optional for
    // low request volumes.
    rpcUrls: ['https://testnet.toncenter.com/api/v2'],
    blockExplorerUrls: ['https://testnet.tonviewer.com'],
    color: '#0098ea',
    // Real TON->Solana lock contract (the relayer watches this account). Deposits carry a
    // 'DEPO' payload with the Solana recipient; see lib/tonBridge.js + hooks/useTxSender.js.
    bridgeAddress: 'UQDiB5vrfi6g9Sa_eUAo-x2l-nzsDPRaoDNAFRK5oYOCjRi4',
    tokens: [],
  },
}

export const CHAIN_LIST = Object.values(CHAINS)

// EVM-only lookup by numeric chain id (used for wallet network detection).
export const getChainById = (chainId) =>
  CHAIN_LIST.find((c) => c.vm === 'evm' && c.chainId === Number(chainId))

export const getChainByKey = (key) => CHAINS[key]
