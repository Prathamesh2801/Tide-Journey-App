import { useEffect, useRef } from 'react'
import { brochurePageUrl } from '../data/brochurePath'

/**
 * Thumbnail strip for jumping between pages.
 *
 * Thumbnails are the full page images scaled down by the browser rather
 * than separate files: only the strip's own small render size is painted,
 * and it keeps the media package to one image per page.
 */
export default function PageStrip({ slug, pageCount, page, onSelect }) {
  const activeRef = useRef(null)

  // Keep the current page visible as it changes via swipe or arrows.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [page])

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
        const isCurrent = n === page

        return (
          <button
            key={n}
            ref={isCurrent ? activeRef : null}
            type="button"
            onClick={() => onSelect(n)}
            aria-label={`Go to page ${n}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={`relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              isCurrent ? 'border-primary' : 'border-border opacity-70'
            }`}
          >
            <img
              src={brochurePageUrl(slug, n)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover"
            />
            <span
              className={`absolute inset-x-0 bottom-0 bg-black/55 text-center text-[0.625rem] font-semibold text-white ${
                isCurrent ? 'bg-primary/90' : ''
              }`}
            >
              {n}
            </span>
          </button>
        )
      })}
    </div>
  )
}
