import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Playback controller for a playlist of audio tracks.
 *
 * One <audio> element is reused for every track rather than one per track:
 * a kiosk runs for days, and a single element keeps exactly one decoder
 * alive no matter how often visitors switch clips.
 *
 * Returns the element ref so a visualiser can tap the same source.
 */
export function useAudioPlayer(tracks) {
  const audioRef = useRef(null)
  const [currentId, setCurrentId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Keep listeners on the element rather than polling, so nothing runs
  // while playback is stopped.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return undefined

    const onTime = () => setCurrentTime(el.currentTime)
    const onLoaded = () => setDuration(el.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('durationchange', onLoaded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('durationchange', onLoaded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [])

  const play = useCallback((track) => {
    const el = audioRef.current
    if (!el || !track) return

    if (el.dataset.trackId !== track.id) {
      el.src = track.url
      el.dataset.trackId = track.id
      setCurrentId(track.id)
      setCurrentTime(0)
      setDuration(0)
    }
    el.play().catch(() => setIsPlaying(false))
  }, [])

  const toggle = useCallback(
    (track) => {
      const el = audioRef.current
      if (!el) return
      if (el.dataset.trackId === track.id && !el.paused) {
        el.pause()
      } else {
        play(track)
      }
    },
    [play]
  )

  const seek = useCallback((seconds) => {
    const el = audioRef.current
    if (!el || !Number.isFinite(seconds)) return
    el.currentTime = seconds
    setCurrentTime(seconds)
  }, [])

  const stop = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    setCurrentTime(0)
  }, [])

  const currentTrack = tracks.find((track) => track.id === currentId) ?? null

  return {
    audioRef,
    currentTrack,
    currentId,
    isPlaying,
    currentTime,
    duration,
    play,
    toggle,
    seek,
    stop,
  }
}
