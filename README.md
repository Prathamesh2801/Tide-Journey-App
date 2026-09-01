# Tide Journey

Offline-first React application for the Tide Journey tablet experience.
Built to run from a local LAN/XAMPP server on ~80 Lenovo K10 tablets
(Android 11, 4 GB RAM, 1920x1200) with no internet dependency at runtime.

## Stack

React 19 · Vite · JSX · TailwindCSS 4 · React Router · Framer Motion · React Icons

No TypeScript, no global state library. Fonts are self-hosted and all
assets are local, so nothing is fetched from a CDN at runtime.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run lint     # ESLint
npm run preview  # serve the production build
```

## Media package

Video, audio and image assets live in `public/media/` and are **not in
this repository** - they are delivered to each tablet separately. A fresh
clone will run, but the Social feed and audio experiences will be empty
until the package is copied in:

```
public/media/
├── social/
│   ├── videos/       11 x .mp4   (~60 MB)
│   ├── thumbnails/   11 x .jpg
│   └── images/        5 x .webp
└── audio/             2 x .mp3
```

Raw masters are kept outside the repo in `docs/raw/`.

## Structure

```
src/
├── config/          experiences.js (launcher + routes), media.js (asset manifest)
├── routes/          AppRoutes.jsx - launcher eager, experiences lazy-loaded
├── pages/           Launcher + one thin page per experience
├── components/      common/ layout/ media/ launcher/  (shared only)
├── experiences/     one self-contained folder per experience
│   ├── social/      Instagram-style reels feed
│   └── audio/       audio player with live visualiser
├── services/media/  offline media boundary (resolve/cache/validate)
├── hooks/  utils/
└── index.css        theme tokens, fonts, global styles
```

### Experiences

The launcher is generated from `src/config/experiences.js` - never
hard-coded. Each experience is an independent module so it can be
developed without touching the rest of the app.

| # | Experience | Medium | Status |
|---|------------|--------|--------|
| 01 | Social | Reels feed | Built |
| 02 | Disruptive Social Maximization | 2 audio tracks | Built |
| 03 | Retail | Video | Placeholder |
| 04 | Television & iVideo | 3 audio tracks | Placeholder - reuses the audio module |
| 05 | E-commerce | Interactive | Placeholder |

## Deployment

`vite.config.js` sets `base: './'` and routing uses `HashRouter`, so the
build works from the XAMPP document root or any subfolder without server
rewrite rules. Copy `dist/` plus the media package to the web root.

## Media preprocessing

Assets are normalised before shipping so they decode cheaply on the
tablet's MediaTek MT8768T:

- **Video** - H.264 Main, 720x1280, no B-frames, keyframe every 2s,
  capped bitrate, faststart. B-frames and sparse keyframes are the main
  cause of stutter on this class of decoder.
- **Audio** - MP3 128 kbps stereo, loudness-normalised to -16 LUFS so
  tracks play at a matched volume.
