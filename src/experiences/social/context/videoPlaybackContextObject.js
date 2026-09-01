import { createContext } from "react";

// The context object lives in its own module so the provider file exports
// only a component — required by react-refresh/only-export-components,
// which our ESLint config enforces.
export const VideoPlaybackContext = createContext(null);
