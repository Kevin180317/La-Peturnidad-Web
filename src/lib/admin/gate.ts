/**
 * Path rules for the private panel.
 *
 * Kept apart from src/middleware.ts because "astro:middleware" is a virtual
 * module that only exists inside the Astro build, so the rules cannot be
 * exercised from the test runner this way.
 */

export const ADMIN_PREFIX = "/admin";
export const LOGIN_PATH = "/admin/login";
export const API_PREFIX = "/api/admin";
export const SESSION_API_PATH = "/api/admin/session";

export type GateDecision =
  /** Not protected: carry on. */
  | { kind: "pass" }
  /** Protected: the caller must verify the session and use onFailure if it fails. */
  | { kind: "check"; onFailure: "redirect" | "deny" };

export function isAdminPage(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function isAdminApi(pathname: string): boolean {
  return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
}

export function evaluateGate(pathname: string, method = "GET"): GateDecision {
  if (!isAdminPage(pathname) && !isAdminApi(pathname)) return { kind: "pass" };
  if (pathname === LOGIN_PATH) return { kind: "pass" };

  // The session endpoint is how a session is created or thrown away, so POST
  // and DELETE have to run before there is anything to guard. Blocking them
  // here would lock everyone out. The route still authenticates on its own:
  // POST verifies the password with Supabase and only issues cookies for an
  // admin or moderator, DELETE just clears cookies, and GET stays gated.
  if (pathname === SESSION_API_PATH && method.toUpperCase() !== "GET") {
    return { kind: "pass" };
  }

  return { kind: "check", onFailure: isAdminApi(pathname) ? "deny" : "redirect" };
}
