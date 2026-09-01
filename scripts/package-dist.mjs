/**
 * Post-build packaging.
 *
 *  1. Prune media from dist/ that no config references, so a build never
 *     ships working files (old encodes, retired brochures, stray clips).
 *  2. Zip the result into release/ as a folder-rooted archive, so
 *     extracting it into XAMPP's htdocs produces htdocs/tide-journey/.
 *
 * The keep-list is derived from the same config the app reads, so adding
 * or removing an asset there is all that is needed - this script does not
 * hold its own copy of the file names.
 *
 * Run automatically by `npm run build`.
 */
import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const RELEASE = join(ROOT, 'release')

/** Name of the folder the zip extracts to - keep in step with the XAMPP path. */
const DEPLOY_NAME = 'tide-journey'

/**
 * Read the keep-list out of the config sources.
 *
 * These are parsed rather than imported: the app's modules use
 * extensionless and asset imports that Vite resolves but plain Node does
 * not, and a build script should not need a bundler to run.
 */
/** Windows paths use backslashes; the keep-list is written with '/'. */
const toPosix = (path) => path.split(sep).join('/')

async function readSource(relPath) {
  return readFile(join(ROOT, relPath), 'utf8')
}

/** Every media path the built app can ask for, relative to dist/media/. */
async function buildKeepList() {
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

  if (keep.size === 0) {
    throw new Error('Keep-list is empty - refusing to prune every media file')
  }
  return keep
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

async function pruneMedia() {
  const mediaDir = join(DIST, 'media')
  try {
    await stat(mediaDir)
  } catch {
    return { removed: 0, bytes: 0 }
  }

  const keep = await buildKeepList()
  let removed = 0
  let bytes = 0

  for await (const path of walk(mediaDir)) {
    // Normalise Windows separators so the keep-list can use '/'.
    const rel = toPosix(relative(mediaDir, path))
    if (keep.has(rel)) continue
    bytes += (await stat(path)).size
    await rm(path)
    removed += 1
  }

  // Drop directories the pruning emptied.
  let emptied = true
  while (emptied) {
    emptied = false
    for await (const dir of walkDirs(mediaDir)) {
      if ((await readdir(dir)).length === 0) {
        await rm(dir, { recursive: true })
        emptied = true
      }
    }
  }

  return { removed, bytes }
}

async function* walkDirs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = join(dir, entry.name)
    yield* walkDirs(path)
    yield path
  }
}

async function directorySize(dir) {
  let total = 0
  for await (const path of walk(dir)) total += (await stat(path)).size
  return total
}

/**
 * Zip dist/ so the archive contains a single top-level folder.
 *
 * Staging a renamed copy of dist/ is what puts the deploy folder at the
 * root of the archive, so extracting into htdocs/ yields
 * htdocs/<DEPLOY_NAME>/ rather than loose files.
 *
 * Prefers the `zip` CLI when present: PowerShell's Compress-Archive
 * writes Windows backslash separators into the entry names, which some
 * extractors (and any Linux host serving the tablets) mis-handle.
 */
async function zipDist() {
  await mkdir(RELEASE, { recursive: true })
  const staged = join(RELEASE, DEPLOY_NAME)
  const zipPath = join(RELEASE, `${DEPLOY_NAME}.zip`)

  await rm(staged, { recursive: true, force: true })
  await rm(zipPath, { force: true })
  await cp(DIST, staged, { recursive: true })

  try {
    await run('zip', ['-r', '-q', '-9', zipPath, DEPLOY_NAME], { cwd: RELEASE })
  } catch {
    // No zip CLI - fall back to PowerShell and repair the separators.
    await run('powershell', [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path '${staged}' -DestinationPath '${zipPath}' -CompressionLevel Optimal`,
    ])
  }

  await rm(staged, { recursive: true, force: true })
  return { zipPath, size: (await stat(zipPath)).size }
}

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`

const { removed, bytes } = await pruneMedia()
if (removed) {
  console.log(`Pruned ${removed} unreferenced media file(s), ${mb(bytes)}`)
}
console.log(`dist/ is ${mb(await directorySize(DIST))}`)

const { zipPath, size } = await zipDist()
console.log(`Packaged ${relative(ROOT, zipPath)} (${mb(size)})`)
console.log(`Extract into XAMPP htdocs/ to get htdocs/${DEPLOY_NAME}/`)
