import React, { useEffect, useState } from "react";
import { EMPTY_CELL, formatDate, formatDateTime, formatText } from "../../lib/admin/format";

interface Detail {
  profile: Record<string, unknown> | null;
  email: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
  counts: Record<string, number>;
}

const COUNT_LABELS: Record<string, string> = {
  pets: "Mascotas",
  emergency_alerts: "Alertas de pérdida",
  found_pets: "Mascotas encontradas",
  posts: "Publicaciones",
  comments: "Comentarios",
  announcements: "Avisos",
  success_stories: "Historias",
  groups: "Grupos creados",
  reports_filed: "Reportes hechos",
  reports_received: "Reportes recibidos",
  blocks_made: "Bloqueos hechos",
  blocks_received: "Bloqueos recibidos",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  user: "Usuario",
};

interface Props {
  endpoint: string;
  row: Record<string, unknown>;
  onClose: () => void;
}

/**
 * Full record for one account.
 *
 * This is the only view that returns home address and date of birth, so it is
 * reached deliberately, one person at a time, instead of shipping those columns
 * in the listing.
 */
export default function UserDetailModal({ endpoint, row, onClose }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("failed");
        return (await response.json()) as Detail;
      })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const profile = detail?.profile ?? row;
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-texto/40 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-texto">{fullName || "Usuario"}</h2>
            <p className="font-mono text-xs text-texto/50">
              {formatText(row.user_id)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg border border-texto/15 px-2 py-1 text-sm text-texto/60 hover:text-texto"
          >
            ✕
          </button>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700">
            No se pudo cargar el detalle.
          </p>
        ) : null}

        {!detail && !error ? (
          <p className="text-sm text-texto/50">Cargando…</p>
        ) : null}

        {detail ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto/50">
                Cuenta
              </h3>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Field label="Correo" value={detail.email} />
                <Field
                  label="Correo verificado"
                  value={detail.emailConfirmedAt ? "Sí" : "No"}
                />
                <Field
                  label="Rol"
                  value={ROLE_LABELS[formatText(profile.role)] ?? formatText(profile.role)}
                />
                <Field label="Teléfono" value={formatText(profile.phone)} />
                <Field label="Ciudad" value={formatText(profile.city)} />
                <Field label="Código postal" value={formatText(profile.postal_code)} />
                <Field label="Dirección" value={formatText(profile.address)} />
                <Field
                  label="Fecha de nacimiento"
                  value={formatDate(profile.birth_date)}
                />
                <Field label="Último acceso" value={formatDateTime(detail.lastSignInAt)} />
                <Field label="Alta en la app" value={formatDateTime(detail.createdAt)} />
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto/50">
                Actividad
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(detail.counts).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-fondo px-3 py-2">
                    <p className="text-xs text-texto/60">{COUNT_LABELS[key] ?? key}</p>
                    <p className="text-lg font-bold tabular-nums text-texto">
                      {value ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  const empty = value === null || value === undefined || value === "" || value === EMPTY_CELL;
  return (
    <div>
      <dt className="text-xs text-texto/50">{label}</dt>
      <dd className={empty ? "text-texto/30" : "text-texto"}>{empty ? EMPTY_CELL : value}</dd>
    </div>
  );
}
