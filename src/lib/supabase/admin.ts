import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client authenticated with the service_role key.
 *
 * The service_role key bypasses every RLS policy, so this client can read
 * tables that no authenticated user is allowed to see (found_pets, blocks) and
 * can read auth.users for email addresses. That makes it the most dangerous
 * credential in the project: it must never reach a browser bundle.
 *
 * This module is only ever imported from API routes, middleware and .astro
 * server code. The SSR assertion below turns an accidental client-side import
 * into a loud runtime failure instead of a silent data leak.
 */
export function getAdminClient(): SupabaseClient {
  if (import.meta.env.SSR !== true) {
    throw new Error(
      "getAdminClient() was called on the client. The service_role key is server-only; use getBrowserClient() instead."
    );
  }

  if (cached) return cached;

  const url = import.meta.env.SUPABASE_URL as string | undefined;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as
    | string
    | undefined;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env locally and in the Vercel project settings."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}
