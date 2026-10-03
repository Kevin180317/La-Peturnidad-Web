import type { IconName } from "./icons";

/**
 * What the dashboard shows, in one place.
 *
 * The KPI tiles, the chart legend and the sparklines all read from this list, so
 * adding a metric is a single edit here rather than a hunt through three
 * components. The keys are database table names, matching what getAdminStats()
 * and getAdminTrends() return.
 */

export type MetricTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6";

/**
 * Per-tone class lookups.
 *
 * Written out in full rather than interpolated as `bg-${tone}`: Tailwind scans
 * source files for complete class names, so a computed class name is not in the
 * output and the element silently loses its colour. Every utility used by the
 * tiles, sparklines and chart therefore appears here as a literal.
 */
export const TONE_SOFT: Record<MetricTone, string> = {
  "chart-1": "bg-chart-1/12 text-chart-1",
  "chart-2": "bg-chart-2/12 text-chart-2",
  "chart-3": "bg-chart-3/12 text-chart-3",
  "chart-4": "bg-chart-4/12 text-chart-4",
  "chart-5": "bg-chart-5/12 text-chart-5",
  "chart-6": "bg-chart-6/12 text-chart-6",
};

export const TONE_TEXT: Record<MetricTone, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
  "chart-6": "text-chart-6",
};

export const TONE_DOT: Record<MetricTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  "chart-6": "bg-chart-6",
};

export const TONE_STROKE: Record<MetricTone, string> = {
  "chart-1": "stroke-chart-1",
  "chart-2": "stroke-chart-2",
  "chart-3": "stroke-chart-3",
  "chart-4": "stroke-chart-4",
  "chart-5": "stroke-chart-5",
  "chart-6": "stroke-chart-6",
};

export const TONE_FILL: Record<MetricTone, string> = {
  "chart-1": "fill-chart-1",
  "chart-2": "fill-chart-2",
  "chart-3": "fill-chart-3",
  "chart-4": "fill-chart-4",
  "chart-5": "fill-chart-5",
  "chart-6": "fill-chart-6",
};

export interface MetricSpec {
  /** Database table name, and the key this metric is counted under. */
  key: string;
  label: string;
  /** Compact label for the legend and axis, where space is tight. */
  short: string;
  href: string;
  icon: IconName;
  tone: MetricTone;
  /**
   * Featured metrics get a full tile with a sparkline; the rest collapse into a
   * compact list underneath. Four tiles is what fits across a laptop without
   * shrinking the numbers past legibility.
   */
  featured?: boolean;
}

export const DASHBOARD_METRICS: MetricSpec[] = [
  {
    key: "user_profiles",
    label: "Usuarios",
    short: "Usuarios",
    href: "/admin/usuarios",
    icon: "users",
    tone: "chart-1",
    featured: true,
  },
  {
    key: "pets",
    label: "Mascotas",
    short: "Mascotas",
    href: "/admin/mascotas",
    icon: "pets",
    tone: "chart-2",
    featured: true,
  },
  {
    key: "emergency_alerts",
    label: "Alertas de pérdida",
    short: "Alertas",
    href: "/admin/alertas",
    icon: "alert",
    tone: "chart-3",
    featured: true,
  },
  {
    key: "reports",
    label: "Reportes",
    short: "Reportes",
    href: "/admin/reportes",
    icon: "flag",
    tone: "chart-4",
    featured: true,
  },
  {
    key: "found_pets",
    label: "Mascotas encontradas",
    short: "Encontradas",
    href: "/admin/encontradas",
    icon: "heart",
    tone: "chart-5",
  },
  {
    key: "success_stories",
    label: "Historias de éxito",
    short: "Historias",
    href: "/admin/historias",
    icon: "file",
    tone: "chart-6",
  },
  {
    key: "groups",
    label: "Grupos",
    short: "Grupos",
    href: "/admin/grupos",
    icon: "users2",
    tone: "chart-1",
  },
  {
    key: "group_members",
    label: "Membresías",
    short: "Membresías",
    href: "/admin/grupos",
    icon: "users2",
    tone: "chart-2",
  },
  {
    key: "posts",
    label: "Publicaciones",
    short: "Publicaciones",
    href: "/admin/publicaciones",
    icon: "file",
    tone: "chart-3",
  },
  {
    key: "comments",
    label: "Comentarios",
    short: "Comentarios",
    href: "/admin/publicaciones",
    icon: "comment",
    tone: "chart-4",
  },
  {
    key: "announcements",
    label: "Avisos",
    short: "Avisos",
    href: "/admin/avisos",
    icon: "bell",
    tone: "chart-5",
  },
  {
    key: "blocks",
    label: "Bloqueos",
    short: "Bloqueos",
    href: "/admin/bloqueos",
    icon: "block",
    tone: "chart-6",
  },
];

export const FEATURED_METRICS = DASHBOARD_METRICS.filter((metric) => metric.featured);

export const COMPACT_METRICS = DASHBOARD_METRICS.filter((metric) => !metric.featured);

const METRIC_BY_KEY = new Map(DASHBOARD_METRICS.map((metric) => [metric.key, metric]));

export function getMetric(key: string): MetricSpec | undefined {
  return METRIC_BY_KEY.get(key);
}

/** "2026-03-12" -> "12 mar", for axis ticks and tooltips. */
export function formatDayLabel(day: string, long = false): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return day;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    ...(long ? { weekday: "long" as const, year: "numeric" as const } : {}),
  });
}