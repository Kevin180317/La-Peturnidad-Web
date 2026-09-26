/**
 * The allow-list of tables the admin panel may read.
 *
 * Two independent safety properties come from this file:
 *
 *  1. Only tables named here can be queried at all. /api/admin/[table] looks the
 *     incoming param up here and returns 404 for anything unknown, so no table
 *     becomes reachable by accident.
 *  2. Every entry lists its columns explicitly. The service_role key bypasses
 *     RLS, so `select("*")` on a table like user_profiles would ship every
 *     user's phone, date of birth and home address to a listing endpoint that
 *     has no business returning them.
 *
 * Columns mirror La-Peturnidad-Mobile/types/database.ts, which is generated
 * from the live database. Do not add a column here without checking that file.
 */

export interface FilterConfig {
  column: string;
  op?: "eq" | "ilike";
}

export interface TableConfig {
  /** Human readable name, used as the i18n key suffix. */
  key: string;
  /** Explicit projection. Never "*". */
  select: string;
  /** Column the list is sorted by when the request does not say otherwise. */
  defaultOrder: string;
  /** Columns a caller may sort by. Anything else falls back to defaultOrder. */
  orderColumns: string[];
  /** Columns matched by the free-text search box. Empty disables search. */
  searchColumns: string[];
  /** Query params accepted as exact-match filters. */
  filters: Record<string, FilterConfig>;
}

export const ADMIN_TABLES = {
  pets: {
    key: "pets",
    select:
      "id, name, type, size, color, features, image_url, user_id, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "name", "type"],
    searchColumns: ["name", "type", "size", "color"],
    filters: { type: { column: "type" }, user_id: { column: "user_id" } },
  },
  emergency_alerts: {
    key: "alerts",
    select:
      "id, pet_name, type, description, last_seen_location, disappearance_date, image_url, user_id, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "pet_name", "type"],
    searchColumns: ["pet_name", "type", "last_seen_location", "description"],
    filters: { type: { column: "type" }, user_id: { column: "user_id" } },
  },
  found_pets: {
    key: "foundPets",
    select:
      "id, pet_id, user_id, created_at, pets(id, name, type, image_url, user_id)",
    defaultOrder: "created_at",
    orderColumns: ["created_at"],
    searchColumns: [],
    filters: { pet_id: { column: "pet_id" }, user_id: { column: "user_id" } },
  },
  posts: {
    key: "posts",
    select: "id, content, image_url, user_id, created_at, updated_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at"],
    searchColumns: ["content"],
    filters: { user_id: { column: "user_id" } },
  },
  comments: {
    key: "comments",
    select:
      "id, content, user_id, target_id, target_type, parent_id, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "target_type"],
    searchColumns: ["content", "target_type"],
    filters: {
      user_id: { column: "user_id" },
      target_id: { column: "target_id" },
      target_type: { column: "target_type" },
    },
  },
  groups: {
    key: "groups",
    select: "id, name, description, created_by, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "name"],
    searchColumns: ["name", "description"],
    filters: { created_by: { column: "created_by" } },
  },
  group_members: {
    key: "groupMembers",
    select: "id, group_id, user_id, role, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "role"],
    searchColumns: [],
    filters: {
      group_id: { column: "group_id" },
      user_id: { column: "user_id" },
      role: { column: "role" },
    },
  },
  announcements: {
    key: "announcements",
    select:
      "id, title, content, category, user_id, created_at, updated_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "title", "category"],
    searchColumns: ["title", "content", "category"],
    filters: { category: { column: "category" }, user_id: { column: "user_id" } },
  },
  success_stories: {
    key: "stories",
    select: "id, pet_name, story, image_url, user_id, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "pet_name"],
    searchColumns: ["pet_name", "story"],
    filters: { user_id: { column: "user_id" } },
  },
  reports: {
    key: "reports",
    select:
      "id, reporter_id, target_user_id, reason, status, created_at, reviewed_at, reviewed_by",
    defaultOrder: "created_at",
    orderColumns: ["created_at", "status"],
    searchColumns: ["reason", "status"],
    filters: {
      status: { column: "status" },
      target_user_id: { column: "target_user_id" },
      reporter_id: { column: "reporter_id" },
    },
  },
  blocks: {
    key: "blocks",
    select: "id, blocker_id, blocked_id, created_at",
    defaultOrder: "created_at",
    orderColumns: ["created_at"],
    searchColumns: [],
    filters: {
      blocker_id: { column: "blocker_id" },
      blocked_id: { column: "blocked_id" },
    },
  },
} as const satisfies Record<string, TableConfig>;

export type AdminTable = keyof typeof ADMIN_TABLES;

export function isAdminTable(value: string): value is AdminTable {
  return Object.prototype.hasOwnProperty.call(ADMIN_TABLES, value);
}

export function getTableConfig(name: string): TableConfig | null {
  return isAdminTable(name) ? ADMIN_TABLES[name] : null;
}

/**
 * user_profiles is intentionally absent from ADMIN_TABLES, so it can never be
 * reached through /api/admin/[table]. It gets its own endpoint because that is
 * the one listing which has to merge user_profiles with auth.users to show email
 * addresses, which only exist on the auth side.
 *
 * The config lives here instead of inside the route so that the section
 * definitions and the tests check filters against a single source of truth.
 */
export const USERS_TABLE_CONFIG: TableConfig = {
  key: "users",
  // address, birth_date and postal_code are left out of the listing and are only
  // returned by the single-user detail endpoint, where the team has a concrete
  // reason to ask about one specific person.
  select:
    "id, user_id, first_name, last_name, phone, city, role, profile_picture_url, created_at",
  defaultOrder: "created_at",
  orderColumns: ["created_at", "first_name", "last_name", "role"],
  // user_id is searchable so a uuid spotted in another table (a report, a block, a
  // lost pet alert) can be pasted straight into this box to identify the person.
  searchColumns: ["first_name", "last_name", "phone", "city", "user_id"],
  filters: {
    role: { column: "role" },
    city: { column: "city" },
  },
};

const ENDPOINT_PREFIX = "/api/admin/";

/**
 * The table config that serves a section endpoint, which is not always the last
 * segment of the path: the users listing is served by its own route.
 */
export function getConfigForEndpoint(endpoint: string): TableConfig | null {
  if (endpoint === `${ENDPOINT_PREFIX}users`) return USERS_TABLE_CONFIG;
  return getTableConfig(endpoint.replace(ENDPOINT_PREFIX, ""));
}
