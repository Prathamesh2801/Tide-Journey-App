import { useCallback, useState } from 'react'
import { UNLOCK_TIMEOUT_MS, getPasscode } from '../config/access'

/**
 * Tracks which experiences are currently unlocked.
 *
 * State lives in sessionStorage rather than a module variable so a page
 * reload during a session does not re-prompt, but closing the browser
 * (or restarting the kiosk) locks everything again. Each unlock carries a
 * timestamp so it expires on its own after UNLOCK_TIMEOUT_MS - a visitor
 * who walks away does not leave the experience open behind them.
 */
const STORAGE_KEY = 'tide-unlocked-experiences'

function readUnlocks() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // storage unavailable (private mode / kiosk lockdown)
    return {}
  }
}

function writeUnlocks(unlocks) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks))
  } catch {
    // ignore - the gate still works for this render, just not across reloads
  }
}

export function useExperienceLock(experienceId) {
  const passcode = getPasscode(experienceId)

  const isStillValid = useCallback(() => {
    const unlockedAt = readUnlocks()[experienceId]
    return Boolean(unlockedAt) && Date.now() - unlockedAt < UNLOCK_TIMEOUT_MS
  }, [experienceId])

  // No passcode configured means the experience is simply open.
  //
  // Evaluated once on mount rather than synced in an effect: every
  // experience route mounts its own gate, so navigating to a different
  // experience remounts this hook and re-reads the stored unlocks.
  const [unlocked, setUnlocked] = useState(() => !passcode || isStillValid())

  const unlock = useCallback(() => {
    writeUnlocks({ ...readUnlocks(), [experienceId]: Date.now() })
    setUnlocked(true)
  }, [experienceId])

  const verify = useCallback(
    (attempt) => attempt === passcode,
    [passcode]
  )

  return { unlocked, passcode, unlock, verify }
}
