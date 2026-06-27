import { useEffect, useState } from 'react'

export const ROUTE_TABS = ['home', 'bridge', 'explorer', 'earn', 'wallet', 'guard', 'pulse', 'docs']

// Tab state backed by the URL hash (#/bridge), so tabs are shareable and the
// browser back/forward buttons work.
export function useHashRoute(defaultTab = 'home') {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '')
    return ROUTE_TABS.includes(h) ? h : defaultTab
  }

  const [tab, setTabState] = useState(parse)

  useEffect(() => {
    const onChange = () => setTabState(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTab = (t) => {
    window.location.hash = `/${t}`
    window.scrollTo({ top: 0 })
  }

  return [tab, setTab]
}
