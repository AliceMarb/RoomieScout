// Text-to-speech dispatcher. Handles the debug short-circuit, routes to the
// provider chosen by TTS_PROVIDER (local Kokoro for dev, cloud ElevenLabs for
// prod), and in dev degrades to silent (returns null) if synthesis fails — so a
// missing model or dead ElevenLabs quota shows Scout's line as text instead of
// 500ing the interview.
import { DEBUG_TTS, TTS_PROVIDER } from "@/infrastructure/config";
import { elevenLabsTextToSpeech } from "./elevenlabs";
import { deepgramTextToSpeech } from "./deepgram";
import { kokoroTextToSpeech } from "./kokoro";

export async function textToSpeech(text: string): Promise<Buffer | null> {
  if (DEBUG_TTS) {
    console.log("[DEBUG_TTS] skipped:", text.slice(0, 60));
    return null;
  }
  try {
    if (TTS_PROVIDER === "kokoro") return await kokoroTextToSpeech(text);
    if (TTS_PROVIDER === "deepgram") return await deepgramTextToSpeech(text);
    return await elevenLabsTextToSpeech(text);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[voice] TTS (${TTS_PROVIDER}) failed — continuing without audio:`,
        (err as Error).message
      );
      return null;
    }
    throw err;
  }
}
