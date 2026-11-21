import { describe, expect, test } from "bun:test";
import {
  findAuthUserIdsByEmail,
  type AuthUserInfo,
} from "../src/lib/admin/emails";
import { mergeListRows } from "../src/lib/admin/queries";

const info = (id: string, email: string | null): AuthUserInfo => ({
  id,
  email,
  emailConfirmedAt: null,
  lastSignInAt: null,
  createdAt: null,
});

describe("findAuthUserIdsByEmail", () => {
  test("matches emails case-insensitively by substring", () => {
    const index = new Map([
      ["1", info("1", "Juan@Example.com")],
      ["2", info("2", "maria@example.com")],
      ["3", info("3", null)],
    ]);
    expect(findAuthUserIdsByEmail(index, "juan")).toEqual(["1"]);
    expect(findAuthUserIdsByEmail(index, "@EXAMPLE")).toEqual(["1", "2"]);
  });

  test("keeps dots in the search term", () => {
    const index = new Map([["1", info("1", "ana@example.com")]]);
    expect(findAuthUserIdsByEmail(index, "ana@example.com")).toEqual(["1"]);
  });

  test("trims whitespace and ignores empty terms", () => {
    const index = new Map([["1", info("1", "ana@example.com")]]);
    expect(findAuthUserIdsByEmail(index, "  ana  ")).toEqual(["1"]);
    expect(findAuthUserIdsByEmail(index, "   ")).toEqual([]);
  });
});

describe("mergeListRows", () => {
  const rows = [
    { user_id: "a", created_at: "2026-01-01", first_name: "Ana" },
    { user_id: "b", created_at: "2026-03-01", first_name: "Beto" },
  ];

  test("deduplicates by user_id and sorts ascending", () => {
    expect(
      mergeListRows([rows, [rows[0]]], {
        column: "created_at",
        ascending: true,
      }).map((row) => row.user_id)
    ).toEqual(["a", "b"]);
  });

  test("sorts descending", () => {
    expect(
      mergeListRows([rows], { column: "created_at", ascending: false }).map(
        (row) => row.user_id
      )
    ).toEqual(["b", "a"]);
  });

  test("falls back to id and breaks ties deterministically", () => {
    const tied = [
      { id: "z", first_name: "Mismo" },
      { id: "a", first_name: "Mismo" },
    ];
    expect(
      mergeListRows([tied], { column: "first_name", ascending: true }).map(
        (row) => row.id
      )
    ).toEqual(["a", "z"]);
  });
});
