import { motion } from 'framer-motion'
import { MdPlayArrow, MdPause, MdReplay10, MdForward10 } from 'react-icons/md'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import AudioVisualizer from './AudioVisualizer'
import ErrorBoundary from '../../../components/common/ErrorBoundary'
import TrackList from './TrackList'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/**
 * Audio experience surface: a now-playing panel with a live visualiser
 * above a track list.
 *
 * `tracks` are resolved media entries: { id, title, subtitle, url,
 * durationSeconds }.
 */
export default function AudioPlayer({ tracks }) {
  const {
    audioRef,
    currentTrack,
    currentId,
    isPlaying,
    currentTime,
    duration,
    toggle,
    select,
    seek,
  } = useAudioPlayer(tracks)

  const activeTrack = currentTrack ?? tracks[0]
  const total = duration || activeTrack?.durationSeconds || 0
  const progress = total ? (currentTime / total) * 100 : 0

  const skip = (delta) => seek(Math.min(total, Math.max(0, currentTime + delta)))

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6">
      {/* One element reused for every track - see useAudioPlayer. */}
      <audio ref={audioRef} preload="metadata" />

      <section className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="h-28 w-full sm:h-32">
          {isPlaying ? (
            /* Boundary because the visualiser touches Web Audio, whose
               failures are throws rather than return values. The bars are
               decoration; losing them must never cost the visitor the
               screen. Falls back to the same resting row shown below. */
            <ErrorBoundary fallback={<RestingBars />}>
              <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
            </ErrorBoundary>
          ) : (
            <RestingBars />
          )}
        </div>

        <div className="text-center">
          <p className="text-3xl font-semibold text-text">
            {activeTrack?.title ?? 'No track selected'}
          </p>
          <p className="mt-1 text-lg text-muted">{activeTrack?.subtitle}</p>
        </div>

        <div className="w-full">
          <input
            type="range"
            min={0}
            max={total || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek"
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-primary"
            style={{
              background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-surface-sunken) ${progress}%)`,
            }}
          />
          <div className="mt-2 flex justify-between text-base tabular-nums text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <TransportButton label="Back 10 seconds" onClick={() => skip(-10)}>
            <MdReplay10 className="text-3xl" />
          </TransportButton>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'tween', duration: 0.12 }}
            onClick={() => activeTrack && toggle(activeTrack)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex size-20 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-brand-600/25"
          >
            {isPlaying ? (
              <MdPause className="text-5xl" />
            ) : (
              <MdPlayArrow className="text-5xl" />
            )}
          </motion.button>

          <TransportButton label="Forward 10 seconds" onClick={() => skip(10)}>
            <MdForward10 className="text-3xl" />
          </TransportButton>
        </div>
      </section>

      <TrackList
        tracks={tracks}
        currentId={currentId}
        isPlaying={isPlaying}
        /* `select`, not `toggle`. Toggling is right for the transport
           button but wrong for a list: picking a different track must
           always start it. Wired to toggle, choosing the other track
           read the element's previous state and played the wrong clip -
           the list ran one click behind. */
        onSelect={select}
      />
    </div>
  )
}

function TransportButton({ label, onClick, children }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'tween', duration: 0.12 }}
      onClick={onClick}
      aria-label={label}
      className="flex size-14 items-center justify-center rounded-full border border-border bg-surface text-primary active:bg-brand-50"
    >
      {children}
    </motion.button>
  )
}

/**
 * Static bar row shown when nothing is playing, and as the visualiser's
 * fallback if Web Audio fails - the panel keeps its shape either way.
 */
function RestingBars() {
  return (
    <div className="flex h-full items-end justify-center gap-1.5">
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          className="w-2 rounded-full bg-brand-100"
          style={{ height: `${18 + Math.abs(Math.sin(i * 0.7)) * 55}%` }}
        />
      ))}
    </div>
  )
}
