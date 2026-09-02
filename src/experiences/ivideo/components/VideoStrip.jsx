import { MdPlayArrow } from 'react-icons/md'
import { ivideoPosterUrl } from '../data/ivideoPath'

/**
 * Thumbnail strip under the stage: shows the whole run at a glance and
 * lets a visitor jump straight to an advert instead of stepping through.
 *
 * Mirrors the brochure reader's page strip so the two experiences feel
 * like the same product.
 */
export default function VideoStrip({ videos, index, onSelect }) {
  if (videos.length < 2) return null

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pt-4">
      {videos.map((video, position) => {
        const active = position === index
        return (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(position)}
            aria-label={`Play ${video.title}`}
            aria-current={active}
            className={`group relative w-36 shrink-0 overflow-hidden rounded-2xl border-2 text-left transition-colors sm:w-44 ${
              active
                ? 'border-primary bg-surface'
                : 'border-border bg-surface active:border-brand-300'
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={ivideoPosterUrl(video.name)}
                alt=""
                className={`h-full w-full object-cover transition-opacity ${
                  active ? 'opacity-100' : 'opacity-70'
                }`}
                draggable="false"
              />
              {active ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-primary">
                    <MdPlayArrow className="size-5 translate-x-px" />
                  </span>
                </span>
              ) : null}
            </div>

            <div className="px-3 py-2">
              <p
                className={`truncate text-sm font-semibold ${
                  active ? 'text-primary' : 'text-text'
                }`}
              >
                {video.title}
              </p>
              <p className="truncate text-xs text-muted">{video.subtitle}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
