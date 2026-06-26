import { useState } from 'react'
import { useWallets } from '../hooks/useWallets.jsx'
import WalletPicker from './WalletPicker.jsx'

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

const DOT = { evm: '#627eea', solana: '#14f195', ton: '#0098ea' }
const LABEL = { evm: 'EVM', solana: 'Solana', ton: 'TON' }

export default function ConnectButton() {
  const wallets = useWallets()
  const [open, setOpen] = useState(false)
  const connected = wallets.list.filter((w) => w.account)
  const allConnected = connected.length === wallets.list.length

  return (
    <div className="connect-area">
      {connected.map((w) => (
        <button
          key={w.vm}
          className="btn btn-ghost wallet-chip"
          onClick={w.disconnect}
          title={`${LABEL[w.vm]} — click to disconnect`}
        >
          <span className="dot" style={{ background: DOT[w.vm] }} />
          {shorten(w.account)}
        </button>
      ))}

      {!allConnected && (
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          {connected.length ? '+ Wallet' : 'Connect Wallet'}
        </button>
      )}

      {open && <WalletPicker onClose={() => setOpen(false)} />}
    </div>
  )
}
