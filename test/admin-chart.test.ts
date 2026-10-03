import { describe, expect, it } from "bun:test";
import {
  buildAreaPath,
  buildLinePath,
  downsample,
  formatCompact,
  formatCount,
  gridLines,
  nearestIndex,
  niceMax,
  points,
  ticks,
} from "../src/lib/admin/chart";

/**
 * The charts are hand-rolled SVG rather than a library, so the geometry is ours
 * to get right. These tests cover the parts that fail quietly: an axis that
 * rounds to the wrong magnitude, a downsampler that averages a spike away, a
 * path with a NaN in it.
 */

const plot = { width: 300, height: 100, padding: 8 };

describe("niceMax", () => {
  it("rounds up to a readable axis top", () => {
    expect(niceMax(7)).toBe(10);
    expect(niceMax(17)).toBe(20);
    expect(niceMax(120)).toBe(200);
    expect(niceMax(1)).toBe(1);
    expect(niceMax(0.4)).toBe(0.5);
  });

  it("never divides by zero on an empty series", () => {
    // A table nobody has written to this month still has to draw an axis.
    expect(niceMax(0)).toBe(1);
    expect(niceMax(-5)).toBe(1);
    expect(niceMax(Number.NaN)).toBe(1);
    expect(niceMax(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("ticks", () => {
  it("spans zero to the rounded top, inclusive", () => {
    expect(ticks(17, 4)).toEqual([0, 5, 10, 15, 20]);
  });

  it("survives an all-zero series", () => {
    expect(ticks(0, 4)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
});

describe("points", () => {
  it("spans the full width for two or more values", () => {
    const result = points({ ...plot, values: [0, 10] });
    expect(result[0][0]).toBe(0);
    expect(result[1][0]).toBe(300);
  });

  it("centres a lone point instead of pinning it to the left edge", () => {
    expect(points({ ...plot, values: [5] })[0][0]).toBe(150);
  });

  it("returns nothing for an empty series", () => {
    expect(points({ ...plot, values: [] })).toEqual([]);
  });

  it("puts the highest value at the top of the plot, inside the padding", () => {
    const result = points({ ...plot, values: [0, 100] });
    expect(result[1][1]).toBe(plot.padding);
    expect(result[0][1]).toBe(plot.height - plot.padding);
  });
});

describe("buildLinePath", () => {
  it("starts with a move and emits no NaN", () => {
    const path = buildLinePath({ ...plot, values: [0, 5, 10, 5] });
    expect(path.startsWith("M ")).toBe(true);
    expect(path).not.toContain("NaN");
    expect(path).toContain("C ");
  });

  it("stays straight when there is too little data to justify a curve", () => {
    // A three-point series drawn as a spline invents shape that is not there.
    const path = buildLinePath({ ...plot, values: [0, 5, 10] });
    expect(path).not.toContain("C ");
    expect(path.match(/L /g)?.length).toBe(2);
  });

  it("degrades to a single move for one point", () => {
    const path = buildLinePath({ ...plot, values: [4] });
    expect(path.startsWith("M ")).toBe(true);
    expect(path).not.toContain("C ");
  });

  it("is empty for an empty series", () => {
    expect(buildLinePath({ ...plot, values: [] })).toBe("");
  });
});

describe("buildAreaPath", () => {
  it("closes the line down to the baseline", () => {
    const area = buildAreaPath({ ...plot, values: [0, 5, 10] });
    expect(area.endsWith("Z")).toBe(true);
    expect(area).toContain(`L ${plot.width} ${plot.height - plot.padding}`);
  });

  it("is empty when a fill would be meaningless", () => {
    expect(buildAreaPath({ ...plot, values: [] })).toBe("");
    expect(buildAreaPath({ ...plot, values: [3] })).toBe("");
  });
});

describe("gridLines", () => {
  it("returns one line per tick, top down", () => {
    const lines = gridLines({ ...plot, values: [0, 20] }, 4);
    expect(lines).toHaveLength(5);
    expect(lines[0].value).toBe(niceMax(20));
    expect(lines[lines.length - 1].y).toBe(plot.height - plot.padding);
    for (const line of lines) expect(line.y).not.toBeNaN();
  });
});

describe("nearestIndex", () => {
  it("finds the closest point to a pixel", () => {
    // Three points across 300px land on x = 0, 150 and 300.
    const p = { ...plot, values: [0, 10, 20] };
    expect(nearestIndex(p, 0)).toBe(0);
    expect(nearestIndex(p, 10)).toBe(0);
    expect(nearestIndex(p, 149)).toBe(1);
    expect(nearestIndex(p, 299)).toBe(2);
    expect(nearestIndex(p, 300)).toBe(2);
  });

  it("breaks an exact tie toward the earlier point", () => {
    const p = { ...plot, values: [0, 10, 20] };
    expect(nearestIndex(p, 75)).toBe(0);
  });

  it("returns -1 for an empty series so callers can bail out", () => {
    expect(nearestIndex({ ...plot, values: [] }, 100)).toBe(-1);
  });
});

describe("downsample", () => {
  it("passes short series through untouched", () => {
    expect(downsample([1, 2, 3], 10)).toEqual([1, 2, 3]);
    expect(downsample([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });

  it("reduces to the requested size", () => {
    const long = Array.from({ length: 90 }, (_, index) => (index % 7) + 1);
    expect(downsample(long, 20)).toHaveLength(20);
  });

  it("keeps the first and last points so the window stays anchored", () => {
    const long = Array.from({ length: 90 }, (_, index) => index);
    const sampled = downsample(long, 15);
    expect(sampled[0]).toBe(0);
    expect(sampled[sampled.length - 1]).toBe(89);
  });

  it("preserves a spike instead of averaging it away", () => {
    // The whole reason for triangle-based sampling: a one-day anomaly has to
    // stay visible after thinning.
    const values = new Array(90).fill(1);
    values[63] = 500;
    expect(downsample(values, 20)).toContain(500);
  });

  it("is a no-op below the usable minimum", () => {
    expect(downsample([1, 2, 3, 4], 2)).toEqual([1, 2, 3, 4]);
    expect(downsample([1, 2, 3, 4], 0)).toEqual([1, 2, 3, 4]);
  });
});

describe("formatCompact", () => {
  it("keeps small counts exact", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(999)).toBe("999");
  });

  it("collapses thousands and millions for the axis", () => {
    expect(formatCompact(1200)).toBe("1,2 mil");
    expect(formatCompact(15_400)).toBe("15,4 mil");
    expect(formatCompact(1_000_000)).toBe("1 M");
    expect(formatCompact(3_450_000)).toBe("3,5 M");
  });

  it("uses a decimal comma, as the rest of the panel does", () => {
    expect(formatCompact(1250)).toContain(",");
  });

  it("degrades gracefully on nonsense", () => {
    expect(formatCompact(Number.NaN)).toBe("—");
  });
});

describe("formatCount", () => {
  it("groups thousands for KPI tiles", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(Number.NaN)).toBe("—");
  });
});