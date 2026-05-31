// Voice IDs tried (library/paid voices — require upgraded plan):
// Adam:        s3TPKV1kjDlVtZbl4Ksh
// Christopher: G17SuINrv2H9FC6nvetn

const DEBUG = process.env.DEBUG_AUDIO === "true";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // George (ElevenLabs premade default)
const TTS_MODEL = "eleven_multilingual_v2";
const STT_MODEL = "scribe_v1";

export async function textToSpeech(text) {
  if (DEBUG) {
    console.log("[DEBUG] TTS skipped:", text.slice(0, 60));
    return null;
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
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

export async function speechToText(audioBuffer, mimeType = "audio/webm") {
  if (DEBUG) {
    console.log("[DEBUG] STT skipped — returning canned response");
    return "This is a debug response.";
  }
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType });
  formData.append("file", blob, "recording.webm");
  formData.append("model_id", STT_MODEL);

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs STT error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.text;
}
