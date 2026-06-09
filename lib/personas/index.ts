/**
 * Personas & avatars — one home for everything about the 16 HMTI housemate
 * types: the catalogue (copy + visuals), persona construction, compatibility
 * scoring, avatar image paths, and image generation.
 *
 * Import from `@/lib/personas` everywhere. See `data.ts` for the catalogue and
 * `README.md` for the full list of types and where the image assets live.
 */

// Types
export type {
  Persona,
  PersonaAxis,
  PersonaMeta,
  HmtiAvatarMeta,
  CompatibilityResult,
  AvatarPromptStyle,
} from "./types";

// Catalogue (source of truth)
export { PERSONAS, HMTI_AVATARS, HMTI_AXES, HMTI_CODES, AXIS_WEIGHTS } from "./data";

// Persona lookups & construction
export {
  getPersonaMeta,
  getHmtiAvatarMeta,
  isValidHmtiCode,
  buildPersonaFromAxes,
  computePersona,
} from "./persona";

// Compatibility scoring
export { computeCompatibility } from "./compatibility";

// Avatar image assets & prompt (client-safe)
export { getAvatarPublicPath } from "./paths";
export { buildAvatarImagePrompt } from "./image-prompt";

// NOTE: server-only avatar *generation* (OpenAI image calls) is intentionally
// NOT re-exported here — importing it would pull `openai`/`weave` into client
// bundles. Import it directly from "@/lib/personas/generate" in server code.
