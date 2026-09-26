import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/admin/auth";
import { getUserDetail } from "../../../../lib/admin/queries";

export const prerender = false;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/** Everything one account owns or is involved in, for the team to look up. */
export const GET: APIRoute = async ({ request, params, cookies }) => {
  const guard = await requireAdmin(request, cookies);
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  const userId = params.id ?? "";
  if (!UUID_PATTERN.test(userId)) return json({ error: "Not found." }, 404);

  try {
    const detail = await getUserDetail(userId);
    if (!detail.profile) return json({ error: "Not found." }, 404);
    return json(detail, 200);
  } catch (error) {
    console.error(`GET /api/admin/users/${userId} failed:`, error);
    return json({ error: "Could not read user." }, 500);
  }
};
