import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TREND_RANGE,
  resolveTrendRange,
  type TrendPayload,
  type TrendRange,
} from "../../lib/admin/trend";
import KpiGrid, { ErrorNotice, LoadingTiles } from "./KpiGrid";
import RangeTabs from "./charts/RangeTabs";
import TrendChart, { toChartSeries } from "./charts/TrendChart";

/**
 * The dashboard body.
 *
 * One island rather than two because both halves need the same trend read:
 * splitting the tiles and the chart into separate islands would fire the same
 * request twice and let the two disagree about which window is selected.
 *
 * Counts come from /api/admin/stats and are usually already seeded by SSR, so
 * there is nothing to fetch on arrival. The chart window is client state, so
 * changing it does refetch -- aborted on the way out so a fast click through
 * 7 -> 30 -> 90 cannot land out of order.
 */

interface Props {
  initialStats?: Record<string, number>;
  initialTrends?: TrendPayload;
  initialRange?: number;
  /**
   * Reports still awaiting review. This is a separate count from
   * `stats.reports`, which is the lifetime total; the moderation banner has to
   * show the queue depth, otherwise it overstates the work waiting.
   */
  initialPending?: number;
}

interface StatsResponse {
  stats: Record<string, number>;
  pending_reports?: number;
}

interface TrendsResponse extends TrendPayload {
  days_range: number;
}

function readRangeFromUrl(): TrendRange {
  if (typeof window === "undefined") return DEFAULT_TREND_RANGE;
  return resolveTrendRange(new URLSearchParams(window.location.search).get("range"));
}

export default function Dashboard({
  initialStats,
  initialTrends,
  initialRange,
  initialPending,
}: Props) {
  const [stats, setStats] = useState<Record<string, number> | null>(initialStats ?? null);
  const [statsFailed, setStatsFailed] = useState(false);
  const [pending, setPending] = useState<number | null>(initialPending ?? null);

  const [range, setRange] = useState<TrendRange>(() =>
    initialRange !== undefined
      ? resolveTrendRange(initialRange)
      : readRangeFromUrl()
  );

  // The page seeds this with the window it rendered server-side, so the tiles'
  // sparklines and the chart already agree on the range before any interaction.
  const [trends, setTrends] = useState<TrendPayload | null>(initialTrends ?? null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsFailed, setTrendsFailed] = useState(false);

  // Only needed when SSR could not seed the counts.
  useEffect(() => {
    if (initialStats) return;
    let cancelled = false;

    fetch("/api/admin/stats", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("stats request failed");
        return (await response.json()) as StatsResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setPending(data.pending_reports ?? 0);
      })
      .catch(() => {
        if (!cancelled) setStatsFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialStats]);

  const loadTrends = useCallback(
    async (target: TrendRange, signal?: AbortSignal) => {
      setTrendsLoading(true);
      setTrendsFailed(false);
      try {
        const response = await fetch(`/api/admin/trends?days=${target}`, {
          credentials: "same-origin",
          signal,
        });
        if (response.status === 401 || response.status === 403) {
          window.location.assign("/admin/login");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as TrendsResponse;
        setTrends({ days: data.days, series: data.series });
      } catch (error) {
        // An abort is the expected outcome of switching window quickly, not a
        // failure worth telling the user about.
        if ((error as Error).name === "AbortError") return;
        setTrendsFailed(true);
      } finally {
        if (!signal?.aborted) setTrendsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    // The SSR payload already covers the window the page was rendered with.
    if (initialTrends && resolveTrendRange(initialRange) === range) return;
    void loadTrends(range, controller.signal);
    return () => controller.abort();
  }, [range, initialTrends, initialRange, loadTrends]);

  // Keep the window in the URL so a refresh or a shared link keeps it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (range === DEFAULT_TREND_RANGE) params.delete("range");
    else params.set("range", String(range));
    const next = params.toString();
    window.history.replaceState(null, "", next ? `${window.location.pathname}?${next}` : window.location.pathname);
  }, [range]);

  const seriesByKey = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const entry of trends?.series ?? []) map.set(entry.key, entry.values);
    return map;
  }, [trends]);

  const chartSeries = useMemo(() => toChartSeries(trends?.series ?? []), [trends]);

  if (statsFailed) {
    return <ErrorNotice message="No se pudieron cargar las métricas." />;
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <KpiGrid stats={stats} series={seriesByKey} days={range} pending={pending} />
      ) : (
        <LoadingTiles />
      )}

      <section className="rounded-2xl border border-texto/5 bg-panel p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-texto">Actividad diaria</h2>
            <p className="mt-0.5 text-sm text-texto/60">
              Filas nuevas por tabla, por día.
            </p>
          </div>
          <RangeTabs value={range} onChange={setRange} disabled={trendsLoading} />
        </div>

        {trendsFailed ? (
          <ErrorNotice message="No se pudo cargar el gráfico de actividad." />
        ) : !trends && trendsLoading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-texto/50">
            Cargando gráfico…
          </div>
        ) : !trends ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-texto/50">
            Sin datos de actividad.
          </div>
        ) : (
          <div className={trendsLoading ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <TrendChart days={trends.days} series={chartSeries} rangeDays={range} />
          </div>
        )}

        {!trendsFailed && trends ? (
          <p className="mt-4 border-t border-texto/5 pt-4 text-xs text-texto/40">
            Lectura agregada: una cuenta por fila, sin datos personales. El muestreo
            se limita a {formatDays(trends.days.length)} días por tabla.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function formatDays(days: number): string {
  return new Intl.NumberFormat("es-MX").format(days);
}