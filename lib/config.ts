// Central config — all flags read from environment variables.
// NEXT_PUBLIC_ prefix makes them available client-side.
// Set these in .env.local for dev; leave unset (or false) in production.

export const DEBUG_TTS = process.env.NEXT_PUBLIC_DEBUG_TTS === "true";
export const DEBUG_STT = process.env.NEXT_PUBLIC_DEBUG_STT === "true";
export const DEBUG_AGENTS = process.env.NEXT_PUBLIC_DEBUG_AGENTS === "true";

// Pre-fills the user ID input — avoids retyping during testing.
// Falls back to "debug-user" when either debug flag is on.
export const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID ??
  (DEBUG_TTS || DEBUG_STT ? "debug-user" : "");
