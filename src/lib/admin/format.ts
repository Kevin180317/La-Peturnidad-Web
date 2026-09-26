/**
 * Presentation helpers for the admin tables.
 *
 * Kept separate from the React components and free of any browser API so the
 * edge cases (null timestamps, unknown enum values, text from untrusted rows)
 * can be unit tested directly.
 */

export const EMPTY_CELL = "—";

/**
 * Postgres date columns arrive as "2026-03-12". Passing that to `new Date()`
 * parses it as UTC midnight, which renders as the previous day for anyone west
 * of Greenwich, so date-only values are assembled in local time instead.
 */
function parseValue(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
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

export function formatDate(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") return EMPTY_CELL;
  const date = parseValue(value);
  if (!date) return EMPTY_CELL;
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") return EMPTY_CELL;
  const date = parseValue(value);
  if (!date) return EMPTY_CELL;
  return `${date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatBool(value: unknown): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (value === null || value === undefined) return EMPTY_CELL;
  return String(value);
}

export function formatText(value: unknown): string {
  if (value === null || value === undefined || value === "") return EMPTY_CELL;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function truncate(value: string, max = 80): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Shortens a uuid for display while keeping both ends recognisable. */
export function shortId(value: unknown): string {
  const text = formatText(value);
  if (text === EMPTY_CELL) return text;
  return text.length <= 12 ? text : `${text.slice(0, 8)}…`;
}

export interface Badge {
  label: string;
  classes: string;
}

const DEFAULT_BADGE_CLASSES = "bg-texto/5 text-texto/70";

export function formatBadge(
  value: unknown,
  values?: Record<string, string>,
  tones?: Record<string, string>
): Badge {
  const raw = typeof value === "string" ? value : "";
  return {
    label: values?.[raw] ?? formatText(value),
    classes: tones?.[raw] ?? DEFAULT_BADGE_CLASSES,
  };
}

/** A readable label for a value that is a foreign key to a user. */
export function formatUserRef(value: unknown): string {
  const text = formatText(value);
  return text === EMPTY_CELL ? text : shortId(text);
}

/** Extracts a display name from a PostgREST embedded object. */
export function formatEmbedded(
  value: unknown,
  field: string
): string {
  if (value === null || value === undefined) return EMPTY_CELL;
  if (typeof value !== "object") return formatText(value);
  const record = value as Record<string, unknown>;
  const name = record[field];
  return name === null || name === undefined ? EMPTY_CELL : String(name);
}

export function renderCell(
  column: { key: string; kind?: string; values?: Record<string, string>; tones?: Record<string, string> },
  row: Record<string, unknown>
): string {
  const value = row[column.key];
  switch (column.kind) {
    case "date":
      return formatDate(value);
    case "datetime":
      return formatDateTime(value);
    case "bool":
      return formatBool(value);
    case "truncate":
      return truncate(formatText(value));
    case "badge":
      return formatBadge(value, column.values, column.tones).label;
    case "user":
      return formatUserRef(value);
    case "joined":
      return formatDateTime(value);
    default:
      return formatText(value);
  }
}
