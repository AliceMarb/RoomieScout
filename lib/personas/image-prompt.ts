/** Builds the text prompt sent to the image model for each avatar. */

import { getPersonaMeta } from "./persona";
import type { AvatarPromptStyle } from "./types";

const STYLE_CLASSIC = `
Style: rounded animal mascot only (no humans), soft 3D clay / polished vector sticker, cozy apartment, pastel colors, Spotify Wrapped card vibe.
NOT realistic wildlife. Leave clean space at top third. No text or logos.
`.trim();

const STYLE_COOL = `
Style: stylized animal mascot roommate card (no humans). COOL + FUNKY — Spotify Wrapped meets streetwear sticker pack meets cozy apartment editorial.
NOT baby-cute, NOT chibi, NOT kawaii, NOT plush-toy, NOT oversized sparkly eyes, NOT infant proportions.
Soft 3D clay OR bold vector-sticker hybrid: confident silhouette, subtle attitude, expressive mature mascot design.
Pastel base with punchy accent colors. Modern app-friendly square composition.
Cozy apartment background (bedroom, kitchen, living room) with scene props, softly blurred.
Clean negative space at top third for text overlay. No text, letters, logos, or watermarks.
`.trim();

export function buildAvatarImagePrompt(
  code: string,
  style: AvatarPromptStyle = "cool",
): string {
  const meta = getPersonaMeta(code);
  const props = [...meta.props, meta.accessories].join(", ");
  const styleBlock = style === "cool" ? STYLE_COOL : STYLE_CLASSIC;

  const toneLine =
    style === "cool"
      ? "Prioritize character attitude and roommate personality over cuteness. Cool, fun, shareable — like a personality result you'd post."
      : "Cute, fun, cool, lovable.";

  return `
Create a single square shareable avatar illustration for a roommate personality card.

${styleBlock}

HMTI type: ${code}
Persona: ${meta.title}
Animal mascot: ${meta.animal}
Tagline mood: "${meta.tagline}"
Character direction: ${meta.characterDirection}
Scene: ${meta.scene}
Expression: ${meta.expression}
Household vibe: ${meta.householdEnergy}
Color palette: pastels + accents inspired by ${meta.palette.bgFrom}, ${meta.palette.accent}, ${meta.palette.soft}

Props and accessories: ${props}

Center the ${meta.animal} mascot as the hero with a pose that matches the character direction. ${toneLine}
`.trim();
}
