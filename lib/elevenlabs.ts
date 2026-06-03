const DEBUG_TTS = process.env.NEXT_PUBLIC_DEBUG_TTS === "true";
const DEBUG_STT = process.env.NEXT_PUBLIC_DEBUG_STT === "true";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb"; // George (ElevenLabs premade default)
const TTS_MODEL = "eleven_multilingual_v2";
const STT_MODEL = "scribe_v1";

export async function textToSpeech(text: string): Promise<Buffer | null> {
  if (DEBUG_TTS) {
    console.log("[DEBUG_TTS] skipped:", text.slice(0, 60));
    return null;
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        speed: 1.2,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Map an audio mime type to the file extension ElevenLabs expects. iOS Safari
// records audio/mp4, so a hardcoded ".webm" name makes Scribe reject the bytes
// as corrupted (invalid_content).
function extForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "mp4";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

export async function speechToText(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<string> {
  if (DEBUG_STT) {
    console.log("[DEBUG_STT] skipped — returning canned response");
    return "This is a debug response.";
  }
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("ElevenLabs STT skipped: empty audio buffer");
  }
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType });
  formData.append("file", blob, `recording.${extForMime(mimeType)}`);
  formData.append("model_id", STT_MODEL);
  formData.append("tag_audio_events", "false");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY! },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs STT error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}
