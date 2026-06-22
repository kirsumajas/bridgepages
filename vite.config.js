import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // For GitHub Pages project sites the app is served from /<repo>/. The deploy
  // workflow injects VITE_BASE accordingly; local dev falls back to '/'.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true, // listen on all interfaces so a tunnel can reach it
    allowedHosts: true, // accept the tunnel's hostname (e.g. *.loca.lt)
  },
})
