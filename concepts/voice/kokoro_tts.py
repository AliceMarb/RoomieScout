#!/usr/bin/env python3
"""Local text-to-speech for RoomieScout dev — synthesizes speech with kokoro-onnx.

Usage:
    python kokoro_tts.py <model_path> <voices_path> <voice> <speed> <out_wav>

Text to speak is read from stdin. Writes a WAV file to <out_wav>.
Errors go to stderr with a non-zero exit.

Setup:
    pip install kokoro-onnx soundfile
    # plus the model files — see lib/voice/README.md

Wired into lib/voice/kokoro.ts. Mirrors the upstream snippet:
    from kokoro_onnx import Kokoro
    kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
    samples, sample_rate = kokoro.create("Hello", voice="af_heart", speed=1.0)
    import soundfile as sf
    sf.write("output.wav", samples, sample_rate)
"""
import sys


def main() -> int:
    if len(sys.argv) < 6:
        print("usage: kokoro_tts.py <model> <voices> <voice> <speed> <out_wav>", file=sys.stderr)
        return 2

    model_path, voices_path, voice, speed, out_wav = sys.argv[1:6]

    text = sys.stdin.read().strip()
    if not text:
        print("no text provided on stdin", file=sys.stderr)
        return 2

    try:
        from kokoro_onnx import Kokoro
        import soundfile as sf
    except ImportError as exc:
        print(
            f"missing dependency ({exc}). Run: pip install kokoro-onnx soundfile",
            file=sys.stderr,
        )
        return 1

    try:
        kokoro = Kokoro(model_path, voices_path)
    except Exception as exc:  # noqa: BLE001 — surface a clear setup hint
        print(
            f"could not load Kokoro model files ({exc}). "
            f"Did you download {model_path} and {voices_path}? See lib/voice/README.md",
            file=sys.stderr,
        )
        return 1

    samples, sample_rate = kokoro.create(text, voice=voice, speed=float(speed))
    sf.write(out_wav, samples, sample_rate)
    return 0


if __name__ == "__main__":
    sys.exit(main())
