/**
 * Brochure manifest - one entry per PDF shown in the Brochure experience.
 *
 * GENERATED FILE - do not edit by hand.
 * Regenerate with:  python scripts/build-brochures.py
 *
 * Page images are pre-rendered from the source PDFs in
 * docs/raw/pdf/Brochures/. The tablet only ever loads WebP images, so
 * there is no PDF library in the bundle and no per-page decoding on
 * device.
 *
 * To change the brochures: replace the PDFs in that folder and re-run
 * the script. Titles come from the filenames.
 */
export const BROCHURES = [
  {
    id: 'the-tide-wave-x-dehradun-edition',
    slug: 'the-tide-wave-x-dehradun-edition',
    title: 'Dehradun',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-delhi-edition',
    slug: 'the-tide-wave-x-delhi-edition',
    title: 'Delhi',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-ghaziabad-edition',
    slug: 'the-tide-wave-x-ghaziabad-edition',
    title: 'Ghaziabad',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-guwahati-edition',
    slug: 'the-tide-wave-x-guwahati-edition',
    title: 'Guwahati',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-haryana-edition',
    slug: 'the-tide-wave-x-haryana-edition',
    title: 'Haryana',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-jammu-edition',
    slug: 'the-tide-wave-x-jammu-edition',
    title: 'Jammu',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-kanpur-edition',
    slug: 'the-tide-wave-x-kanpur-edition',
    title: 'Kanpur',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-kolkata-edition',
    slug: 'the-tide-wave-x-kolkata-edition',
    title: 'Kolkata',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-lucknow-edition',
    slug: 'the-tide-wave-x-lucknow-edition',
    title: 'Lucknow',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-orissa-edition',
    slug: 'the-tide-wave-x-orissa-edition',
    title: 'Orissa',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-patna-edition',
    slug: 'the-tide-wave-x-patna-edition',
    title: 'Patna',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-punjab-edition',
    slug: 'the-tide-wave-x-punjab-edition',
    title: 'Punjab',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-rajasthan-edition',
    slug: 'the-tide-wave-x-rajasthan-edition',
    title: 'Rajasthan',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-ranchi-edition',
    slug: 'the-tide-wave-x-ranchi-edition',
    title: 'Ranchi',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-srinagar-edition',
    slug: 'the-tide-wave-x-srinagar-edition',
    title: 'Srinagar',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
  {
    id: 'the-tide-wave-x-varanasi-edition',
    slug: 'the-tide-wave-x-varanasi-edition',
    title: 'Varanasi',
    subtitle: 'The Tide Wave Edition',
    pageCount: 8,
    portrait: true,
  },
]

export function getBrochureById(id) {
  return BROCHURES.find((brochure) => brochure.id === id) ?? null
}
