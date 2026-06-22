import { useWallets } from '../hooks/useWallets.jsx'

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

const DOT = { evm: '#627eea', solana: '#14f195', ton: '#0098ea' }
const LABEL = { evm: 'EVM', solana: 'Solana', ton: 'TON' }

export default function ConnectButton() {
  const wallets = useWallets()
  const connected = wallets.list.filter((w) => w.account)

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
      {connected.length === 0 && (
        <button
          className="btn btn-primary"
          onClick={wallets.evm.connect}
          disabled={wallets.evm.connecting}
        >
          {wallets.evm.connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}
