import { formatUnits } from 'ethers'
import { getReadProvider } from './wallet.js'
import { getSolBalance } from './solana.js'
import { getTonBalance } from './ton.js'

// Native-currency balance for any chain, dispatched by VM. Returns a number.
export async function getNativeBalance(chain, account) {
  if (chain.vm === 'solana') return getSolBalance(account)
  if (chain.vm === 'ton') return getTonBalance(account)
  const raw = await getReadProvider(chain.key).getBalance(account)
  return Number(formatUnits(raw, chain.nativeCurrency.decimals))
}
