import { JsonRpcProvider } from 'ethers'

// ENS lives on Ethereum mainnet, so resolution uses a mainnet RPC regardless of
// which testnet the bridge is on.
let _provider
const provider = () => {
  if (!_provider) _provider = new JsonRpcProvider('https://ethereum-rpc.publicnode.com')
  return _provider
}

export const looksLikeEns = (v) => /^[a-z0-9-]+\.[a-z]{2,}$/i.test(v.trim())

export async function resolveEns(name) {
  try {
    return await provider().resolveName(name.trim())
  } catch {
    return null
  }
}
