import { useEffect, useRef, useState } from 'react'
import { MdPlayArrow } from 'react-icons/md'
import { retailVideoUrl } from '../data/retailPath'

/**
 * Full-bleed looping film for the Retail experience.
 *
 * The clip has no audio track at all, so it plays muted and loops
 * silently - no controls, nothing for a visitor to get wrong.
 *
 * `object-contain` over a blurred copy of the same frame: the film is
 * 9:16 portrait and the tablet is 16:10 in landscape, so cropping to fill
 * would cut the product shot in half. The blurred backdrop fills the
 * letterbox the way Reels does, matching what the Social feed already
 * does for the same reason.
 */
export default function RetailVideo({ name }) {
  const videoRef = useRef(null)
  const [blocked, setBlocked] = useState(false)
  const src = retailVideoUrl(name)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Autoplay is allowed for muted video, but a policy change or a
    // locked-down kiosk profile can still refuse it. Surface a tap target
    // rather than leaving a visitor looking at a frozen first frame.
    const play = () => {
      const attempt = video.play()
      if (attempt?.catch) attempt.catch(() => setBlocked(true))
    }

    play()

    // Android pauses video when the screen sleeps or the app is
    // backgrounded, and does not always resume on return.
    const onVisible = () => {
      if (!document.hidden && video.paused) play()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [src])

  const start = () => {
    const video = videoRef.current
    if (!video) return
    video.play().then(
      () => setBlocked(false),
      () => setBlocked(true),
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-black">
      {/* Blurred fill behind the letterboxed film. aria-hidden so a screen
          reader does not announce the same video twice. */}
      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
        src={src}
        muted
        loop
        playsInline
        autoPlay
        tabIndex={-1}
      />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      />

      {blocked ? (
        <button
          type="button"
          onClick={start}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/40"
        >
          <span className="flex size-24 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
            <MdPlayArrow className="size-14" />
          </span>
        </button>
      ) : null}
    </div>
  )
}
