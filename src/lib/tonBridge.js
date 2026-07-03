// TON->Solana deposit builder + bridge status client.
//
// Mirrors the reference deposit script (LockEscrowContract/scripts/deposit.ts) EXACTLY so the
// relayer detects it and the SP1 guest decodes it: MsgDeposit { tail } to the lock contract,
//   tail = recipient:uint256 (Solana pubkey, big-endian) amount:uint64 (nano-TON) nonce:uint64 deadline:uint32
//   body = op:uint32 ('DEPO' 0x4445504F), ref -> tail
import { beginCell } from '@ton/core'
import { PublicKey } from '@solana/web3.js'

export const OP_DEPOSIT = 0x4445504f // 'DEPO'

// Droplet status API over HTTPS (Cloudflare Tunnel, so an HTTPS site can reach it without
// mixed-content). Override with VITE_BRIDGE_STATUS_URL. NOTE: trycloudflare URLs are
// ephemeral — if the droplet's cf-status service restarts, update this + redeploy.
export const STATUS_URL =
  import.meta.env?.VITE_BRIDGE_STATUS_URL ||
  'https://broker-customize-stayed-earnings.trycloudflare.com/api/status'

// Build a TonConnect message for a TON->Solana deposit.
// tonAmount = TON to lock (also the amount reused as USDC base units on release).
export function buildDepositMessage({ lockContract, solanaRecipient, tonAmount }) {
  const bytes = new PublicKey(solanaRecipient).toBytes() // 32 bytes, big-endian
  let recip = 0n
  for (const b of bytes) recip = (recip << 8n) | BigInt(b)
  const depositAmount = BigInt(Math.round(Number(tonAmount) * 1e9)) // nano-TON, uint64
  const nonce = BigInt(Date.now())
  const deadline = 0
  const tail = beginCell()
    .storeUint(recip, 256)
    .storeUint(depositAmount, 64)
    .storeUint(nonce, 64)
    .storeUint(deadline, 32)
    .endCell()
  const body = beginCell().storeUint(OP_DEPOSIT, 32).storeRef(tail).endCell()
  return {
    message: {
      address: lockContract,
      amount: (depositAmount + 100_000_000n).toString(), // deposit + 0.1 TON gas
      payload: body.toBoc().toString('base64'),
    },
    nonce: nonce.toString(),
  }
}

// Fetch the bridge's per-deposit status list from the droplet API.
export async function fetchBridgeStatus() {
  const r = await fetch(STATUS_URL, { cache: 'no-store' })
  if (!r.ok) throw new Error(`status ${r.status}`)
  const j = await r.json()
  return j.deposits || []
}

// Match a user's deposits by their Solana recipient (lowercased hex compare against the
// recipient the guest committed). Returns entries newest-first.
export function depositsForRecipient(deposits, solanaRecipient) {
  let hex = ''
  try {
    hex = Buffer.from(new PublicKey(solanaRecipient).toBytes()).toString('hex')
  } catch {
    return []
  }
  return deposits.filter((d) => (d.recipient || '').toLowerCase() === hex)
}

// Human label + progress for a status stage.
export const STAGE_INFO = {
  detected: { label: 'Deposit detected on TON', pct: 0.25 },
  proving: { label: 'Generating ZK proof', pct: 0.55 },
  proven: { label: 'Proof ready', pct: 0.7 },
  submitting: { label: 'Releasing on Solana', pct: 0.9 },
  released: { label: 'Completed — USDC released', pct: 1 },
  failed: { label: 'Failed', pct: 1 },
}