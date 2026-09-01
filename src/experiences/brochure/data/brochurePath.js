// Every brochure image is resolved through here so no component hard-codes
// a path. When the offline media cache lands (services/media), this is the
// single place that has to start returning a cached blob URL instead.
//
// BASE_URL keeps the path correct whether the build is served from the
// XAMPP root or a subfolder.
const BROCHURE_BASE = `${import.meta.env.BASE_URL}media/brochures/`

/** Cover image used on the grid. */
export function brochureThumbUrl(slug) {
  return `${BROCHURE_BASE}${slug}/thumb.webp`
}

/** A single page, 1-indexed to match the printed page numbering. */
export function brochurePageUrl(slug, pageNumber) {
  const padded = String(pageNumber).padStart(2, '0')
  return `${BROCHURE_BASE}${slug}/page-${padded}.webp`
}
