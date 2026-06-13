# Avatar Generation Changelog

## Prompt & script changes (new-avatars worktree)

### Animals
- **CPHF**: changed from `bat` → `sasquatch` (original). Bat implies nocturnal; sasquatch is elusive without implying night-owl behaviour.

### Locations
- All Private (P) personas must be in their own room (desk, bedroom, doorway).
- **NPDF (fox)**: was "clean counter, dishes already done" (kitchen) → fixed to "private desk at odd hours". Counter/dishes are kitchen props, fox is Private.
- **CPDF (hedgehog)**: was "minimal but functional space" (ambiguous) → fixed to "private bedroom desk, late at night". Scene was vague enough to render as a kitchen.
- **NPHF (ferret)** and **CPHF (sasquatch)**: intentional exceptions — both are Private but their character stories require a shared-space moment (ferret cleans the shared kitchen at dawn; sasquatch is caught at the fridge at 2am). Bedroom door is visible for ferret.

### Text-bearing props
All props that inherently carry text have been neutralised:
- "chore chart on the fridge" → "blank chart on the fridge" (NODS)
- "colour-coded wall calendar" → "small wall calendar (no visible text)" (NPDS)
- "cleaning rota pinned to wall" → "small pinboard on wall" (NPHS)
- "fair bills split on the whiteboard" → "blank whiteboard on the wall" (CODS)
- "whiteboard" (CODF) → "blank whiteboard on the wall"
- "group chat buzzing on the counter" → "phone face-down on the counter" (NODS)

### Locked rules (never change)
See `docs/avatar-prompt-rules.md`. No-text, gender-neutral, and no-alcohol rules are locked and must always appear verbatim.

### No alcohol
- Added to locked rules: no alcohol, wine glasses, beer, or drinks that could be interpreted as alcoholic.
- **NODF (parrot)**: "wine glass in hand" → "juice cup in hand" (wine glass appeared in generated image).

### Style reference (edit mode)
- `--ref=PATH` flag switches to `images.edit` with a style reference image
- Currently using `public/avatars/COSL.png` (the original bear) as the style reference
- In edit mode the STYLE block is skipped — the reference image handles style
- Gender-neutral and no-text rules are still included explicitly in edit mode

### Version log
See the VERSION LOG comment at the top of `scripts/generate-avatars-direct.mjs`.
