# lib/voice

All speech I/O lives here. Import from the barrel, never the provider files:

```ts
import { textToSpeech, speechToText } from "@/concepts/voice";
```

| File | Role |
| --- | --- |
| `index.ts` | Public API barrel (`textToSpeech`, `speechToText`). |
| `tts.ts` | Text-to-speech dispatcher: debug short-circuit, provider switch, dev degrade-to-silent. |
| `stt.ts` | Speech-to-text dispatcher: debug short-circuit, then provider switch. |
| `elevenlabs.ts` | ElevenLabs cloud TTS (`elevenLabsTextToSpeech`) + STT (`elevenLabsSpeechToText`). |
| `deepgram.ts` | Deepgram cloud STT (`deepgramSpeechToText`) — cheapest cloud option. |
| `kokoro.ts` | Local TTS via kokoro-onnx, for dev. Spawns `kokoro_tts.py`, transcodes WAV→MP3 with ffmpeg. |
| `kokoro_tts.py` | Python entry point that synthesizes a WAV with Kokoro. |
| `whisper.ts` | Local STT via openai-whisper, for dev. Spawns `whisper_transcribe.py`. |
| `whisper_transcribe.py` | Python entry point that runs Whisper and prints the transcript. |
| `mime.ts` | `extForMime` — maps the recorded mime type to a file extension. |

## Providers & defaults

`npm run dev` uses the **free local** engines (Whisper for STT, Kokoro for TTS);
production uses **ElevenLabs** for both. Override per direction in `.env.local`:

| Direction | Env var | Local (dev default) | Cloud (prod default) |
| --- | --- | --- | --- |
| Speech → text | `STT_PROVIDER` | `whisper` | `elevenlabs` (needs `ELEVENLABS_API_KEY`) |
| Text → speech | `TTS_PROVIDER` | `kokoro` | `elevenlabs` (needs `ELEVENLABS_API_KEY`) |

For STT you can also set `STT_PROVIDER=deepgram` (needs `DEEPGRAM_API_KEY`) — cloud
Nova, the cheapest hosted option. See [Deepgram setup](#deepgram-setup) below.

`NEXT_PUBLIC_DEBUG_STT=true` / `NEXT_PUBLIC_DEBUG_TTS=true` still win and return a
canned response / skip audio. In dev, if local TTS fails (e.g. model files
missing) Scout's line falls back to text instead of erroring the interview.

## Deepgram setup

Deepgram's Nova models are the cheapest hosted STT here. Grab a key from
[console.deepgram.com](https://console.deepgram.com) → API Keys, then in `.env.local`:

```bash
STT_PROVIDER=deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key
# optional: override the model (default nova-3)
# DEEPGRAM_MODEL=nova-3
```

`deepgram.ts` POSTs the raw recorded bytes to Deepgram's prerecorded endpoint with
`smart_format` on, so there's no SDK dependency — just a `fetch`.

## Local setup (dev only)

Both engines run through Python. Use one venv for both, and point Node at it:

```bash
# from the repo (or worktree) root
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install openai-whisper kokoro-onnx soundfile   # needs ffmpeg on PATH too
```

Download the Kokoro model files into `models/` (git-ignored):

```bash
mkdir -p models
curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o models/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

Then in `.env.local` (so Node uses the venv without it being activated):

```bash
WHISPER_PYTHON=/ABSOLUTE/PATH/TO/.venv/bin/python   # KOKORO_PYTHON falls back to this
# optional overrides:
WHISPER_MODEL=base                # tiny | base | small | medium | large
KOKORO_VOICE=af_heart             # see kokoro-onnx voices
KOKORO_SPEED=1.0
KOKORO_MODEL=models/kokoro-v1.0.onnx
KOKORO_VOICES=models/voices-v1.0.bin
```

How it works: for STT, Node writes the recorded audio to a temp file and runs
`whisper_transcribe.py <audio> <model>`, reading the transcript from stdout. For
TTS, Node pipes the text to `kokoro_tts.py` (stdin), which writes a WAV; Node then
transcodes it to MP3 via ffmpeg so the browser's `data:audio/mpeg` player works
unchanged. First calls load model weights; later calls reuse them.
