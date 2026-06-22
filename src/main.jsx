import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { PricesProvider } from './hooks/usePrices.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PricesProvider>
      <App />
    </PricesProvider>
  </React.StrictMode>,
)
