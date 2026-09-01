import { useRef, useState } from 'react'
import { MdPlayArrow, MdPause, MdReplay } from 'react-icons/md'
import { useMediaUrl } from '../../hooks/useMediaUrl'
import MediaFallback from './MediaFallback'
import TouchButton from '../common/TouchButton'

/**
 * Plain video surface with large touch controls.
 *
 * `playsInline` + `muted` are required for autoplay to work at all in
 * Android WebView. `preload="metadata"` keeps the launcher and first
 * paint cheap - the full file is never pulled until the user presses
 * play.
 */
export default function VideoPlayer({ mediaId, loop = false }) {
  const { url, status } = useMediaUrl(mediaId)
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  if (status === 'loading') return <MediaFallback message="Loading media…" />
  if (status === 'missing') {
    return <MediaFallback message={`Media not found: ${mediaId}`} tone="error" />
  }

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.play()
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-black">
      <video
        ref={videoRef}
        src={url}
        loop={loop}
        muted
        playsInline
        preload="metadata"
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-6">
        {ended ? (
          <TouchButton icon={MdReplay} onClick={restart}>
            Replay
          </TouchButton>
        ) : (
          <TouchButton
            icon={playing ? MdPause : MdPlayArrow}
            onClick={toggle}
          >
            {playing ? 'Pause' : 'Play'}
          </TouchButton>
        )}
      </div>
    </div>
  )
}
