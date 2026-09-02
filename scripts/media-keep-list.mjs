/**
 * The single source of truth for "which media files actually ship".
 *
 * Shared by the dist pruner and the service worker manifest so the two
 * can never disagree about what is deployed.
 *
 * Config files are parsed rather than imported: the app's modules use
 * extensionless and asset imports that Vite resolves but plain Node does
 * not, and a build script should not need a bundler to run.
 */
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function readSource(relPath) {
  return readFile(join(ROOT, relPath), 'utf8')
}

/** Every media path the built app can ask for, relative to dist/media/. */
export async function buildKeepList() {
  const keep = new Set()

  // config/media.js - audio and any other manifest entries.
  const media = await readSource('src/config/media.js')
  for (const [, path] of media.matchAll(/path:\s*['"]([^'"]+)['"]/g)) {
    keep.add(path)
  }

  // Social feed clips: one name yields a video and its thumbnail.
  const videos = await readSource('src/experiences/social/data/feedVideos.js')
  const clipBlock = videos.match(/const CLIPS = \[([\s\S]*?)\]/)
  for (const [, name] of (clipBlock?.[1] ?? '').matchAll(/['"]([^'"]+)['"]/g)) {
    keep.add(`social/videos/${name}.mp4`)
    keep.add(`social/thumbnails/${name}.jpg`)
  }

  // Social feed images: a numeric range of post-N.webp.
  const images = await readSource('src/experiences/social/data/feedImages.js')
  const imageBlock = images.match(/\[([\d,\s]+)\]\.map/)
  for (const index of (imageBlock?.[1] ?? '').split(',')) {
    const trimmed = index.trim()
    if (trimmed) keep.add(`social/images/post-${trimmed}.webp`)
  }

  // Brochures: cover plus every page.
  const brochures = await readSource('src/config/brochures.js')
  for (const entry of brochures.matchAll(
    /slug:\s*['"]([^'"]+)['"][\s\S]*?pageCount:\s*(\d+)/g
  )) {
    const [, slug, count] = entry
    keep.add(`brochures/${slug}/thumb.webp`)
    for (let page = 1; page <= Number(count); page += 1) {
      keep.add(`brochures/${slug}/page-${String(page).padStart(2, '0')}.webp`)
    }
  }

  // Retail: a single looping film named in the experience module.
  const retail = await readSource('src/experiences/retail/data/retailVideo.js')
  for (const [, name] of retail.matchAll(
    /RETAIL_VIDEO\s*=\s*['"]([^'"]+)['"]/g
  )) {
    keep.add(`retail/${name}.mp4`)
  }

  if (keep.size === 0) {
    throw new Error('Keep-list is empty - refusing to prune every media file')
  }
  return keep
}
