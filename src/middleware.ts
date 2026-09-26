import { defineMiddleware } from "astro:middleware";
import { requireAdmin } from "./lib/admin/auth";
import { evaluateGate, LOGIN_PATH } from "./lib/admin/gate";

function unauthorized(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Gate for the private panel.
 *
 * The admin API routes call requireAdmin() themselves; this middleware repeats
 * the check so that a route added later without the guard is still not exposed,
 * and so unauthenticated visitors are redirected before any page renders.
 * The duplication is deliberate: with the service_role key in play, the admin
 * check is the only thing protecting every user's personal data.
 *
 * Which paths are protected lives in lib/admin/gate.ts so it can be tested
 * without the Astro build.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const decision = evaluateGate(pathname, context.request.method);

  if (decision.kind === "pass") return next();

  const guard = await requireAdmin(context.request, context.cookies);

  if (guard.ok) {
    context.locals.admin = guard.session;
    return next();
  }

  if (decision.onFailure === "deny") return unauthorized(guard.status, guard.error);

  return context.redirect(
    `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`,
    302
  );
});
