/**
 * Tests for admin table cell formatting.
 *
 * The values formatted here come straight from user submitted rows, so these
 * tests pin down the null, empty and unknown-enum cases rather than the happy
 * path.
 *
 * bun test
 */
import { describe, expect, test } from "bun:test";
import {
  EMPTY_CELL,
  formatBadge,
  formatBool,
  formatDate,
  formatDateTime,
  formatEmbedded,
  formatText,
  formatUserRef,
  renderCell,
  shortId,
  truncate,
} from "../src/lib/admin/format";

describe("formatDate", () => {
  test("renders a Postgres date column", () => {
    expect(formatDate("2026-03-12")).toBe("12 mar 2026");
  });

  test("does not shift date-only values by a day", () => {
    // Parsed as UTC midnight, this would render as the 11th west of Greenwich.
    expect(formatDate("2026-01-01")).toBe("01 ene 2026");
    expect(formatDate("2026-12-31")).toBe("31 dic 2026");
  });

  test("returns a placeholder for missing values", () => {
    expect(formatDate(null)).toBe(EMPTY_CELL);
    expect(formatDate(undefined)).toBe(EMPTY_CELL);
    expect(formatDate("")).toBe(EMPTY_CELL);
    expect(formatDate("   ")).toBe(EMPTY_CELL);
  });

  test("returns a placeholder for unparseable values", () => {
    expect(formatDate("not a date")).toBe(EMPTY_CELL);
    expect(formatDate(12345)).toBe(EMPTY_CELL);
  });
});

describe("formatDateTime", () => {
  test("includes the time", () => {
    expect(formatDateTime("2026-03-12T20:30:00Z")).toContain("2026");
    expect(formatDateTime("2026-03-12T20:30:00Z")).toMatch(/,/);
  });

  test("returns a placeholder for missing values", () => {
    expect(formatDateTime(null)).toBe(EMPTY_CELL);
    expect(formatDateTime("")).toBe(EMPTY_CELL);
  });
});

describe("formatBool", () => {
  test("labels true and false", () => {
    expect(formatBool(true)).toBe("Sí");
    expect(formatBool(false)).toBe("No");
  });

  test("does not treat null as false", () => {
    expect(formatBool(null)).toBe(EMPTY_CELL);
    expect(formatBool(undefined)).toBe(EMPTY_CELL);
  });
});

describe("formatText", () => {
  test("passes strings through", () => {
    expect(formatText("Luna")).toBe("Luna");
  });

  test("uses a placeholder for empty values", () => {
    expect(formatText(null)).toBe(EMPTY_CELL);
    expect(formatText("")).toBe(EMPTY_CELL);
  });

  test("serialises embedded objects instead of printing [object Object]", () => {
    expect(formatText({ a: 1 })).toBe('{"a":1}');
  });
});

describe("truncate", () => {
  test("leaves short text alone", () => {
    expect(truncate("corta", 10)).toBe("corta");
  });

  test("adds an ellipsis past the limit", () => {
    const result = truncate("a".repeat(50), 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("shortId", () => {
  test("shortens a uuid", () => {
    const uuid = "9f2b1c44-7a3e-4c11-9b0d-2e5f6a7b8c9d";
    expect(shortId(uuid)).toBe("9f2b1c44…");
  });

  test("leaves short values alone", () => {
    expect(shortId("abc")).toBe("abc");
  });

  test("uses a placeholder for missing values", () => {
    expect(shortId(null)).toBe(EMPTY_CELL);
  });
});

describe("formatBadge", () => {
  const values = { perro: "Perro", gato: "Gato" };

  test("maps a known value to its label and tone", () => {
    expect(formatBadge("perro", values)).toEqual({
      label: "Perro",
      classes: "bg-texto/5 text-texto/70",
    });
  });

  test("falls back to the raw value for an unknown enum member", () => {
    expect(formatBadge("conejo", values).label).toBe("conejo");
  });

  test("uses a placeholder when the value is null", () => {
    expect(formatBadge(null, values).label).toBe(EMPTY_CELL);
  });

  test("does not crash without a mapping", () => {
    expect(formatBadge("admin").label).toBe("admin");
  });
});

describe("formatUserRef and formatEmbedded", () => {
  test("shortens a user id reference", () => {
    expect(formatUserRef("9f2b1c44-7a3e-4c11-9b0d-2e5f6a7b8c9d")).toBe("9f2b1c44…");
  });

  test("reads a field out of an embedded object", () => {
    expect(formatEmbedded({ name: "Luna" }, "name")).toBe("Luna");
  });

  test("uses a placeholder when the embedded object is absent", () => {
    expect(formatEmbedded(null, "name")).toBe(EMPTY_CELL);
    expect(formatEmbedded({ name: null }, "name")).toBe(EMPTY_CELL);
  });
});

describe("renderCell", () => {
  const row = {
    name: "Luna",
    type: "perro",
    created_at: "2026-03-12",
    confirmed: true,
    owner: "9f2b1c44-7a3e-4c11-9b0d-2e5f6a7b8c9d",
    note: "x".repeat(200),
  };

  test("dispatches on the column kind", () => {
    expect(renderCell({ key: "name" }, row)).toBe("Luna");
    expect(renderCell({ key: "created_at", kind: "date" }, row)).toBe("12 mar 2026");
    expect(renderCell({ key: "confirmed", kind: "bool" }, row)).toBe("Sí");
    expect(renderCell({ key: "owner", kind: "user" }, row)).toBe("9f2b1c44…");
    expect(renderCell({ key: "type", kind: "badge", values: { perro: "Perro" } }, row)).toBe("Perro");
  });

  test("truncates long text", () => {
    expect(renderCell({ key: "note", kind: "truncate" }, row)).toHaveLength(80);
  });

  test("uses a placeholder for a missing column", () => {
    expect(renderCell({ key: "nope" }, row)).toBe(EMPTY_CELL);
  });
});
