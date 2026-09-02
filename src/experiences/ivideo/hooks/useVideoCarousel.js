import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Playback state for the advert carousel.
 *
 * These films carry audio, so the first one deliberately does NOT
 * autoplay: a tablet that starts shouting the moment someone opens the
 * screen is worse than one that waits to be asked. Once a visitor has
 * pressed play, later films in the run start on their own - by then the
 * sound is expected and stopping to tap between every advert would be
 * tedious.
 */
export function useVideoCarousel(videos) {
  const videoRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)

  // Whether the visitor has started playback at least once. Gates the
  // auto-advance so arriving on the screen never makes noise by itself.
  const started = useRef(false)

  const clampedIndex = Math.min(index, Math.max(videos.length - 1, 0))
  const current = videos[clampedIndex] ?? null

  const play = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    started.current = true
    video.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    )
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (videoRef.current?.paused) play()
    else pause()
  }, [play, pause])

  /** Move by an offset, wrapping at both ends so the strip never dead-ends. */
  const go = useCallback(
    (offset) => {
      setIndex((prev) => {
        const count = videos.length
        return count ? (prev + offset + count) % count : 0
      })
      setProgress(0)
    },
    [videos.length],
  )

  const next = useCallback(() => go(1), [go])
  const previous = useCallback(() => go(-1), [go])

  const select = useCallback((target) => {
    setIndex(target)
    setProgress(0)
  }, [])

  const seek = useCallback((fraction) => {
    const video = videoRef.current
    if (!video?.duration) return
    video.currentTime = fraction * video.duration
    setProgress(fraction)
  }, [])

  // On change: load the new film, and continue playing only if the visitor
  // was already watching.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setProgress(0)
    if (!started.current) return
    const attempt = video.play()
    if (attempt?.then) attempt.then(() => setPlaying(true), () => setPlaying(false))
  }, [clampedIndex])

  // Android pauses media when the screen sleeps and does not reliably
  // resume, which would leave the play button lying about the state.
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const bind = {
    ref: videoRef,
    onTimeUpdate: (event) => {
      const { currentTime, duration } = event.currentTarget
      if (duration) setProgress(currentTime / duration)
    },
    onEnded: () => {
      // Roll into the next advert, stopping at the end of the run rather
      // than looping the whole reel forever.
      if (clampedIndex < videos.length - 1) next()
      else {
        setPlaying(false)
        setProgress(1)
      }
    },
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
  }

  return {
    current,
    index: clampedIndex,
    playing,
    progress,
    muted,
    setMuted,
    play,
    pause,
    toggle,
    next,
    previous,
    select,
    seek,
    bind,
  }
}
