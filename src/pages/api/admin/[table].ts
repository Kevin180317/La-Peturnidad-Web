import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/admin/auth";
import { listRows } from "../../../lib/admin/queries";
import { getTableConfig, type AdminTable } from "../../../lib/admin/tables";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Generic read-only listing endpoint.
 *
 * Every table the panel can browse must be registered in lib/admin/tables.ts;
 * anything else 404s. That is what keeps `service_role` from turning into a
 * general purpose database reader for a crafted table name.
 */
export const GET: APIRoute = async ({ request, params, cookies }) => {
  const guard = await requireAdmin(request, cookies);
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  const table = params.table ?? "";
  const config = getTableConfig(table);
  if (!config) return json({ error: "Not found." }, 404);

  try {
    const result = await listRows(table as AdminTable, new URL(request.url));
    return json({ ...result, table: config.key }, 200);
  } catch (error) {
    console.error(`GET /api/admin/${table} failed:`, error);
    return json({ error: "Could not read data." }, 500);
  }
};
