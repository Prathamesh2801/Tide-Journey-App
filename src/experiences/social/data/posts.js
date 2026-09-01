// Dummy feed data for the Tide Journey event showcase.
// Photos and video clips are both bundled locally (see feedImages.js /
// feedVideos.js) so the kiosk never depends on an external service.

import { FEED_IMAGES } from "./feedImages";
import { FEED_VIDEOS } from "./feedVideos";
import { LIKES_CONFIG } from "../config";

// Grouped by type rather than interleaved: the full run of videos plays in
// sequence first, then the full run of images, then the cycle repeats.
const CYCLE_LENGTH = FEED_VIDEOS.length + FEED_IMAGES.length;

// Each post's starting like count is a genuinely random number in
// LIKES_CONFIG's range — tune the range in config.js.
function randomBaseLikes() {
  const { baseLikesMin, baseLikesMax } = LIKES_CONFIG;
  return baseLikesMin + Math.floor(Math.random() * (baseLikesMax - baseLikesMin + 1));
}

function buildItem(index) {
  if (index < FEED_VIDEOS.length) {
    const video = FEED_VIDEOS[index];
    return { type: "video", src: video.src, thumb: video.thumb };
  }

  const imgIndex = index - FEED_VIDEOS.length;
  return { type: "image", image: FEED_IMAGES[imgIndex] };
}

export function buildPost(index) {
  return {
    id: `post-${index}`,
    ...buildItem(index % CYCLE_LENGTH),
    likes: randomBaseLikes(),
  };
}

export function getPostPage(pageIndex, pageSize = 8) {
  const start = pageIndex * pageSize;
  return Array.from({ length: pageSize }, (_, i) => buildPost(start + i));
}
