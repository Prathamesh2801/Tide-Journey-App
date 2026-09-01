import { BsPatchCheckFill } from "react-icons/bs";
import tideLogo from "../../../assets/icons/logo.png";

// Static UI only — Follow and the caption are decorative, matching the
// reference design's account row (avatar, verified name, Follow, caption)
// that Reels/Shorts show bottom-left above the action dock.
const CAPTIONS = [
  { text: "Deep clean feels this good 💙", hashtag: "#TideDeepClean" },
  { text: "Freshness that lasts all day ✨", hashtag: "#TideFreshness" },
  { text: "One wash, zero doubts 🧺", hashtag: "#TideClean" },
  { text: "Clean clothes, happy moments 💫", hashtag: "#TideJourney" },
  { text: "This is what deep clean feels like", hashtag: "#TideDeepClean" },
  { text: "Stains don't stand a chance 🔥", hashtag: "#TideClean" },
  { text: "Tide Journey — real stories, real clean", hashtag: "#TideJourney" },
  { text: "Because clean should feel effortless", hashtag: "#TideFreshness" },
];

function pseudoIndex(seed, length) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

export default function ReelInfo({ postId, className = "" }) {
  const caption = CAPTIONS[pseudoIndex(postId, CAPTIONS.length)];

  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <img
          src={tideLogo}
          alt="Tide"
          className="h-8 w-8 shrink-0 rounded-full bg-white object-contain"
        />
        <span className="flex items-center gap-1 text-[0.9375rem] font-semibold text-white drop-shadow-md">
          tide.india
          <BsPatchCheckFill className="text-tide-blue" size="0.875rem" />
        </span>
        <button
          type="button"
          className="ml-1 shrink-0 rounded-full border border-white/70 px-3 py-1 text-xs font-semibold text-white"
        >
          Follow
        </button>
      </div>
      <p className="truncate text-[0.8125rem] font-medium text-white/90 drop-shadow-md">{caption.text}</p>
      <p className="truncate text-[0.9375rem] font-bold tracking-tight text-white drop-shadow-md">
        {caption.hashtag}
      </p>
    </div>
  );
}
