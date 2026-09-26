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
import UserDetailModal from "./UserDetailModal";

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

function readInitialState() {
  if (typeof window === "undefined") {
    return { q: "", page: 1, perPage: DEFAULT_PER_PAGE };
  }
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const perPage = Number.parseInt(params.get("per_page") ?? "", 10);
  return {
    q: params.get("q") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE,
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
  const [order, setOrder] = useState(defaultOrder);
  const [dir, setDir] = useState<"asc" | "desc">("desc");
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
    const next = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, [queryString]);

  const pageCount = data?.pageCount ?? 1;
  const rows = data?.rows ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {searchable ? (
          <div className="min-w-56 flex-1">
            <label htmlFor="admin-search" className="mb-1 block text-xs font-medium text-texto/60">
              Buscar
            </label>
            <input
              id="admin-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Escribe para filtrar…"
              className="w-full rounded-xl border border-texto/15 bg-white px-3 py-2 text-sm text-texto outline-none focus:border-secundario"
            />
          </div>
        ) : null}

        {filters.map((filter) => (
          <div key={filter.param}>
            <label
              htmlFor={`filter-${filter.param}`}
              className="mb-1 block text-xs font-medium text-texto/60"
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
              className="rounded-xl border border-texto/15 bg-white px-3 py-2 text-sm text-texto outline-none focus:border-secundario"
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

        {orderOptions ? (
          <div>
            <label htmlFor="admin-order" className="mb-1 block text-xs font-medium text-texto/60">
              Ordenar por
            </label>
            <select
              id="admin-order"
              value={order}
              onChange={(event) => {
                setOrder(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-texto/15 bg-white px-3 py-2 text-sm text-texto outline-none focus:border-secundario"
            >
              {orderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label htmlFor="admin-dir" className="mb-1 block text-xs font-medium text-texto/60">
            Dirección
          </label>
          <select
            id="admin-dir"
            value={dir}
            onChange={(event) => {
              setDir(event.target.value as "asc" | "desc");
              setPage(1);
            }}
            className="rounded-xl border border-texto/15 bg-white px-3 py-2 text-sm text-texto outline-none focus:border-secundario"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-texto/10 text-xs uppercase tracking-wide text-texto/50">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : undefined}>
            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-texto/50"
                >
                  Sin resultados.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={String(row.id ?? index)}
                  className={`border-b border-texto/5 last:border-0 ${
                    detailEndpoint ? "cursor-pointer hover:bg-fondo/60" : ""
                  }`}
                  onClick={() => {
                    if (detailEndpoint) setDetailRow(row);
                  }}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top text-texto">
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto/60">
        <p>
          {data ? `${data.count.toLocaleString("es-MX")} registros` : "—"}
          {data && data.count > 0 ? ` · página ${data.page} de ${pageCount}` : ""}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-per-page" className="text-xs">
            Por página
          </label>
          <select
            id="admin-per-page"
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-texto/15 bg-white px-2 py-1 text-sm"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-texto/15 px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={page >= pageCount}
            className="rounded-lg border border-texto/15 px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>

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

function renderCellValue(column: ColumnSpec, row: Record<string, unknown>) {
  if (column.kind === "badge") {
    const badge = formatBadge(row[column.key], column.values, column.tones);
    return (
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${badge.classes}`}>
        {badge.label}
      </span>
    );
  }

  if (column.kind === "user") {
    const value = row[column.key];
    if (typeof value !== "string" || !value) return EMPTY_CELL;
    return (
      <a
        href={`/admin/usuarios?q=${encodeURIComponent(value)}`}
        onClick={(event) => event.stopPropagation()}
        className="font-mono text-xs text-secundario underline underline-offset-2"
        title="Buscar esta persona en Usuarios"
      >
        {formatUserRef(value)}
      </a>
    );
  }

  if (column.kind === "image") {
    const value = row[column.key];
    if (typeof value !== "string" || !value) return EMPTY_CELL;
    return (
      <a href={value} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="" className="h-10 w-10 rounded-lg object-cover" />
      </a>
    );
  }

  if (column.key === "pets") {
    return formatEmbedded(row.pets, "name");
  }

  const text = renderCell(column, row);
  if (text === EMPTY_CELL) return <span className="text-texto/30">{EMPTY_CELL}</span>;
  return text;
}
