import { memo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import ReelActions from "./ReelActions";
import ReelInfo from "./ReelInfo";

function ImageReel({ post, liked, likeCount, onToggleLike }) {
  const [burstKey, setBurstKey] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const lastTapRef = useRef(0);

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
      className="relative h-full w-full select-none overflow-hidden bg-tide-navy"
      onClick={handleTap}
    >
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
    </div>
  );
}

export default memo(ImageReel);
