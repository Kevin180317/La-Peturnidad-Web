/**
 * Navigation and column layout for the admin panel.
 *
 * /admin is Spanish only, so section slugs are Spanish while the endpoints
 * behind them keep the database's English table names. Everything a table view
 * needs to render is declared here, which is what lets a single page component
 * and a single DataTable serve all twelve sections.
 */

export type ColumnKind =
  | "text"
  | "truncate"
  | "date"
  | "datetime"
  | "badge"
  | "bool"
  | "image"
  | "user"
  | "joined";

export interface ColumnSpec {
  key: string;
  label: string;
  kind?: ColumnKind;
  /** Raw value -> displayed label, for badge columns. */
  values?: Record<string, string>;
  /** Raw value -> tailwind classes, for badge columns. */
  tones?: Record<string, string>;
  /** Overrides the sort param; defaults to the column key. */
  sortKey?: string;
}

export interface FilterSpec {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SectionSpec {
  slug: string;
  title: string;
  description: string;
  group: string;
  endpoint: string;
  columns: ColumnSpec[];
  /** Whether to render the search box. */
  searchable: boolean;
  defaultOrder: string;
  orderOptions?: { value: string; label: string }[];
  filters?: FilterSpec[];
  /** Set for the users section, which opens a detail modal. */
  detail?: { endpoint: (row: Record<string, unknown>) => string };
}

export const ADMIN_GROUPS = [
  "Resumen",
  "Personas",
  "Emergencias",
  "Comunidad",
  "Moderación",
] as const;

const PET_TYPE = {
  values: { perro: "Perro", gato: "Gato" },
  tones: {
    perro: "bg-principal/15 text-texto",
    gato: "bg-secundario/15 text-secundario",
  },
};

const ROLE = {
  values: { admin: "Admin", moderator: "Moderador", user: "Usuario" },
  tones: {
    admin: "bg-principal/20 text-texto font-semibold",
    moderator: "bg-secundario/15 text-secundario font-semibold",
    user: "bg-texto/5 text-texto/60",
  },
};

const REPORT_STATUS = {
  values: { pending: "Pendiente", reviewed: "Revisado", dismissed: "Descartado" },
  tones: {
    pending: "bg-principal/20 text-texto font-semibold",
    reviewed: "bg-secundario/15 text-secundario",
    dismissed: "bg-texto/5 text-texto/60",
  },
};

const CATEGORY = {
  values: {
    aviso: "Aviso",
    evento: "Evento",
    pregunta: "Pregunta",
    general: "General",
  },
  tones: { general: "bg-texto/5 text-texto/70" },
};

export const ADMIN_SECTIONS: SectionSpec[] = [
  {
    slug: "usuarios",
    title: "Usuarios",
    description:
      "Cuentas registradas. El correo viene de auth.users y se une por user_id.",
    group: "Personas",
    endpoint: "/api/admin/users",
    searchable: true,
    defaultOrder: "created_at",
    columns: [
      { key: "first_name", label: "Nombre" },
      { key: "last_name", label: "Apellido" },
      { key: "email", label: "Correo" },
      { key: "phone", label: "Teléfono" },
      { key: "city", label: "Ciudad" },
      { key: "role", label: "Rol", kind: "badge", ...ROLE },
      { key: "email_confirmed", label: "Verificado", kind: "bool" },
      { key: "last_sign_in_at", label: "Último acceso", kind: "datetime" },
      { key: "created_at", label: "Registro", kind: "date" },
    ],
    filters: [
      {
        param: "role",
        label: "Rol",
        options: [
          { value: "admin", label: "Admin" },
          { value: "moderator", label: "Moderador" },
          { value: "user", label: "Usuario" },
        ],
      },
    ],
    detail: { endpoint: (row) => `/api/admin/users/${String(row.user_id)}` },
  },
  {
    slug: "mascotas",
    title: "Mascotas",
    description: "Mascotas registradas por los usuarios.",
    group: "Personas",
    endpoint: "/api/admin/pets",
    searchable: true,
    defaultOrder: "created_at",
    columns: [
      { key: "name", label: "Nombre" },
      { key: "type", label: "Tipo", kind: "badge", ...PET_TYPE },
      { key: "size", label: "Tamaño" },
      { key: "color", label: "Color" },
      { key: "features", label: "Rasgos", kind: "truncate" },
      { key: "user_id", label: "Dueño", kind: "user" },
      { key: "created_at", label: "Alta", kind: "date" },
    ],
    filters: [
      {
        param: "type",
        label: "Tipo",
        options: [
          { value: "perro", label: "Perro" },
          { value: "gato", label: "Gato" },
        ],
      },
    ],
  },
  {
    slug: "alertas",
    title: "Alertas de pérdida",
    description:
      "Avisos de mascotas perdidas. La app borra la fila cuando la mascota aparece, así que este listado es histórico, no de emergencias activas.",
    group: "Emergencias",
    endpoint: "/api/admin/emergency_alerts",
    searchable: true,
    defaultOrder: "created_at",
    orderOptions: [
      { value: "created_at", label: "Fecha" },
      { value: "pet_name", label: "Mascota" },
      { value: "type", label: "Tipo" },
    ],
    columns: [
      { key: "pet_name", label: "Mascota" },
      { key: "type", label: "Tipo", kind: "badge", ...PET_TYPE },
      { key: "last_seen_location", label: "Última ubicación" },
      { key: "disappearance_date", label: "Fecha", kind: "date" },
      { key: "description", label: "Descripción", kind: "truncate" },
      { key: "user_id", label: "Reporta", kind: "user" },
      { key: "created_at", label: "Alta", kind: "date" },
    ],
    filters: [
      {
        param: "type",
        label: "Tipo",
        options: [
          { value: "perro", label: "Perro" },
          { value: "gato", label: "Gato" },
        ],
      },
    ],
  },
  {
    slug: "encontradas",
    title: "Mascotas encontradas",
    description:
      "Reportes de 'la encontré'. RLS no permite verlos entre usuarios, así que esta vista solo existe gracias al acceso con service_role.",
    group: "Emergencias",
    endpoint: "/api/admin/found_pets",
    searchable: false,
    defaultOrder: "created_at",
    columns: [
      { key: "pets", label: "Mascota" },
      { key: "user_id", label: "Quien reportó", kind: "user" },
      { key: "created_at", label: "Fecha", kind: "date" },
    ],
  },
  {
    slug: "publicaciones",
    title: "Publicaciones",
    description: "Posts del feed comunitario.",
    group: "Comunidad",
    endpoint: "/api/admin/posts",
    searchable: true,
    defaultOrder: "created_at",
    columns: [
      { key: "content", label: "Contenido", kind: "truncate" },
      { key: "user_id", label: "Autor", kind: "user" },
      { key: "created_at", label: "Publicado", kind: "datetime" },
    ],
  },
  {
    slug: "grupos",
    title: "Grupos",
    description: "Grupos de la comunidad.",
    group: "Comunidad",
    endpoint: "/api/admin/groups",
    searchable: true,
    defaultOrder: "created_at",
    columns: [
      { key: "name", label: "Nombre" },
      { key: "description", label: "Descripción", kind: "truncate" },
      { key: "created_by", label: "Creado por", kind: "user" },
      { key: "created_at", label: "Alta", kind: "date" },
    ],
  },
  {
    slug: "avisos",
    title: "Avisos",
    description: "Muro de avisos de la comunidad.",
    group: "Comunidad",
    endpoint: "/api/admin/announcements",
    searchable: true,
    defaultOrder: "created_at",
    orderOptions: [
      { value: "created_at", label: "Fecha" },
      { value: "title", label: "Título" },
      { value: "category", label: "Categoría" },
    ],
    columns: [
      { key: "title", label: "Título" },
      { key: "category", label: "Categoría", kind: "badge", ...CATEGORY },
      { key: "content", label: "Contenido", kind: "truncate" },
      { key: "user_id", label: "Autor", kind: "user" },
      { key: "created_at", label: "Publicado", kind: "datetime" },
    ],
    filters: [
      {
        param: "category",
        label: "Categoría",
        options: [
          { value: "aviso", label: "Aviso" },
          { value: "evento", label: "Evento" },
          { value: "pregunta", label: "Pregunta" },
          { value: "general", label: "General" },
        ],
      },
    ],
  },
  {
    slug: "historias",
    title: "Historias de éxito",
    description:
      "Reuniones publicadas a mano por los usuarios, así que el total va por debajo de las reuniones reales.",
    group: "Comunidad",
    endpoint: "/api/admin/success_stories",
    searchable: true,
    defaultOrder: "created_at",
    columns: [
      { key: "pet_name", label: "Mascota" },
      { key: "story", label: "Historia", kind: "truncate" },
      { key: "user_id", label: "Autor", kind: "user" },
      { key: "created_at", label: "Publicada", kind: "date" },
    ],
  },
  {
    slug: "reportes",
    title: "Reportes",
    description: "Denuncias de usuarios. Coincide con lo que moderan en la app.",
    group: "Moderación",
    endpoint: "/api/admin/reports",
    searchable: true,
    defaultOrder: "created_at",
    orderOptions: [
      { value: "created_at", label: "Fecha" },
      { value: "status", label: "Estado" },
    ],
    columns: [
      { key: "reason", label: "Motivo", kind: "truncate" },
      { key: "status", label: "Estado", kind: "badge", ...REPORT_STATUS },
      { key: "reporter_id", label: "Reporta", kind: "user" },
      { key: "target_user_id", label: "Reportado", kind: "user" },
      { key: "reviewed_by", label: "Revisó", kind: "user" },
      { key: "created_at", label: "Creado", kind: "datetime" },
    ],
    filters: [
      {
        param: "status",
        label: "Estado",
        options: [
          { value: "pending", label: "Pendiente" },
          { value: "reviewed", label: "Revisado" },
          { value: "dismissed", label: "Descartado" },
        ],
      },
    ],
  },
  {
    slug: "bloqueos",
    title: "Bloqueos",
    description:
      "Quién bloqueó a quién. La app solo muestra los bloqueos del propio moderador, así que esta vista es nueva.",
    group: "Moderación",
    endpoint: "/api/admin/blocks",
    searchable: false,
    defaultOrder: "created_at",
    columns: [
      { key: "blocker_id", label: "Bloquea", kind: "user" },
      { key: "blocked_id", label: "Bloqueado", kind: "user" },
      { key: "created_at", label: "Fecha", kind: "date" },
    ],
  },
];

export const SECTION_BY_SLUG: Record<string, SectionSpec> = Object.fromEntries(
  ADMIN_SECTIONS.map((section) => [section.slug, section])
);

export function getSection(slug: string | undefined): SectionSpec | null {
  if (!slug) return null;
  return Object.prototype.hasOwnProperty.call(SECTION_BY_SLUG, slug)
    ? SECTION_BY_SLUG[slug]
    : null;
}
