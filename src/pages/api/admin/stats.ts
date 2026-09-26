import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/admin/auth";
import { countPendingReports, getAdminStats } from "../../../lib/admin/queries";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Aggregate counts for the dashboard cards. Numbers only, no records. */
export const GET: APIRoute = async ({ request, cookies }) => {
  const guard = await requireAdmin(request, cookies);
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const [stats, pendingReports] = await Promise.all([
      getAdminStats(),
      countPendingReports(),
    ]);
    return json({ stats, pending_reports: pendingReports }, 200);
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return json({ error: "Could not read stats." }, 500);
  }
};
