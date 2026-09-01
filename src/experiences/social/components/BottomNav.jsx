import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiSearch, FiUser, FiPlay } from "react-icons/fi";
import { BsFunnel } from "react-icons/bs";

// Reels is the page actually showing, so it's the one marked active/current
// — the rest are dummy destinations that don't exist yet.
//
// Positioning is absolute rather than the reference app's fixed: this feed
// is one route inside the launcher, so the nav must anchor to the
// experience container and not the whole viewport.
const NAV_ITEMS = [
  { key: "home", label: "Home", icon: FiHome, active: false },
  { key: "reels", label: "Reels", icon: FiPlay, active: true },
  { key: "filter", label: "Filter", icon: BsFunnel, active: false },
  { key: "search", label: "Search", icon: FiSearch, active: false },
  { key: "profile", label: "Profile", icon: FiUser, active: false },
];

export default function BottomNav() {
  const [toast, setToast] = useState(null);

  const handleDummyClick = (label) => {
    setToast(label);
    window.clearTimeout(handleDummyClick._t);
    handleDummyClick._t = window.setTimeout(() => setToast(null), 1400);
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-tide-navy px-4 py-2 text-xs font-medium text-white shadow-float"
          >
            {toast} coming soon
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="safe-bottom absolute inset-x-0 bottom-3 z-30 flex justify-center px-4">
        <div className="flex items-center gap-1 rounded-full bg-black/70 p-2 shadow-float backdrop-blur-lg">
          {NAV_ITEMS.map(({ key, label, icon: Icon, active }) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-current={active ? "page" : undefined}
              aria-disabled={!active}
              onClick={() => (active ? undefined : handleDummyClick(label))}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                active ? "bg-white text-black" : "text-white/70 active:text-white"
              } ${active ? "cursor-default" : "cursor-not-allowed"}`}
            >
              <Icon size="1.25rem" />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
