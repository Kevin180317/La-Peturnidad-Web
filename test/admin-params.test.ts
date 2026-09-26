/**
 * Tests for admin list query parameters.
 *
 * The admin endpoints turn URL params into PostgREST filters, so these tests
 * focus on the boundaries: a caller must not be able to name a column that was
 * not reviewed, turn a search term into a wildcard, or ask for unbounded page
 * sizes.
 *
 * bun test
 */
import { describe, expect, test } from "bun:test";
import {
  PER_PAGE_DEFAULT,
  PER_PAGE_MAX,
  SEARCH_MAX_LENGTH,
  clampPage,
  clampPerPage,
  resolveFilters,
  resolveOrder,
  sanitizeSearch,
  toLikePattern,
} from "../src/lib/admin/params";
import { ADMIN_TABLES, getTableConfig, isAdminTable } from "../src/lib/admin/tables";

const config = ADMIN_TABLES.pets;
const url = (query: string) => new URL(`https://luckytracker.com.mx/api/admin/pets${query}`);

describe("sanitizeSearch", () => {
  test("trims and collapses whitespace", () => {
    expect(sanitizeSearch("  luna   del  mar ")).toBe("luna del mar");
  });

  test("escapes LIKE wildcards so they match literally", () => {
    expect(sanitizeSearch("50%")).toBe("50\\%");
    expect(sanitizeSearch("a_b")).toBe("a\\_b");
    expect(sanitizeSearch("back\\slash")).toBe("back\\\\slash");
  });

  test("strips PostgREST filter metacharacters", () => {
    expect(sanitizeSearch("a,b")).toBe("ab");
    expect(sanitizeSearch("f(x)")).toBe("fx");
    expect(sanitizeSearch("col.name")).toBe("colname");
    expect(sanitizeSearch('say "hi"')).toBe("say hi");
    expect(sanitizeSearch("a:b")).toBe("ab");
    // An attempted or() injection collapses to a harmless literal.
    expect(sanitizeSearch("or=(a.neq.1)")).toBe("or=aneq1");
  });

  test("cannot be used to inject an or() clause", () => {
    const injected = sanitizeSearch("x,role.eq.admin");
    expect(injected).not.toContain(",");
  });

  test("caps the length", () => {
    expect(sanitizeSearch("a".repeat(500))).toHaveLength(SEARCH_MAX_LENGTH);
  });

  test("returns an empty string for missing input", () => {
    expect(sanitizeSearch(null)).toBe("");
    expect(sanitizeSearch(undefined)).toBe("");
    expect(sanitizeSearch("")).toBe("");
  });
});

describe("toLikePattern", () => {
  test("wraps the term in wildcards", () => {
    expect(toLikePattern("luna")).toBe("%luna%");
  });
});

describe("clampPage", () => {
  test("defaults to the first page", () => {
    expect(clampPage(null)).toBe(1);
    expect(clampPage("")).toBe(1);
    expect(clampPage("abc")).toBe(1);
    expect(clampPage("0")).toBe(1);
    expect(clampPage("-5")).toBe(1);
  });

  test("parses valid pages", () => {
    expect(clampPage("3")).toBe(3);
  });
});

describe("clampPerPage", () => {
  test("falls back to the default", () => {
    expect(clampPerPage(null)).toBe(PER_PAGE_DEFAULT);
    expect(clampPerPage("0")).toBe(PER_PAGE_DEFAULT);
    expect(clampPerPage("-1")).toBe(PER_PAGE_DEFAULT);
    expect(clampPerPage("abc")).toBe(PER_PAGE_DEFAULT);
  });

  test("caps the page size", () => {
    expect(clampPerPage("1000")).toBe(PER_PAGE_MAX);
    expect(clampPerPage(String(PER_PAGE_MAX))).toBe(PER_PAGE_MAX);
    expect(clampPerPage("50")).toBe(50);
  });
});

describe("resolveOrder", () => {
  test("accepts an allow-listed column", () => {
    expect(resolveOrder(url("?order=name"), config)).toEqual({
      column: "name",
      ascending: true,
    });
  });

  test("falls back to the default for unknown columns", () => {
    expect(resolveOrder(url("?order=drop_table"), config).column).toBe("created_at");
    expect(resolveOrder(url("?order="), config).column).toBe("created_at");
  });

  test("does not accept a column that is only present in the projection", () => {
    // "features" is in the select list but is not orderable.
    expect(resolveOrder(url("?order=features"), config).column).toBe("created_at");
  });

  test("reads the direction, defaulting to ascending", () => {
    expect(resolveOrder(url("?order=name&dir=desc"), config)).toEqual({
      column: "name",
      ascending: false,
    });
    expect(resolveOrder(url("?order=name&dir=asc"), config).ascending).toBe(true);
    expect(resolveOrder(url("?order=name&dir=sideways"), config).ascending).toBe(true);
  });
});

describe("resolveFilters", () => {
  test("keeps declared filters", () => {
    expect(resolveFilters(url("?type=gato"), config)).toEqual({ type: "gato" });
  });

  test("drops params that are not declared filters", () => {
    expect(resolveFilters(url("?name=luna"), config)).toEqual({});
  });

  test("drops empty values", () => {
    expect(resolveFilters(url("?type="), config)).toEqual({});
  });

  test("never lets a param name become a column", () => {
    // user_id is a declared filter for pets, role is not: it must be dropped
    // rather than reaching the query as a column.
    const resolved = resolveFilters(url("?user_id=abc&role=admin"), config);
    expect(Object.keys(resolved)).toEqual(["user_id"]);
    expect(resolved.role).toBeUndefined();
  });
});

describe("ADMIN_TABLES allow-list", () => {
  test("never projects a bare *", () => {
    for (const [name, table] of Object.entries(ADMIN_TABLES)) {
      expect(table.select).not.toBe("*");
      expect(table.select).not.toContain("*,");
      expect(table.select).not.toContain(",*");
      expect(name).toBeTruthy();
    }
  });

  test("defaultOrder is always orderable", () => {
    for (const table of Object.values(ADMIN_TABLES)) {
      expect(table.orderColumns).toContain(table.defaultOrder);
    }
  });

  test("search and order columns are real projection columns", () => {
    for (const table of Object.values(ADMIN_TABLES)) {
      const projected = table.select
        .replace(/\([^)]*\)/g, "")
        .split(",")
        .map((part) => part.trim());
      for (const column of [...table.searchColumns, ...table.orderColumns]) {
        expect(projected).toContain(column);
      }
    }
  });

  test("user_profiles is not reachable through the generic endpoint", () => {
    expect(isAdminTable("user_profiles")).toBe(false);
    expect(getTableConfig("user_profiles")).toBeNull();
  });

  test("rejects prototype keys and unknown tables", () => {
    for (const candidate of [
      "__proto__",
      "constructor",
      "toString",
      "hasOwnProperty",
      "passwords",
      "",
    ]) {
      expect(isAdminTable(candidate)).toBe(false);
      expect(getTableConfig(candidate)).toBeNull();
    }
  });

  test("does not expose the private messaging tables", () => {
    for (const table of ["messages", "conversations", "conversation_participants"]) {
      expect(isAdminTable(table)).toBe(false);
    }
  });

  test("found_pets embeds the pet so the list is readable", () => {
    expect(ADMIN_TABLES.found_pets.select).toContain("pets(");
    expect(ADMIN_TABLES.found_pets.searchColumns).toEqual([]);
  });
});
