import { useCallback, useEffect, useRef, useState } from "react";
import { LIKES_CONFIG } from "../config";

const COUNTS_STORAGE_KEY = "tide-feed-like-counts";

// A shared kiosk has no login, so there's no way to tell "the same visitor
// toggling their like" apart from "the next visitor adding a new one" other
// than a pause in activity. After this much idle time we treat the next tap
// as a new visitor: their hearts start unfilled again, but the counts below
// (what everyone before them contributed) are untouched and keep growing.
const IDLE_RESET_MS = LIKES_CONFIG.idleResetMs;

function loadCounts() {
  try {
    const raw = localStorage.getItem(COUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useLikes() {
  const [counts, setCounts] = useState(loadCounts);
  const [sessionLiked, setSessionLiked] = useState({});
  const idleTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(counts));
    } catch {
      // storage unavailable (private mode / kiosk lockdown) — ignore
    }
  }, [counts]);

  useEffect(() => {
    const scheduleIdleReset = () => {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => setSessionLiked({}), IDLE_RESET_MS);
    };

    scheduleIdleReset();
    window.addEventListener("pointerdown", scheduleIdleReset);
    return () => {
      window.clearTimeout(idleTimerRef.current);
      window.removeEventListener("pointerdown", scheduleIdleReset);
    };
  }, []);

  const getCount = useCallback((postId, baseCount = 0) => counts[postId] ?? baseCount, [counts]);

  const isLiked = useCallback((postId) => Boolean(sessionLiked[postId]), [sessionLiked]);

  const toggleLike = useCallback(
    (postId, baseCount = 0) => {
      const nextLiked = !sessionLiked[postId];
      setSessionLiked((prev) => ({ ...prev, [postId]: nextLiked }));
      setCounts((prev) => {
        const current = prev[postId] ?? baseCount;
        const next = nextLiked ? current + 1 : Math.max(0, current - 1);
        return { ...prev, [postId]: next };
      });
    },
    [sessionLiked]
  );

  return { getCount, isLiked, toggleLike };
}
