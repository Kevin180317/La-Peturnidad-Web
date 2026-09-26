/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { AdminSession } from "./lib/admin/auth";

declare global {
  namespace App {
    interface Locals {
      /** Set by src/middleware.ts once the caller is a verified admin. */
      admin?: AdminSession;
    }
  }
}
