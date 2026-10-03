/**
 * Geometry for the hand-rolled dashboard charts.
 *
 * Pure functions over plain numbers so the maths -- especially the downsampling
 * and the tick rounding -- can be unit tested without a DOM. Keeping it out of
 * the React components is what makes the charts testable at all, and it avoids
 * pulling a charting dependency into the panel for three visuals.
 */

export interface Plot {
  values: number[];
  width: number;
  height: number;
  /** Room above the highest point for the top gridline and its label. */
  padding?: number;
}

export const DEFAULT_PADDING = 8;

/**
 * Rounds a data maximum up to a readable axis top (1, 2 or 5 times a power of
 * ten), so gridlines land on 20 rather than 17.
 *
 * Guards against a zero or non-finite maximum: an all-zero series is common
 * (a table nobody has written to this month) and would otherwise divide by zero
 * downstream.
 */
export function niceMax(max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalized = max / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Evenly spaced tick values from 0 to `niceMax`, inclusive. */
export function ticks(max: number, count = 4): number[] {
  const top = niceMax(max);
  return Array.from({ length: count + 1 }, (_, index) => (top / count) * index);
}

function plotValues({ values, height, padding = DEFAULT_PADDING }: Plot): {
  scale: (value: number) => number;
  top: number;
} {
  const usable = Math.max(1, height - padding * 2);
  const top = niceMax(Math.max(0, ...values));
  return {
    top,
    scale: (value: number) => padding + usable - (Math.max(0, value) / top) * usable,
  };
}

/**
 * Point positions for a series, left to right.
 *
 * A single point is centred rather than pinned to the left edge, so a
 * one-day-old table still draws a visible dot instead of nothing.
 */
export function points({ values, width, height, padding = DEFAULT_PADDING }: Plot): [number, number][] {
  const { scale } = plotValues({ values, width, height, padding });
  if (values.length === 0) return [];
  if (values.length === 1) return [[width / 2, scale(values[0])]];
  const step = width / (values.length - 1);
  return values.map((value, index) => [index * step, scale(value)]);
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * A smooth curve through the points.
 *
 * Catmull-Rom converted to cubic beziers, which passes through every data point
 * (unlike a plain spline fit) and keeps the peaks visible. With two or three
 * points a curve would invent shape the data does not contain, so those fall
 * back to straight segments.
 */
export function buildLinePath(plot: Plot, tension = 6): string {
  const pts = points(plot);
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${round(pts[0][0])} ${round(pts[0][1])}`;

  let path = `M ${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let index = 0; index < pts.length - 1; index += 1) {
    const p0 = pts[index - 1] ?? pts[index];
    const p1 = pts[index];
    const p2 = pts[index + 1];
    const p3 = pts[index + 2] ?? p2;

    if (pts.length <= 3) {
      path += ` L ${round(p2[0])} ${round(p2[1])}`;
      continue;
    }

    const c1x = p1[0] + (p2[0] - p0[0]) / tension;
    const c1y = p1[1] + (p2[1] - p0[1]) / tension;
    const c2x = p2[0] - (p3[0] - p1[0]) / tension;
    const c2y = p2[1] - (p3[1] - p1[1]) / tension;
    path += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(p2[0])} ${round(p2[1])}`;
  }
  return path;
}

/** The same curve closed down to the baseline, for the translucent fill. */
export function buildAreaPath(plot: Plot): string {
  const { values, width, height, padding = DEFAULT_PADDING } = plot;
  const line = buildLinePath(plot);
  if (!line || values.length < 2) return "";
  const baseline = round(height - padding);
  return `${line} L ${round(width)} ${baseline} L 0 ${baseline} Z`;
}

/**
 * Horizontal gridlines across the plot.
 */
export function gridLines(plot: Plot, count = 4): { y: number; value: number }[] {
  const { values, height, padding = DEFAULT_PADDING } = plot;
  const usable = Math.max(1, height - padding * 2);
  const top = niceMax(Math.max(0, ...values));
  return Array.from({ length: count + 1 }, (_, index) => {
    const value = (top / count) * (count - index);
    return { y: round(padding + (usable / count) * index), value };
  });
}

/** Index of the point nearest a pixel x, or -1 when the chart is empty. */
export function nearestIndex(plot: Plot, x: number): number {
  const pts = points(plot);
  if (pts.length === 0) return -1;
  let best = 0;
  let bestDistance = Infinity;
  pts.forEach(([px], index) => {
    const distance = Math.abs(px - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/**
 * Reduces a series to at most `maxPoints`, keeping peaks.
 *
 * Largest-Triangle-Three-Buckets: of every bucket it picks the point forming the
 * largest triangle with its neighbours, so a spike in an otherwise flat month
 * survives. Averaging instead would erase exactly the anomaly an admin opens
 * this chart to find. Endpoints are always kept.
 */
export function downsample(values: readonly number[], maxPoints: number): number[] {
  if (maxPoints < 3 || values.length <= maxPoints) return [...values];

  const sampled: number[] = [values[0]];
  const every = (values.length - 2) / (maxPoints - 2);

  // The previously chosen point, standing in for `a` in the three-buckets
  // formulation. Held as a coordinate pair because the area formula needs both
  // its x (the index) and its y (the value).
  let anchorX = 0;
  let anchorY = values[0];

  for (let i = 0; i < maxPoints - 2; i += 1) {
    // Centroid of the *next* bucket: the third vertex of every candidate
    // triangle. Degenerates to the anchor on the final bucket.
    const avgStart = Math.floor((i + 1) * every) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * every) + 1, values.length);
    let avgX = anchorX + 1;
    let avgY = anchorY;
    if (avgEnd > avgStart) {
      let sum = 0;
      for (let j = avgStart; j < avgEnd; j += 1) sum += values[j];
      avgX = (avgStart + avgEnd - 1) / 2;
      avgY = sum / (avgEnd - avgStart);
    }

    const bucketStart = Math.floor(i * every) + 1;
    const bucketEnd = Math.max(
      bucketStart + 1,
      Math.min(Math.floor((i + 1) * every) + 1, values.length - 1)
    );

    let bestX = bucketStart;
    let bestY = values[bucketStart];
    let bestArea = -1;
    for (let j = bucketStart; j < bucketEnd; j += 1) {
      const area = Math.abs(
        (anchorX - avgX) * (values[j] - anchorY) - (anchorX - j) * (avgY - anchorY)
      );
      if (area > bestArea) {
        bestArea = area;
        bestX = j;
        bestY = values[j];
      }
    }

    sampled.push(bestY);
    anchorX = bestX;
    anchorY = bestY;
  }

  sampled.push(values[values.length - 1]);
  return sampled;
}

/**
 * Compact axis and tooltip numbers, in Spanish.
 *
 * Full digit grouping stops being legible once an axis has six gridlines, so
 * thousands collapse to "1.2 mil" and millions to "3.4 M". Anything under a
 * thousand keeps its exact count, which is the range admin numbers actually sit
 * in.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  if (magnitude < 1000) return value.toLocaleString("es-MX");

  const scaled = magnitude < 1_000_000 ? value / 1000 : value / 1_000_000;
  const rounded = Math.round(scaled * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${text} ${magnitude < 1_000_000 ? "mil" : "M"}`;
}

/** Full grouped count, for KPI tiles and tooltips. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("es-MX");
}