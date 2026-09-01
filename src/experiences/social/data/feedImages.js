import { socialMediaUrl } from "./mediaPath";

export const FEED_IMAGES = [0, 1, 2, 3, 4].map((i) =>
  socialMediaUrl(`images/post-${i}.webp`)
);
