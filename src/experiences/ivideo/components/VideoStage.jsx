import { MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff } from 'react-icons/md'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { ivideoUrl, ivideoPosterUrl } from '../data/ivideoPath'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/**
 * The playing advert plus its transport controls.
 *
 * The films are 16:9 and the tablet is 16:10 in landscape, so
 * `object-contain` keeps them whole; a blurred copy fills the small
 * letterbox rather than leaving hard black bars.
 *
 * Previous/next sit as large targets over the left and right edges - the
 * gesture a visitor reaches for first - and are mirrored by the thumbnail
 * strip below for direct jumps.
 */
export default function VideoStage({
  video,
  count,
  index,
  playing,
  progress,
  muted,
  onToggle,
  onNext,
  onPrevious,
  onToggleMute,
  onSeek,
  bind,
}) {
  if (!video) return null

  const src = ivideoUrl(video.name)
  const poster = ivideoPosterUrl(video.name)
  const elapsed = progress * video.duration

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-black">
      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
        src={src}
        poster={poster}
        muted
        playsInline
        tabIndex={-1}
      />

      <video
        {...bind}
        key={video.id}
        className="absolute inset-0 h-full w-full object-contain"
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        muted={muted}
      />

      {/* Tap anywhere on the film to play or pause. */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="absolute inset-0 flex items-center justify-center"
      >
        {!playing ? (
          <span className="flex size-24 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl">
            <MdPlayArrow className="size-14 translate-x-0.5" />
          </span>
        ) : null}
      </button>

      {count > 1 ? (
        <>
          <EdgeButton side="left" onClick={onPrevious} label="Previous video">
            <FiChevronLeft className="size-8" />
          </EdgeButton>
          <EdgeButton side="right" onClick={onNext} label="Next video">
            <FiChevronRight className="size-8" />
          </EdgeButton>
        </>
      ) : null}

      {/* Title and position, top-left, over a gradient so white text stays
          readable whatever frame is behind it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent p-5">
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.9)]">
            {video.title}
          </p>
          {video.subtitle ? (
            <p className="truncate text-sm text-white/80 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
              {video.subtitle}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-black/45 px-3 py-1 text-sm font-medium text-white">
          {index + 1} / {count}
        </span>
      </div>

      {/* Transport bar. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pt-10 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/95 text-primary"
          >
            {playing ? <MdPause className="size-7" /> : <MdPlayArrow className="size-7 translate-x-0.5" />}
          </button>

          {/* drop-shadow rather than a plain colour: the transport sits over
              live video, and these adverts cut to near-white frames where
              white-on-transparent text disappears. */}
          <span className="shrink-0 text-sm tabular-nums text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
            {formatTime(elapsed)}
          </span>

          <Scrubber progress={progress} onSeek={onSeek} />

          <span className="shrink-0 text-sm tabular-nums text-white/85 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
            {formatTime(video.duration)}
          </span>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
          >
            {muted ? <MdVolumeOff className="size-6" /> : <MdVolumeUp className="size-6" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function EdgeButton({ side, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:bg-black/60 ${
        side === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * Seek bar. The hit area is padded well beyond the visible 6px track so it
 * is reachable with a fingertip, which a bare thin bar is not.
 */
function Scrubber({ progress, onSeek }) {
  const handle = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const point = event.clientX ?? event.touches?.[0]?.clientX
    if (point == null || !rect.width) return
    onSeek(Math.min(1, Math.max(0, (point - rect.left) / rect.width)))
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onClick={handle}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.05))
        if (event.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.05))
      }}
      className="flex min-w-0 flex-1 cursor-pointer items-center py-4"
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
