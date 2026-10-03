import React, { useMemo } from "react";
import {
  buildAreaPath,
  buildLinePath,
  downsample,
  formatCount,
  type Plot,
} from "../../../lib/admin/chart";
import { hasData } from "../../../lib/admin/trend";

/**
 * A single trend, drawn small enough to sit inside a KPI tile.
 *
 * Decorative by design: it shows shape, not values, and the exact count is
 * printed right next to it. That is why it carries no axis and no tooltip -- a
 * 120px chart with hover state would be a worse readout than a number.
 */

const WIDTH = 240;
const HEIGHT = 56;
const PADDING = 4;

interface Props {
  values: number[];
  /** Tailwind text colour token, e.g. "text-chart-1". */
  tone: string;
}

export default function Sparkline({ values, tone }: Props) {
  // One point per two pixels is plenty for a 120px tile. Downsampling matters
  // here in a way it does not in the main chart: at 90 days the series carries
  // three quarters more points than the tile has pixels, and the extra ones only
  // add path noise. Thin here, keep the interactive chart exact.
  const sampled = useMemo(
    () => downsample(values, Math.max(8, Math.round(WIDTH / 2))),
    [values]
  );

  const populated = hasData(values);

  const plot: Plot = useMemo(
    () => ({ values: sampled, width: WIDTH, height: HEIGHT, padding: PADDING }),
    [sampled]
  );

  if (!populated) {
    // A flat line pinned to the baseline reads as "measured, and it is zero",
    // which is a real answer. An empty box would just look broken.
    return (
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={`h-14 w-full ${tone}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1={HEIGHT - PADDING}
          x2={WIDTH}
          y2={HEIGHT - PADDING}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.35"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`h-14 w-full ${tone}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={buildAreaPath(plot)} fill="currentColor" opacity="0.12" />
      <path
        d={buildLinePath(plot)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Exported for the KPI tile, which labels the sparkline's window. */
export function sparklineCaption(count: number): string {
  return count === 1 ? "1 día" : `${formatCount(count)} días`;
}