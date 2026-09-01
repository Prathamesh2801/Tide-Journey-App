import { socialMediaUrl } from "./mediaPath";

// All source clips are native 9:16 portrait (1080x1920 or 720x1280).
//
// Unlike the standalone reference app these are not bundled imports: the
// clips live in the media package under public/media/social/ and are
// resolved by URL, so the 97MB of video never passes through the build and
// can be shipped to the tablets separately.
const CLIPS = [
  "accident",
  "freshness",
  "twins-deep-clean",
  "short-1",
  "short-2",
  "short-3",
  "kol-1",
  "kol-2",
  "kol-3",
  "kol-4",
  "kol-5",
];

export const FEED_VIDEOS = CLIPS.map((name) => ({
  src: socialMediaUrl(`videos/${name}.mp4`),
  thumb: socialMediaUrl(`thumbnails/${name}.jpg`),
}));
