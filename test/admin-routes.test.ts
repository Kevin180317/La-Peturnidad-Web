/**
 * Structural tests over the admin API routes.
 *
 * The admin endpoints read through the service_role key, which bypasses RLS, so
 * requireAdmin() is the only thing keeping anonymous requests away from every
 * user's personal data. These tests read the route files off disk and fail if
 * that invariant is ever broken by a new or refactored route.
 *
 * bun test
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const API_ROOT = new URL("../src/pages/api/admin/", import.meta.url).pathname.replace(
  /^\//,
  ""
);

/** The sign-in endpoint authenticates instead of authorising, so it is exempt. */
const EXEMPT = new Set(["session.ts"]);

function collect(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collect(full));
    else if (entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const routeFiles = collect(API_ROOT).filter(
  (file) => !EXEMPT.has(file.slice(API_ROOT.length).split("\\").pop() ?? "")
);

describe("admin API routes", () => {
  test("there is at least one route to check", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  test("every route calls requireAdmin", () => {
    for (const file of routeFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("requireAdmin(");
    }
  });

  test("every route checks the guard before touching the database", () => {
    for (const file of routeFiles) {
      // Import lines are stripped so the check compares the guard call against
      // the first real data access, not against the import statement.
      const body = readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("import"))
        .join("\n");

      const guardAt = body.indexOf("requireAdmin(");
      const dataAt = body.search(/getAdminClient\(|await listRows\(|getUserDetail\(/);
      if (dataAt === -1) continue;

      expect(guardAt).toBeGreaterThan(-1);
      expect(guardAt).toBeLessThan(dataAt);
    }
  });

  test("every route opts out of prerendering", () => {
    for (const file of routeFiles) {
      expect(readFileSync(file, "utf8")).toContain("export const prerender = false");
    }
  });

  test("no route selects every column", () => {
    for (const file of routeFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/select\(\s*['"`]\*/);
    }
  });

  test("no route returns a successful response without the guard result", () => {
    for (const file of routeFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).toMatch(/if \(!guard\.ok\)/);
    }
  });
});

describe("admin session route", () => {
  const source = readFileSync(join(API_ROOT, "session.ts"), "utf8");

  test("is the only route that skips requireAdmin", () => {
    expect(routeFiles.length).toBe(collect(API_ROOT).length - 1);
  });

  test("throttles repeated sign-in attempts", () => {
    expect(source).toContain("MAX_ATTEMPTS");
    expect(source).toContain("isThrottled");
  });

  test("does not reveal whether an account exists", () => {
    expect(source).toContain("Invalid credentials.");
    expect(source).not.toMatch(/Invalid (email|password)/);
  });

  test("checks the role with the service client rather than the RPC", () => {
    expect(source).toContain('from("user_profiles")');
    // is_moderator_or_admin() depends on auth.uid(), which is null on a
    // service_role client, so the route must not call it.
    expect(source).not.toContain(".rpc(");
  });
});
