import type { APIRoute } from "astro";
import { requireAdmin } from "../../../../lib/admin/auth";
import { getAuthUserIndex } from "../../../../lib/admin/emails";
import { listRows } from "../../../../lib/admin/queries";
import { USERS_TABLE_CONFIG } from "../../../../lib/admin/tables";

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

export const GET: APIRoute = async ({ request, cookies }) => {
  const guard = await requireAdmin(request, cookies);
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const result = await listRows(
      "user_profiles",
      new URL(request.url),
      USERS_TABLE_CONFIG
    );

    const index = await getAuthUserIndex();

    const rows = result.rows.map((row) => {
      const userId = String(row.user_id);
      const info = index.get(userId);
      return {
        ...row,
        email: info?.email ?? null,
        email_confirmed: info ? Boolean(info.emailConfirmedAt) : null,
        last_sign_in_at: info?.lastSignInAt ?? null,
        joined_at: info?.createdAt ?? row.created_at ?? null,
      };
    });

    return json({ ...result, rows }, 200);
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return json({ error: "Could not read users." }, 500);
  }
};
