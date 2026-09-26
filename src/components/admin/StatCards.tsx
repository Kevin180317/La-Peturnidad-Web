import React, { useEffect, useState } from "react";

interface Card {
  key: string;
  label: string;
  value: number;
  href?: string;
  tone?: string;
}

const CARDS: Card[] = [
  { key: "user_profiles", label: "Usuarios", href: "/admin/usuarios" },
  { key: "pets", label: "Mascotas", href: "/admin/mascotas" },
  {
    key: "emergency_alerts",
    label: "Alertas de pérdida",
    href: "/admin/alertas",
    tone: "text-texto",
  },
  {
    key: "found_pets",
    label: "Mascotas encontradas",
    href: "/admin/encontradas",
  },
  { key: "success_stories", label: "Historias", href: "/admin/historias" },
  { key: "groups", label: "Grupos", href: "/admin/grupos" },
  { key: "group_members", label: "Membresías", href: "/admin/grupos" },
  { key: "posts", label: "Publicaciones", href: "/admin/publicaciones" },
  { key: "comments", label: "Comentarios", href: "/admin/publicaciones" },
  { key: "announcements", label: "Avisos", href: "/admin/avisos" },
  {
    key: "blocks",
    label: "Bloqueos",
    href: "/admin/bloqueos",
  },
];

interface Props {
  initialStats?: Record<string, number>;
  initialPending?: number;
}

export default function StatCards({ initialStats, initialPending }: Props) {
  const [stats, setStats] = useState<Record<string, number> | null>(
    initialStats ?? null
  );
  const [pending, setPending] = useState<number | null>(
    initialPending ?? null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (initialStats) return;
    let cancelled = false;

    fetch("/api/admin/stats", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("stats request failed");
        return (await response.json()) as {
          stats: Record<string, number>;
          pending_reports: number;
        };
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setPending(data.pending_reports);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialStats]);

  if (failed) {
    return (
      <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700">
        No se pudieron cargar las métricas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pending !== null && pending > 0 ? (
        <a
          href="/admin/reportes?status=pending"
          className="flex items-center justify-between rounded-2xl bg-principal/20 px-5 py-4 text-texto transition hover:bg-principal/30"
        >
          <span className="font-semibold">
            {pending} {pending === 1 ? "reporte pendiente" : "reportes pendientes"}
          </span>
          <span className="text-sm text-texto/70">Revisar →</span>
        </a>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((card) => {
          const value = stats ? (stats[card.key] ?? 0) : null;
          const body = (
            <>
              <p className="text-xs font-medium text-texto/60">{card.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-texto">
                {value === null ? "—" : value.toLocaleString("es-MX")}
              </p>
            </>
          );

          return card.href ? (
            <a
              key={card.key}
              href={card.href}
              className="rounded-2xl bg-white px-4 py-4 transition hover:shadow-sm"
            >
              {body}
            </a>
          ) : (
            <div key={card.key} className="rounded-2xl bg-white px-4 py-4">
              {body}
            </div>
          );
        })}
      </div>

      {stats ? null : (
        <p className="text-sm text-texto/50">Cargando métricas…</p>
      )}
    </div>
  );
}
