import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ColumnSpec, FilterSpec } from "../../lib/admin/sections";
import {
  EMPTY_CELL,
  formatBadge,
  formatEmbedded,
  formatUserRef,
  renderCell,
} from "../../lib/admin/format";
import { formatCount } from "../../lib/admin/chart";
import UserDetailModal from "./UserDetailModal";
import { IconExclamation, IconInbox, IconSpinner } from "./Icons";

interface ListResponse {
  rows: Record<string, unknown>[];
  count: number;
  page: number;
  pageCount: number;
}

interface Props {
  endpoint: string;
  columns: ColumnSpec[];
  searchable: boolean;
  defaultOrder: string;
  orderOptions?: { value: string; label: string }[];
  filters?: FilterSpec[];
  detailEndpoint?: (row: Record<string, unknown>) => string;
}

const PER_PAGE_OPTIONS = [25, 50, 100];
const DEFAULT_PER_PAGE = 25;
const SEARCH_DEBOUNCE_MS = 300;
/** Page pills stay hidden past this, where they stop being a shortcut. */
const MAX_PAGE_PILLS = 7;

function readInitialState() {
  if (typeof window === "undefined") {
    return { q: "", page: 1, perPage: DEFAULT_PER_PAGE, order: "", dir: "desc" as const };
  }
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const perPage = Number.parseInt(params.get("per_page") ?? "", 10);
  const dir = params.get("dir") === "asc" ? ("asc" as const) : ("desc" as const);
  return {
    q: params.get("q") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE,
    order: params.get("order") ?? "",
    dir,
  };
}

export default function DataTable({
  endpoint,
  columns,
  searchable,
  defaultOrder,
  orderOptions,
  filters = [],
  detailEndpoint,
}: Props) {
  const initial = useMemo(readInitialState, []);
  const [searchInput, setSearchInput] = useState(initial.q);
  const [term, setTerm] = useState(initial.q);
  const [page, setPage] = useState(initial.page);
  const [perPage, setPerPage] = useState(initial.perPage);
  const [dir, setDir] = useState<"asc" | "desc">(initial.dir);

  // The sort is driven by the column headers, so the only orders that can be
  // requested are the ones a section declared. A crafted ?order= is dropped
  // here and never reaches the request.
  const allowedOrders = useMemo(
    () => [defaultOrder, ...(orderOptions ?? []).map((option) => option.value)],
    [defaultOrder, orderOptions]
  );
  const [order, setOrder] = useState(() =>
    allowedOrders.includes(initial.order) ? initial.order : defaultOrder
  );

  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null);

  // Seed the filter selects from the URL so deep links such as
  // /admin/reportes?status=pending work.
  //
  // This runs once only. It cannot simply depend on `filters`, because the
  // default `filters = []` is a fresh array on every render, and calling
  // setFilterValues with a new object would re-render and re-trigger the effect
  // forever on any section that has no filters.
  const seededFromUrl = useRef(false);
  useEffect(() => {
    if (seededFromUrl.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const seeded: Record<string, string> = {};
    for (const filter of filters) {
      const value = params.get(filter.param);
      if (value) seeded[filter.param] = value;
    }
    seededFromUrl.current = true;
    setFilterValues(seeded);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTerm(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    for (const filter of filters) {
      const value = filterValues[filter.param];
      if (value) params.set(filter.param, value);
    }
    if (order !== defaultOrder) params.set("order", order);
    if (dir === "desc") params.set("dir", "desc");
    if (page > 1) params.set("page", String(page));
    if (perPage !== DEFAULT_PER_PAGE) params.set("per_page", String(perPage));
    return params.toString();
  }, [term, filters, filterValues, order, defaultOrder, dir, page, perPage]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const response = await fetch(url, { credentials: "same-origin" });
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData((await response.json()) as ListResponse);
    } catch {
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }, [endpoint, queryString]);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep the address bar in step so a refresh or a shared link keeps state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, [queryString]);

  const pageCount = data?.pageCount ?? 1;
  const rows = data?.rows ?? [];

  function toggleSort(columnKey: string) {
    if (order === columnKey) {
      setDir((current) => (current === "desc" ? "asc" : "desc"));
    } else {
      setOrder(columnKey);
      // Text sorts read better ascending, everything else newest-first.
      setDir("desc");
    }
    setPage(1);
  }

  const dirty =
    Boolean(searchInput) ||
    Object.values(filterValues).some(Boolean) ||
    order !== defaultOrder;

  return (
    <div className="space-y-4">
      <div className="sticky top-[4.25rem] z-20 space-y-4 rounded-2xl border border-texto/5 bg-panel/95 p-4 backdrop-blur sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-texto">Filtros y búsqueda</h3>
          {dirty ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setFilterValues({});
                setOrder(defaultOrder);
                setPage(1);
              }}
              className="text-xs font-medium text-principal transition-colors hover:text-principal/70"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {searchable ? (
            <div>
              <label
                htmlFor="admin-search"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-texto/60"
              >
                Buscar
              </label>
              <input
                id="admin-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Escribe para filtrar…"
                className="w-full rounded-xl border border-texto/15 bg-panel px-3 py-2.5 text-sm text-texto outline-none transition-all placeholder:text-texto/40 focus:border-principal focus:ring-2 focus:ring-principal/20"
              />
            </div>
          ) : null}

          {filters.map((filter) => (
            <div key={filter.param}>
              <label
                htmlFor={`filter-${filter.param}`}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-texto/60"
              >
                {filter.label}
              </label>
              <select
                id={`filter-${filter.param}`}
                value={filterValues[filter.param] ?? ""}
                onChange={(event) => {
                  setFilterValues((current) => ({ ...current, [filter.param]: event.target.value }));
                  setPage(1);
                }}
                className="select-chevron w-full rounded-xl border border-texto/15 bg-panel px-3 py-2.5 text-sm text-texto outline-none transition-all focus:border-principal focus:ring-2 focus:ring-principal/20"
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div>
            <label
              htmlFor="admin-per-page-top"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-texto/60"
            >
              Por página
            </label>
            <select
              id="admin-per-page-top"
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="select-chevron w-full rounded-xl border border-texto/15 bg-panel px-3 py-2.5 text-sm text-texto outline-none transition-all focus:border-principal focus:ring-2 focus:ring-principal/20"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <IconExclamation className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-texto/5 bg-panel">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-fondo/95 backdrop-blur">
              <tr className="border-b border-texto/10">
                {columns.map((column) => {
                  const sortable = allowedOrders.includes(column.key);
                  const active = order === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        active ? (dir === "asc" ? "ascending" : "descending") : undefined
                      }
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-texto/60"
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className={`group inline-flex items-center gap-1.5 transition-colors hover:text-texto ${
                            active ? "text-texto" : ""
                          }`}
                        >
                          {column.label}
                          <span
                            className={`transition-opacity ${
                              active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                            }`}
                            aria-hidden="true"
                          >
                            {dir === "asc" ? "▲" : "▼"}
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading && rows.length === 0 ? (
                <SkeletonRows columns={columns.length} rows={8} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-texto/40">
                      <IconInbox className="h-9 w-9" />
                      <p className="text-sm font-medium text-texto/60">Sin resultados</p>
                      <p className="max-w-xs text-xs">
                        {dirty
                          ? "Prueba con otro término o quita los filtros."
                          : "Todavía no hay registros en esta sección."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={String(row.id ?? index)}
                    className={`border-b border-texto/5 last:border-0 transition-colors ${
                      detailEndpoint ? "cursor-pointer hover:bg-fondo/40" : ""
                    } ${loading ? "opacity-50" : ""}`}
                    onClick={() => {
                      if (detailEndpoint) setDetailRow(row);
                    }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-5 py-3 align-middle tabular-nums text-texto"
                      >
                        {renderCellValue(column, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-texto/5 bg-panel p-4 text-sm text-texto/60 sm:flex-row">
        <p>
          {data ? `${formatCount(data.count)} registros` : "—"}
          {data && data.count > 0 ? ` · página ${data.page} de ${pageCount}` : ""}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-xl border border-texto/15 px-3 py-1.5 font-medium transition-colors hover:bg-texto/5 disabled:pointer-events-none disabled:opacity-40"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {pageCount <= MAX_PAGE_PILLS ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  aria-current={value === page ? "page" : undefined}
                  className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold tabular-nums transition-colors ${
                    value === page
                      ? "bg-principal/15 text-principal"
                      : "text-texto/60 hover:bg-texto/5 hover:text-texto"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : (
            <span className="px-2 text-xs font-medium tabular-nums">
              {data ? `${data.page} / ${pageCount}` : "—"}
            </span>
          )}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={page >= pageCount}
            className="inline-flex items-center gap-1 rounded-xl border border-texto/15 px-3 py-1.5 font-medium transition-colors hover:bg-texto/5 disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {loading && rows.length > 0 ? (
        <p className="flex items-center justify-center gap-2 text-xs text-texto/40">
          <IconSpinner className="h-3.5 w-3.5" />
          Actualizando…
        </p>
      ) : null}

      {detailRow && detailEndpoint ? (
        <UserDetailModal
          endpoint={detailEndpoint(detailRow)}
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * Placeholder rows for the first load.
 *
 * Dimming the previous results while refetching is fine, but on the very first
 * load there is nothing to dim and the table just looked empty.
 */
function SkeletonRows({ columns, rows }: { columns: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-texto/5 last:border-0">
          {Array.from({ length: columns }, (_, cellIndex) => (
            <td key={cellIndex} className="px-5 py-3">
              <div
                className="h-3.5 animate-pulse rounded bg-texto/5"
                style={{
                  width: `${45 + ((rowIndex * 7 + cellIndex * 13) % 45)}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function renderCellValue(column: ColumnSpec, row: Record<string, unknown>) {
  if (column.kind === "badge") {
    const badge = formatBadge(row[column.key], column.values, column.tones);
    return (
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${badge.classes}`}
      >
        {badge.label}
      </span>
    );
  }

  if (column.kind === "user") {
    const value = row[column.key];
    if (typeof value !== "string" || !value) return <Dash />;
    return (
      <a
        href={`/admin/usuarios?q=${encodeURIComponent(value)}`}
        onClick={(event) => event.stopPropagation()}
        className="font-mono text-xs text-secundario underline underline-offset-2 hover:opacity-80"
        title="Buscar esta persona en Usuarios"
      >
        {formatUserRef(value)}
      </a>
    );
  }

  if (column.kind === "image") {
    const value = row[column.key];
    if (typeof value !== "string" || !value) return <Dash />;
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="" className="h-10 w-10 rounded-lg object-cover" />
      </a>
    );
  }

  if (column.key === "pets") {
    const text = formatEmbedded(row.pets, "name");
    return text === EMPTY_CELL ? <Dash /> : text;
  }

  const text = renderCell(column, row);
  return text === EMPTY_CELL ? <Dash /> : text;
}

function Dash() {
  return <span className="text-texto/25">{EMPTY_CELL}</span>;
}