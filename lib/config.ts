// Central config — all flags read from environment variables.
// NEXT_PUBLIC_ prefix makes them available client-side.
// Set these in .env.local for dev; leave unset (or false) in production.

export const DEBUG_TTS = process.env.NEXT_PUBLIC_DEBUG_TTS === "true";
export const DEBUG_STT = process.env.NEXT_PUBLIC_DEBUG_STT === "true";
export const DEBUG_AGENTS = process.env.NEXT_PUBLIC_DEBUG_AGENTS === "true";

// Speech-to-text provider. Server-side only (STT runs on the server).
//   "elevenlabs" — cloud Scribe, needs ELEVENLABS_API_KEY
//   "deepgram"   — cloud Nova, needs DEEPGRAM_API_KEY (cheapest cloud option)
//   "whisper"    — local openai-whisper, no quota/key (see lib/voice/README.md)
// Default: whisper in dev (npm run dev → the free local engine), elevenlabs in
// production. Set STT_PROVIDER explicitly in .env.local to override either way.
export const STT_PROVIDER: "elevenlabs" | "deepgram" | "whisper" =
  process.env.STT_PROVIDER === "whisper"
    ? "whisper"
    : process.env.STT_PROVIDER === "deepgram"
      ? "deepgram"
      : process.env.STT_PROVIDER === "elevenlabs"
        ? "elevenlabs"
        : process.env.NODE_ENV === "development"
          ? "whisper"
          : "elevenlabs";

// Local Whisper tuning (only used when STT_PROVIDER=whisper).
export const WHISPER_MODEL = process.env.WHISPER_MODEL ?? "base";
export const WHISPER_PYTHON = process.env.WHISPER_PYTHON ?? "python3";

// Deepgram model (only used when STT_PROVIDER=deepgram).
export const DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL ?? "nova-3";

// Text-to-speech provider. Server-side only (TTS runs on the server).
//   "elevenlabs" — cloud, needs ELEVENLABS_API_KEY
//   "kokoro"     — local kokoro-onnx, no quota/key (see lib/voice/README.md)
// Default: kokoro in dev, elevenlabs in production. Set TTS_PROVIDER to override.
export const TTS_PROVIDER: "elevenlabs" | "kokoro" =
  process.env.TTS_PROVIDER === "kokoro"
    ? "kokoro"
    : process.env.TTS_PROVIDER === "elevenlabs"
      ? "elevenlabs"
      : process.env.NODE_ENV === "development"
        ? "kokoro"
        : "elevenlabs";

// Local Kokoro tuning (only used when TTS_PROVIDER=kokoro). Model/voices paths
// are relative to the project root unless absolute. Python defaults to the same
// interpreter as Whisper so one venv serves both.
export const KOKORO_PYTHON =
  process.env.KOKORO_PYTHON ?? process.env.WHISPER_PYTHON ?? "python3";
export const KOKORO_MODEL = process.env.KOKORO_MODEL ?? "models/kokoro-v1.0.onnx";
export const KOKORO_VOICES = process.env.KOKORO_VOICES ?? "models/voices-v1.0.bin";
export const KOKORO_VOICE = process.env.KOKORO_VOICE ?? "af_heart";
export const KOKORO_SPEED = Number(process.env.KOKORO_SPEED ?? "1.0");

// Pre-fills the user ID input — avoids retyping during testing.
// Falls back to "debug-user" when either debug flag is on.
export const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID ??
  (DEBUG_TTS || DEBUG_STT ? "debug-user" : "");
