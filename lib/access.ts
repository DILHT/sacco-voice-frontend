// Shared access check used by middleware.ts and app/api/token/route.ts.

export const ACCESS_COOKIE = 'demo_access';

/**
 * Compare two strings in constant time: the loop always runs to the end, so
 * how long the check takes doesn't reveal how much of a guessed code was right.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * True if this visitor may use the demo.
 * Fails CLOSED: if no code is configured, access is refused everywhere
 * except local development.
 */
export function isAccessAllowed(provided: string | undefined): boolean {
  const expected = process.env.DEMO_ACCESS_CODE;
  if (!expected) return process.env.NODE_ENV === 'development';
  return provided !== undefined && safeEqual(provided, expected);
}