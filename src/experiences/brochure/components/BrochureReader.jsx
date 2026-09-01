import { motion, AnimatePresence } from 'framer-motion'
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdOutlineMenuBook,
} from 'react-icons/md'
import { useBrochurePager } from '../hooks/useBrochurePager'
import BrochurePage from './BrochurePage'
import PageStrip from './PageStrip'

const SWIPE_DISTANCE = 60

/**
 * Full-screen reader for one brochure.
 *
 * Pages advance by horizontal swipe, on-screen arrows, the thumbnail
 * strip or the arrow keys. Only the current page is mounted - a 30 page
 * document would otherwise hold 30 decoded images in memory, which the
 * 4GB tablet would feel.
 */
export default function BrochureReader({ brochure, onClose }) {
  const { page, direction, goTo, next, previous, isFirst, isLast } =
    useBrochurePager(brochure.pageCount)

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-start justify-between gap-4 pb-4">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold text-text sm:text-3xl">
            {brochure.title}
          </h2>
          <p className="mt-0.5 flex items-center gap-2 text-base text-muted">
            <MdOutlineMenuBook aria-hidden="true" />
            Page {page} of {brochure.pageCount}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close brochure"
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-primary transition-colors active:bg-brand-50"
        >
          <MdClose className="text-3xl" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 basis-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-sunken">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(event, info) => {
              if (info.offset.x < -SWIPE_DISTANCE) next()
              else if (info.offset.x > SWIPE_DISTANCE) previous()
            }}
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-6"
          >
            <BrochurePage slug={brochure.slug} page={page} />
          </motion.div>
        </AnimatePresence>

        <ArrowButton side="left" onClick={previous} disabled={isFirst} />
        <ArrowButton side="right" onClick={next} disabled={isLast} />
      </div>

      {brochure.pageCount > 1 && (
        <div className="shrink-0 pt-4">
          <PageStrip
            slug={brochure.slug}
            pageCount={brochure.pageCount}
            page={page}
            onSelect={goTo}
          />
        </div>
      )}
    </div>
  )
}

function ArrowButton({ side, onClick, disabled }) {
  const Icon = side === 'left' ? MdChevronLeft : MdChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Previous page' : 'Next page'}
      className={`absolute top-1/2 flex size-14 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-md backdrop-blur-sm transition-opacity ${
        side === 'left' ? 'left-3' : 'right-3'
      } ${disabled ? 'pointer-events-none opacity-0' : 'opacity-100'} z-10`}
    >
      <Icon className="text-4xl" aria-hidden="true" />
    </button>
  )
}
