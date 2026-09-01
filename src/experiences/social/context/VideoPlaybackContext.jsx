import { useEffect, useMemo, useRef, useState } from "react";
import { VideoPlaybackContext } from "./videoPlaybackContextObject";

// Enforces "only one video plays at a time" across the whole feed, and
// tracks whether the browser will allow autoplay WITH audio yet. Browsers
// block unmuted autoplay until the user has interacted with the page at
// least once, so the very first reel may start muted — after that first
// tap/scroll, every reel that scrolls into view autoplays with sound.
export function VideoPlaybackProvider({ children }) {
  const activeRef = useRef(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    if (audioUnlocked) return undefined;
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [audioUnlocked]);

  const value = useMemo(
    () => ({
      audioUnlocked,
      requestPlay(videoEl) {
        if (activeRef.current && activeRef.current !== videoEl) {
          activeRef.current.pause();
        }
        activeRef.current = videoEl;
      },
      notifyStopped(videoEl) {
        if (activeRef.current === videoEl) {
          activeRef.current = null;
        }
      },
    }),
    [audioUnlocked]
  );

  return <VideoPlaybackContext.Provider value={value}>{children}</VideoPlaybackContext.Provider>;
}
