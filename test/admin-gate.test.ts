import { describe, expect, it } from "bun:test";
import { evaluateGate, isAdminApi, isAdminPage } from "../src/lib/admin/gate";

/**
 * Path rules for the panel gate.
 *
 * The important case here is the session endpoint: if the gate also covers
 * POST /api/admin/session, nobody can ever sign in.
 */

describe("admin path classification", () => {
  it("treats /admin and everything under it as a page", () => {
    expect(isAdminPage("/admin")).toBe(true);
    expect(isAdminPage("/admin/")).toBe(true);
    expect(isAdminPage("/admin/usuarios")).toBe(true);
    expect(isAdminPage("/admin/reportes")).toBe(true);
  });

  it("does not claim a path that merely starts with the same letters", () => {
    expect(isAdminPage("/administrador")).toBe(false);
    expect(isAdminPage("/admin-publico")).toBe(false);
    expect(isAdminApi("/api/administradores")).toBe(false);
  });

  it("treats /api/admin and everything under it as an API path", () => {
    expect(isAdminApi("/api/admin")).toBe(true);
    expect(isAdminApi("/api/admin/users")).toBe(true);
    expect(isAdminApi("/api/admin/users/abc")).toBe(true);
    expect(isAdminApi("/api/admin/stats")).toBe(true);
  });
});

describe("evaluateGate", () => {
  it("ignores the public site", () => {
    for (const pathname of ["/", "/faq", "/en", "/blog", "/privacy"]) {
      expect(evaluateGate(pathname)).toEqual({ kind: "pass" });
    }
  });

  it("lets the login page through", () => {
    expect(evaluateGate("/admin/login")).toEqual({ kind: "pass" });
  });

  it("lets a login POST reach the session endpoint", () => {
    expect(evaluateGate("/api/admin/session", "POST")).toEqual({ kind: "pass" });
  });

  it("lets a logout DELETE reach the session endpoint", () => {
    expect(evaluateGate("/api/admin/session", "DELETE")).toEqual({ kind: "pass" });
  });

  it("is not case sensitive about the method", () => {
    expect(evaluateGate("/api/admin/session", "post")).toEqual({ kind: "pass" });
  });

  it("still gates GET on the session endpoint", () => {
    expect(evaluateGate("/api/admin/session", "GET")).toEqual({
      kind: "check",
      onFailure: "deny",
    });
  });

  it("checks panel pages and redirects on failure", () => {
    for (const pathname of ["/admin", "/admin/usuarios", "/admin/reportes"]) {
      expect(evaluateGate(pathname)).toEqual({
        kind: "check",
        onFailure: "redirect",
      });
    }
  });

  it("checks admin APIs and denies on failure", () => {
    for (const pathname of [
      "/api/admin/users",
      "/api/admin/users/abc",
      "/api/admin/stats",
      "/api/admin/pet_profiles",
    ]) {
      expect(evaluateGate(pathname)).toEqual({ kind: "check", onFailure: "deny" });
    }
  });

  it("does not exempt a table route that merely looks like the session one", () => {
    expect(evaluateGate("/api/admin/sessions")).toEqual({
      kind: "check",
      onFailure: "deny",
    });
    expect(evaluateGate("/api/admin/session/extra")).toEqual({
      kind: "check",
      onFailure: "deny",
    });
  });

  it("only exempts the exact login path", () => {
    expect(evaluateGate("/admin/login/extra")).toEqual({
      kind: "check",
      onFailure: "redirect",
    });
  });
});
