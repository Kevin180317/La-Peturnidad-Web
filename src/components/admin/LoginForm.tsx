import React, { useState } from "react";

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
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label
          htmlFor="admin-email"
          className="mb-1 block text-sm font-medium text-texto"
        >
          Correo
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-texto/15 bg-white px-4 py-3 text-texto outline-none focus:border-secundario"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-1 block text-sm font-medium text-texto"
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
          className="w-full rounded-xl border border-texto/15 bg-white px-4 py-3 text-texto outline-none focus:border-secundario"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-texto px-4 py-3 font-semibold text-white transition disabled:opacity-60"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
