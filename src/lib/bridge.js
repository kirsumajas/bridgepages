import { parseUnits } from 'ethers'
import { getErc20 } from './erc20.js'

// Executes the source-chain deposit for a bridge transfer.
//
// For native tokens this is a value transfer to the chain's bridge address.
// For ERC-20 tokens this is an ERC-20 `transfer` to the bridge address.
//
// In a production bridge the destination chain would mint/release the
// corresponding asset via a relayer watching the bridge contract. That release
// step is intentionally out of scope for this front-end — see README.
// Sends `amount` of an asset to `to` on `chain`. Native = value transfer,
// ERC-20 = `transfer`. Shared by the bridge deposit and the Earn pool deposit.
export async function transferTo({ signer, chain, token, amount, to }) {
  if (!to) throw new Error('No destination address configured')
  if (!token) {
    const value = parseUnits(amount, chain.nativeCurrency.decimals)
    return signer.sendTransaction({ to, value })
  }
  const value = parseUnits(amount, token.decimals)
  const erc20 = getErc20(token.address, signer)
  return erc20.transfer(to, value)
}

export async function depositToBridge({
  signer,
  sourceChain,
  token, // null = native token
  amount, // human-readable string, e.g. "0.05"
  recipient, // destination-chain recipient (released by the relayer, not this tx)
}) {
  if (!sourceChain.bridgeAddress)
    throw new Error('No bridge address configured for source chain')
  return transferTo({ signer, chain: sourceChain, token, amount, to: sourceChain.bridgeAddress })
}

export const explorerTxUrl = (chain, hash) => {
  const base = chain.blockExplorerUrls[0]
  if (chain.vm === 'solana') {
    const q = chain.explorerCluster ? `?cluster=${chain.explorerCluster}` : ''
    return `${base}/tx/${hash}${q}`
  }
  return `${base}/tx/${hash}`
}
