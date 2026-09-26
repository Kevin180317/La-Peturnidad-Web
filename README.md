# Lucky Tracker — Web

Sitio público y panel interno de Lucky Tracker, construido con Astro 5 y
desplegado en Vercel.

## Comandos

| Comando           | Acción                                             |
| :---------------- | :------------------------------------------------- |
| `bun install`     | Instala dependencias                                |
| `bun dev`         | Servidor de desarrollo en `localhost:4321`          |
| `bun build`       | Build de producción (salida en `dist/`)             |
| `bun preview`     | Sirve el build de producción                        |
| `bun test`        | Corre la suite de tests                             |

No hay script de `lint` ni de `typecheck`. La verificación disponible es
`bun test` más `bun build`.

## Estructura

```text
src/
├── components/
│   └── admin/          # Islands React del panel
├── layouts/            # Layout del sitio público
├── lib/
│   ├── admin/          # Auth, consultas y params del panel
│   └── supabase/       # Clientes Supabase (servidor y navegador)
├── middleware.ts       # Puerta de acceso de /admin
└── pages/
    ├── admin/          # Panel privado
    └── api/admin/      # Endpoints de solo lectura
```

## Panel interno `/admin`

Dashboard privado para consultar los datos de la app móvil. Es de **solo
lectura**: no hay acciones de escritura, ni consola SQL, ni moderación desde
ahí. Los mensajes privados de los usuarios quedan fuera a propósito.

Apunta al mismo proyecto de Supabase que la app móvil
(`owtcrciujfdlcuopimof`), usando la service rolekey solo en el servidor.

### Variables de entorno

Copia `.env.example` a `.env` para desarrollo y define las mismas claves en los
ajustes del proyecto de Vercel.

| Variable                     | Lado         | Para qué sirve                          |
| :--------------------------- | :----------- | :-------------------------------------- |
| `PUBLIC_SUPABASE_URL`        | cliente      | Iniciar sesión de admins                |
| `PUBLIC_SUPABASE_ANON_KEY`   | cliente      | Iniciar sesión de admins                |
| `SUPABASE_URL`               | servidor     | Consultar datos con service role        |
| `SUPABASE_SERVICE_ROLE_KEY`  | servidor     | Consultar datos con service role        |

La service role key salta las políticas RLS, así que **nunca** debe llegar al
navegador. Astro solo expone al bundle las variables `PUBLIC_*`, y la clave de
servidor se lee en el backend. Para comprobarlo tras un build:

```sh
bun run build
grep -ri "SUPABASE_SERVICE_ROLE" .vercel/output/static/   # sin resultados
```

### Dar acceso a una cuenta

El panel solo admite cuentas con rol `admin` o `moderator` en
`user_profiles.role`. Para promover a alguien:

```sql
update user_profiles
set role = 'admin'
where user_id = '<auth.users.id>';
```

El `user_id` debe ser el id de `auth.users`, no el `id` de la fila de
`user_profiles`.

### Cómo se protege

- `src/middleware.ts` bloquea `/admin/*` y `/api/admin/*`. Sin sesión válida,
  las páginas redirigen al login y las APIs responden 401.
- Cada endpoint vuelve a llamar `requireAdmin()`. La duplicación es
  deliberada: con la service role key en juego, esa comprobación es lo único
  que separa los datos personales de los usuarios.
- La sesión vive en cookies `httpOnly` (`lt_admin_at`, `lt_admin_rt`), así que
  el cliente no puede leerlas y el login exige una navegación completa.
- El rol se consulta por `user_id` con el cliente de service role. La función
  `is_moderator_or_admin()` no sirve aquí: con service role, `auth.uid()` es
  siempre `null` y le negaría el acceso a todo el mundo.
- Las tablas y columnas visibles están en una lista blanca
  (`src/lib/admin/tables.ts`); no se acepta SQL del cliente.
- El login tiene límite de intentos por IP más email, por encima de los límites
  de Supabase.

### Cosas que conviene saber de los datos

- **Alertas de pérdida** es un acumulado histórico. La app borra el registro
  cuando la mascota aparece, así que el número no son emergencias abiertas.
- **Historias** solo cuenta las reuniones que los usuarios publican a mano, así
  que queda por debajo de las reuniones reales.
- Los correos no están en `user_profiles`: se combinan con `auth.users` y se
  cachean en memoria por proceso (`src/lib/admin/emails.ts`).
- `user_profiles` tiene hoy un `SELECT true` en RLS, lo que expone datos
  personales a cualquiera que use la anon key. Es un problema anterior a este
  panel y conviene cerrarlo por separado.

### Añadir una tabla o una sección

1. Añade la tabla y su proyección explícita a `src/lib/admin/tables.ts`.
2. Añade la sección, sus columnas y sus filtros a `src/lib/admin/sections.ts`.
3. Si necesita una consulta a medida, añade un endpoint bajo `src/pages/api/admin/`
   empezando por `requireAdmin()`.

## Tests

```sh
bun test
```

Cubren la puerta de acceso (`admin-gate`), el armado de consultas y
parámetros, las rutas, el formato en español y la validación de la sesión.
