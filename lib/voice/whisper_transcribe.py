#!/usr/bin/env python3
"""Local speech-to-text for RoomieScout dev — transcribes one audio file with openai-whisper.

Usage:
    python whisper_transcribe.py <audio_path> [model]

Prints the transcript to stdout (errors go to stderr, non-zero exit on failure).

Setup:
    pip install openai-whisper      # also needs ffmpeg on PATH

This is the snippet wired into lib/voice/whisper.ts:
    import whisper
    model = whisper.load_model("base")
    result = model.transcribe("audio.mp3")
    print(result["text"])
"""
import sys


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: whisper_transcribe.py <audio_path> [model]", file=sys.stderr)
        return 2

    audio_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "base"

    try:
        import whisper
    except ImportError:
        print(
            "openai-whisper is not installed. Run: pip install openai-whisper",
            file=sys.stderr,
        )
        return 1

    model = whisper.load_model(model_name)
    result = model.transcribe(audio_path)
    print(str(result.get("text", "")).strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
