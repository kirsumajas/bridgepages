import { createContext, useContext } from 'react'
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react'
import { useWallet as useEvmWallet } from './useWallet.js'
import { useSolanaWallet } from './useSolanaWallet.js'

// Unifies the three wallet ecosystems behind one object. Components pick the
// right wallet for a chain via forChain(chain) / forVm(vm).
const WalletsContext = createContext(null)

export function WalletsProvider({ children }) {
  const evm = { vm: 'evm', ...useEvmWallet() }
  const solana = useSolanaWallet()

  const [tonConnectUI] = useTonConnectUI()
  const tonAddress = useTonAddress()
  const ton = {
    vm: 'ton',
    installed: true,
    account: tonAddress || null,
    connecting: false,
    error: null,
    connect: () => tonConnectUI.openModal(),
    disconnect: () => tonConnectUI.disconnect(),
    tonConnectUI,
  }

  const byVm = { evm, solana, ton }
  const value = {
    evm,
    solana,
    ton,
    list: [evm, solana, ton],
    forVm: (vm) => byVm[vm],
    forChain: (chain) => byVm[chain.vm],
  }

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
}

export const useWallets = () => useContext(WalletsContext)
