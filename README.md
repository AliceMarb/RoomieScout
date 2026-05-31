# RoomieScout

A minimal Next.js boilerplate: a single page with a text input that POSTs to a backend route, which calls a placeholder business-logic function and returns its result.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Home page with the submit form |
| `app/api/submit/route.ts` | Receives the form text and calls business logic |
| `lib/business-logic.ts` | **Add your business logic here** (`processSubmission`) |
| `components/SubmitForm.tsx` | Client-side form + response display |

## Wiring real business logic

Open `lib/business-logic.ts` and replace the body of `processSubmission`. It receives `{ text }` and should return a JSON-serializable result. The API route at `app/api/submit/route.ts` already validates input and forwards it.
