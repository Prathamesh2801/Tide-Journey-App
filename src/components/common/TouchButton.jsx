import { motion } from 'framer-motion'

const VARIANT_CLASSES = {
  /* Solid brand blue. */
  primary: 'bg-brand-gradient text-white font-semibold shadow-md shadow-brand-600/20',
  /* Quiet control for secondary actions such as Back. */
  surface: 'bg-surface text-primary border border-border font-medium active:bg-brand-50',
  /* Outlined brand, for use directly on top of media. */
  outline: 'border-2 border-brand-400 text-primary font-medium active:bg-brand-50',
}

/**
 * Standard touch target for the whole application.
 * Minimum height 64px so it stays comfortable on the 10.3" panel, and
 * feedback comes from :active / whileTap rather than :hover.
 */
export default function TouchButton({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  className = '',
  type = 'button',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'tween', duration: 0.12 }}
      className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-8 text-xl transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {Icon ? <Icon className="text-2xl" aria-hidden="true" /> : null}
      {children}
    </motion.button>
  )
}
