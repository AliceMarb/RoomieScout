// Deepgram cloud speech-to-text — the cheapest cloud STT path here (Nova pricing
// undercuts ElevenLabs Scribe). STT debug/provider selection happens in ./stt;
// this file only talks to the API.
//
// Deepgram's prerecorded endpoint takes the raw audio bytes as the request body
// (not multipart) with the mime type in Content-Type, so there's no SDK needed —
// just a fetch, matching the elevenlabs.ts style.
import { DEEPGRAM_MODEL } from "@/infrastructure/config";

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
