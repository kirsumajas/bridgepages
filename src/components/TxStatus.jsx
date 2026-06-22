import { explorerTxUrl } from '../lib/bridge.js'

export default function TxStatus({ status, chain }) {
  if (!status) return null

  const { state, hash, message } = status
  const cls = state === 'error' ? 'tx-error' : state === 'success' ? 'tx-success' : 'tx-pending'

  return (
    <div className={`tx-status ${cls}`}>
      <div className="tx-status-row">
        {state === 'pending' && <span className="spinner" />}
        <span>{message}</span>
      </div>
      {hash && chain && (
        <a href={explorerTxUrl(chain, hash)} target="_blank" rel="noreferrer">
          View on explorer ↗
        </a>
      )}
    </div>
  )
}
