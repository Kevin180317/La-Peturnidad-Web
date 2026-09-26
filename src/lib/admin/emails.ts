import { getAdminClient } from "../supabase/admin";

export interface AuthUserInfo {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
}

/** auth.users changes rarely, so a full scan is cached for a short while. */
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 1000;
/** Backstop so a misbehaving response can never spin here forever. */
const MAX_PAGES = 50;

let cache: { at: number; index: Map<string, AuthUserInfo> } | null = null;

function toInfo(user: {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  created_at?: string;
}): AuthUserInfo {
  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at ?? null,
  };
}

/**
 * Builds an id -> auth user index so listings can show email addresses.
 *
 * Emails do not live in user_profiles, they only exist in auth.users, so the
 * two have to be joined. The join key is user_profiles.user_id === auth.users.id
 * and *not* user_profiles.id, which is a different uuid.
 *
 * auth.admin.listUsers() has no offset/range support: it pages with
 * `page`/`perPage`, capped at 1000 per call, so a full index means walking the
 * pages. That is why the result is cached.
 */
export async function getAuthUserIndex(
  now: number = Date.now()
): Promise<Map<string, AuthUserInfo>> {
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.index;

  const index = new Map<string, AuthUserInfo>();
  const client = getAdminClient();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      console.error("getAuthUserIndex: listUsers failed:", error.message);
      break;
    }

    const users = data?.users ?? [];
    for (const user of users) index.set(user.id, toInfo(user));

    if (users.length < PAGE_SIZE) break;
  }

  cache = { at: now, index };
  return index;
}

export function clearAuthUserIndex(): void {
  cache = null;
}

/** Filters the cached index down to the ids a single page needs. */
export function pickAuthUsers(
  index: Map<string, AuthUserInfo>,
  userIds: string[]
): Map<string, AuthUserInfo> {
  const picked = new Map<string, AuthUserInfo>();
  for (const id of userIds) {
    const info = index.get(id);
    if (info) picked.set(id, info);
  }
  return picked;
}

export function uniqueUserIds(rows: Record<string, unknown>[]): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    const value = row.user_id ?? row.blocker_id ?? row.blocked_id;
    if (typeof value === "string") ids.add(value);
  }
  return [...ids];
}
