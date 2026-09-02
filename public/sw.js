/**
 * Offline media cache for the Tide Journey kiosk.
 *
 * The tablets run from a local XAMPP box over Wi-Fi. Streaming ~1.5 Mbps
 * per tablet is fine for one device but does not hold for ~70 at once,
 * and every swipe otherwise waits on a cold fetch. This worker copies the
 * whole media package into Cache Storage once, so playback afterwards is
 * served from the device and touches the network not at all.
 *
 * The precache list is written by scripts/build-sw-manifest.mjs at build
 * time from the same config the app reads, so it can never drift from
 * what is actually shipped.
 */
importScripts('./sw-manifest.js') // defines self.__MEDIA_MANIFEST

const VERSION = self.__MEDIA_MANIFEST?.version ?? 'dev'
const MEDIA_CACHE = `tide-media-${VERSION}`
const SHELL_CACHE = `tide-shell-${VERSION}`
const MEDIA_FILES = self.__MEDIA_MANIFEST?.files ?? []

/** Fetch in small batches: 70 parallel requests would swamp the tablet. */
const BATCH_SIZE = 4

async function precacheMedia() {
  const cache = await caches.open(MEDIA_CACHE)
  const pending = []
  for (const url of MEDIA_FILES) {
    if (!(await cache.match(url))) pending.push(url)
  }

  let done = MEDIA_FILES.length - pending.length
  const total = MEDIA_FILES.length
  const report = () => broadcast({ type: 'cache-progress', done, total })
  report()

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    await Promise.all(
      pending.slice(i, i + BATCH_SIZE).map(async (url) => {
        try {
          // no-store so a partial/ranged response is never what we store.
          const response = await fetch(url, { cache: 'no-store' })
          if (response.ok) await cache.put(url, response.clone())
        } catch {
          // A single failed asset must not abort the whole precache; it
          // will simply fall through to the network when played.
        } finally {
          done += 1
          report()
        }
      })
    )
  }

  // `downloaded` lets the page tell a real first-run copy from a return
  // visit where everything was already stored: a tablet that downloaded
  // nothing should not be shown a "ready" badge it did not earn.
  broadcast({ type: 'cache-complete', done, total, downloaded: pending.length })
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  for (const client of clients) client.postMessage(message)
}

self.addEventListener('install', (event) => {
  // Take over straight away rather than waiting for every tab to close -
  // a kiosk has one tab and we want the cache live on first load.
  self.skipWaiting()
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      const shell = self.__MEDIA_MANIFEST?.shell ?? ['./', './index.html']
      // Individually, not addAll: one asset failing must not abort the
      // whole shell precache and leave the tablet with nothing.
      await Promise.all(
        shell.map(async (path) => {
          try {
            const response = await fetch(path, { cache: 'reload' })
            if (response.ok) await cache.put(path, response)
          } catch {
            // Retried on demand by the fetch handler below.
          }
        })
      )
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older builds so a redeploy does not leave the
      // previous media package occupying storage forever.
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('tide-') && key !== MEDIA_CACHE && key !== SHELL_CACHE)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'start-precache') {
    event.waitUntil(precacheMedia())
  }
})

/**
 * Media is cache-first: once stored it is served from disk and never
 * refetched. Everything else is network-first so a redeploy is picked up
 * without needing the cache cleared by hand.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.includes('/media/')) {
    event.respondWith(serveMedia(request))
    return
  }

  // Built assets carry a content hash in the filename, so a cached one can
  // never be stale - a code change produces a different name. Cache-first
  // keeps lazily-loaded route chunks working when the laptop is briefly
  // unreachable, which is otherwise a blank screen on the tablet.
  if (url.pathname.includes('/assets/')) {
    event.respondWith(serveAsset(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE)
        return (await cache.match('./index.html')) ?? Response.error()
      })
    )
  }
})

/** Content-hashed build assets: cache-first, filled in on first miss. */
async function serveAsset(request) {
  const cache = await caches.open(SHELL_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function serveMedia(request) {
  const cache = await caches.open(MEDIA_CACHE)
  const range = request.headers.get('range')

  // Cache.match ignores Range, so a ranged request still finds the whole
  // stored response - but the element needs a real 206 back or it treats
  // the source as unplayable. Slice it here rather than going to network.
  const cached = await cache.match(request, { ignoreSearch: true })
  if (cached) {
    return range ? buildRangeResponse(cached, range) : cached
  }

  // Not cached yet. Ranged misses go straight to the network: storing a
  // partial response would poison the cache for every later request.
  if (range) return fetch(request)

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

/** Turn a cached 200 into the 206 a media element expects. */
async function buildRangeResponse(cached, rangeHeader) {
  const buffer = await cached.arrayBuffer()
  const total = buffer.byteLength

  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader)
  if (!match) return cached

  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1

  if (Number.isNaN(start) || start >= total) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${total}` },
    })
  }

  const headers = new Headers(cached.headers)
  headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
  headers.set('Content-Length', String(end - start + 1))
  headers.set('Accept-Ranges', 'bytes')

  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers,
  })
}
