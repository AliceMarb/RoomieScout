# Avatar Style Rules

Internal rules for avatar generation. These are OUR rules — not all of them are sent verbatim to OpenAI. They exist so we don't accidentally break things when editing prompts or palettes.

## No text

```
No text, letters, logos, or watermarks anywhere in the image including on props.
```

This means scene descriptions must not include props that inherently carry text (whiteboards, chore charts, calendars, rottas, phone screens, signs, labels). Replace them with blank/visual equivalents — e.g. "blank whiteboard" not "whiteboard with bills split", "small pinboard" not "cleaning rota".

## No alcohol
Do not describe alcohol in accessories or scenes (wine glass, beer, etc.). The no-alcohol rule is also sent to OpenAI in the prompt.

## Casual (C) personas should look lived-in
C = Casual cleanliness axis. Scenes for C personas should have a few things lying around — spare hoodie, empty wrappers, stuff where it landed. Not messy, just comfortably imperfect. N = Neat personas should look clean and tidy.

## No drab colours
Every persona must have a distinct, vibrant pastel palette. No flat grey, flat brown, or muted monochrome palettes. If a palette looks drab, change it. Each persona should feel visually different from the others.

## 3 palette colours per persona
Each persona's palette spec should have 3 colours — a background tone, an accent, and a warm secondary/contrast. The palette line in PROMPTS should read: `"[description] — #hex1, #hex2, #hex3"`. Props and accessories can introduce their own natural colours on top (pizza can be orange, plants can be green etc.) — that's fine.

## Gender-neutral

```
Gender-neutral: no pearls, jewellery, eyelashes, makeup, bows, ties or other masculine/feminine markers. Keep the character androgynous.
```

Never shorten this list. Never replace with just "gender-neutral". The full list of exclusions must be present.
