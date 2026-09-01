import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import ReelsFeed from "./components/ReelsFeed";
import BottomNav from "./components/BottomNav";
import { VideoPlaybackProvider } from "./context/VideoPlaybackContext";

// Root of the Social (Instagram-style reels) experience.
//
// This mirrors the standalone Tide_Feed app's App.jsx: a full-bleed feed
// on a black stage with the floating bottom nav over it. The only addition
// is the back control, since here the feed is one experience inside the
// launcher rather than the whole application.
export default function SocialFeedExperience() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <VideoPlaybackProvider>
        <ReelsFeed />
      </VideoPlaybackProvider>

      <button
        type="button"
        aria-label="Back to launcher"
        onClick={() => navigate("/")}
        className="absolute left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm active:bg-black/70"
      >
        <FiArrowLeft size="1.375rem" />
      </button>

      <BottomNav />
    </div>
  );
}
