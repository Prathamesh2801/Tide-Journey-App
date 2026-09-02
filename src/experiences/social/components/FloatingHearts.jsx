import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart } from "react-icons/fi";

// Instagram Live-style reaction stream, two layers:
//  - an ambient stream (mixed white + several pink shades) that visibly
//    emerges from the like button the whole time this reel is on screen —
//    meant to draw the eye and invite a tap, not just fill dead space
//  - a bigger, brighter red-dominant outburst of hearts on an actual like,
//    which still reads as a clear step up from the ambient baseline
const BURST_COLORS = ["#ff3040", "#ffffff", "#ff3040", "#ff6b81", "#ffffff"];
const AMBIENT_COLORS = [
  "#ffffff",
  "#ffb3ba",
  "#ff8fab",
  "#ff6b93",
  "#ffffff",
  "#ffc2d1",
  "#ff8fab",
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Drift/wobble/rise are all in rem (not px) so the whole stream scales up
// with the root font-size on the big portrait TV (see index.css's clamp()),
// the same way every other size in the app does — px values would stay a
// fixed physical size and look tiny on a large screen.
function makeHeart({ idPrefix, colors, sizeRange, opacityPeak, driftRange, rotateRange, durationRange, delay = 0 }) {
  return {
    id: `${idPrefix}-${Math.random().toString(36).slice(2, 9)}`,
    color: colors[Math.floor(Math.random() * colors.length)],
    driftRem: randomBetween(...driftRange),
    wobbleRem: randomBetween(-0.9, 0.9),
    delay,
    duration: randomBetween(...durationRange),
    size: randomBetween(...sizeRange),
    rotate: randomBetween(...rotateRange),
    opacityPeak,
  };
}

export default function FloatingHearts({ burstKey, className = "" }) {
  const containerRef = useRef(null);
  const [hearts, setHearts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const prevBurstKeyRef = useRef(burstKey);

  const addHeart = (heart, lifetimeMs) => {
    setHearts((prev) => [...prev, heart]);
    window.setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== heart.id)), lifetimeMs);
  };

  // Only trickle/burst while this specific reel is actually on screen — no
  // point animating hearts for the dozens of off-screen reels in the feed.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;
    let timeoutId;

    const spawnAmbient = () => {
      // Spawn 1-3 together so it reads as a real stream, not a single-file
      // drip — more noticeable on a big screen where a lone heart gets lost.
      const roll = Math.random();
      const batch = roll < 0.4 ? 3 : roll < 0.8 ? 2 : 1;
      for (let i = 0; i < batch; i += 1) {
        const heart = makeHeart({
          idPrefix: "ambient",
          colors: AMBIENT_COLORS,
          sizeRange: [0.9, 1.4],
          opacityPeak: 0.8,
          driftRange: [-1, 1],
          rotateRange: [-15, 15],
          durationRange: [2.2, 3.2],
          delay: i * 0.1,
        });
        addHeart(heart, (heart.delay + heart.duration) * 1000 + 150);
      }
      timeoutId = window.setTimeout(spawnAmbient, randomBetween(180, 350));
    };

    timeoutId = window.setTimeout(spawnAmbient, randomBetween(150, 350));
    return () => window.clearTimeout(timeoutId);
  }, [isVisible]);

  useEffect(() => {
    if (!burstKey || burstKey === prevBurstKeyRef.current) return undefined;
    prevBurstKeyRef.current = burstKey;

    const count = 7 + Math.floor(Math.random() * 4);
    const newHearts = Array.from({ length: count }, (_, i) =>
      makeHeart({
        idPrefix: `burst-${burstKey}-${i}`,
        colors: BURST_COLORS,
        sizeRange: [1.1, 1.9],
        opacityPeak: 1,
        driftRange: [-2.2, 2.2],
        rotateRange: [-20, 20],
        durationRange: [1.5, 2.2],
        delay: i * 0.07 + Math.random() * 0.05,
      })
    );

    newHearts.forEach((heart) => addHeart(heart, (heart.delay + heart.duration) * 1000 + 150));
  }, [burstKey]);

  return (
    <div ref={containerRef} className={`pointer-events-none absolute overflow-visible ${className}`}>
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.span
            key={heart.id}
            initial={{ opacity: 0, x: "0rem", y: "0rem", scale: 0.4, rotate: 0 }}
            animate={{
              // All four properties share the same 4-point "times" below so
              // the fade-in lands while the heart is still right next to the
              // button (a small rise), not already partway up — mismatched
              // keyframe counts previously let opacity and y drift out of
              // sync, making hearts look like they spawned higher than they
              // actually did.
              opacity: [0, heart.opacityPeak, heart.opacityPeak, 0],
              x: [
                "0rem",
                `${(heart.driftRem * 0.15).toFixed(2)}rem`,
                `${(heart.driftRem * 0.6).toFixed(2)}rem`,
                `${(heart.driftRem + heart.wobbleRem).toFixed(2)}rem`,
              ],
              y: ["0rem", "-1rem", "-7rem", "-15rem"],
              scale: [0.4, 0.9, 1, 0.8],
              rotate: [0, heart.rotate * 0.25, heart.rotate, heart.rotate * 1.3],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              ease: "easeOut",
              times: [0, 0.12, 0.55, 1],
            }}
            className="absolute bottom-0 left-1/2"
            style={{ marginLeft: "-0.5rem" }}
          >
            <FiHeart
              size={`${heart.size}rem`}
              style={{ color: heart.color, fill: heart.color }}
            />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
