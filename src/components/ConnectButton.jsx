import { useState } from 'react'
import { useWallets } from '../hooks/useWallets.jsx'
import WalletPicker from './WalletPicker.jsx'

export default function ConnectButton() {
  const wallets = useWallets()
  const [open, setOpen] = useState(false)
  const count = wallets.list.filter((w) => w.account).length

  return (
    <div className="connect-area">
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        {count ? '+ Wallet' : 'Connect Wallet'}
        {count > 0 && <span className="wallet-count">{count}</span>}
      </button>
      {open && <WalletPicker onClose={() => setOpen(false)} />}
    </div>
  )
}
