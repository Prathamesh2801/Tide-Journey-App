// Every retail video is resolved through here so no component hard-codes a
// path, matching how the brochure and social modules do it.
//
// BASE_URL keeps the path correct whether the build is served from the
// XAMPP root or a subfolder.
const RETAIL_BASE = `${import.meta.env.BASE_URL}media/retail/`

/** Source file for the looping retail film. */
export function retailVideoUrl(name) {
  return `${RETAIL_BASE}${name}.mp4`
}
