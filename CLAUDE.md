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

RoomieScout is a Next.js 15 App Router + React 19 + TypeScript app implementing an AI roommate compatibility test. It is a 4-page flow built around a single in-memory resource (a "matching flow"). The AI interview and email/notification pieces are intentionally **stubbed with `TODO`s** — the wiring is complete end-to-end.

### The flow (one `flowId` threads through all 4 pages)
1. **Home `/`** (`StartMatchingForm`) — initiator's input → `POST /api/flows` → redirect to `/share/[flowId]`.
2. **Share `/share/[flowId]`** (`SharePanel`) — initiator saves email (`POST /api/flows/[flowId]/email`) and copies the join link.
3. **Join `/join/[flowId]`** (`JoinForm`) — roommate's input → `POST /api/flows/[flowId]/respond` (computes result, stamps `resultsReadyAt`, logs the TODO email) → redirect to `/results/[flowId]`.
4. **Results `/results/[flowId]`** (`ResultsView`) — polls `GET /api/flows/[flowId]` every 1s; shows a processing spinner until status flips to `completed`, then the score + category breakdown.

### Key pieces
- `lib/store.ts` — the source of truth: a `Map<flowId, MatchingFlow>` pinned to `globalThis` (survives dev hot-reload). **In-memory only — lost on restart, not shared across serverless instances; `TODO` swap for a DB.** Status is *derived*, not stored: `getStatus()` returns `processing` until `Date.now() >= resultsReadyAt`, then `completed`. This is what makes the polling loading screen work without background timers.
- `lib/business-logic.ts` — `computeCompatibility(initiatorInput, roommateInput)` is the **placeholder for the real AI scoring**. It's a deterministic hash-based stub (same inputs → same score). `CompatibilityResult` is the contract shared by the respond route, the GET route, and `ResultsView`.
- API routes live under `app/api/flows/...` and follow one validation pattern: parse JSON (400 on bad body), check the flow exists (404), then act.

When changing the result shape, update `CompatibilityResult` in `lib/business-logic.ts` — `ResultsView` and the routes import it, so there's a single source of truth (no duplicated types).

### Stubs to replace (search for `TODO`)
- AI agent → the textareas in `StartMatchingForm` / `JoinForm`.
- Real scoring → `computeCompatibility` in `lib/business-logic.ts`.
- Initiator email notification → `console.log` in `app/api/flows/[flowId]/respond/route.ts`.
- Persistence → `lib/store.ts`.

`@/*` resolves to the repo root (see `tsconfig.json`), so imports use `@/lib/...`, `@/components/...`.

Add environment variables to `.env.local` (template: `.env.local.example`).
