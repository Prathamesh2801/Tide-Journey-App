import { useState } from 'react'
import { brochurePageUrl } from '../data/brochurePath'

/** A single rendered page, with its own loading state. */
export default function BrochurePage({ slug, page }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex h-full w-full items-center justify-center">
      {!loaded && (
        <div className="skeleton absolute inset-0 m-auto h-full w-full max-w-[min(100%,56vh)] rounded-xl" />
      )}
      <img
        key={page}
        src={brochurePageUrl(slug, page)}
        alt={`Page ${page}`}
        decoding="async"
        draggable="false"
        onLoad={() => setLoaded(true)}
        className={`max-h-full max-w-full rounded-xl object-contain shadow-md transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
