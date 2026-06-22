import { BrowserProvider, JsonRpcProvider } from 'ethers'
import { CHAINS } from '../config/chains.js'

export const hasMetaMask = () =>
  typeof window !== 'undefined' && Boolean(window.ethereum)

// A signing provider bound to the injected wallet (MetaMask).
export const getBrowserProvider = () => {
  if (!hasMetaMask()) throw new Error('No injected wallet found')
  return new BrowserProvider(window.ethereum)
}

// A read-only provider for a given chain, used to fetch balances on chains the
// wallet isn't currently connected to.
const readProviders = {}
export const getReadProvider = (chainKey) => {
  const chain = CHAINS[chainKey]
  if (!chain) throw new Error(`Unknown chain: ${chainKey}`)
  if (!readProviders[chainKey]) {
    readProviders[chainKey] = new JsonRpcProvider(chain.rpcUrls[0], {
      chainId: chain.chainId,
      name: chain.name,
    })
  }
  return readProviders[chainKey]
}

export const requestAccounts = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  })
  return accounts
}

// Ask the wallet to switch to `chain`. If the chain is unknown to the wallet,
// add it first (error 4902), then the switch.
export const switchChain = async (chain) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.chainIdHex }],
    })
  } catch (err) {
    if (err?.code === 4902 || err?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chain.chainIdHex,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: chain.rpcUrls,
            blockExplorerUrls: chain.blockExplorerUrls,
          },
        ],
      })
    } else {
      throw err
    }
  }
}
