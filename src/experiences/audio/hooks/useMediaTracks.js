import { useEffect, useState } from 'react'
import { getMediaEntries } from '../../../config/media'
import { resolveMediaUrl } from '../../../services/media'

/**
 * Resolve a list of media ids into playable tracks.
 *
 * Async because the future cache lookup is async; the effect is guarded
 * so a late resolve for a previous id list cannot overwrite a newer one.
 */
export function useMediaTracks(mediaIds) {
  const [tracks, setTracks] = useState([])
  const key = mediaIds.join(',')

  useEffect(() => {
    let active = true
    const entries = getMediaEntries(key ? key.split(',') : [])

    Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        url: await resolveMediaUrl(entry.id),
      }))
    ).then((resolved) => {
      if (active) setTracks(resolved.filter((track) => track.url))
    })

    return () => {
      active = false
    }
  }, [key])

  return tracks
}
