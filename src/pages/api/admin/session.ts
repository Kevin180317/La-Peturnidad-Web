import type { APIRoute } from "astro";
import {
  hasAdminRole,
  type AdminRole,
} from "../../../lib/admin/auth";
import { ACCESS_COOKIE, COOKIE_OPTIONS, REFRESH_COOKIE } from "../../../lib/admin/cookies";
import { getAdminClient } from "../../../lib/supabase/admin";
import { getBrowserClient } from "../../../lib/supabase/browser";

export const prerender = false;

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const ATTEMPT_TTL_MS = 15 * 60 * 1000;

/**
 * In-memory brute force throttle. Resets on redeploy and does not span
 * instances, which is acceptable here: it is a speed bump on top of Supabase's
 * own auth rate limits, and /admin is not advertised anywhere.
 */
const attempts = new Map<string, { count: number; first: number }>();

function throttleKey(request: Request, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "local";
  return `${ip}:${email.toLowerCase()}`;
}

function isThrottled(key: string, now: number): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (now - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string, now: number): void {
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return;
  }
  entry.count += 1;
}

function pruneAttempts(now: number): void {
  if (attempts.size < 500) return;
  for (const [key, entry] of attempts) {
    if (now - entry.first > ATTEMPT_TTL_MS) attempts.delete(key);
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  // The middleware already verified the session and hung it off locals, and it
  // answers 401 for an unauthenticated caller, so reaching this point means
  // there is a valid admin or moderator session.
  return json({ ok: true, session: locals.admin ?? null }, 200);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const { email, password } = body;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return json({ error: "Email and password are required." }, 400);
  }

  const now = Date.now();
  pruneAttempts(now);

  const key = throttleKey(request, email);
  if (isThrottled(key, now)) {
    return json({ error: "Too many attempts. Try again later." }, 429);
  }

  // Everything from here talks to Supabase, and a missing environment variable
  // makes the client constructors throw synchronously. The whole block is
  // wrapped so a deployment mistake surfaces as a clean 500 with the reason in
  // the server log, rather than an HTML error page the form cannot read.
  let signIn: Awaited<ReturnType<ReturnType<typeof getBrowserClient>["auth"]["signInWithPassword"]>>;
  try {
    signIn = await getBrowserClient().auth.signInWithPassword({ email, password });
  } catch (cause) {
    console.error("Admin login could not reach Supabase:", cause);
    return json({ error: "Sign in is temporarily unavailable." }, 503);
  }

  const { data, error } = signIn;

  if (error || !data?.session || !data.user) {
    recordFailure(key, now);
    // Deliberately vague: never reveal whether the account exists.
    return json({ error: "Invalid credentials." }, 401);
  }

  const userId = data.user.id;

  // Read the role with the service_role client using the now verified user id.
  // The is_moderator_or_admin() RPC cannot be used here because auth.uid() is
  // always null on a service_role client, so it would return false for
  // everyone and no admin could ever sign in.
  let profileQuery: { data: { role?: string } | null; error: unknown };
  try {
    profileQuery = await getAdminClient()
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
  } catch (cause) {
    console.error("Admin login could not read the profile role:", cause);
    return json({ error: "Sign in is temporarily unavailable." }, 503);
  }

  const { data: profile, error: profileError } = profileQuery;

  const role = (profile?.role as AdminRole | undefined) ?? null;

  if (profileError || !hasAdminRole(role)) {
    attempts.set(key, { count: MAX_ATTEMPTS, first: now });
    return json({ error: "This account does not have access." }, 403);
  }

  attempts.delete(key);

  const session = data.session;
  cookies.set(ACCESS_COOKIE, session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: Math.max(60, session.expires_in ?? 3600),
  });
  cookies.set(REFRESH_COOKIE, session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });

  return json({ ok: true, role }, 200);
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(ACCESS_COOKIE, { path: COOKIE_OPTIONS.path });
  cookies.delete(REFRESH_COOKIE, { path: COOKIE_OPTIONS.path });
  return json({ ok: true }, 200);
};
