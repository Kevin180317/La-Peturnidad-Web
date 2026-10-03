import React from "react";
import { formatCount } from "../../lib/admin/chart";
import {
  COMPACT_METRICS,
  FEATURED_METRICS,
  TONE_DOT,
  TONE_SOFT,
  TONE_TEXT,
  type MetricSpec,
} from "../../lib/admin/dashboard";
import { iconSvg } from "../../lib/admin/icons";
import type { TrendSeries } from "../../lib/admin/trend";
import Sparkline from "./charts/Sparkline";

/**
 * The dashboard's number tiles.
 *
 * Split in two on purpose. The four featured metrics get a tile big enough to
 * read at a glance, with a sparkline for shape; the remaining eight collapse
 * into a compact list, because a wall of twelve equally weighted tiles reads as
 * a wall and forces a scan for the four that matter.
 *
 * The figures are exact head counts from getAdminStats(). The sparkline beside
 * them is a separate, sampled read and is never the source of the number.
 *
 * Icons arrive as markup strings from the shared icon map, so they are set with
 * dangerouslySetInnerHTML rather than as React children. The strings are static
 * and authored in this repo; nothing from a database row reaches them.
 */

function Icon({ name, className }: { name: string; className: string }) {
  const markup = iconSvg(name, className);
  if (!markup) return null;
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      <Icon name="exclamation" className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function PendingReportsBanner({ pending }: { pending: number | null }) {
  if (pending === null || pending <= 0) return null;

  return (
    <a
      href="/admin/reportes?status=pending"
      className="group flex items-center justify-between gap-4 rounded-2xl border border-principal/30 bg-gradient-to-r from-principal/20 to-principal/5 px-5 py-4 transition-all hover:border-principal/50 hover:shadow-lg hover:shadow-principal/10"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-principal/20 text-principal">
          <Icon name="flag" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-texto">
            {formatCount(pending)}{" "}
            {pending === 1 ? "reporte pendiente" : "reportes pendientes"}
          </p>
          <p className="text-xs text-texto/60">Acción requerida</p>
        </div>
      </div>
      <span className="flex items-center gap-1 text-sm font-semibold text-principal">
        Revisar
        <Icon name="chevronRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

interface Props {
  stats: Record<string, number> | null;
  /** Series keyed by table name, as returned by the trends endpoint. */
  series: Map<string, number[]>;
  days: number;
  /** Reports still awaiting review, which is not `stats.reports`. */
  pending: number | null;
}

export default function KpiGrid({ stats, series, days, pending }: Props) {
  return (
    <div className="space-y-6">
      <PendingReportsBanner pending={pending} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED_METRICS.map((metric) => (
          <FeaturedTile
            key={metric.key}
            metric={metric}
            value={stats ? (stats[metric.key] ?? 0) : null}
            trend={series.get(metric.key)}
            days={days}
          />
        ))}
      </div>

      <CompactList stats={stats} />
    </div>
  );
}

function FeaturedTile({
  metric,
  value,
  trend,
  days,
}: {
  metric: MetricSpec;
  value: number | null;
  trend?: number[];
  days: number;
}) {
  return (
    <a
      href={metric.href}
      className="group flex flex-col rounded-2xl border border-texto/5 bg-panel p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-principal/30 hover:shadow-lg hover:shadow-principal/5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${TONE_SOFT[metric.tone]}`}
        >
          <Icon name={metric.icon} className="h-5 w-5" />
        </span>
        {trend ? (
          <span className="text-[11px] font-medium text-texto/40">
            últimos {days} días
          </span>
        ) : null}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-texto/60">
        {metric.label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-texto">
        {value === null ? "—" : formatCount(value)}
      </p>

      <div className="mt-4">
        {trend ? (
          <Sparkline values={trend} tone={TONE_TEXT[metric.tone]} />
        ) : (
          <div className="h-14" />
        )}
      </div>
    </a>
  );
}

function CompactList({ stats }: { stats: Record<string, number> | null }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-texto/5 bg-panel">
      <h2 className="border-b border-texto/5 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-texto/60">
        Resto de métricas
      </h2>
      <ul className="grid grid-cols-1 divide-y divide-texto/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {COMPACT_METRICS.map((metric, index) => {
          const value = stats ? (stats[metric.key] ?? 0) : null;
          return (
            <li
              key={metric.key}
              className={`flex items-center justify-between gap-3 px-5 py-4 ${
                index >= COMPACT_METRICS.length - 2
                  ? "sm:border-t sm:border-texto/5 lg:border-t-0"
                  : ""
              }`}
            >
              <a
                href={metric.href}
                className="flex min-w-0 items-center gap-2.5 text-sm text-texto/70 transition-colors hover:text-texto"
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${TONE_DOT[metric.tone]}`} />
                <span className="truncate">{metric.label}</span>
              </a>
              <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-texto">
                {value === null ? "—" : formatCount(value)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LoadingTiles({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-texto/5 bg-panel p-5"
        >
          <div className="mb-4 h-10 w-10 rounded-xl bg-texto/5" />
          <div className="h-3 w-24 rounded bg-texto/5" />
          <div className="mt-3 h-8 w-16 rounded bg-texto/5" />
          <div className="mt-4 h-14 rounded bg-texto/5" />
        </div>
      ))}
    </div>
  );
}

export type { TrendSeries };