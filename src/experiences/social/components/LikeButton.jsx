import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
  return String(n);
}

// The single action left in the UI, styled as a Reels/Shorts-style action
// button anchored to the media itself rather than a separate footer row.
export default function LikeButton({ liked, likeCount, onToggle, className = "" }) {
  return (
    <motion.button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      whileTap={{ scale: 0.85 }}
      className={`flex flex-col items-center gap-1 ${className}`}
    >
      <motion.span
        animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
      >
        <FiHeart
          size="1.375rem"
          className={liked ? "fill-tide-orange text-tide-orange" : "text-white"}
        />
      </motion.span>
      <span className="text-[0.6875rem] font-semibold text-white drop-shadow-md">
        {formatCount(likeCount)}
      </span>
    </motion.button>
  );
}
