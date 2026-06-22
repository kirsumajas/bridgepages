const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

export default function ConnectButton({ wallet }) {
  const { installed, account, connecting, connect, disconnect } = wallet

  if (!installed) {
    return (
      <a
        className="btn btn-primary"
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
      >
        Install MetaMask
      </a>
    )
  }

  if (account) {
    return (
      <button className="btn btn-ghost" onClick={disconnect} title="Click to disconnect">
        <span className="dot dot-green" />
        {shorten(account)}
      </button>
    )
  }

  return (
    <button className="btn btn-primary" onClick={connect} disabled={connecting}>
      {connecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}
