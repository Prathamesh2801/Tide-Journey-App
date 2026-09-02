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
import { createWriteStream } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateRawSync } from 'node:zlib'
import { buildKeepList } from './media-keep-list.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const RELEASE = join(ROOT, 'release')

/** Name of the folder the zip extracts to - keep in step with the XAMPP path. */
const DEPLOY_NAME = 'tide-journey'

/** Windows paths use backslashes; the keep-list is written with '/'. */
const toPosix = (path) => path.split(sep).join('/')


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

/** CRC-32 (the ZIP variant), built lazily on first use. */
let crcTable
function crc32(buffer) {
  if (!crcTable) {
    crcTable = new Int32Array(256)
    for (let i = 0; i < 256; i += 1) {
      let value = i
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
      }
      crcTable[i] = value
    }
  }
  let crc = -1
  for (let i = 0; i < buffer.length; i += 1) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ -1) >>> 0
}

/**
 * Already-compressed formats. Deflating these buys nothing and costs
 * minutes on a 105 MB media package, so they are stored verbatim.
 */
const STORED_EXTENSIONS = new Set([
  '.mp4', '.mp3', '.jpg', '.jpeg', '.png', '.webp', '.woff2', '.zip', '.gz',
])

/** ZIP records timestamps as a packed MS-DOS date/time pair. */
function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear())
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
  }
}

/**
 * Write a ZIP archive with forward-slash entry names.
 *
 * Written here rather than shelled out because neither available tool is
 * safe: the `zip` CLI is not present on a stock Windows box, and
 * PowerShell's Compress-Archive writes Windows *backslash* separators
 * into the entry names. Extractors then read
 * `tide-journey\media\...\reel-0.mp4` as one long filename rather than a
 * path, so the whole media tree silently fails to appear and the tablets
 * get an app with no video in it.
 *
 * Only stored/deflated entries and a plain end-of-central-directory are
 * emitted - no ZIP64, which the ~105 MB package is nowhere near needing.
 */
async function writeZip(zipPath, entries) {
  const out = createWriteStream(zipPath)
  const write = (buffer) =>
    new Promise((res, rej) => out.write(buffer, (err) => (err ? rej(err) : res())))

  const central = []
  let offset = 0

  for (const entry of entries) {
    const data = await readFile(entry.path)
    const name = Buffer.from(entry.name, 'utf8')
    const stored = STORED_EXTENSIONS.has(extname(entry.name).toLowerCase())
    const body = stored ? data : deflateRawSync(data, { level: 9 })
    const method = stored ? 0 : 8
    const crc = crc32(data)
    const { date, time } = dosDateTime(entry.mtime)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)

    await write(local)
    await write(name)
    await write(body)

    const record = Buffer.alloc(46)
    record.writeUInt32LE(0x02014b50, 0)
    record.writeUInt16LE(20, 4)
    record.writeUInt16LE(20, 6)
    record.writeUInt16LE(0, 8)
    record.writeUInt16LE(method, 10)
    record.writeUInt16LE(time, 12)
    record.writeUInt16LE(date, 14)
    record.writeUInt32LE(crc, 16)
    record.writeUInt32LE(body.length, 20)
    record.writeUInt32LE(data.length, 24)
    record.writeUInt16LE(name.length, 28)
    record.writeUInt32LE(0, 30) // extra + comment length
    record.writeUInt32LE(0, 34) // disk number + internal attrs
    record.writeUInt32LE(0, 38) // external attrs
    record.writeUInt32LE(offset, 42)
    central.push(Buffer.concat([record, name]))

    offset += local.length + name.length + body.length
  }

  const centralStart = offset
  for (const record of central) {
    await write(record)
    offset += record.length
  }

  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(central.length, 8)
  end.writeUInt16LE(central.length, 10)
  end.writeUInt32LE(offset - centralStart, 12)
  end.writeUInt32LE(centralStart, 16)
  await write(end)

  await new Promise((res, rej) => {
    out.on('finish', res)
    out.on('error', rej)
    out.end()
  })
}

/**
 * Zip dist/ so the archive contains a single top-level folder.
 *
 * The DEPLOY_NAME prefix is applied to the entry names directly, so
 * extracting into htdocs/ yields htdocs/<DEPLOY_NAME>/ without staging a
 * second 105 MB copy of dist/ on disk first.
 */
async function zipDist() {
  await mkdir(RELEASE, { recursive: true })
  const zipPath = join(RELEASE, `${DEPLOY_NAME}.zip`)
  await rm(zipPath, { force: true })

  const entries = []
  for await (const path of walk(DIST)) {
    entries.push({
      path,
      name: `${DEPLOY_NAME}/${toPosix(relative(DIST, path))}`,
      mtime: (await stat(path)).mtime,
    })
  }
  entries.sort((a, b) => a.name.localeCompare(b.name))

  await writeZip(zipPath, entries)
  return { zipPath, size: (await stat(zipPath)).size, count: entries.length }
}

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`

const { removed, bytes } = await pruneMedia()
if (removed) {
  console.log(`Pruned ${removed} unreferenced media file(s), ${mb(bytes)}`)
}
console.log(`dist/ is ${mb(await directorySize(DIST))}`)

const { zipPath, size, count } = await zipDist()
console.log(`Packaged ${relative(ROOT, zipPath)} (${count} files, ${mb(size)})`)
console.log(`Extract into XAMPP htdocs/ to get htdocs/${DEPLOY_NAME}/`)
