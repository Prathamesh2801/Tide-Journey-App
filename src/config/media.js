/**
 * Media manifest - the single registry of every asset the app can play.
 *
 * Components never hard-code a file path; they reference a media id and
 * let services/media resolve it. That indirection is what lets the
 * storage strategy move to Cache Storage / IndexedDB later without any
 * component change.
 *
 * Source files live in docs/raw/ and are preprocessed into the media
 * package under public/media/. Audio is normalised to MP3 128kbps stereo
 * at -16 LUFS, so every clip plays back at a matched volume and decodes
 * natively in Android WebView.
 */
export const MEDIA = {
  'dsm-anupama': {
    id: 'dsm-anupama',
    path: 'audio/anupama.mp3',
    kind: 'audio',
    title: 'Anupama',
    subtitle: 'Disruptive Social Maximization',
    durationSeconds: 18,
    bytes: 290524,
    version: 1,
  },
  'dsm-himesh': {
    id: 'dsm-himesh',
    path: 'audio/himesh.mp3',
    kind: 'audio',
    title: 'Himesh',
    subtitle: 'Disruptive Social Maximization',
    durationSeconds: 46,
    bytes: 736905,
    version: 1,
  },
}

export function getMediaEntry(mediaId) {
  return MEDIA[mediaId] ?? null
}

export function getMediaEntries(mediaIds) {
  return mediaIds.map(getMediaEntry).filter(Boolean)
}
