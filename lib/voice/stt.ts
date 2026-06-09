// Speech-to-text dispatcher. Handles the debug short-circuit, then routes to the
// provider chosen by STT_PROVIDER (cloud ElevenLabs by default, local Whisper for dev).
import { DEBUG_STT, STT_PROVIDER } from "@/lib/config";
import { elevenLabsSpeechToText } from "./elevenlabs";
import { whisperSpeechToText } from "./whisper";

export async function speechToText(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<string> {
  if (DEBUG_STT) {
    console.log("[DEBUG_STT] skipped — returning canned response");
    return "This is a debug response.";
  }
  if (STT_PROVIDER === "whisper") {
    return whisperSpeechToText(audioBuffer, mimeType);
  }
  return elevenLabsSpeechToText(audioBuffer, mimeType);
}
