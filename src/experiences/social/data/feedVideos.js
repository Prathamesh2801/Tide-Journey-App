import { socialMediaUrl } from "./mediaPath";

// All source clips are native 9:16 portrait (1080x1920 or 720x1280).
//
// Unlike the standalone reference app these are not bundled imports: the
// clips live in the media package under public/media/social/ and are
// resolved by URL, so the video never passes through the build and can be
// shipped to the tablets separately.
//
// Names are the delivered reel numbers, kept as-is so a clip on the
// tablet can be traced back to the file that was supplied. The gap at 6
// is in the delivery, not a missing file.
const CLIPS = [
  "reel-0",
  "reel-1",
  "reel-2",
  "reel-3",
  "reel-4",
  "reel-5",
  "reel-7",
  "reel-8",
];

export const FEED_VIDEOS = CLIPS.map((name) => ({
  src: socialMediaUrl(`videos/${name}.mp4`),
  thumb: socialMediaUrl(`thumbnails/${name}.jpg`),
}));
