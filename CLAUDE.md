# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — Next.js ESLint
- `npm run typecheck` — `tsc --noEmit`, type-check without emitting

There is no test runner configured yet.

## Design system

The UI follows one deliberate language — **Swiss functional**: warm paper canvas, ink type, a single warm-coral accent, hairline rules and a faint background grid, with **Space Grotesk** (display) + **Inter** (body). Build every screen from these pieces; do not introduce ad-hoc colors, fonts, or one-off slate/`bg-white` styling.

- **Tokens live in two places only.** Color/spacing/radius tokens are CSS variables in `app/globals.css` (`:root`) and surfaced as Tailwind utilities in `tailwind.config.ts`. Use the semantic names — never raw hex or Tailwind's default palette (`slate-*`, `red-*`, etc.):
  - Color: `bg-paper`, `bg-surface`, `text-ink` / `text-ink-soft` / `text-ink-faint`, `border-line`, `bg-accent` / `text-accent` / `text-accent-ink` / `bg-accent-soft`. All are RGB-channel vars, so alpha modifiers work (`bg-accent/10`, `ring-accent/60`).
  - Type: `font-display` (Space Grotesk) for headings/codes/numbers, `font-sans` (Inter) for body. Fonts are wired via `next/font` in `app/layout.tsx`.
  - Errors use `text-accent-ink` (coral), not red.
- **Shared primitives are in `components/ui.tsx`.** Reach for these before writing markup: `PageShell` (canvas + grid + centered `max-w-page` column), `Wordmark`, `Card`, `Button` (`variant`: `solid` ink / `accent` coral / `outline` / `ghost`), `Input`, `Textarea`, `Field` (labelled control), `Eyebrow`, `RuleLabel`, and the `cn()` class joiner.
- **Signature motifs:** the `.eyebrow` class (tiny uppercase tracked label) titles most sections; `RuleLabel` / `.rule-label` draws an eyebrow followed by a hairline that fills the row; `.bg-grid` is the faint margin grid; numerals/codes use `.tnum` (tabular). Spectrum/score bars are 1px `bg-line` tracks with a coral fill/marker (see `PersonaCard` and `ResultsView`).
- A page = `PageShell` › `Wordmark` › a header (`eyebrow` + `font-display` h1 + `text-ink-soft` subtitle) › `Card`-wrapped content.

## Architecture

RoomieScout is a Next.js 15 App Router + React 19 + TypeScript app implementing an AI roommate compatibility test. **Two subsystems run side by side and are not yet joined — understanding that seam is the key to working here:** a live multi-agent voice interview (real OpenAI + ElevenLabs), and a 4-page "matching flow" that still uses placeholder text inputs and deterministic stub scoring.

### 1. The voice interview (live, real AI)
Scout interviews one person at a time through a multi-agent loop, then classifies them into roommate personas. Everything here is keyed by a free-form `userId` (**not** a flowId).

- **`components/InterviewPage.tsx`** (rendered at `/`) drives the browser: records mic audio, POSTs to the interview API, plays back Scout's TTS audio, renders the running transcript. Falls back to a text box.
- **`lib/agents/`** is the brain, all imported via `lib/agents/index.ts`:
  - `orchestrator.ts` repeatedly picks which of four domains (`communication`, `cleanliness`, `social`, `personal_space` — `types.ts` `ALL_DOMAINS`) to probe next, then asks a specialist. The loop ends when all domains are `satisfied`, `MAX_TURNS` (12) is hit, or the orchestrator says `done`.
  - `specialist.ts` generates one question for a domain and signals when it's satisfied (capped at `MAX_QUESTIONS_PER_AGENT`).
  - `classifier.ts` maps the full transcript to a top-3 persona breakdown.
  - Every agent is an OpenAI JSON-mode call (`lib/openai.ts`, model pinned in `MODEL`) wrapped in a try/catch with a **hardcoded fallback**, so a bad LLM response degrades instead of breaking the interview. Prompts live in `prompts.ts`. (`lib/scoutPrompt.ts` is legacy — imported by nothing.)
- **`lib/transcriptStore.ts`** — in-memory `Map<userId, Session>` on `globalThis`; holds the transcript + live `InterviewState`.
- **`lib/voice/`** — all speech I/O behind one barrel (`@/lib/voice` → `textToSpeech`, `speechToText`). Two dispatchers pick a provider per direction: `tts.ts` by `TTS_PROVIDER` (local `kokoro` via `kokoro_tts.py` in dev | cloud `elevenlabs` in prod) and `stt.ts` by `STT_PROVIDER` (local `whisper` via `whisper_transcribe.py` in dev | cloud `elevenlabs` or `deepgram` in prod); set the env var to force either. `elevenlabs.ts` holds the cloud TTS+STT; `deepgram.ts` is cloud Deepgram STT (cheapest cloud option); `kokoro.ts`/`whisper.ts` shell out to Python (one venv, `WHISPER_PYTHON`). Gated by debug flags in `lib/config.ts` (`DEBUG_TTS`/`DEBUG_STT`/`DEBUG_AGENTS`); in dev, local TTS failures degrade to text instead of erroring. See `lib/voice/README.md`.
- API under `app/api/interview/{start,respond,transcript}`: `start` creates the session + first question; `respond` accepts audio (multipart) or text (JSON), appends the answer, returns the next question — or the closing line + personas when done.

### 2. The matching flow (still stubbed)
A `flowId` threads four pages together; this half has **not** been wired to the interview/persona output above.

1. **Home `/`** — renders the voice interview (`InterviewPage`).
2. **Share `/share/[flowId]`** (`SharePanel`) — initiator saves email (`POST .../email`) and copies the join link.
3. **Join `/join/[flowId]`** (`JoinForm`) — **still a `Textarea` placeholder** that POSTs raw text to `.../respond`, which computes the result and stamps `resultsReadyAt`.
4. **Results `/results/[flowId]`** (`ResultsView`) — polls `GET /api/flows/[flowId]` every 1s; spinner until status flips to `completed`, then shows the score + category breakdown.

- `lib/store.ts` — `Map<flowId, MatchingFlow>` on `globalThis`. Status is *derived*, not stored: `getStatus()` returns `processing` until `Date.now() >= resultsReadyAt`, then `completed` — this is what makes the polling loading screen work without background timers.
- `lib/business-logic.ts` — **deterministic hash-based placeholders**: `computeCompatibility()` (score + categories) and `computePersona()` (the 16-type HMTI built from 4 binary axes). Same inputs → same output. `CompatibilityResult` and `Persona` here are the shared contracts imported by the flow routes, `ResultsView`, and `PersonaCard` — change the shape here, not in copies.

### The open seam (most likely next work)
System 1 produces real transcripts + personas; system 2's result still comes from `computeCompatibility(initiatorInput, roommateInput)` over placeholder strings. Connecting them — feeding interview transcripts/personas into the flow and replacing the hash stubs — is the central unfinished integration. Stubs are marked `TODO`: `JoinForm` and `StartMatchingForm` (raw `Textarea`s instead of voice interview), `business-logic.ts` (hash placeholders), and both stores.

### Email (now live)
`lib/email.ts` (`sendResultsEmail`) is real: Nodemailer over Gmail, gated on `EMAIL_USER`/`EMAIL_PASS`, throwing if unset. The flow respond route fires it best-effort (`.catch` logs, never blocks the response) once a roommate submits, but only if `SharePanel` saved an `initiatorEmail` first. The results link is built from `NEXT_PUBLIC_APP_URL`. Note: `resend` is in `package.json` but unused — Nodemailer is the live path.

### Conventions
- **API route pattern:** parse JSON (400 on bad body), check the resource exists (404), then act. LLM/agent calls always carry a fallback.
- **Both stores are in-memory only** — lost on restart, not shared across serverless instances. `TODO` swap for a DB.
- `@/*` resolves to the repo root (`tsconfig.json`); imports use `@/lib/...`, `@/components/...`.
- Env vars go in `.env.local`. Required: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`. Email: `EMAIL_USER`, `EMAIL_PASS` (Gmail app password), `NEXT_PUBLIC_APP_URL`. Optional: `ELEVENLABS_VOICE_ID`. Debug flags are client-side, so they carry the `NEXT_PUBLIC_` prefix in the environment (`NEXT_PUBLIC_DEBUG_TTS`/`_STT`/`_AGENTS`, `NEXT_PUBLIC_DEFAULT_USER_ID`) even though `lib/config.ts` re-exports them as `DEBUG_TTS`/etc. Template: `.env.local.example`.
