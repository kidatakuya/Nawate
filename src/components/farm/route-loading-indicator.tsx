'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const SHOW_DELAY_MS = 120
const MAX_VISIBLE_MS = 10_000

export function RouteLoadingIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    showTimer.current = null
    hideTimer.current = null
  }, [])

  const startLoading = useCallback(() => {
    clearTimers()
    showTimer.current = setTimeout(() => {
      setVisible(true)
      hideTimer.current = setTimeout(() => setVisible(false), MAX_VISIBLE_MS)
    }, SHOW_DELAY_MS)
  }, [clearTimers])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return

      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return

      const destination = new URL(link.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname && destination.search === window.location.search)
      ) return

      startLoading()
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', startLoading)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', startLoading)
      clearTimers()
    }
  }, [clearTimers, startLoading])

  useEffect(() => {
    clearTimers()
    setVisible(false)
  }, [pathname, searchParams, clearTimers])

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="h-full w-1/3 animate-route-loading bg-primary" />
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {visible ? 'ページを読み込み中です。' : ''}
      </span>
    </>
  )
}
