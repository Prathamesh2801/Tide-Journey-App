/**
 * Brochure manifest - one entry per PDF shown in the Brochure experience.
 *
 * Page images are pre-rendered from the source PDFs by
 * `scripts/build-brochures.py`, which prints an updated version of this
 * array when it runs. The tablet only ever loads WebP images, so there is
 * no PDF library in the bundle and no per-page decoding on device.
 *
 * To change the brochures:
 *   1. put the new PDFs in docs/raw/pdf/  (remove any that are going)
 *   2. python scripts/build-brochures.py
 *   3. paste the printed array below and edit the titles/subtitles
 */
export const BROCHURES = [
  {
    id: 'image-doc',
    slug: 'image-doc',
    title: 'Nature Landscape',
    subtitle: 'Photography showcase',
    pageCount: 6,
  },
  {
    id: 'sample-10-page-pdf-a4-size',
    slug: 'sample-10-page-pdf-a4-size',
    title: 'Product Overview',
    subtitle: '10 page A4 document',
    pageCount: 10,
  },
  {
    id: 'sample-text-only-pdf-a4-size',
    slug: 'sample-text-only-pdf-a4-size',
    title: 'Specification Sheet',
    subtitle: 'Text only reference',
    pageCount: 5,
  },
  {
    id: 'file-example-pdf-1mb',
    slug: 'file-example-pdf-1mb',
    title: 'Extended Catalogue',
    subtitle: '30 page sample',
    pageCount: 30,
  },
]

export function getBrochureById(id) {
  return BROCHURES.find((brochure) => brochure.id === id) ?? null
}
