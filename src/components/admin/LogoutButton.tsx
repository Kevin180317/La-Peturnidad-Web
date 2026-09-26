import React, { useState } from "react";

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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-lg border border-texto/15 px-3 py-1.5 text-xs font-medium text-texto/70 transition hover:border-texto/30 hover:text-texto disabled:opacity-60"
    >
      {busy ? "Saliendo…" : "Salir"}
    </button>
  );
}
