// Local speech-to-text for dev — shells out to openai-whisper running in Python,
// so you can transcribe mic input without spending ElevenLabs quota.
//
// Setup (once):
//   pip install openai-whisper      # and have ffmpeg on PATH
// Then in .env.local:
//   STT_PROVIDER=whisper
//
// See ./README.md for details and the model/python overrides.
import { spawn } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { WHISPER_MODEL, WHISPER_PYTHON } from "@/lib/config";
import { extForMime } from "./mime";

const SCRIPT = join(process.cwd(), "lib", "voice", "whisper_transcribe.py");

export async function whisperSpeechToText(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<string> {
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Whisper STT skipped: empty audio buffer");
  }
  // Whisper reads from disk (via ffmpeg), so stage the bytes in a temp file.
  const tmpPath = join(tmpdir(), `roomiescout-${randomUUID()}.${extForMime(mimeType)}`);
  await writeFile(tmpPath, audioBuffer);
  try {
    return await runWhisper(tmpPath);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

function runWhisper(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(WHISPER_PYTHON, [SCRIPT, audioPath, WHISPER_MODEL]);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) =>
      reject(
        new Error(
          `Failed to launch Whisper via "${WHISPER_PYTHON}". Is Python + openai-whisper installed? (${err.message})`
        )
      )
    );
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`Whisper exited with code ${code}: ${stderr.trim() || "(no stderr)"}`));
    });
  });
}
