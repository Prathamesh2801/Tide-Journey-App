import { MdPlayArrow, MdGraphicEq } from 'react-icons/md'

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/** Touch-friendly track rows; the active row is marked, not just coloured. */
export default function TrackList({ tracks, currentId, isPlaying, onSelect }) {
  return (
    <ul className="flex flex-col gap-3">
      {tracks.map((track, index) => {
        const isCurrent = track.id === currentId

        return (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => onSelect(track)}
              aria-current={isCurrent ? 'true' : undefined}
              className={`flex min-h-20 w-full items-center gap-5 rounded-2xl border px-6 text-left transition-colors ${
                isCurrent
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-border bg-surface active:bg-brand-50'
              }`}
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                  isCurrent
                    ? 'bg-brand-gradient text-white'
                    : 'bg-surface-sunken text-muted'
                }`}
              >
                {isCurrent && isPlaying ? (
                  <MdGraphicEq className="text-2xl" aria-hidden="true" />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-xl font-semibold text-text">
                  {track.title}
                </span>
                <span className="block truncate text-base text-muted">
                  {isCurrent && isPlaying ? 'Now playing' : track.subtitle}
                </span>
              </span>

              <span className="shrink-0 text-base tabular-nums text-muted">
                {formatDuration(track.durationSeconds)}
              </span>

              {!isCurrent && (
                <MdPlayArrow
                  className="shrink-0 text-3xl text-brand-300"
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
