import { useEffect, useState } from 'react'

// Auto-hide header behaviour: `hidden` becomes true when scrolling down (past a
// small offset) and false when scrolling up. `scrolled` flags any scroll away
// from the very top (used to fade in the header background).
export function useHideOnScroll(threshold = 8) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let last = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 4)
      if (Math.abs(y - last) < threshold) return
      setHidden(y > last && y > 64) // hide on scroll-down once past the header
      last = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { hidden, scrolled }
}
