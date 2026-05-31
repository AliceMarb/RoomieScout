# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — Next.js ESLint
- `npm run typecheck` — `tsc --noEmit`, type-check without emitting

There is no test runner configured yet.

## Architecture

RoomieScout is a Next.js 15 App Router + React 19 + TypeScript boilerplate. It implements a single end-to-end request path that is meant to be extended:

1. `components/SubmitForm.tsx` — a client component (`"use client"`) that owns form state and `POST`s `{ text }` to `/api/submit`, then renders the JSON response or an error.
2. `app/api/submit/route.ts` — the API route handler. It validates/trims the incoming `text`, returns `400` on bad input, and delegates to `processSubmission`.
3. `lib/business-logic.ts` — `processSubmission({ text })` is the **placeholder seam where real logic goes** (DB writes, LLM calls, integrations). It currently echoes input. Its `ProcessSubmissionInput` / `ProcessSubmissionResult` types are the contract between the route and the business layer.

When changing the response shape, keep three places in sync: the `ProcessSubmissionResult` type in `lib/business-logic.ts`, the route handler, and the `SubmitResult` type duplicated in `components/SubmitForm.tsx`.

`@/*` resolves to the repo root (see `tsconfig.json`), so imports use `@/lib/...`, `@/components/...`.

Add environment variables to `.env.local` (template: `.env.local.example`).
