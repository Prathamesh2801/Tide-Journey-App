import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiHeart } from "react-icons/fi";
import { useVideoPlayback } from "../context/useVideoPlayback";
import ReelActions from "./ReelActions";
import ReelInfo from "./ReelInfo";
import { VIDEO_CONFIG } from "../config";

const {
  doubleTapWindowMs: DOUBLE_TAP_WINDOW_MS,
  visibilityPlayThreshold: VISIBILITY_PLAY_THRESHOLD,
} = VIDEO_CONFIG;

function VideoReel({ post, liked, likeCount, onToggleLike }) {
  const videoRef = useRef(null);
  const articleRef = useRef(null);
  const { requestPlay, notifyStopped, audioUnlocked } = useVideoPlayback();

  // The <video> element mounts once the tile is near the viewport; whether
  // it's actually playing is driven purely by scroll visibility below, the
  // same way Reels/Shorts auto-play the reel currently on screen.
  const [started, setStarted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(!audioUnlocked);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const tapTimeoutRef = useRef(null);
  const pendingTapRef = useRef(null);
  const desiredActiveRef = useRef(false);

  const triggerBurst = () => setBurstKey((k) => k + 1);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return undefined;

    // `started` is two-way: the <video> mounts as the reel approaches and
    // unmounts once it is well clear of the viewport. Leaving it mounted
    // meant every reel scrolled past kept a decoder and its buffered data
    // alive, which on a 4GB tablet in a long kiosk session is what makes
    // scrolling progressively stutter.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStarted(entry.isIntersecting);
        setIsActive(entry.intersectionRatio >= VISIBILITY_PLAY_THRESHOLD);
      },
      { threshold: [0, VISIBILITY_PLAY_THRESHOLD], rootMargin: "25% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!started || !el) return undefined;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      notifyStopped(el);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("playing", onPlaying);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("playing", onPlaying);
    };
  }, [started, notifyStopped]);

  // Entering the active zone always (re)starts playback — even after a
  // manual pause — matching how Reels/Shorts resume a clip once it's back
  // on screen. Unmuted playback is attempted first; if the browser blocks
  // audio (no user gesture yet this session), it falls back to muted so
  // the video still plays instead of freezing on the poster frame.
  //
  // el.play() is asynchronous. On a fast scroll-through, isActive can flip
  // true then false again before that promise settles — at the moment this
  // effect re-runs with isActive=false, el.paused is often still true (the
  // browser hasn't actually started playback yet), so the pause branch has
  // nothing to do. Without desiredActiveRef, playback (with audio) would
  // then silently begin once the promise resolves, for a reel that already
  // scrolled out of view. The ref lets the .then() catch that and pause
  // immediately instead of leaving stray audio running.
  useEffect(() => {
    const el = videoRef.current;
    if (!started || !el) return undefined;

    desiredActiveRef.current = isActive;

    if (isActive) {
      requestPlay(el);
      el.muted = !audioUnlocked;
      setIsMuted(el.muted);
      setIsBuffering(true);
      el.play()
        .then(() => {
          if (!desiredActiveRef.current) el.pause();
        })
        .catch(() => {
          el.muted = true;
          setIsMuted(true);
          el.play()
            .then(() => {
              if (!desiredActiveRef.current) el.pause();
            })
            .catch(() => setIsBuffering(false));
        });
    } else if (!el.paused) {
      el.pause();
    }
  }, [started, isActive, audioUnlocked, requestPlay]);

  const togglePlayPause = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      desiredActiveRef.current = true;
      requestPlay(el);
      el.play()
        .then(() => {
          if (!desiredActiveRef.current) el.pause();
        })
        .catch(() => {});
    } else {
      desiredActiveRef.current = false;
      el.pause();
    }
  };

  const likeFromDoubleTap = () => {
    if (!liked) onToggleLike();
    triggerBurst();
  };

  const handleTap = () => {
    if (pendingTapRef.current) {
      window.clearTimeout(tapTimeoutRef.current);
      pendingTapRef.current = false;
      likeFromDoubleTap();
      return;
    }

    pendingTapRef.current = true;
    tapTimeoutRef.current = window.setTimeout(() => {
      pendingTapRef.current = false;
      togglePlayPause();
    }, DOUBLE_TAP_WINDOW_MS);
  };

  useEffect(() => () => window.clearTimeout(tapTimeoutRef.current), []);

  const toggleMute = (event) => {
    event.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  return (
    <article
      ref={articleRef}
      className="relative h-full w-full select-none overflow-hidden bg-tide-navy"
      onClick={handleTap}
    >
      {/* Nothing inside a reel renders until it is near the viewport.
          `started` already gated the <video>; everything else used to stay
          mounted for every post the feed had ever loaded - up to 96 of
          them. That left ~90 full-screen shimmer skeletons repainting
          (a lazy poster never loads, so posterLoaded never flips), plus a
          40px blur layer and five backdrop-filters each. The feed got
          progressively slower the further it was scrolled, while the
          single-video experiences on the same tablet stayed smooth. */}
      {started && (
        <>
        {!posterLoaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}

        {/* Blurred fill behind the media. The clips are 9:16 but the tablet
            viewport is nearer 3:4, so containing them leaves bars - this is
            how Reels/Shorts fill that space instead of cropping the frame. */}
        <img
          src={post.thumb}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-opacity duration-300 ${
            posterLoaded ? "opacity-60" : "opacity-0"
          }`}
        />

        <img
          src={post.thumb}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setPosterLoaded(true)}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
            posterLoaded ? "opacity-100" : "opacity-0"
          } pointer-events-none`}
        />

        <video
          ref={videoRef}
          src={post.src}
          poster={post.thumb}
          preload="metadata"
          playsInline
          loop
          className="absolute inset-0 h-full w-full object-contain"
        />

        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="h-8 w-8 animate-spin rounded-full border-[0.1875rem] border-white/30 border-t-white" />
          </div>
        )}

        {!isBuffering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white transition-opacity duration-200"
              style={{ opacity: isPlaying ? 0 : 1 }}
            >
              {isPlaying ? (
                <FiPause size="1.5rem" />
              ) : (
                <FiPlay size="1.75rem" className="translate-x-0.5" />
              )}
            </span>
          </div>
        )}

        <AnimatePresence>
          {burstKey > 0 && (
            <motion.div
              key={burstKey}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 1, 1, 1, 0], scale: [0.2, 1.85, 1.25, 1.5, 1.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, times: [0, 0.35, 0.55, 0.75, 1], ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <FiHeart className="fill-[#ff3040] text-[#ff3040] drop-shadow-[0_4px_18px_rgba(255,48,64,0.55)]" size="8.5rem" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={isMuted ? "Unmute" : "Mute"}
          onClick={toggleMute}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white"
        >
          {isMuted ? <FiVolumeX size="1.125rem" /> : <FiVolume2 size="1.125rem" />}
        </button>

        <ReelActions
          postId={post.id}
          liked={liked}
          likeCount={likeCount}
          onToggleLike={() => {
            onToggleLike();
            if (!liked) triggerBurst();
          }}
          burstKey={burstKey}
          className="absolute bottom-32 right-3"
        />

        <ReelInfo postId={post.id} className="absolute bottom-32 left-3 right-20" />
        </>
      )}
    </article>
  );
}

export default memo(VideoReel);
