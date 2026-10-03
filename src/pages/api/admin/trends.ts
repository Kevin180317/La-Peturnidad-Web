import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/admin/auth";
import { getAdminTrends } from "../../../lib/admin/queries";
import { resolveTrendRange } from "../../../lib/admin/trend";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Daily row counts for the dashboard charts.
 *
 * Aggregates only: the response is one integer per day per table, so it carries
 * no rows and nothing from a user record.
 */
export const GET: APIRoute = async ({ request, cookies, url }) => {
  const guard = await requireAdmin(request, cookies);
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  // resolveTrendRange clamps to the offered windows, so ?days= cannot be used to
  // widen the query.
  const days = resolveTrendRange(url.searchParams.get("days"));

  try {
    const payload = await getAdminTrends(days);
    return json({ ...payload, days_range: days }, 200);
  } catch (error) {
    console.error("GET /api/admin/trends failed:", error);
    return json({ error: "Could not read trends." }, 500);
  }
};