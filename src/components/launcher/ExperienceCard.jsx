import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * One launcher tile. The whole card is the touch target.
 *
 * The artwork carries the identity of each module, so the card itself
 * stays quiet: a white surface and a numbered label.
 *
 * Sizes are clamped against the viewport rather than fixed, because the
 * five tiles have to fit on screen at once in both orientations -
 * portrait stacks three rows, so the artwork is sized in `vh` to stop
 * the set overflowing. `index` staggers the entrance animation.
 */
export default function ExperienceCard({ experience, index, className = "" }) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate(experience.route)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      style={{ padding: "clamp(0.5rem, 1vh, 1rem)" }}
      className={`flex h-full w-full flex-col items-center justify-center gap-[clamp(0.9rem,1.8vh,1.5rem)] rounded-3xl border-2 border-shell-card-edge bg-surface text-center shadow-lg shadow-black/15 transition-colors active:bg-brand-50 ${className}`}
    >
      <img
        src={experience.art}
        alt=""
        style={{ height: "clamp(3.75rem, 11vh, 8.5rem)" }}
        className="w-auto object-contain"
        draggable="false"
      />

      <span className="flex flex-col gap-0.5">
        <span className="text-base font-bold tracking-[0.2em] text-shell-number">
          {experience.number}
        </span>
        <span
          className="line-clamp-2 flex items-center justify-center font-semibold leading-tight text-text"
          style={{
            fontSize: "clamp(1rem, 2.1vh, 1.5rem)",
            /* Two lines reserved so a one-line and a two-line title
               produce the same card height across a row. */
            minHeight: "calc(2 * 1.25 * clamp(1rem, 2.1vh, 1.5rem))",
          }}
        >
          {experience.title}
        </span>
        <span
          className="text-muted"
          style={{ fontSize: "clamp(0.8rem, 1.5vh, 1rem)" }}
        >
          {experience.subtitle}
        </span>
      </span>
    </motion.button>
  );
}
