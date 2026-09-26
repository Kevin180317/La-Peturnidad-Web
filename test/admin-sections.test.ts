import { describe, expect, it } from "bun:test";
import { ADMIN_SECTIONS, getSection } from "../src/lib/admin/sections";
import {
  ADMIN_TABLES,
  USERS_TABLE_CONFIG,
  getConfigForEndpoint,
  getTableConfig,
} from "../src/lib/admin/tables";

/**
 * The panel is driven entirely by these two tables, so a typo here shows up as a
 * broken page rather than a build error. These checks are the safety net.
 */

const ENDPOINT_PREFIX = "/api/admin/";

describe("admin sections", () => {
  it("has unique slugs", () => {
    const slugs = ADMIN_SECTIONS.map((section) => section.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses slug safe values", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(section.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("points every section at an admin endpoint", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(section.endpoint.startsWith(ENDPOINT_PREFIX)).toBe(true);
    }
  });

  it("has a column list and a default order everywhere", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(section.columns.length).toBeGreaterThan(0);
      expect(section.defaultOrder).toBeTruthy();
    }
  });

  it("has no duplicate column keys within a section", () => {
    for (const section of ADMIN_SECTIONS) {
      const keys = section.columns.map((column) => column.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("only sorts by columns the table allows", () => {
    for (const section of ADMIN_SECTIONS) {
      if (!section.orderOptions) continue;
      const config = getConfigForEndpoint(section.endpoint);
      expect(config).not.toBeNull();
      for (const option of section.orderOptions) {
        expect(config?.orderColumns).toContain(option.value);
      }
    }
  });

  it("resolves a section by slug and rejects anything else", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(getSection(section.slug)).toBe(section);
    }
    expect(getSection("no-existe")).toBeNull();
    expect(getSection("")).toBeNull();
    expect(getSection("../etc")).toBeNull();
  });

  it("only offers filters the served table can actually apply", () => {
    for (const section of ADMIN_SECTIONS) {
      for (const filter of section.filters ?? []) {
        expect(filter.options.length).toBeGreaterThan(0);
        for (const option of filter.options) {
          expect(option.value).toBeTruthy();
          expect(option.label).toBeTruthy();
        }
        const config = getConfigForEndpoint(section.endpoint);
        expect(Object.keys(config?.filters ?? {})).toContain(filter.param);
      }
    }
  });

  it("resolves every section to a table config", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(getConfigForEndpoint(section.endpoint)).not.toBeNull();
    }
  });

  it("keeps user_profiles out of the generic table route", () => {
    // If it were reachable through /api/admin/[table] it would serve the
    // listing without the merged emails, and the dedicated route would be
    // bypassable.
    expect(getTableConfig("user_profiles")).toBeNull();
    expect(getConfigForEndpoint("/api/admin/users")).toBe(USERS_TABLE_CONFIG);
  });

  it("keeps the sensitive columns out of the users listing", () => {
    // These are only served by the single-user detail endpoint.
    for (const column of ["address", "birth_date", "postal_code"]) {
      expect(USERS_TABLE_CONFIG.select).not.toContain(column);
    }
  });
});

describe("admin table whitelist", () => {
  it("only exposes tables that exist in the list", () => {
    for (const name of Object.keys(ADMIN_TABLES)) {
      expect(getTableConfig(name)).not.toBeNull();
    }
  });

  it("refuses anything not on the list", () => {
    expect(getTableConfig("user_profiles; drop table")).toBeNull();
    expect(getTableConfig("rpc_exec")).toBeNull();
    expect(getTableConfig("")).toBeNull();
  });

  it("never exposes the tables holding private conversations", () => {
    // Read only is fine; writing a message is not, and neither table is listed.
    for (const forbidden of ["messages", "message_reactions"]) {
      expect(getTableConfig(forbidden)).toBeNull();
      expect(ADMIN_SECTIONS.some((section) => section.endpoint.includes(forbidden))).toBe(
        false
      );
    }
  });

  it("gives every table a projection and a sort whitelist", () => {
    for (const [name, config] of Object.entries(ADMIN_TABLES)) {
      expect(config.select).toBeTruthy();
      expect(config.orderColumns.length).toBeGreaterThan(0);
      // Sorting by a column outside the whitelist would be an injection point.
      expect(config.orderColumns).toContain(config.defaultOrder);
      expect(name).toBeTruthy();
    }
  });
});
