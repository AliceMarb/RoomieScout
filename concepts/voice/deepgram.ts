// Deepgram cloud STT (Nova) and TTS (Aura). No SDK — just fetch, matching the
// elevenlabs.ts style. STT/TTS provider selection happens in ./stt and ./tts.
import { DEEPGRAM_MODEL, DEEPGRAM_TTS_MODEL } from "@/infrastructure/config";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export async function deepgramSpeechToText(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<string> {
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Deepgram STT skipped: empty audio buffer");
  }
  if (!DEEPGRAM_API_KEY) {
    throw new Error("Deepgram STT skipped: DEEPGRAM_API_KEY is not set");
  }

  // smart_format adds punctuation/capitalization so the transcript reads cleanly.
  const params = new URLSearchParams({
    model: DEEPGRAM_MODEL,
    smart_format: "true",
    punctuate: "true",
  });

  const response = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Deepgram STT error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    results?: {
      channels?: { alternatives?: { transcript?: string }[] }[];
    };
  };
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
}

export async function deepgramTextToSpeech(text: string): Promise<Buffer> {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("Deepgram TTS: DEEPGRAM_API_KEY is not set");
  }

  const params = new URLSearchParams({ model: DEEPGRAM_TTS_MODEL });
  const response = await fetch(`https://api.deepgram.com/v1/speak?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Deepgram TTS error ${response.status}: ${err}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
