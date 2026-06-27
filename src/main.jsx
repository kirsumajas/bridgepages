import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App.jsx'
import { PricesProvider } from './hooks/usePrices.jsx'
import { WalletsProvider } from './hooks/useWallets.jsx'
import { ToastProvider } from './hooks/useToast.jsx'
import './index.css'

// Must be a public, absolute URL the TON wallet can fetch.
const TON_MANIFEST_URL = 'https://kirsumajas.github.io/bridgepages/tonconnect-manifest.json'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={TON_MANIFEST_URL}>
      <ToastProvider>
        <PricesProvider>
          <WalletsProvider>
            <App />
          </WalletsProvider>
        </PricesProvider>
      </ToastProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
)
