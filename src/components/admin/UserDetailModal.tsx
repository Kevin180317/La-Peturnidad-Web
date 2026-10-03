import React, { useEffect, useState } from "react";
import { EMPTY_CELL, formatDate, formatDateTime, formatText } from "../../lib/admin/format";
import { IconClose, IconExclamation, IconSpinner } from "./Icons";

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-texto/50 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-panel shadow-2xl shadow-principal/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-texto/10 px-5 py-4 sm:px-7 sm:py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-texto">{fullName || "Usuario"}</h2>
            <p className="font-mono text-xs text-texto/50 mt-1">
              {formatText(row.user_id)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg hover:bg-texto/5 p-2 text-texto/60 hover:text-texto transition-all"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-7">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 flex items-start gap-3">
              <IconExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>No se pudo cargar el detalle.</span>
            </div>
          ) : null}

          {!detail && !error ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-flex items-center gap-2 text-sm text-texto/50">
                <IconSpinner className="w-4 h-4 text-texto/60" />
                Cargando…
              </div>
            </div>
          ) : null}


        {detail ? (
          <div className="space-y-8">
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-texto/50">
                Información de la cuenta
              </h3>
              <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <Field label="Correo" value={detail.email} />
                <Field
                  label="Correo verificado"
                  value={detail.emailConfirmedAt ? "✓ Sí" : "✗ No"}
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
              </dl>
            </section>

            <div className="border-t border-texto/10 pt-8">
              <section>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-texto/50">
                  Actividad y estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(detail.counts).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-fondo/60 px-4 py-3 ring-1 ring-texto/5 transition-colors hover:ring-principal/30 transition-colors">
                      <p className="text-xs font-medium text-texto/60 mb-1">{COUNT_LABELS[key] ?? key}</p>
                      <p className="text-2xl font-bold tabular-nums text-texto">
                        {value ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="border-t border-texto/10 pt-8">
              <section>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-texto/50">
                  Historial de acceso
                </h3>
                <dl className="grid gap-y-3 text-sm">
                  <Field label="Último acceso" value={formatDateTime(detail.lastSignInAt)} />
                  <Field label="Miembro desde" value={formatDateTime(detail.createdAt)} />
                </dl>
              </section>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  const empty = value === null || value === undefined || value === "" || value === EMPTY_CELL;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-texto/50 mb-1">{label}</dt>
      <dd className={empty ? "text-texto/30 text-sm" : "text-sm font-medium text-texto"}>{empty ? EMPTY_CELL : value}</dd>
    </div>
  );
}
