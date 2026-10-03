import React, { useState } from "react";
import { IconSpinner, IconLogout } from "./Icons";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      // Even if the request fails, send them to the login page.
    }
    window.location.assign("/admin/login");
  }

  // An icon-only control in the top bar, where a filled red pill used to sit.
  // Sign-out is reversible in one click, so it does not need the visual weight
  // of a destructive confirmation; the hover state is where it is signalled.
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={busy ? "Saliendo…" : "Cerrar sesión"}
      title="Cerrar sesión"
      className="rounded-lg p-2 text-texto/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
    >
      {busy ? (
        <IconSpinner className="h-5 w-5" />
      ) : (
        <IconLogout className="h-5 w-5" />
      )}
    </button>
  );
}