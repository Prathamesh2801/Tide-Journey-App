import { useEffect, useState } from 'react'

/**
 * Registers the service worker and reports precache progress.
 *
 * The worker copies the whole media package into Cache Storage on first
 * load so playback afterwards never touches the network. Where service
 * workers are unavailable (a non-secure context, e.g. plain http://) this
 * reports `unsupported` and the app simply streams as before - the
 * feature degrades rather than breaking.
 */
const IDLE = { status: 'idle', done: 0, total: 0 }
const UNSUPPORTED = { status: 'unsupported', done: 0, total: 0 }

// Evaluated once at module scope: whether the API exists cannot change
// during a session, so it does not need to be synced in an effect.
const SUPPORTED =
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator

export function useMediaCache() {
  const [state, setState] = useState(SUPPORTED ? IDLE : UNSUPPORTED)

  useEffect(() => {
    if (!SUPPORTED) return undefined

    let active = true

    const onMessage = (event) => {
      if (!active) return
      const { type, done, total } = event.data ?? {}
      if (type === 'cache-progress') setState({ status: 'caching', done, total })
      if (type === 'cache-complete') setState({ status: 'ready', done, total })
    }

    navigator.serviceWorker.addEventListener('message', onMessage)

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      })
      .then(async (registration) => {
        await navigator.serviceWorker.ready

        // Post to the registration's own active worker rather than
        // navigator.serviceWorker.controller: on a first visit the page
        // is not yet controlled, so controller is null and the message
        // would be dropped silently.
        const worker = registration.active ?? navigator.serviceWorker.controller
        if (!worker) return
        worker.postMessage({ type: 'start-precache' })
      })
      .catch(() => {
        if (active) setState(UNSUPPORTED)
      })

    return () => {
      active = false
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [])

  return state
}
