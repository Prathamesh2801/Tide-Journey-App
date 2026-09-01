// Central place to tune feed/kiosk behavior without hunting through
// components. Every value here is read by exactly one place — see the
// comment on each group for where.

export const VIDEO_CONFIG = {
  // Used in VideoReel.jsx: a reel is treated as "on screen" once at least
  // this fraction of it is visible — crossing above autoplays it (with
  // audio, Reels-style), dropping below pauses it.
  visibilityPlayThreshold: 0.3,

  // Used in VideoReel.jsx: a tap that isn't followed by a second tap within
  // this window is treated as a real single tap (play/pause). A second tap
  // inside the window cancels the pending play/pause and likes instead.
  doubleTapWindowMs: 250,
};

export const LIKES_CONFIG = {
  // Used in useLikes.js: how long the kiosk waits with no touch input
  // before treating the next tap as a new visitor (their hearts reset to
  // unfilled, but everyone's cumulative like counts are untouched).
  idleResetMs: 10000,

  // Used in posts.js: each post's starting like count (before any real
  // attendee likes it) is a random number in this range, so the feed
  // doesn't look like it's starting from zero.
  baseLikesMin: 250,
  baseLikesMax: 320,
};

export const FEED_CONFIG = {
  // Used in useInfiniteFeed.js: how many posts load per page, and the
  // simulated network latency for each load (both initial + infinite scroll).
  pageSize: 8,
  maxPages: 12,
  simulatedLatencyMs: 550,
};
