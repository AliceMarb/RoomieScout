/**
 * Avatar image asset paths (client-safe).
 *
 * The generated PNGs live in `public/avatars/<CODE>.png` rather than inside this
 * folder, because Next.js only serves static files from `public/`. The
 * server-only filesystem dir (`AVATAR_IMAGE_DIR`) lives in `generate.ts`.
 */

// v2 codes without their own PNG yet — mapped to v1 PNGs with the same animal.
const V2_AVATAR_FALLBACK: Record<string, string> = {
  CPDF: "CPFD", // hedgehog
  CPHS: "CPSL", // panda
  CPHF: "CPFL", // bat
  CODS: "COSD", // capybara
  CODF: "COFD", // raccoon
  COHS: "COSL", // bear
  COHF: "COFL", // otter
};

/** Public URL for a code's avatar image, e.g. "/avatars/NPDS.png". */
export function getAvatarPublicPath(code: string): string {
  const upper = code.toUpperCase();
  const resolved = V2_AVATAR_FALLBACK[upper] ?? upper;
  return `/avatars/${resolved}.png`;
}
