import { getAdminClient } from "../supabase/admin";
import {
  clampPage,
  clampPerPage,
  resolveFilters,
  resolveOrder,
  sanitizeSearch,
  toLikePattern,
} from "./params";
import {
  TREND_ROW_CAP,
  bucketByDay,
  dayKeys,
  type TrendPayload,
  type TrendSeries,
} from "./trend";
import type { TableConfig } from "./tables";

export interface ListResult {
  rows: Record<string, unknown>[];
  count: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/**
 * Runs one read-only listing query against an allow-listed table.
 *
 * `config` is passed in rather than looked up so that callers with a bespoke
 * projection (the users listing merges auth data) reuse this exact code path
 * instead of reimplementing pagination and search.
 *
 * Everything the caller controls is funnelled through resolveFilters and
 * resolveOrder, so a query param can only ever become a column name that was
 * reviewed in the config, and values always travel as bound parameters.
 */
export async function listRows(
  table: string,
  url: URL,
  config: TableConfig
): Promise<ListResult> {
  const page = clampPage(url.searchParams.get("page"));
  const perPage = clampPerPage(url.searchParams.get("per_page"));
  const from = (page - 1) * perPage;

  let query = getAdminClient()
    .from(table)
    .select(config.select, { count: "exact" });

  const term = sanitizeSearch(url.searchParams.get("q"));
  if (term && config.searchColumns.length > 0) {
    const pattern = toLikePattern(term);
    const clauses = config.searchColumns
      .map((column) => `${column}.ilike.${pattern}`)
      .join(",");
    query = query.or(clauses);
  }

  for (const [column, value] of Object.entries(resolveFilters(url, config))) {
    query = query.eq(column, value);
  }

  const order = resolveOrder(url, config);
  const { data, count, error } = await query
    .order(order.column, { ascending: order.ascending })
    .range(from, from + perPage - 1);

  if (error) throw new Error(`Failed to read ${table}: ${error.message}`);

  const total = count ?? 0;
  return {
    rows: (data as Record<string, unknown>[]) ?? [],
    count: total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

const COUNT_TABLES = [
  "user_profiles",
  "pets",
  "emergency_alerts",
  "found_pets",
  "success_stories",
  "groups",
  "group_members",
  "posts",
  "comments",
  "announcements",
  "reports",
  "blocks",
] as const;

export type AdminStats = Record<(typeof COUNT_TABLES)[number], number>;

export async function getAdminStats(): Promise<AdminStats> {
  const client = getAdminClient();

  const results = await Promise.all(
    COUNT_TABLES.map(async (table) => {
      const { count, error } = await client
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) {
        console.error(`getAdminStats: count failed for ${table}:`, error.message);
        return [table, 0] as const;
      }
      return [table, count ?? 0] as const;
    })
  );

  return Object.fromEntries(results) as AdminStats;
}

export async function countPendingReports(): Promise<number> {
  const { count, error } = await getAdminClient()
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) {
    console.error("countPendingReports failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * The tables the dashboard charts.
 *
 * The same set the KPI cards count, minus the ones whose growth is not
 * meaningful or whose rows are deleted as they resolve: `group_members` is
 * already implied by `users`, and `found_pets` only ever exists to close an
 * alert that has since been deleted, so charting it would draw a decay curve
 * that means nothing.
 */
const TREND_TABLES = [
  "user_profiles",
  "pets",
  "emergency_alerts",
  "posts",
  "comments",
  "reports",
] as const;

export type TrendTable = (typeof TREND_TABLES)[number];

/**
 * Daily row counts per table, oldest day first.
 *
 * PostgREST cannot group and count in one round trip, so this reads the single
 * `created_at` column for the window and buckets it here. Only one column ever
 * leaves the database -- no user data is touched -- and the row count is capped
 * at TREND_ROW_CAP so the query stays bounded on a table that has been written
 * to for years.
 *
 * `user_profiles` is queried directly rather than through the table allow-list
 * for the same reason getAdminStats() does: the dashboard needs its daily
 * registrations, and the allow-list exists to keep it off the generic listing
 * route, not to forbid aggregates.
 */
export async function getAdminTrends(days: number): Promise<TrendPayload> {
  const client = getAdminClient();
  const keys = dayKeys(days);

  // Start of the first bucket, in UTC so the comparison happens against the same
  // clock the timestamps carry. One extra day of slack absorbs the offset
  // between this and the admin's own calendar, which bucketByDay then assigns
  // to the right local day.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const results = await Promise.all(
    TREND_TABLES.map(async (table) => {
      const { data, error } = await client
        .from(table)
        .select("created_at")
        .gte("created_at", since.toISOString())
        .limit(TREND_ROW_CAP);

      if (error) {
        console.error(`getAdminTrends: read failed for ${table}:`, error.message);
        return [table, new Array<number>(keys.length).fill(0)] as const;
      }

      const timestamps = (data ?? [])
        .map((row) => (row as { created_at?: unknown }).created_at)
        .filter((value): value is string => typeof value === "string");

      return [table, bucketByDay(timestamps, keys)] as const;
    })
  );

  const series: TrendSeries[] = results.map(([key, values]) => ({ key, values }));
  return { days: keys, series };
}

export interface UserDetail {
  profile: Record<string, unknown> | null;
  email: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
  counts: Record<string, number>;
}

const USER_RELATION_COUNTS: ReadonlyArray<readonly [string, string]> = [
  ["pets", "user_id"],
  ["emergency_alerts", "user_id"],
  ["found_pets", "user_id"],
  ["posts", "user_id"],
  ["comments", "user_id"],
  ["announcements", "user_id"],
  ["success_stories", "user_id"],
  ["groups", "created_by"],
  ["reports", "reporter_id"],
  ["reports", "target_user_id"],
  ["blocks", "blocker_id"],
  ["blocks", "blocked_id"],
];

export async function getUserDetail(userId: string): Promise<UserDetail> {
  const client = getAdminClient();

  const [profileResult, authResult, ...countResults] = await Promise.all([
    client
      .from("user_profiles")
      .select(
        "id, user_id, first_name, last_name, phone, birth_date, address, city, postal_code, profile_picture_url, role, created_at, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle(),
    client.auth.admin.getUserById(userId),
    ...USER_RELATION_COUNTS.map(([table, column]) =>
      client.from(table).select("*", { count: "exact", head: true }).eq(column, userId)
    ),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Failed to read profile: ${profileResult.error.message}`
    );
  }

  const counts: Record<string, number> = {};
  USER_RELATION_COUNTS.forEach(([table, column], index) => {
    const key =
      table === "reports"
        ? `${column === "reporter_id" ? "reports_filed" : "reports_received"}`
        : table === "blocks"
          ? `${column === "blocker_id" ? "blocks_made" : "blocks_received"}`
          : table;
    counts[key] = countResults[index]?.count ?? 0;
  });

  const authUser = authResult.data?.user;

  return {
    profile: (profileResult.data as Record<string, unknown> | null) ?? null,
    email: authUser?.email ?? null,
    emailConfirmedAt: authUser?.email_confirmed_at ?? null,
    lastSignInAt: authUser?.last_sign_in_at ?? null,
    createdAt: authUser?.created_at ?? null,
    counts,
  };
}
