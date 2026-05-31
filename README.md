# RoomieScout

A Next.js app with a voice interview agent powered by ElevenLabs. Users answer roommate-matching questions out loud — Scout speaks each question, listens to the answer, and builds a full transcript.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- ElevenLabs (text-to-speech + speech-to-text)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

Create a `.env.local` file in the project root:

```env
# Required — get this from https://elevenlabs.io → Profile → API Keys
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — override the default voice (George). Find voice IDs in the ElevenLabs voice library.
# ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

> Sign up at https://elevenlabs.io → profile icon → **Profile + API key**

## Debug flags

ElevenLabs charges per character — use these flags during development to avoid burning quota. Set them in `.env.local` and **restart the server** after any change.

| Flag | What it does |
| --- | --- |
| `NEXT_PUBLIC_DEBUG_TTS=true` | Skips ElevenLabs TTS — questions appear in the transcript but are not spoken |
| `NEXT_PUBLIC_DEBUG_STT=true` | Skips ElevenLabs STT — returns `"This is a debug response."` instead of transcribing your voice |
| `NEXT_PUBLIC_DEFAULT_USER_ID=alice` | Pre-fills the user ID and hides the name input — set automatically to `debug-user` when either debug flag is on |

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

> The free ElevenLabs tier gives **10,000 characters/month**. The Scout intro + first question alone is ~500 chars, so 20 full test runs would exhaust it. Use debug mode liberally.

## Where things live

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Home page — renders the interview UI |
| `components/InterviewPage.tsx` | Voice interview UI (hold-to-record, transcript bubbles) |
| `app/api/interview/start/route.ts` | POST — creates a session, returns first question + audio |
| `app/api/interview/respond/route.ts` | POST — transcribes answer, returns next question + audio |
| `app/api/interview/transcript/route.ts` | GET — fetch transcript for a user or all users |
| `lib/elevenlabs.ts` | ElevenLabs TTS and STT helpers |
| `lib/transcriptStore.ts` | In-memory session store (resets on server restart) |
| `lib/interview.ts` | Scout's intro text and static interview questions |
| `lib/config.ts` | Dev flags — debug TTS/STT, default user ID |
| `lib/scoutPrompt.ts` | Scout's agent system prompt (wired to Claude when LLM layer is added) |

## How the interview works

1. User enters their name/ID and clicks **Start**
2. The app calls `/api/interview/start` → gets the first question as audio
3. User holds the 🎙 button and speaks their answer
4. On release, audio is sent to `/api/interview/respond` → transcribed via ElevenLabs STT
5. The next question plays automatically — repeat until all 10 questions are done
6. Full transcript is stored in memory and retrievable via `/api/interview/transcript?userId=NAME`

## Customising questions

Open `lib/interview.ts` to edit Scout's intro or the list of interview questions.
