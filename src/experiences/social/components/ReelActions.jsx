import { FiMessageCircle, FiRepeat, FiBookmark } from "react-icons/fi";
import LikeButton from "./LikeButton";
import FloatingHearts from "./FloatingHearts";

// Deterministic per-post pseudo-random count so comment/share/save numbers
// look real and vary between reels, without needing real backing data —
// these three actions are static UI only, matching the reference design.
function pseudoCount(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (hash % (max - min + 1));
}

function StaticAction({ icon: Icon, count }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
        <Icon size="1.375rem" />
      </span>
      <span className="text-[0.6875rem] font-semibold text-white drop-shadow-md">{count}</span>
    </div>
  );
}

export default function ReelActions({ postId, liked, likeCount, onToggleLike, burstKey = 0, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <FloatingHearts burstKey={burstKey} className="bottom-full left-1/2 h-40 w-1 -translate-x-1/2" />
        <LikeButton liked={liked} likeCount={likeCount} onToggle={onToggleLike} />
      </div>
      <StaticAction icon={FiMessageCircle} count={pseudoCount(`${postId}-comments`, 3, 42)} />
      <StaticAction icon={FiRepeat} count={pseudoCount(`${postId}-shares`, 1, 18)} />
      <StaticAction icon={FiBookmark} count={pseudoCount(`${postId}-saves`, 2, 30)} />
    </div>
  );
}
