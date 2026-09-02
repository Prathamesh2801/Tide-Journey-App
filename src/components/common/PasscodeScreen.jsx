import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdBackspace, MdLockOutline, MdArrowBack } from 'react-icons/md'
import { isNumericPasscode } from '../../config/access'
import { APP_LOGO } from '../../config/app'
import TouchButton from './TouchButton'
import FullscreenButton from './FullscreenButton'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

/**
 * Passcode gate shown before an experience opens.
 *
 * Uses the launcher's own surfaces, brand gradient and touch sizing so it
 * reads as part of the product rather than a browser prompt. An all-digit
 * code gets the keypad; anything else falls back to a text field.
 */
export default function PasscodeScreen({
  experience,
  passcode,
  onVerify,
  onUnlock,
  onCancel,
}) {
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)
  const numeric = isNumericPasscode(passcode)

  const submit = (value) => {
    if (onVerify(value)) {
      onUnlock()
      return
    }
    setError(true)
    setEntry('')
    // Clear the error as soon as the visitor starts over.
    window.setTimeout(() => setError(false), 900)
  }

  const press = (key) => {
    if (key === 'clear') {
      setEntry('')
      return
    }
    if (key === 'back') {
      setEntry((prev) => prev.slice(0, -1))
      return
    }

    const next = entry + key
    setEntry(next)
    // Auto-submit once the entry is as long as the code, so a short code
    // needs no extra confirm tap.
    if (next.length >= passcode.length) submit(next)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background bg-brand-ambient">
      <header className="flex shrink-0 items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <TouchButton variant="surface" icon={MdArrowBack} onClick={onCancel}>
          Back
        </TouchButton>
        <div className="flex items-center gap-4">
          <FullscreenButton />
          <img
            src={APP_LOGO}
            alt="Tide"
            className="h-16 w-auto select-none sm:h-20"
            draggable="false"
          />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex w-full max-w-md flex-col items-center"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md shadow-brand-600/25">
            <MdLockOutline className="text-3xl" aria-hidden="true" />
          </span>

          <p className="mt-5 text-sm font-bold tracking-[0.2em] text-brand-300">
            {experience.number}
          </p>
          <h1 className="mt-1 text-center text-3xl font-semibold text-text">
            {experience.title}
          </h1>
          <p className="mt-2 text-center text-lg text-muted">
            Enter the passcode to continue
          </p>

          <motion.div
            animate={error ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 w-full"
          >
            {numeric ? (
              <PasscodeDots length={passcode.length} filled={entry.length} error={error} />
            ) : (
              <input
                type="password"
                value={entry}
                autoFocus
                /* The codes are single uppercase words. Android's
                   keyboard otherwise starts lowercase and offers
                   autocorrect, which turns a correct code into a
                   rejected one. Matching is case-insensitive anyway;
                   these just make the keyboard agree with what is
                   printed on the card. */
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                onChange={(event) => {
                  setEntry(event.target.value)
                  setError(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submit(entry)
                }}
                aria-label="Passcode"
                className={`w-full rounded-2xl border-2 bg-surface px-6 py-5 text-center text-2xl tracking-widest text-text outline-none ${
                  error ? 'border-accent-red' : 'border-border focus:border-brand-400'
                }`}
              />
            )}

            <p
              role="status"
              className={`mt-4 text-center text-base font-medium transition-opacity ${
                error ? 'text-accent-red opacity-100' : 'opacity-0'
              }`}
            >
              Incorrect passcode — try again
            </p>
          </motion.div>

          {numeric ? (
            <div className="mt-2 grid w-full grid-cols-3 gap-3">
              {KEYS.map((key) => (
                <Key key={key} value={key} onPress={press} />
              ))}
            </div>
          ) : (
            <TouchButton className="mt-2 w-full" onClick={() => submit(entry)}>
              Unlock
            </TouchButton>
          )}
        </motion.div>
      </main>
    </div>
  )
}

function PasscodeDots({ length, filled, error }) {
  return (
    <div className="flex justify-center gap-4">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`size-5 rounded-full transition-colors ${
            error
              ? 'bg-accent-red'
              : i < filled
                ? 'bg-primary'
                : 'bg-surface-sunken ring-1 ring-border'
          }`}
        />
      ))}
    </div>
  )
}

function Key({ value, onPress }) {
  const isAction = value === 'clear' || value === 'back'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'tween', duration: 0.1 }}
      onClick={() => onPress(value)}
      aria-label={value === 'back' ? 'Delete' : value === 'clear' ? 'Clear' : value}
      className={`flex min-h-16 items-center justify-center rounded-2xl border text-2xl font-semibold transition-colors ${
        isAction
          ? 'border-border bg-surface-sunken text-muted active:bg-brand-50'
          : 'border-border bg-surface text-text active:bg-brand-50'
      }`}
    >
      {value === 'back' ? (
        <MdBackspace className="text-2xl" aria-hidden="true" />
      ) : value === 'clear' ? (
        'C'
      ) : (
        value
      )}
    </motion.button>
  )
}
