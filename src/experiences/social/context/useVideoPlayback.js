import { useContext } from "react";
import { VideoPlaybackContext } from "./videoPlaybackContextObject";

export function useVideoPlayback() {
  const ctx = useContext(VideoPlaybackContext);
  if (!ctx) throw new Error("useVideoPlayback must be used within VideoPlaybackProvider");
  return ctx;
}
