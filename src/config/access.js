/**
 * Passcode gate for each experience.
 *
 * Change a value here to change that experience's code - nothing else
 * needs touching. Codes are strings so leading zeros survive ("01" is not
 * the number 1), and may be digits or text: the keypad shows for an
 * all-digit code, a text field otherwise.
 *
 * Set a code to null to leave that experience open with no gate.
 *
 * NOTE: this is presentation-level access control for a kiosk, not
 * security. The codes ship in the client bundle and anyone with the
 * files can read them. It exists to stop casual/accidental entry on the
 * show floor, nothing more.
 */
export const EXPERIENCE_PASSCODES = {
  "app-01": "FRESHFEED", // Social Media Maximization
  "app-02": "TIDETWIST", // Disruptive Social Activations
  "app-03": "ANDARSECLEAN", // Retail Zone
  "app-04": "DEEPCLEAN", // Television & iVideo
  "app-05": "TIDEWAVE", // Brochure
};

/** How long an unlocked experience stays unlocked, in milliseconds. */
export const UNLOCK_TIMEOUT_MS = 15 * 60 * 1000;

export function getPasscode(experienceId) {
  return EXPERIENCE_PASSCODES[experienceId] ?? null;
}

export function isNumericPasscode(code) {
  return typeof code === "string" && /^\d+$/.test(code);
}
