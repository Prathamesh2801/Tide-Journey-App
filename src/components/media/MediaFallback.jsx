import { MdOutlineImageNotSupported, MdOutlineHourglassEmpty } from 'react-icons/md'

/** Shared empty/loading/error surface for any media component. */
export default function MediaFallback({ message, tone = 'neutral' }) {
  const Icon =
    tone === 'error' ? MdOutlineImageNotSupported : MdOutlineHourglassEmpty

  return (
    <div className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-surface-sunken text-center">
      <Icon
        className={`text-6xl ${tone === 'error' ? 'text-accent-red' : 'text-brand-300'}`}
        aria-hidden="true"
      />
      <p className="px-6 text-xl text-muted">{message}</p>
    </div>
  )
}
