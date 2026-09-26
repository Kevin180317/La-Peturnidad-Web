export const ACCESS_COOKIE = "lt_admin_at";
export const REFRESH_COOKIE = "lt_admin_rt";

/**
 * Minimal structural type for Astro's `context.cookies`, declared here so the
 * guard can be unit tested with a plain object instead of a live Astro context.
 */
export interface SessionCookies {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete(name: string, options: Record<string, unknown>): void;
}

export const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: "strict",
} as const;

/**
 * Parses a Cookie header into a plain record. Pure: no Astro or DOM types, so
 * it can be exercised directly from bun test.
 */
export function parseCookies(
  header: string | null | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    const key = part.slice(0, separator).trim();
    if (!key) continue;

    const raw = part.slice(separator + 1).trim();
    try {
      out[key] = decodeURIComponent(raw);
    } catch {
      out[key] = raw;
    }
  }

  return out;
}

export function readAccessToken(request: Request): string | null {
  return parseCookies(request.headers.get("cookie"))[ACCESS_COOKIE] ?? null;
}

export function readRefreshToken(request: Request): string | null {
  return parseCookies(request.headers.get("cookie"))[REFRESH_COOKIE] ?? null;
}
