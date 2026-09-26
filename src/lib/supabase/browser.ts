import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Browser-safe Supabase client using the anon key.
 *
 * The anon key is designed to be public: every request it makes is still
 * subject to RLS. It is only used to sign admins in and to read their own
 * session. It never grants access to the data the dashboard displays, because
 * that data is only ever fetched through the server routes that hold the
 * service_role key.
 */
export function getBrowserClient(): SupabaseClient {
  if (cached) return cached;

  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    throw new Error(
      "Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. Set them in .env locally and in the Vercel project settings."
    );
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
