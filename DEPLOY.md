# Deploying MEPO

The MEPO front-end is a static Vite build served **from a droplet behind a
Cloudflare Tunnel**. GitHub Pages is **not** used anymore — the `/api/status`
endpoint the Bridge status panel polls only exists on the droplet (proxied by
nginx), so a Pages/static-only host cannot serve the full app.

CI (`.github/workflows/ci.yml`) only lints and builds on push/PR — it does not
deploy.

## Prerequisites

- Node 20 (see `.nvmrc`)
- SSH access to the droplet
- nginx on the droplet serving the web root, proxying `/api` to the bridge
  status service, and hosting `tonconnect-manifest.json`
- A Cloudflare Tunnel exposing the droplet over HTTPS

## Configuration (env)

Copy `.env.example` to `.env` and fill in as needed (all optional — sensible
defaults apply):

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_BASE` | Base path for assets | `/` (root — correct for droplet) |
| `VITE_TON_MANIFEST_URL` | Absolute URL of the TonConnect manifest | current tunnel URL in `main.jsx` |
| `VITE_BRIDGE_STATUS_URL` | Bridge status endpoint | `/api/status` (same-origin via nginx) |

> **Tunnel hostnames:** `*.trycloudflare.com` quick-tunnel URLs are **ephemeral**
> and change on restart. Prefer a **named Cloudflare Tunnel** or a real domain,
> and point `VITE_TON_MANIFEST_URL` + the manifest `url` at that stable host.

## Deploy

```bash
DROPLET_HOST=root@YOUR_DROPLET DROPLET_PATH=/var/www/mepo ./scripts/deploy-droplet.sh
```

This runs `npm ci && npm run build` and `rsync`s `dist/` to the droplet.

## nginx caching (avoids stale builds)

Vite content-hashes files in `/assets`, so serve those immutable and keep
`index.html` uncached:

```nginx
location = /index.html { add_header Cache-Control "no-cache"; }
location /assets/     { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

With this in place you don't need any build-marker cache-busting hacks.
