import { AnimatePresence, motion } from 'framer-motion'
import { MdCloudDownload, MdCheckCircle } from 'react-icons/md'
import { useMediaCache } from '../../hooks/useMediaCache'

/**
 * First-load progress for the offline media copy.
 *
 * Deliberately unobtrusive: the app is fully usable while this runs
 * (uncached files fall through to the network), so this informs rather
 * than blocks.
 *
 * Transient by design. useMediaCache returns to `idle` a few seconds
 * after the copy completes, and never reports `ready` at all on a tablet
 * that was already provisioned - otherwise the badge parks itself over
 * every screen for the rest of the session, which is what it did before.
 */
export default function CacheStatus() {
  const { status, done, total } = useMediaCache()

  const isCaching = status === 'caching' && total > 0
  const isReady = status === 'ready'
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <AnimatePresence>
      {(isCaching || isReady) && (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-surface px-5 py-2.5 shadow-md"
        >
          {isCaching ? (
            <span className="flex items-center gap-3 text-sm font-medium text-text">
              <MdCloudDownload className="text-xl text-primary" aria-hidden="true" />
              Preparing offline media… {percent}%
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
                <span
                  className="block h-full rounded-full bg-brand-gradient transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm font-medium text-text">
              <MdCheckCircle className="text-xl text-primary" aria-hidden="true" />
              Ready to use offline
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
