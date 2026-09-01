import { getMediaEntry } from '../../config/media'

/**
 * Offline-first media boundary.
 *
 * Everything that needs a media file goes through `resolveMediaUrl` so
 * the storage strategy can change without touching a component.
 *
 * Current implementation serves from the local web root (Vite public/ in
 * dev, the XAMPP document root in production). The intended future
 * implementation checks a device-local copy in Cache Storage or
 * IndexedDB first and only falls back to the server. localStorage is
 * never used - it cannot hold video.
 *
 * Keep this module free of React imports: plain async logic only.
 */

/** Base path for media not yet cached on the device. Relative so it
 *  works from any XAMPP subdirectory. */
const MEDIA_BASE_PATH = './media/'

/**
 * Resolve a media id to a URL a <video> or <img> can consume.
 * Returns null for an unknown id so callers can render a clear
 * fallback instead of requesting a broken URL.
 */
export async function resolveMediaUrl(mediaId) {
  const entry = getMediaEntry(mediaId)
  if (!entry) return null
  return `${MEDIA_BASE_PATH}${entry.path}`
}

/** Whether a device-local copy exists. Always false until caching lands. */
export async function isMediaAvailable(_mediaId) {
  return false
}

/**
 * Download an asset into persistent device storage.
 * `onProgress` will receive a 0..1 fraction so a UI can show a bar.
 */
export async function downloadMedia(_mediaId, _onProgress) {
  throw new Error('downloadMedia is not implemented yet')
}

/** Remove a single cached asset from device storage. */
export async function removeCachedMedia(_mediaId) {
  throw new Error('removeCachedMedia is not implemented yet')
}

/** Cached version of an asset, for comparison against the manifest. */
export async function getMediaVersion(_mediaId) {
  return null
}

/** Verify a cached asset is complete (size / checksum) before playback. */
export async function validateMedia(_mediaId) {
  return false
}

/** Aggregate cache report for a future diagnostics screen. */
export async function getCacheStatus() {
  return {
    supported: false,
    totalAssets: 0,
    cachedAssets: 0,
    bytesUsed: 0,
    version: null,
  }
}
