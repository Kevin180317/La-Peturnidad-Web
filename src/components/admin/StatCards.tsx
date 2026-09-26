import React, { useEffect, useState } from "react";
import { IconExclamation, IconSpinner } from "./Icons";

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
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
        <IconExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span>No se pudieron cargar las métricas.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pending !== null && pending > 0 ? (
        <a
          href="/admin/reportes?status=pending"
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-principal/15 to-principal/10 border border-principal/20 px-6 py-4 text-texto transition-all duration-200 hover:shadow-lg hover:shadow-principal/10"
        >
          <div>
            <p className="font-semibold">
              {pending} {pending === 1 ? "reporte pendiente" : "reportes pendientes"}
            </p>
            <p className="text-xs text-texto/60">Acción requerida</p>
          </div>
          <span className="text-sm font-semibold text-principal">Revisar →</span>
        </a>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const value = stats ? (stats[card.key] ?? 0) : null;

          const body = (
            <div className="flex flex-col h-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto/60 mb-auto">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-texto">
                {value === null ? "—" : value.toLocaleString("es-MX")}
              </p>
            </div>
          );

          return card.href ? (
            <a
              key={card.key}
              href={card.href}
              className="rounded-xl bg-white p-5 transition-all duration-200 hover:shadow-lg hover:shadow-principal/10 border border-texto/5 hover:border-principal/20 group"
            >
              {body}
            </a>
          ) : (
            <div key={card.key} className="rounded-xl bg-white p-5 border border-texto/5">
              {body}
            </div>
          );
        })}
      </div>

      {stats ? null : (
        <div className="flex items-center justify-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-texto/50">
            <IconSpinner className="w-4 h-4 text-texto/60" />
            Cargando métricas…
          </div>
        </div>
      )}
    </div>
  );
}
