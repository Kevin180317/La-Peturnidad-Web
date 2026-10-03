import React, { useState } from "react";
import { IconExclamation, IconSpinner } from "./Icons";

/**
 * Sign-in form for the private panel.
 *
 * A full page navigation is used on success on purpose: the session lives in an
 * httpOnly cookie that JavaScript cannot read, so the browser has to re-request
 * the page for the server side middleware to see it.
 */
export default function LoginForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        setBusy(false);
        return;
      }

      window.location.assign(nextPath);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="block text-sm font-semibold text-texto"
        >
          Correo electrónico
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-texto/15 bg-panel px-4 py-3 text-sm text-texto outline-none transition-all placeholder:text-texto/40 focus:border-principal focus:ring-2 focus:ring-principal/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="block text-sm font-semibold text-texto"
        >
          Contraseña
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-texto/15 bg-panel px-4 py-3 text-sm text-texto outline-none transition-all placeholder:text-texto/40 focus:border-principal focus:ring-2 focus:ring-principal/20"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 flex items-start gap-3"
        >
          <IconExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-principal px-4 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-principal/30 disabled:opacity-60 disabled:hover:shadow-none"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <IconSpinner className="w-4 h-4 text-white" />
            Entrando…
          </span>
        ) : (
          "Entrar al Panel"
        )}
      </button>
    </form>
  );
}
