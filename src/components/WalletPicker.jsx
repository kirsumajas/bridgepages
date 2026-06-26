import { useEffect } from 'react'
import { useWallets } from '../hooks/useWallets.jsx'

const shorten = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`

const WALLETS = [
  { vm: 'evm', name: 'MetaMask', desc: 'Ethereum & EVM chains', icon: '🦊', install: 'https://metamask.io/download/' },
  { vm: 'solana', name: 'Phantom', desc: 'Solana', icon: '👻', install: 'https://phantom.app/download' },
  { vm: 'ton', name: 'Tonkeeper', desc: 'TON · via TonConnect', icon: '💎', install: null },
]

export default function WalletPicker({ onClose }) {
  const wallets = useWallets()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wallet-picker" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="section-title">Connect a wallet</h2>

        <div className="wp-list">
          {WALLETS.map((meta) => {
            const w = wallets.forVm(meta.vm)
            const installed = meta.vm === 'ton' ? true : w.installed
            const connected = Boolean(w.account)

            return (
              <div className="wp-row" key={meta.vm}>
                <span className="wp-icon">{meta.icon}</span>
                <div className="wp-info">
                  <div className="wp-name">{meta.name}</div>
                  <div className="wp-desc">{connected ? shorten(w.account) : meta.desc}</div>
                </div>
                {connected ? (
                  <button className="btn btn-ghost btn-sm" onClick={w.disconnect}>
                    Disconnect
                  </button>
                ) : installed ? (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={w.connecting}
                    onClick={() => {
                      // TonConnect opens its own modal — close ours first.
                      if (meta.vm === 'ton') onClose()
                      w.connect()
                    }}
                  >
                    {w.connecting ? '…' : 'Connect'}
                  </button>
                ) : (
                  <a className="btn btn-ghost btn-sm" href={meta.install} target="_blank" rel="noreferrer">
                    Install ↗
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <p className="wp-note">
          Pick the wallet for the chain you want to use — you can connect more than one.
        </p>
      </div>
    </div>
  )
}
