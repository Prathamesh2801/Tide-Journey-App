// Every iVideo asset is resolved through here so no component hard-codes a
// path, matching how the retail, brochure and social modules do it.
//
// BASE_URL keeps the path correct whether the build is served from the
// XAMPP root or a subfolder.
const IVIDEO_BASE = `${import.meta.env.BASE_URL}media/ivideo/`

/** The advert itself. */
export function ivideoUrl(name) {
  return `${IVIDEO_BASE}${name}.mp4`
}

/**
 * First frame, shown while the video loads and as the thumbnail strip
 * image. Without it the player would flash black on every change.
 */
export function ivideoPosterUrl(name) {
  return `${IVIDEO_BASE}posters/${name}.jpg`
}
