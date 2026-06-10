# Homi

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
[docs/voice.md](docs/voice.md).

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

## Test URLs (dev only)

| URL | What it shows |
| --- | --- |
| `http://localhost:3000/results/dev-test` | Fully populated results page — two personas (The Peaceful Planner vs The Clean Ghost), 65/100 score, axis breakdown, dealbreakers, upsell card. No interview needed. Any `dev-*` ID works. |
| `http://localhost:3000/results/dev-alice` | Same seed, different name slug — useful for testing name display. |

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
| `app/api/flows/[flowId]/send-link` | POST — emails the results link to a given address |
| `app/api/flows/[flowId]/name` | POST — saves a participant's display name |
| `app/api/flows/pair` | POST — Rendezvous path: matches two people by their mutual email nomination |
| `app/api/avatars/generate` | POST — generates an HMTI avatar image via DALL·E |

### Concept modules (`concepts/`)
| Path | What it does |
| --- | --- |
| `concepts/interview/` | Interview session state, multi-agent orchestration, Scout copy |
| `concepts/personas/` | All 16 HMTI persona types — catalogue, construction, compatibility scoring, avatar paths |
| `concepts/pairing/` | Pairing store — connects two participants and produces a compatibility result |
| `concepts/voice/` | All speech I/O — ElevenLabs TTS + STT, local Whisper STT + Kokoro TTS, provider dispatch |
| `concepts/rendezvous/` | Email-based matching — lets two people find each other without sharing a link |
| `concepts/notification.ts` | Email notification helper (Nodemailer / Gmail) |
| `concepts/risk-assessment/` | **TODO** — paid Risk Assessment concept (not yet wired to routes or payment) |

### Infrastructure (`infrastructure/`)
| Path | What it does |
| --- | --- |
| `infrastructure/openai.ts` | OpenAI client singleton + model pin |
| `infrastructure/kv.ts` | Key-value store abstraction (in-memory in dev, Redis-compatible in prod) |
| `infrastructure/config.ts` | Dev flags — debug TTS/STT, default user ID |
| `infrastructure/weave.ts` | Weave tracing setup (optional observability) |

## Data storage

**Everything is currently in-memory** — no database. Data is lost on server restart and not shared across serverless instances in production. Before going live with real users, replace the KV store (`infrastructure/kv.ts`) with a real backend (Upstash Redis, Supabase, etc.).

## Customising Scout

- Edit Scout's intro and closing lines: `concepts/interview/copy.ts`
- Edit the multi-agent orchestration logic: `concepts/interview/agents/`
- Edit HMTI persona types, descriptions, avatars, and compatibility scoring: `concepts/personas/` (start with `concepts/personas/data.ts`)
- Edit voice providers and dispatch: `concepts/voice/` (see `docs/voice.md`)
