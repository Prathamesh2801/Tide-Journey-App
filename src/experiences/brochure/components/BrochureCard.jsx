import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdMenuBook } from 'react-icons/md'
import { brochureThumbUrl } from '../data/brochurePath'

/**
 * One brochure in the grid: cover image, title and page count.
 * The whole card is the touch target.
 */
export default function BrochureCard({ brochure, index, onOpen }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(brochure)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-colors active:bg-brand-50"
    >
      <span className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-surface-sunken">
        {!loaded && (
          <MdMenuBook className="text-5xl text-brand-200" aria-hidden="true" />
        )}
        <img
          src={brochureThumbUrl(brochure.slug)}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </span>

      <span className="flex flex-col gap-0.5 p-4">
        <span className="line-clamp-2 text-lg font-semibold leading-tight text-text">
          {brochure.title}
        </span>
        <span className="text-sm text-muted">
          {brochure.pageCount} page{brochure.pageCount === 1 ? '' : 's'}
        </span>
      </span>
    </motion.button>
  )
}
