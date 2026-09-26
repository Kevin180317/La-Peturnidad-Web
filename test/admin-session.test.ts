import { describe, expect, it } from "bun:test";
import { DELETE, GET, POST } from "../src/pages/api/admin/session";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../src/lib/admin/cookies";

/**
 * Behaviour of the session endpoint, exercised without a Supabase project.
 *
 * Only the paths that answer before touching the network are covered: request
 * validation and cookie clearing. The sign-in path itself needs a real project
 * and is covered by hand after the environment variables are set.
 */

type Handler = (context: never) => Promise<Response>;

function makeContext(body?: string, ip = "203.0.113.9") {
  const deleted: string[] = [];
  const set: string[] = [];

  return {
    context: {
      request: new Request("http://localhost/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body,
      }),
      cookies: {
        set: (name: string) => set.push(name),
        delete: (name: string) => deleted.push(name),
        get: () => undefined,
      },
      locals: {} as Record<string, unknown>,
    } as never,
    deleted,
    set,
  };
}

describe("POST /api/admin/session validation", () => {
  it("rejects a body that is not JSON", async () => {
    const { context } = makeContext("this is not json");
    const response = await (POST as unknown as Handler)(context);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Invalid JSON body.");
  });

  it("rejects a missing password", async () => {
    const { context } = makeContext(JSON.stringify({ email: "a@b.com" }));
    const response = await (POST as unknown as Handler)(context);
    expect(response.status).toBe(400);
  });

  it("rejects a missing email", async () => {
    const { context } = makeContext(JSON.stringify({ password: "secret" }));
    const response = await (POST as unknown as Handler)(context);
    expect(response.status).toBe(400);
  });

  it("rejects non string credentials", async () => {
    const { context } = makeContext(JSON.stringify({ email: 1, password: true }));
    const response = await (POST as unknown as Handler)(context);
    expect(response.status).toBe(400);
  });

  it("rejects empty strings", async () => {
    const { context } = makeContext(JSON.stringify({ email: "", password: "" }));
    const response = await (POST as unknown as Handler)(context);
    expect(response.status).toBe(400);
  });

  it("never caches a credential response", async () => {
    const { context } = makeContext("nope");
    const response = await (POST as unknown as Handler)(context);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("DELETE /api/admin/session", () => {
  it("clears both session cookies", async () => {
    const { context, deleted } = makeContext();
    const response = await (DELETE as unknown as Handler)(context);
    expect(response.status).toBe(200);
    expect(deleted).toEqual([ACCESS_COOKIE, REFRESH_COOKIE]);
  });
});

describe("GET /api/admin/session", () => {
  it("reports the session the middleware already verified", async () => {
    const { context } = makeContext();
    const withSession = {
      ...(context as unknown as { locals: Record<string, unknown> }),
      locals: { admin: { userId: "u1", email: "a@b.com", role: "admin" } },
    };
    const response = await (GET as unknown as Handler)(withSession as never);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; session: unknown };
    expect(body.ok).toBe(true);
    expect(body.session).toEqual({
      userId: "u1",
      email: "a@b.com",
      role: "admin",
    });
  });
});
