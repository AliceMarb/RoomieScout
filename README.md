# RoomieScout

A Next.js app that matches potential roommates through a voice interview. Scout (an AI interviewer) speaks questions, listens to answers, and produces a **Housemate Type** (HMTI) for each person. Once both people complete the interview, a compatibility score and breakdown is shown.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- ElevenLabs (text-to-speech + speech-to-text)
- OpenAI (multi-agent interview orchestration)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Free local voice (dev)

In dev, speech runs on free **local** engines by default — Whisper for
speech-to-text and Kokoro for text-to-speech — so the interview works without any
ElevenLabs quota (production still uses ElevenLabs). One-time setup:

```bash
# 1) Python deps in a venv (needs ffmpeg on PATH: brew install ffmpeg)
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install openai-whisper kokoro-onnx soundfile

# 2) Kokoro model files (git-ignored)
mkdir -p models
curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o models/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

# 3) Point Node at the venv (so you don't have to keep it activated)
echo "WHISPER_PYTHON=$(pwd)/.venv/bin/python" >> .env.local
```

Then `npm run dev`. To force the cloud engines instead, set `STT_PROVIDER=elevenlabs`
/ `TTS_PROVIDER=elevenlabs` in `.env.local`. Full details, voices, and overrides:
[lib/voice/README.md](lib/voice/README.md).

## How a match works

```
Alice does the voice interview
        │
        ▼
  flowId: abc-123 created
        │
        ├─ /share/abc-123     ← Alice sees her Housemate Type, copies a link
        │
        └─ /join/abc-123      ← Alice sends this link to Bob
                │
                ▼
          Bob does the voice interview
                │
                ▼
        /results/abc-123      ← Both Alice & Bob can see the compatibility results
```

> **Note:** Anyone with the flowId link can view the results — there is no login or email gating yet. The flowId is a UUID (hard to guess, but not secret if shared further).

## Environment variables

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

```env
# ElevenLabs — TTS + STT. Get from: https://elevenlabs.io → Profile → API Keys
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI — agent orchestration. Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — override the default ElevenLabs voice (George)
# ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

## Email setup (Gmail)

When the roommate completes their interview, an email is sent to the initiator. Uses Nodemailer with a Gmail app password — no new account needed.

1. Make sure **2-Step Verification** is on for your Google account
2. Go to **https://myaccount.google.com/apppasswords**
3. Generate a password for "Mail" → copy the 16-character code
4. Add to `.env.local`:

```env
EMAIL_USER=you@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app   # or http://localhost:3000 in dev
```

## Debug flags

ElevenLabs charges per character — use these flags during development to avoid burning quota. Set in `.env.local` and **restart the server** after any change.

| Flag | What it does |
| --- | --- |
| `NEXT_PUBLIC_DEBUG_TTS=true` | Skips ElevenLabs TTS — questions appear in the transcript but are not spoken |
| `NEXT_PUBLIC_DEBUG_STT=true` | Skips ElevenLabs STT — returns a canned response instead of transcribing your voice |
| `NEXT_PUBLIC_DEFAULT_USER_ID=alice` | Pre-fills the user ID and hides the name input |

**Common setups:**

```env
# Full debug — no API calls at all (safe for rapid UI testing)
NEXT_PUBLIC_DEBUG_TTS=true
NEXT_PUBLIC_DEBUG_STT=true

# Test real transcription without spending TTS quota
NEXT_PUBLIC_DEBUG_TTS=true
NEXT_PUBLIC_DEBUG_STT=false

# Full live mode — both flags off or absent
```

> The free ElevenLabs tier gives **10,000 characters/month**. The Scout intro + first question is ~500 chars, so ~20 full runs. Use debug mode liberally.

## Where things live

### Pages
| Path | What it is |
| --- | --- |
| `app/page.tsx` | Home — renders the voice interview UI |
| `app/share/[flowId]/page.tsx` | Shows the initiator's Housemate Type + share link |
| `app/join/[flowId]/page.tsx` | The roommate's interview entry point |
| `app/results/[flowId]/page.tsx` | Compatibility score and breakdown for both people |

### API routes
| Path | What it does |
| --- | --- |
| `app/api/interview/start` | POST — starts a Scout interview session, returns first question + audio |
| `app/api/interview/respond` | POST — accepts voice (multipart) or text (JSON), returns next question + audio |
| `app/api/interview/transcript` | GET — fetch one user's transcript or all (`?all=true`) |
| `app/api/flows` | POST — creates a new matching flow |
| `app/api/flows/[flowId]` | GET — returns flow status and results (once ready) |
| `app/api/flows/[flowId]/respond` | POST — roommate submits their answers, triggers compatibility calculation + email |
| `app/api/flows/[flowId]/email` | POST — (re)sends the results email to the initiator |

### Key library files
| Path | What it does |
| --- | --- |
| `lib/voice/` | All speech I/O — ElevenLabs TTS + STT, local Whisper STT, provider dispatch (see `lib/voice/README.md`) |
| `lib/transcriptStore.ts` | In-memory interview session store (lost on server restart) |
| `lib/store.ts` | In-memory matching flow store (lost on server restart) |
| `lib/business-logic.ts` | HMTI persona + compatibility score calculation (currently deterministic placeholders) |
| `lib/agents/` | Multi-agent interview orchestration (orchestrator + specialist agents) |
| `lib/interview.ts` | Scout's static intro text and fallback questions |
| `lib/scoutPrompt.ts` | Scout's system prompt (ready to wire to Claude) |
| `lib/email.ts` | Nodemailer email helper |
| `lib/config.ts` | Dev flags — debug TTS/STT, default user ID |

## Data storage

**Everything is currently in-memory** — no database. Data is lost on server restart and not shared across serverless instances in production. Before going live with real users, replace `lib/store.ts` and `lib/transcriptStore.ts` with a real database (Supabase, Vercel Postgres, etc.).

## Customising Scout

- Edit questions/intro: `lib/interview.ts`
- Edit Scout's persona and reasoning: `lib/scoutPrompt.ts`
- Edit the multi-agent logic: `lib/agents/orchestrator.ts` and `lib/agents/specialist.ts`
- Edit HMTI types and compatibility scoring: `lib/business-logic.ts`
