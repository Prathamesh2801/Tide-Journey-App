import { useCallback, useEffect, useState } from 'react'

/**
 * Fullscreen control for the kiosk.
 *
 * Prefixed variants are included because Android WebView and older
 * Chrome builds - which is what these tablets run - still expose only
 * webkit-prefixed methods. The state follows the browser's own
 * fullscreenchange event rather than assuming our call succeeded, so
 * leaving fullscreen via the system back gesture stays in sync.
 */
function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  )
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() =>
    Boolean(getFullscreenElement())
  )

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(getFullscreenElement()))
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]
    events.forEach((event) => document.addEventListener(event, sync))
    return () =>
      events.forEach((event) => document.removeEventListener(event, sync))
  }, [])

  const enter = useCallback(() => {
    const el = document.documentElement
    const request =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen
    // Returns a promise in modern browsers, undefined in older WebViews.
    return Promise.resolve(request?.call(el)).catch(() => {})
  }, [])

  const exit = useCallback(() => {
    const request =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen
    return Promise.resolve(request?.call(document)).catch(() => {})
  }, [])

  const toggle = useCallback(
    () => (getFullscreenElement() ? exit() : enter()),
    [enter, exit]
  )

  // Fullscreen is unavailable in some embedded WebViews; callers hide the
  // control rather than showing a button that silently does nothing.
  const isSupported =
    typeof document !== 'undefined' &&
    Boolean(
      document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen
    )

  return { isFullscreen, isSupported, enter, exit, toggle }
}
