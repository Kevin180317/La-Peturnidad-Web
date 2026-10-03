import React, { useMemo, useRef, useState } from "react";
import {
  buildAreaPath,
  buildLinePath,
  formatCompact,
  formatCount,
  gridLines,
  nearestIndex,
  niceMax,
  points,
  type Plot,
} from "../../../lib/admin/chart";
import {
  TONE_DOT,
  TONE_FILL,
  TONE_STROKE,
  formatDayLabel,
  getMetric,
  type MetricTone,
} from "../../../lib/admin/dashboard";
import { hasData, type TrendSeries } from "../../../lib/admin/trend";
import { IconInbox } from "../Icons";

/**
 * Multi-series daily activity chart, drawn as plain SVG.
 *
 * No charting library: this is three visuals on one internal tool, and the
 * alternative is a dependency whose bundle and API both dwarf the geometry in
 * lib/admin/chart.ts. All of that maths is unit tested there.
 *
 * Series are drawn on one shared axis. Values are row counts across very
 * different tables, so the scale always favours the largest series -- a day of
 * 40 comments next to a day of 2 reports is honest, not a rendering bug.
 */

const VIEW_W = 860;
const VIEW_H = 280;
const PAD = { top: 14, right: 16, bottom: 30, left: 48 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const GRID_TICKS = 4;

export interface ChartSeries extends TrendSeries {
  label: string;
  tone: MetricTone;
  href: string;
}

interface Props {
  days: string[];
  series: ChartSeries[];
  /** How many days are in the window, for the summary line. */
  rangeDays: number;
}

export default function TrendChart({ days, series, rangeDays }: Props) {
  // Which series are drawn. Defaulting to all of them and letting the legend
  // narrow it avoids an empty chart on first paint.
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => series.filter((entry) => !hidden[entry.key]),
    [series, hidden]
  );

  const plot = useMemo<Plot>(
    () => ({
      // One shared maximum across every visible series, which is what makes the
      // comparison between them meaningful.
      values: visible.length
        ? [niceMax(Math.max(...visible.flatMap((entry) => entry.values)))]
        : [0],
      width: PLOT_W,
      height: PLOT_H,
      padding: 0,
    }),
    [visible]
  );

  const maxValue = plot.values[0];
  const lines = useMemo(() => gridLines(plot, GRID_TICKS), [plot]);
  const populated = visible.some((entry) => hasData(entry.values));

  function plotFor(values: number[]): Plot {
    return { values, width: PLOT_W, height: PLOT_H, padding: 0 };
  }

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || days.length === 0) return;

    // The SVG scales to its container, so the pointer position is converted
    // back into viewBox units before being used to look up a day. Doing it this
    // way keeps the geometry code working in one fixed coordinate system
    // regardless of how wide the card actually is.
    const ratio = (event.clientX - rect.left) / rect.width;
    const inPlot = (ratio * VIEW_W - PAD.left) / PLOT_W;
    const index = Math.round(Math.min(1, Math.max(0, inPlot)) * (days.length - 1));
    setHover(Number.isFinite(index) ? index : null);
  }

  const hoverDay = hover !== null ? days[hover] : null;
  const summary = `${days.length} días, hasta ${hoverDay ? formatDayLabel(hoverDay, true) : "hoy"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {series.map((entry) => {
          const off = Boolean(hidden[entry.key]);
          return (
            <button
              key={entry.key}
              type="button"
              aria-pressed={!off}
              onClick={() => setHidden((current) => ({ ...current, [entry.key]: !current[entry.key] }))}
              className={`group inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                off ? "text-texto/40 hover:text-texto/70" : "text-texto/80 hover:text-texto"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[entry.tone]} ${off ? "opacity-30" : ""}`}
              />
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="relative" ref={frameRef}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full touch-none select-none"
          role="img"
          aria-label={`Actividad diaria por tabla. ${summary}.`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <g transform={`translate(${PAD.left} ${PAD.top})`}>
            {lines.map((line) => (
              <g key={line.y}>
                <line
                  x1="0"
                  y1={line.y}
                  x2={PLOT_W}
                  y2={line.y}
                  stroke="currentColor"
                  className="text-grid"
                  strokeWidth="1"
                />
                <text
                  x="-12"
                  y={line.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-texto/40 text-[11px]"
                >
                  {formatCompact(line.value)}
                </text>
              </g>
            ))}

            {hover !== null && populated ? (
              <line
                x1={(hover / Math.max(1, days.length - 1)) * PLOT_W}
                y1="0"
                x2={(hover / Math.max(1, days.length - 1)) * PLOT_W}
                y2={PLOT_H}
                className="stroke-texto/30"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ) : null}

            {populated
              ? visible.map((entry) => {
                  const current = plotFor(entry.values);
                  return (
                    <g key={entry.key}>
                      <path
                        d={buildAreaPath(current)}
                        className={TONE_FILL[entry.tone]}
                        opacity="0.08"
                      />
                      <path
                        d={buildLinePath(current)}
                        fill="none"
                        className={TONE_STROKE[entry.tone]}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {hover !== null ? (
                        <circle
                          cx={
                            (hover / Math.max(1, days.length - 1)) * PLOT_W
                          }
                          cy={points(current)[hover]?.[1] ?? 0}
                          r="3.5"
                          className={`${TONE_FILL[entry.tone]} stroke-panel`}
                          strokeWidth="2"
                        />
                      ) : null}
                    </g>
                  );
                })
              : null}

            {days.length > 1
              ? [0, Math.floor((days.length - 1) / 2), days.length - 1].map((index) => (
                  <text
                    key={index}
                    x={(index / (days.length - 1)) * PLOT_W}
                    y={PLOT_H + 20}
                    textAnchor={
                      index === 0 ? "start" : index === days.length - 1 ? "end" : "middle"
                    }
                    className="fill-texto/40 text-[11px]"
                  >
                    {formatDayLabel(days[index])}
                  </text>
                ))
              : null}
          </g>
        </svg>

        {!populated ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-texto/40">
            <IconInbox className="h-8 w-8" />
            <p className="text-sm">
              Sin actividad en los últimos {rangeDays} días
            </p>
          </div>
        ) : null}

        {hover !== null && populated && hoverDay ? (
          <ChartTooltip
            day={hoverDay}
            index={hover}
            total={days.length}
            series={visible}
          />
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {hoverDay ? formatDayLabel(hoverDay, true) : ""}
      </p>
    </div>
  );
}

function ChartTooltip({
  day,
  index,
  total,
  series,
}: {
  day: string;
  index: number;
  total: number;
  series: ChartSeries[];
}) {
  // Flipped to the left half once past the midpoint so the panel never runs off
  // the right edge of the card on the most recent days.
  const flip = index / Math.max(1, total - 1) > 0.5;
  const ranked = [...series].sort((a, b) => b.values[index] - a.values[index]);

  return (
    <div
      className={`pointer-events-none absolute top-2 z-10 min-w-[11rem] rounded-xl border border-texto/10 bg-panel/95 p-3 text-xs shadow-lg shadow-shadow/20 backdrop-blur ${
        flip ? "right-2" : "left-2"
      }`}
    >
      <p className="mb-2 font-semibold capitalize text-texto">
        {formatDayLabel(day, true)}
      </p>
      <ul className="space-y-1">
        {ranked.map((entry) => (
          <li key={entry.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-texto/70">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[entry.tone]}`}
              />
              {entry.label}
            </span>
            <span className="font-semibold tabular-nums text-texto">
              {formatCount(entry.values[index] ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Turns the raw trend payload into labelled, ordered chart series.
 *
 * Kept here rather than in the page so the endpoint's shape and the chart's
 * needs meet in one tested-adjacent place.
 */
export function toChartSeries(payload: TrendSeries[]): ChartSeries[] {
  return payload.flatMap((entry) => {
    const metric = getMetric(entry.key);
    if (!metric) return [];
    return [
      {
        key: entry.key,
        values: entry.values,
        label: metric.short,
        tone: metric.tone,
        href: metric.href,
      },
    ];
  });
}