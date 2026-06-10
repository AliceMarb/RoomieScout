// Local text-to-speech for dev — synthesizes Scout's voice with kokoro-onnx
// (~82M params, MPS/CoreML-friendly on Apple Silicon), so you don't spend
// ElevenLabs quota. Kokoro emits WAV; we transcode to MP3 with ffmpeg so the
// client's <audio data:audio/mpeg> path works unchanged.
//
// Setup (once):
//   pip install kokoro-onnx soundfile        # plus ffmpeg on PATH
//   # download the model files — see ./README.md
// Then in .env.local:
//   TTS_PROVIDER=kokoro                       # (auto in dev)
//
// See ./README.md for the model/voice/python overrides.
import { spawn } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  KOKORO_PYTHON,
  KOKORO_MODEL,
  KOKORO_VOICES,
  KOKORO_VOICE,
  KOKORO_SPEED,
} from "@/infrastructure/config";

const SCRIPT = join(process.cwd(), "concepts", "voice", "kokoro_tts.py");

// Model paths may be relative (default) or absolute (env override).
function resolvePath(p: string): string {
  return isAbsolute(p) ? p : join(process.cwd(), p);
}

export async function kokoroTextToSpeech(text: string): Promise<Buffer> {
  const wavPath = join(tmpdir(), `roomiescout-tts-${randomUUID()}.wav`);
  try {
    await runKokoro(text, wavPath);
    return await wavFileToMp3(wavPath);
  } finally {
    await unlink(wavPath).catch(() => {});
  }
}

function runKokoro(text: string, outWav: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(KOKORO_PYTHON, [
      SCRIPT,
      resolvePath(KOKORO_MODEL),
      resolvePath(KOKORO_VOICES),
      KOKORO_VOICE,
      String(KOKORO_SPEED),
      outWav,
    ]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) =>
      reject(
        new Error(
          `Failed to launch Kokoro via "${KOKORO_PYTHON}". Is kokoro-onnx installed? (${err.message})`
        )
      )
    );
    proc.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Kokoro exited with code ${code}: ${stderr.trim() || "(no stderr)"}`))
    );
    // Pass the (possibly long, quote-heavy) text over stdin, not argv.
    proc.stdin.write(text);
    proc.stdin.end();
  });
}

function wavFileToMp3(wavPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-loglevel", "error", "-i", wavPath, "-f", "mp3", "pipe:1"]);
    const chunks: Buffer[] = [];
    let stderr = "";
    proc.stdout.on("data", (d) => chunks.push(d as Buffer));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) =>
      reject(new Error(`Failed to launch ffmpeg (needed to encode Kokoro audio): ${err.message}`))
    );
    proc.on("close", (code) =>
      code === 0
        ? resolve(Buffer.concat(chunks))
        : reject(new Error(`ffmpeg exited with code ${code}: ${stderr.trim() || "(no stderr)"}`))
    );
  });
}
