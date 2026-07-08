import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App.jsx'
import { PricesProvider } from './hooks/usePrices.jsx'
import { WalletsProvider } from './hooks/useWallets.jsx'
import { ToastProvider } from './hooks/useToast.jsx'
import './index.css'

// Absolute, public URL the TON wallet fetches. Set VITE_TON_MANIFEST_URL to a
// stable host (named Cloudflare Tunnel / domain); the fallback is the current
// droplet tunnel. Stale caching is handled by nginx headers (see DEPLOY.md).
const TON_MANIFEST_URL =
  import.meta.env?.VITE_TON_MANIFEST_URL ||
  'https://redhead-decimal-walls-dana.trycloudflare.com/tonconnect-manifest.json'

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
