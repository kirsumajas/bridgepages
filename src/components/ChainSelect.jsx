import { CHAIN_LIST } from '../config/chains.js'

export default function ChainSelect({ label, value, onChange, disabledKey }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="select-wrap">
        <span className="chain-dot" style={{ background: value?.color ?? '#888' }} />
        <select
          className="select"
          value={value?.key ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {CHAIN_LIST.map((chain) => (
            <option key={chain.key} value={chain.key} disabled={chain.key === disabledKey}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}
