// Map an audio mime type to the file extension downstream STT expects. iOS Safari
// records audio/mp4, so a hardcoded ".webm" name makes some transcribers reject
// the bytes as corrupted (e.g. ElevenLabs Scribe's invalid_content).
export function extForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "mp4";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  return "webm";
}
