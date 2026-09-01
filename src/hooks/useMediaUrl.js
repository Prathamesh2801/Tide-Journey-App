import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '../services/media'

const LOADING = { url: null, status: 'loading' }

/**
 * Resolve a media id to a playable URL.
 *
 * Async because the future cache lookup will be async. The pending id is
 * tracked alongside the result so a change of `mediaId` reports
 * "loading" during the same render that requested it, without a second
 * setState pass - and the effect is guarded so a late resolve for a
 * previous id can never overwrite a newer one.
 */
export function useMediaUrl(mediaId) {
  const [resolved, setResolved] = useState({ mediaId: null, ...LOADING })

  useEffect(() => {
    let active = true

    resolveMediaUrl(mediaId)
      .then((url) => {
        if (!active) return
        setResolved({ mediaId, url, status: url ? 'ready' : 'missing' })
      })
      .catch(() => {
        if (active) setResolved({ mediaId, url: null, status: 'missing' })
      })

    return () => {
      active = false
    }
  }, [mediaId])

  return resolved.mediaId === mediaId ? resolved : LOADING
}
