# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — Next.js ESLint
- `npm run typecheck` — `tsc --noEmit`, type-check without emitting

There is no test runner configured yet.

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
