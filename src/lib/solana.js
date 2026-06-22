import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { CHAINS } from '../config/chains.js'

let _conn
export const getSolanaConnection = () => {
  if (!_conn) _conn = new Connection(CHAINS.solanaDevnet.rpcUrls[0], 'confirmed')
  return _conn
}

// The injected Phantom provider, if present.
export const getPhantom = () => {
  if (typeof window === 'undefined') return null
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana
  if (window.solana?.isPhantom) return window.solana
  return null
}

export async function getSolBalance(address) {
  const lamports = await getSolanaConnection().getBalance(new PublicKey(address))
  return lamports / LAMPORTS_PER_SOL
}

export const getSolBlockHeight = () => getSolanaConnection().getBlockHeight()

export function isSolanaAddress(value) {
  try {
    // PublicKey throws for anything that isn't a valid 32-byte base58 key.
    new PublicKey(value)
    return true
  } catch {
    return false
  }
}

// Builds, signs (via Phantom), sends, and confirms a native SOL transfer.
// Returns the transaction signature.
export async function sendSol({ provider, from, to, amount }) {
  const conn = getSolanaConnection()
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(from),
      toPubkey: new PublicKey(to),
      lamports: Math.round(Number(amount) * LAMPORTS_PER_SOL),
    }),
  )
  tx.feePayer = new PublicKey(from)
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash
  const { signature } = await provider.signAndSendTransaction(tx)
  await conn.confirmTransaction(signature, 'confirmed')
  return signature
}
