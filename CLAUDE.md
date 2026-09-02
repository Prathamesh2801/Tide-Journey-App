# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

An offline-first React kiosk app for the **Tide Journey** event. It runs
from a local LAN/XAMPP server on ~80 Lenovo K10 tablets (Android 11, 4 GB
RAM, 1920x1200, MediaTek MT8768T) with **no internet at runtime**.

Every design decision follows from that: no CDN, no fonts from Google, no
analytics, self-hosted assets only, and media preprocessed so a cheap
decoder can play it without stutter.

## Commands

```bash
npm run dev         # vite --host (LAN-accessible dev server)
npm run build       # vite build -> prune media -> write sw-manifest -> zip to release/
npm run build:only  # vite build only, no pruning/zipping
npm run lint        # ESLint
npm run preview     # serve the production build
```

There is no test suite. Verification is `npm run lint` + `npm run build` +
opening the app.

## Stack

React 19 · Vite 8 · **JSX, not TypeScript** · TailwindCSS 4 (via
`@tailwindcss/vite`, no config file — theme tokens live in `src/index.css`)
· React Router (**HashRouter**) · Framer Motion · React Icons.

No global state library. Local `useState` plus a small context per
experience is the pattern; do not introduce Redux/Zustand.

## Architecture

```
src/
├── config/          experiences.js, media.js, brochures.js, access.js, app.js
├── routes/          AppRoutes.jsx - launcher eager, App01..App05 lazy
├── pages/           Launcher + one thin page per experience
├── components/      common/ layout/ media/ launcher/  (shared only)
├── experiences/     one self-contained folder per experience
│   ├── social/      Instagram-style reels feed        (app-01)
│   ├── audio/       audio player + live visualiser    (app-02)
│   ├── retail/      single looping film               (app-03)
│   ├── ivideo/      advert carousel                   (app-04)
│   └── brochure/    multi-page WebP page reader       (app-05)
├── services/media/  media resolution boundary
├── hooks/  utils/
└── index.css        theme tokens, self-hosted fonts, global styles
```

### Rules that matter

- **The launcher is generated from `src/config/experiences.js`.** Never
  hard-code a tile or a route target. Adding an experience means an entry
  there, a `pages/AppNN.jsx`, and a route in `AppRoutes.jsx`.
- **Each `experiences/<name>/` folder is self-contained** — its own
  `components/`, `data/`, `hooks/`. Only genuinely shared UI belongs in
  `src/components/`. Do not reach across experience folders.
- **Pages are thin.** A page wraps the experience in `ExperienceGate` and
  nothing else.
- **`ExperienceGate` takes children as a function**, not elements, so a
  locked experience never mounts — experiences start playback on mount.
- Comments here explain *why*, not *what*, and several encode hard-won
  device findings. Preserve them; match that style.

## Two media systems — know which one you are in

There are deliberately two, and they are not interchangeable.

1. **`config/media.js` + `services/media/resolveMediaUrl`** — the id-based
   manifest. Only the **audio** experience uses it. Components reference a
   media id; the service returns a URL. The indirection exists so storage
   can move behind it without touching a component.

2. **Per-experience path modules** — `social/data/mediaPath.js`,
   `ivideo/data/ivideoPath.js`, `retail/data/retailPath.js`,
   `brochure/data/brochurePath.js`. Each builds URLs under
   `import.meta.env.BASE_URL + media/...`. Video never goes through the
   config manifest, so it never passes through the Vite build.

Either way, **assets live in `public/media/` and are resolved by URL**.
Never `import` a video or a brochure page.

## The keep-list is the contract

`scripts/media-keep-list.mjs` derives, by **parsing config source with
regexes**, every media path the built app can request. Two consumers:

- `scripts/package-dist.mjs` — deletes anything in `dist/media/` not on
  the list, then zips `dist/` to `release/tide-journey.zip`.
- `scripts/build-sw-manifest.mjs` — writes `dist/sw-manifest.js`, the
  service worker's precache list, versioned by a hash of that list.

**Consequence:** if you change the shape of a config file, the regexes can
silently stop matching and the build will prune shipped media. The parsers
expect:

| File | Shape the regex needs |
|---|---|
| `config/media.js` | `path: 'audio/foo.mp3'` |
| `social/data/feedVideos.js` | a `const CLIPS = [ ... ]` array of stems |
| `social/data/feedImages.js` | `[0, 1, 2].map(...)` |
| `config/brochures.js` | `slug: '...'` followed by `pageCount: N` |
| `retail/data/retailVideo.js` | `RETAIL_VIDEO = 'stem'` |
| `ivideo/data/ivideos.js` | `name: 'stem'` per entry |

After any media or config change, run `npm run build` and check the file
count and MB reported on the `sw-manifest.js` line.

## Offline caching (`public/sw.js`)

- Media: **cache-first**, precached in batches of 4 on first load. A
  ranged request is served by slicing the cached 200 into a real 206 —
  a `<video>` element rejects a 200 for a range request.
- `/assets/` (content-hashed build output, including lazy route chunks):
  **cache-first**, precached — an uncached chunk is a blank screen if the
  laptop blips.
- Navigations: network-first, falling back to the cached `index.html`.
- Old `tide-*` caches are deleted on activate.

**Requires a secure context.** Plain `http://<lan-ip>/tide-journey` is not
one on a Lenovo K10; HTTPS from the same IP is. See
`deploy/XAMPP-HTTPS-SETUP.md`, then open `check.html` on a tablet to
verify. Without HTTPS the app still works — it just streams.

## Deployment

`base: './'` plus `HashRouter` mean the build runs from the XAMPP document
root or any subfolder with no rewrite rules. `npm run build` produces
`release/tide-journey.zip`; extract into `htdocs/` to get
`htdocs/tide-journey/`.

## Media package (not in git)

`public/media/` and `docs/` are **gitignored** — they are delivered to the
tablets separately. A fresh clone runs, but the experiences are empty.

```
public/media/
├── social/videos/*.mp4 + thumbnails/*.jpg + images/post-N.webp
├── audio/*.mp3
├── ivideo/*.mp4 + posters/*.jpg
├── retail/tide-loop.mp4
└── brochures/<slug>/page-NN.webp + thumb.webp
```

Raw masters live in `docs/raw/` (`audio/`, `iVideo/`, `insta/`, `pdf/`,
`retail/`).

### Preprocessing spec

Assets are normalised so they decode cheaply on the MT8768T. B-frames and
sparse keyframes are the main cause of stutter on this class of decoder.

- **Video** — H.264 **Main**, at most 720 px on the short edge (9:16
  portrait), 30 fps, `-bf 0`, keyframe every 2 s (`-g 60 -keyint_min 60
  -sc_threshold 0`), capped bitrate (~1.8 Mbps max), `-pix_fmt yuv420p`,
  `-movflags +faststart`. Audio AAC-LC 128 kbps 48 kHz stereo.
  **Never upscale** — use `scale='min(720,iw)':-2`.
- **Audio** — MP3 128 kbps stereo, loudness-normalised to -16 LUFS.
- **Brochures** — each PDF page pre-rendered to WebP at 1600 px on the
  long edge via `python scripts/build-brochures.py` (needs `pymupdf`). It
  regenerates `src/config/brochures.js`; that file is generated, so do not
  hand-edit it.
- **Reel thumbnails** — JPG poster frame grabbed ~1 s in (0 s is often a
  fade-in), at source resolution.

## Passcodes

`src/config/access.js` gates each experience. This is
**presentation-level access control for a kiosk, not security** — the
codes ship in the client bundle. Text codes match case-insensitively and
trimmed, because the tablet keyboard auto-capitalises and swipe input
appends a trailing space.

## Device gotchas already solved — do not regress them

- Reels **unmount the `<video>` once well clear of the viewport**
  (`VideoReel.jsx`). Leaving them mounted keeps a decoder plus buffered
  data alive per reel, and a long kiosk session progressively stutters.
- `el.play()` is async; `desiredActiveRef` catches a fast scroll-through
  where the promise resolves after the reel left the screen, which would
  otherwise leave stray audio playing.
- The precache posts to `registration.active`, not
  `navigator.serviceWorker.controller` — on a first visit the page is not
  yet controlled and `controller` is null.
- `ScreenLayout` centres with `my-auto`, not `justify-center`: a centred
  flex container that overflows pushes its first child above the
  scrollable area, where it can never be reached.
