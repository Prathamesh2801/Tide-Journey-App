import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import ReelActions from "./ReelActions";
import ReelInfo from "./ReelInfo";

function ImageReel({ post, liked, likeCount, onToggleLike }) {
  const [burstKey, setBurstKey] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef(null);
  const lastTapRef = useRef(0);

  // Mirrors VideoReel: a reel well clear of the viewport renders nothing.
  // Left mounted, every image post the feed had loaded kept a full-screen
  // shimmer skeleton repainting, a 40px blur layer and four
  // backdrop-filters alive, which is what made the feed slow down the
  // further it was scrolled.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setStarted(entry.isIntersecting),
      { rootMargin: "25% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const triggerBurst = () => setBurstKey((k) => k + 1);

  const handleTap = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;
    if (isDoubleTap) {
      if (!liked) onToggleLike();
      triggerBurst();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden bg-tide-navy"
      onClick={handleTap}
    >
      {started && (
        <>
        {!imgLoaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}

        {/* Blurred fill behind the photo, matching VideoReel: the posts are
            square and the tablet viewport is not, so containing them leaves
            bars that would otherwise read as dead space. */}
        <img
          src={post.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-opacity duration-300 ${
            imgLoaded ? "opacity-60" : "opacity-0"
          }`}
        />

        <img
          src={post.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setImgLoaded(true)}
          className={`relative h-full w-full object-contain transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

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
    </div>
  );
}

export default memo(ImageReel);
