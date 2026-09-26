/**
 * Tests for the admin panel's security boundary and session helpers.
 *
 * These cover the logic behind requireAdmin(): cookie parsing, JWT expiry
 * inspection and the role check. The Supabase calls themselves are not mocked,
 * because what matters here is that the decision logic is correct and that the
 * role check cannot be satisfied by a non-admin.
 *
 * bun test
 */
import { describe, expect, test } from "bun:test";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  parseCookies,
  readAccessToken,
  readRefreshToken,
} from "../src/lib/admin/cookies";
import {
  ADMIN_ROLES,
  hasAdminRole,
  readTokenExpiry,
  shouldRefresh,
} from "../src/lib/admin/auth";

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

function requestWithCookie(cookie: string): Request {
  return new Request("https://luckytracker.com.mx/api/admin/stats", {
    headers: { cookie },
  });
}

describe("parseCookies", () => {
  test("reads a single cookie", () => {
    expect(parseCookies("a=1")).toEqual({ a: "1" });
  });

  test("reads multiple cookies and trims whitespace", () => {
    expect(parseCookies("a=1; b=2;c=3")).toEqual({ a: "1", b: "2", c: "3" });
  });

  test("returns an empty record for missing headers", () => {
    expect(parseCookies(null)).toEqual({});
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies("")).toEqual({});
  });

  test("percent-decodes values", () => {
    expect(parseCookies("token=a%20b")).toEqual({ token: "a b" });
  });

  test("keeps values that contain an equals sign", () => {
    expect(parseCookies("token=abc=def")).toEqual({ token: "abc=def" });
  });

  test("falls back to the raw value when decoding fails", () => {
    expect(parseCookies("token=%E0%A4%A")).toEqual({ token: "%E0%A4%A" });
  });

  test("ignores segments without a value", () => {
    expect(parseCookies("a=1; broken; b=2")).toEqual({ a: "1", b: "2" });
  });

  test("does not treat a segment with an empty name as a cookie", () => {
    expect(parseCookies("=orphan")).toEqual({});
  });
});

describe("readAccessToken / readRefreshToken", () => {
  test("extracts the session cookies", () => {
    const request = requestWithCookie(
      `${ACCESS_COOKIE}=access123; ${REFRESH_COOKIE}=refresh456`
    );
    expect(readAccessToken(request)).toBe("access123");
    expect(readRefreshToken(request)).toBe("refresh456");
  });

  test("returns null when the cookies are absent", () => {
    const request = requestWithCookie("other=1");
    expect(readAccessToken(request)).toBeNull();
    expect(readRefreshToken(request)).toBeNull();
  });
});

describe("readTokenExpiry", () => {
  test("reads exp from a well formed JWT", () => {
    const token = makeJwt({ exp: 1_700_000_000 });
    expect(readTokenExpiry(token)).toEqual({ expiresAt: 1_700_000_000_000 });
  });

  test("handles base64url payloads", () => {
    const token = makeJwt({ exp: 1, note: "a?b>c~d" });
    expect(readTokenExpiry(token)).not.toBeNull();
  });

  test("returns null for a malformed token", () => {
    expect(readTokenExpiry("not-a-jwt")).toBeNull();
    expect(readTokenExpiry("")).toBeNull();
  });

  test("returns null when exp is missing or not a number", () => {
    expect(readTokenExpiry(makeJwt({ sub: "abc" }))).toBeNull();
    expect(readTokenExpiry(makeJwt({ exp: "soon" }))).toBeNull();
  });
});

describe("shouldRefresh", () => {
  const now = 1_700_000_000_000;

  test("refreshes when the token expires inside the window", () => {
    const token = makeJwt({ exp: (now + 60_000) / 1000 });
    expect(shouldRefresh(token, now)).toBe(true);
  });

  test("does not refresh a token that is still fresh", () => {
    const token = makeJwt({ exp: (now + 3_600_000) / 1000 });
    expect(shouldRefresh(token, now)).toBe(false);
  });

  test("refreshes an already expired token", () => {
    const token = makeJwt({ exp: (now - 60_000) / 1000 });
    expect(shouldRefresh(token, now)).toBe(true);
  });

  test("does not refresh when the expiry cannot be read", () => {
    expect(shouldRefresh("garbage", now)).toBe(false);
  });

  test("honours a custom window", () => {
    const token = makeJwt({ exp: (now + 120_000) / 1000 });
    expect(shouldRefresh(token, now, 60_000)).toBe(false);
    expect(shouldRefresh(token, now, 300_000)).toBe(true);
  });
});

describe("hasAdminRole", () => {
  test("accepts admin and moderator", () => {
    for (const role of ADMIN_ROLES) {
      expect(hasAdminRole(role)).toBe(true);
    }
  });

  test("rejects every other value", () => {
    expect(hasAdminRole("user")).toBe(false);
    expect(hasAdminRole("")).toBe(false);
    expect(hasAdminRole(null)).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
  });

  test("is case sensitive and does not coerce", () => {
    expect(hasAdminRole("Admin")).toBe(false);
    expect(hasAdminRole("ADMIN")).toBe(false);
  });

  test("does not accept inherited Object properties as roles", () => {
    expect(hasAdminRole("toString")).toBe(false);
    expect(hasAdminRole("constructor")).toBe(false);
  });
});
