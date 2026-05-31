/** Client-safe helpers for generated avatar image paths. */

export function getAvatarPublicPath(code: string): string {
  return `/avatars/${code.toUpperCase()}.png`;
}
