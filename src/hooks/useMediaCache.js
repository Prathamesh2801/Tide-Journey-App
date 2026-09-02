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

/** How long the "ready" confirmation stays on screen before retiring. */
const DISMISS_AFTER_MS = 4000

export function useMediaCache() {
  const [state, setState] = useState(SUPPORTED ? IDLE : UNSUPPORTED)

  useEffect(() => {
    if (!SUPPORTED) return undefined

    let active = true
    let dismissTimer

    const onMessage = (event) => {
      if (!active) return
      const { type, done, total, downloaded } = event.data ?? {}

      if (type === 'cache-progress') {
        // A return visit reports 100% immediately with nothing left to
        // fetch. Showing a progress pill for that is noise, so only
        // surface it while there is real work happening.
        if (done < total) setState({ status: 'caching', done, total })
        return
      }

      if (type === 'cache-complete') {
        // Nothing was downloaded - the tablet was already provisioned, so
        // there is nothing to announce.
        if (downloaded === 0) {
          setState({ status: 'idle', done, total })
          return
        }
        setState({ status: 'ready', done, total })
        // Retire the badge rather than leaving it parked over every
        // screen for the rest of the session.
        dismissTimer = window.setTimeout(() => {
          if (active) setState({ status: 'idle', done, total })
        }, DISMISS_AFTER_MS)
      }
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
      window.clearTimeout(dismissTimer)
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [])

  return state
}
