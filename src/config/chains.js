// Testnet chain definitions used by the bridge UI.
//
// `bridgeAddress` is the escrow/bridge contract that receives the deposit on the
// source chain. The defaults below are placeholders — replace them with your own
// deployed bridge contract (or a relayer escrow address) before going live.
// Until then, deposits are sent to the address you configure here so every
// "bridge" action is still a real, signed, on-chain testnet transaction.

export const CHAINS = {
  sepolia: {
    key: 'sepolia',
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
}

export const CHAIN_LIST = Object.values(CHAINS)

export const getChainById = (chainId) =>
  CHAIN_LIST.find((c) => c.chainId === Number(chainId))

export const getChainByKey = (key) => CHAINS[key]
