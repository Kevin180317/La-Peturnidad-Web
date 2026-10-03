/**
 * Day bucketing for the dashboard charts.
 *
 * Free of Supabase and of any browser API, so the parts that are easy to get
 * wrong -- timezone boundaries, leap days, junk timestamps -- are unit tested
 * directly. See format.ts for the same reasoning applied to table cells.
 */

/** The windows the dashboard offers. Anything else is coerced to the default. */
export const TREND_RANGES = [7, 30, 90] as const;

export type TrendRange = (typeof TREND_RANGES)[number];

export const DEFAULT_TREND_RANGE: TrendRange = 30;

/**
 * Upper bound on how many timestamps one series may contribute.
 *
 * Bucketing happens in JavaScript because PostgREST has no grouped-count, and a
 * plain select of every created_at ever written would grow without limit. Past
 * this cap the newest rows win and the chart silently covers less than the
 * window it claims to. That is an accepted trade for a dashboard: the counts are
 * illustrative, and the exact totals still come from the KPI cards, which are
 * exact head counts.
 */
export const TREND_ROW_CAP = 20_000;

export function resolveTrendRange(value: unknown): TrendRange {
  const parsed = Number(value);
  const match = TREND_RANGES.find((range) => range === parsed);
  return match ?? DEFAULT_TREND_RANGE;
}

/**
 * Local calendar day as YYYY-MM-DD.
 *
 * Local, not UTC: an admin looking at "rows created today" means their own
 * today, and bucketing on the UTC day would put late-evening rows in tomorrow.
 */
export function dayKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a timestamp, returning null instead of an Invalid Date.
 *
 * A bare YYYY-MM-DD is assembled in local time. Passed to `new Date()` it is
 * read as UTC midnight, which lands on the previous day for anyone west of
 * Greenwich -- the same trap documented in format.ts.
 */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  if (typeof value !== "string" || value.trim() === "") return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The `days` day keys ending at `end`, oldest first.
 *
 * Steps by calendar day through setDate rather than adding 86_400_000 ms, so
 * month and year rollover is exact and a DST transition cannot shift the range
 * by an hour. The cursor is pinned to midday so that zones which skip midnight
 * on a transition day still land on the intended date.
 */
export function dayKeys(days: number, end: Date = new Date()): string[] {
  const total = Math.max(1, Math.floor(days));
  const cursor = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12);
  cursor.setDate(cursor.getDate() - (total - 1));

  const keys: string[] = [];
  for (let index = 0; index < total; index += 1) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/**
 * Counts values into one bucket per key.
 *
 * Values outside the range and values that cannot be parsed are dropped rather
 * than throwing: the caller is drawing a chart, and one bad row should cost one
 * bar, not the whole panel. Buckets with no rows stay at zero so every series is
 * the same length and can be indexed by day.
 */
export function bucketByDay(
  values: readonly unknown[],
  keys: readonly string[]
): number[] {
  const buckets = new Array<number>(keys.length).fill(0);

  const slotByDay = new Map<string, number>();
  keys.forEach((key, index) => slotByDay.set(key, index));

  for (const value of values) {
    const date = toDate(value);
    if (!date) continue;
    const slot = slotByDay.get(dayKey(date));
    if (slot !== undefined) buckets[slot] += 1;
  }

  return buckets;
}

export interface TrendSeries {
  key: string;
  values: number[];
}

export interface TrendPayload {
  days: string[];
  series: TrendSeries[];
}

/** True when a series is worth plotting at all. */
export function hasData(values: readonly number[]): boolean {
  return values.some((value) => Number.isFinite(value) && value > 0);
}