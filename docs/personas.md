# Personas & avatars

Everything about the 16 HMTI (Housemate Type Indicator) personas lives here — one
folder, one import path: `@/lib/personas`.

## Files

| File | What's in it |
| --- | --- |
| [`data.ts`](data.ts) | **The catalogue** — `PERSONAS`, the single source of truth: every type's title, emoji, description, animal/scene/props, palette, copy, and image-generation direction. Also `HMTI_AXES` (the 4 binary axes) and `AXIS_WEIGHTS`. |
| [`types.ts`](types.ts) | `Persona`, `PersonaMeta`, `PersonaAxis`, `CompatibilityResult`, `AvatarPromptStyle`. |
| [`persona.ts`](persona.ts) | `getPersonaMeta`, `isValidHmtiCode`, `buildPersonaFromAxes`, `computePersona`. |
| [`compatibility.ts`](compatibility.ts) | `computeCompatibility` — scores two personas (0–100 + per-axis breakdown). |
| [`paths.ts`](paths.ts) | `getAvatarPublicPath`, `AVATAR_IMAGE_DIR` — where the avatar images live. |
| [`image-prompt.ts`](image-prompt.ts) | `buildAvatarImagePrompt` — turns a persona into an image-model prompt. |
| [`generate.ts`](generate.ts) | `generateAvatarImage` — server-side OpenAI image generation. **Server-only** (pulls in `openai`); import it directly from `@/lib/personas/generate`, not the barrel. |
| [`index.ts`](index.ts) | Client-safe barrel — import everything (except `generate`) from `@/lib/personas`. |

## Image assets

Generated avatar PNGs are **not** in this folder — they live in
[`public/avatars/<CODE>.png`](../../public/avatars) because Next.js only serves
static files from `public/`. `paths.ts` is the only place that encodes that
location. Regenerate them with the dev server running:

```bash
node scripts/generate-all-avatars.mjs          # all 16 (skips existing)
node scripts/generate-avatar.mjs NPSD           # just one
```

## The 16 types

Code = Cleanliness (**N**eat/**C**asual) · Privacy (**P**rivate/**O**pen) ·
Rhythm (**S**table/**F**luid) · Rules (**D**efined/**L**aid-back).

| Code | Emoji | Title | Animal | Description |
| --- | --- | --- | --- | --- |
| NPSD | 🦉 | The Peaceful Planner | owl | Tidy, private, and routine-driven with clear house rules. |
| NPSL | 🐱 | The Quiet Minimalist | cat | Clean, private, and low-drama — keeps to themselves. |
| NPFD | 🦊 | The Independent Organizer | fox | Organized space, flexible schedule, strong boundaries. |
| NPFL | ✨ | The Clean Ghost | ferret | Barely seen but keeps shared spaces spotless. |
| NOSD | 🐕 | The House Captain | golden-retriever | Friendly leader who runs the home with snacks and systems. |
| NOSL | 🐶 | The Friendly Maintainer | corgi | Warm, tidy, and easygoing — everyone likes them. |
| NOFD | 🐼 | The Social Organizer | red-panda | Social and clean — spontaneous plans, scheduled responsibly. |
| NOFL | 🦜 | The Clean Free Spirit | parrot | Playful energy with surprisingly clean counters. |
| CPSD | 🐢 | The Boundary Keeper | turtle | Private and steady — clear boundaries, calm energy. |
| CPSL | 🐼 | The Easygoing Independent | panda | Chill, private, and low-pressure — no drama. |
| CPFD | 🦔 | The Flexible Boundary Setter | hedgehog | Night owl with flexible routine and clear lines. |
| CPFL | 🦇 | The True Ghost Roommate | bat | Seen once a week — pays rent, barely interferes. |
| COSD | 🫶 | The Communal Manager | capybara | Warm communal living with fair shared expectations. |
| COSL | 🐻 | The Warm Housemate | bear | Emotionally cozy — makes the apartment feel like home. |
| COFD | 🦝 | The Social Negotiator | raccoon | Brings energy and group-chat etiquette to flexible living. |
| COFL | 🦦 | The Party-Compatible Roommate | otter | The living room is a lifestyle — fun and spontaneous. |
