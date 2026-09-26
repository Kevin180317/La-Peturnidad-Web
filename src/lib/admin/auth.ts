import { getAdminClient } from "../supabase/admin";
import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  REFRESH_COOKIE,
  readAccessToken,
  readRefreshToken,
  type SessionCookies,
} from "./cookies";

export const ADMIN_ROLES = ["admin", "moderator"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Refresh the access token when it expires in less than this. */
export const REFRESH_WINDOW_MS = 5 * 60 * 1000;

export interface AdminSession {
  userId: string;
  role: AdminRole;
  email: string | null;
}

export type GuardResult =
  | { ok: true; session: AdminSession }
  | { ok: false; status: 401 | 403; error: string };

interface TokenPayload {
  exp?: number;
}

/**
 * Decodes the `exp` claim of a JWT without verifying the signature.
 *
 * The value is only used to decide *whether* to attempt a refresh. The token is
 * never trusted on the basis of this: every request is re-verified against
 * Supabase Auth via getUser() below.
 */
export function readTokenExpiry(
  token: string
): { expiresAt: number } | { expired: true } | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    const normalized = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized)) as TokenPayload;
    if (typeof payload.exp !== "number") return null;
    return { expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}

export function shouldRefresh(
  token: string,
  now: number,
  windowMs: number = REFRESH_WINDOW_MS
): boolean {
  const claims = readTokenExpiry(token);
  if (!claims || "expired" in claims) return false;
  return claims.expiresAt - now < windowMs;
}

export function hasAdminRole(
  role: string | null | undefined
): role is AdminRole {
  return (
    typeof role === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(role)
  );
}

/**
 * Asks Supabase Auth to confirm the token is genuine and unexpired.
 *
 * getUser() is called with the admin's own token, so this hits /auth/v1/user
 * *as that user*. The service_role key only authorises the request, it does not
 * substitute for the identity being checked.
 */
async function verifyToken(
  token: string
): Promise<{ userId: string; email: string | null } | null> {
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error || !data?.user) return null;
  return { userId: data.user.id, email: data.user.email ?? null };
}

/**
 * Reads the role for an already-verified user id.
 *
 * This deliberately queries user_profiles with the service_role client instead
 * of calling the is_moderator_or_admin() RPC. The RPC relies on auth.uid(),
 * which is always null on a service_role client, so calling it here would
 * return false for every request and lock every admin out.
 */
async function fetchRole(userId: string): Promise<string | null> {
  const { data, error } = await getAdminClient()
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("requireAdmin: could not read user role:", error.message);
    return null;
  }
  return (data?.role as string | undefined) ?? null;
}

async function rotateSession(
  refreshToken: string,
  cookies: SessionCookies
): Promise<GuardResult | null> {
  const { data, error } = await getAdminClient().auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error || !data.session) return null;

  const session = data.session;
  const userId = session.user?.id;
  if (!userId) return null;

  const role = await fetchRole(userId);
  if (!hasAdminRole(role)) {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  cookies.set(ACCESS_COOKIE, session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: Math.max(
      0,
      Math.floor((session.expires_in ?? 3600) - REFRESH_WINDOW_MS / 1000)
    ),
  });
  cookies.set(REFRESH_COOKIE, session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    ok: true,
    session: { userId, role, email: session.user?.email ?? null },
  };
}

export function clearSession(cookies: SessionCookies): void {
  cookies.delete(ACCESS_COOKIE, { path: COOKIE_OPTIONS.path });
  cookies.delete(REFRESH_COOKIE, { path: COOKIE_OPTIONS.path });
}

/**
 * The single security boundary of the admin panel.
 *
 * Every /admin page and every /api/admin route must call this before touching
 * the database. It verifies the session token with Supabase Auth, then confirms
 * the account holds an admin or moderator role. The service_role key bypasses
 * RLS, so this check is the only thing standing between an anonymous request
 * and every user's phone number, home address and date of birth.
 *
 * When `cookies` is supplied and the access token is close to expiring, the
 * session is rotated transparently and the refreshed tokens are written back.
 */
export async function requireAdmin(
  request: Request,
  cookies?: SessionCookies
): Promise<GuardResult> {
  const accessToken = readAccessToken(request);

  if (!accessToken) {
    return { ok: false, status: 401, error: "Missing session." };
  }

  const verified = await verifyToken(accessToken);

  if (!verified) {
    const refreshToken = cookies ? readRefreshToken(request) : null;
    if (refreshToken) {
      const rotated = await rotateSession(refreshToken, cookies);
      if (rotated) return rotated;
    }
    return { ok: false, status: 401, error: "Invalid or expired session." };
  }

  if (cookies && shouldRefresh(accessToken, Date.now())) {
    const refreshToken = readRefreshToken(request);
    if (refreshToken) await rotateSession(refreshToken, cookies);
  }

  const role = await fetchRole(verified.userId);
  if (!hasAdminRole(role)) {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  return {
    ok: true,
    session: { userId: verified.userId, role, email: verified.email },
  };
}
