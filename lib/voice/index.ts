// Public voice API. Import voice features from here, not the provider files:
//   import { textToSpeech, speechToText } from "@/lib/voice";
//
// Each dispatches by provider/debug flags (see ./tts and ./stt):
// - textToSpeech: Kokoro (local dev) or ElevenLabs (cloud) per TTS_PROVIDER
// - speechToText: Whisper (local dev), Deepgram (cloud), or ElevenLabs (cloud) per STT_PROVIDER
export { textToSpeech } from "./tts";
export { speechToText } from "./stt";
