import type { TableConfig } from "./tables";

export const PER_PAGE_DEFAULT = 25;
export const PER_PAGE_MAX = 100;
export const SEARCH_MAX_LENGTH = 120;

/**
 * Prepares a user supplied text for use inside a PostgREST filter.
 *
 * Two different things are handled here:
 *
 *  - LIKE wildcards. `%` and `_` are escaped with a backslash so a search for
 *    "50%" or "a_b" is matched literally instead of turning into a wildcard.
 *    supabase-js URL-encodes the value, so the backslashes survive the trip and
 *    Postgres reads them as escapes.
 *  - PostgREST filter metacharacters. `, ( ) . : "` are structural inside an
 *    or() filter, so they are stripped. A term containing them is searched
 *    without them rather than being rejected or, worse, altering the filter.
 */
export function sanitizeSearch(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[,():."]/g, "")
    .replace(/([%_\\])/g, "\\$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_MAX_LENGTH);
}

export function toLikePattern(term: string): string {
  return `%${term}%`;
}

export function clampPage(raw: string | null | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function clampPerPage(raw: string | null | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return PER_PAGE_DEFAULT;
  return Math.min(parsed, PER_PAGE_MAX);
}

export function resolveOrder(
  url: URL,
  config: TableConfig
): { column: string; ascending: boolean } {
  const requested = url.searchParams.get("order");
  const column =
    requested && config.orderColumns.includes(requested)
      ? requested
      : config.defaultOrder;

  const rawDirection = url.searchParams.get("dir");
  return { column, ascending: rawDirection !== "desc" };
}

/**
 * Collects only the filters declared for this table. Unknown params are dropped
 * rather than forwarded, so nothing a caller sends can reach PostgREST as a
 * column or operator that was not reviewed here.
 */
export function resolveFilters(
  url: URL,
  config: TableConfig
): Record<string, string> {
  const filters: Record<string, string> = {};
  for (const [param, definition] of Object.entries(config.filters)) {
    const value = url.searchParams.get(param);
    if (value !== null && value !== "") filters[definition.column] = value;
  }
  return filters;
}

export function hasSearch(config: TableConfig): boolean {
  return config.searchColumns.length > 0;
}
