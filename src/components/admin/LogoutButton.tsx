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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-lg bg-red-50 border border-red-200/50 px-4 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 disabled:opacity-60 disabled:hover:bg-red-50 disabled:hover:border-red-200/50 flex items-center gap-1.5"
    >
      {busy ? (
        <>
          <IconSpinner className="w-3 h-3 text-red-600" />
          Saliendo…
        </>
      ) : (
        <>
          <IconLogout className="w-3 h-3" />
          Salir
        </>
      )}
    </button>
  );
}
