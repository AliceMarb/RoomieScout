/**
 * Avatar image asset paths (client-safe).
 *
 * The generated PNGs live in `public/avatars/<CODE>.png` rather than inside this
 * folder, because Next.js only serves static files from `public/`. The
 * server-only filesystem dir (`AVATAR_IMAGE_DIR`) lives in `generate.ts`.
 */

/** Public URL for a code's avatar image, e.g. "/avatars/NPSD.png". */
export function getAvatarPublicPath(code: string): string {
  return `/avatars/${code.toUpperCase()}.png`;
}
