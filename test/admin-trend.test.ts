import { describe, expect, it } from "bun:test";
import {
  DEFAULT_TREND_RANGE,
  TREND_RANGES,
  bucketByDay,
  dayKey,
  dayKeys,
  hasData,
  resolveTrendRange,
  toDate,
} from "../src/lib/admin/trend";

/**
 * The dashboard charts are built by counting rows into day buckets in
 * JavaScript, so these tests pin down the two places that can silently produce
 * a plausible-looking but wrong chart: which calendar day a timestamp belongs
 * to, and what happens to junk.
 */

describe("resolveTrendRange", () => {
  it("accepts every offered range", () => {
    for (const range of TREND_RANGES) {
      expect(resolveTrendRange(range)).toBe(range);
      expect(resolveTrendRange(String(range))).toBe(range);
    }
  });

  it("falls back to the default for anything else", () => {
    expect(resolveTrendRange(null)).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange(undefined)).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange("")).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange("abc")).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange(0)).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange(-30)).toBe(DEFAULT_TREND_RANGE);
    expect(resolveTrendRange(31)).toBe(DEFAULT_TREND_RANGE);
    // Not a way to make the query read more rows than intended.
    expect(resolveTrendRange(100000)).toBe(DEFAULT_TREND_RANGE);
  });
});

describe("dayKey", () => {
  it("uses local calendar parts, not UTC", () => {
    // 03:30 UTC is still the previous evening in Mexico City, which is where
    // the panel is read. Bucketing on the UTC date would shift this row a day.
    const lateEvening = new Date("2026-03-12T03:30:00+00:00");
    expect(dayKey(lateEvening)).toBe(dayKey(new Date(2026, 2, 12)));
  });

  it("zero-pads to a sortable YYYY-MM-DD key", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
    expect(dayKey(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});

describe("toDate", () => {
  it("parses timestamps and dates", () => {
    expect(toDate("2026-03-12T10:00:00+00:00")).toBeInstanceOf(Date);
    expect(toDate(1773290400000)).toBeInstanceOf(Date);
    expect(toDate(new Date(2026, 2, 12))).toBeInstanceOf(Date);
  });

  it("reads a bare date as local midnight, not UTC", () => {
    // new Date("2026-03-12") is UTC midnight, which is the 11th west of
    // Greenwich. Assembling it locally keeps the day the column actually says.
    expect(dayKey(toDate("2026-03-12")!)).toBe("2026-03-12");
  });

  it("returns null instead of an Invalid Date", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate("")).toBeNull();
    expect(toDate("   ")).toBeNull();
    expect(toDate("not a date")).toBeNull();
    expect(toDate(Number.NaN)).toBeNull();
    expect(toDate(new Date("nope"))).toBeNull();
  });
});

describe("dayKeys", () => {
  it("returns exactly `days` keys, oldest first, ending today", () => {
    const end = new Date(2026, 2, 12);
    const keys = dayKeys(7, end);
    expect(keys).toHaveLength(7);
    expect(keys[keys.length - 1]).toBe("2026-03-12");
    expect(keys[0]).toBe("2026-03-06");
  });

  it("crosses month and year boundaries", () => {
    const keys = dayKeys(5, new Date(2026, 0, 2));
    expect(keys).toEqual([
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
      "2026-01-01",
      "2026-01-02",
    ]);
  });

  it("handles a leap day", () => {
    const keys = dayKeys(3, new Date(2028, 1, 29));
    expect(keys).toEqual(["2028-02-27", "2028-02-28", "2028-02-29"]);
  });

  it("never returns an empty range", () => {
    expect(dayKeys(0, new Date(2026, 2, 12))).toHaveLength(1);
    expect(dayKeys(-5, new Date(2026, 2, 12))).toHaveLength(1);
  });
});

describe("bucketByDay", () => {
  const keys = ["2026-03-10", "2026-03-11", "2026-03-12"];

  it("counts rows into the matching day", () => {
    const values = [
      "2026-03-10T09:00:00+00:00",
      "2026-03-10T21:00:00+00:00",
      "2026-03-12T06:00:00+00:00",
    ];
    expect(bucketByDay(values, keys)).toEqual([2, 0, 1]);
  });

  it("zero-fills empty days so every series is indexable by day", () => {
    expect(bucketByDay(["2026-03-11T12:00:00+00:00"], keys)).toEqual([0, 1, 0]);
    expect(bucketByDay([], keys)).toEqual([0, 0, 0]);
  });

  it("drops rows outside the window instead of growing a bucket", () => {
    const values = [
      "2026-03-09T23:00:00+00:00",
      "2026-03-13T01:00:00+00:00",
      "2026-03-11T10:00:00+00:00",
    ];
    expect(bucketByDay(values, keys)).toEqual([0, 1, 0]);
  });

  it("skips junk rather than throwing away the whole chart", () => {
    const values = [null, undefined, "", "basura", "2026-03-11T10:00:00+00:00"];
    expect(bucketByDay(values, keys)).toEqual([0, 1, 0]);
  });

  it("always matches the number of keys", () => {
    for (const days of TREND_RANGES) {
      const window = dayKeys(days, new Date(2026, 2, 12));
      expect(bucketByDay(["2026-03-12T10:00:00+00:00"], window)).toHaveLength(days);
    }
  });

  it("returns all zeros for an empty range", () => {
    expect(bucketByDay(["2026-03-12T10:00:00+00:00"], [])).toEqual([]);
  });
});

describe("hasData", () => {
  it("tells a flat series from a populated one", () => {
    expect(hasData([0, 0, 0])).toBe(false);
    expect(hasData([])).toBe(false);
    expect(hasData([0, 3])).toBe(true);
    expect(hasData([Number.NaN, 1])).toBe(true);
  });
});