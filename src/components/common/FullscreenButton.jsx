import { motion } from 'framer-motion'
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import { useFullscreen } from '../../hooks/useFullscreen'

/**
 * Enter/exit fullscreen. Renders nothing where the API is unavailable
 * rather than showing a control that would silently do nothing.
 */
export default function FullscreenButton({ className = '' }) {
  const { isFullscreen, isSupported, toggle } = useFullscreen()

  if (!isSupported) return null

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'tween', duration: 0.12 }}
      onClick={toggle}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      className={`flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-primary transition-colors active:bg-brand-50 ${className}`}
    >
      {isFullscreen ? (
        <MdFullscreenExit className="text-3xl" aria-hidden="true" />
      ) : (
        <MdFullscreen className="text-3xl" aria-hidden="true" />
      )}
    </motion.button>
  )
}
