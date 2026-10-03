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

Crea un `.env` en la raíz con estas cuatro variables para desarrollo, y define
las mismas en los ajustes del proyecto de Vercel. `.env` está en `.gitignore`.

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
grep -ri "SUPABASE_SERVICE_ROLE" dist/client/ .vercel/output/static/   # sin resultados
grep -rEo "eyJ[A-Za-z0-9_-]{20,}" dist/client/ | sort -u               # sin resultados
```

La segunda búsqueda es la que importa: aunque el nombre de la variable no viaje,
una clave JWT sí lo haría.

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

### El resumen

`/admin` arranca con un resumen de la actividad, y las gráficas son SVG propio: no
hay librería de charts.

- Los KPIs se cuentan en el servidor y se hidratan con `client:load`, así que la
  primera pintura no espera a la red.
- La serie diaria viene de `GET /api/admin/trends?range=7|30|90`. Trae seis
  tablas a la vez (`user_profiles`, `pets`, `emergency_alerts`, `posts`,
  `comments`, `reports`) y solo pide `created_at`: el agrupado por día se hace en
  el cliente, no en SQL.
- Cambiar de rango solo recarga la serie; los KPIs no se vuelven a pedir.
- El aviso de «reportes pendientes» usa el recuento con `status = 'pending'`,
  que es distinto del total de la tabla `reports`.

Si añades una métrica al resumen, declárala en `src/lib/admin/dashboard.ts`:
ahí viven la etiqueta, el color y las clases de Tailwind en forma literal, para
que el compilador las vea.

### Tema claro y oscuro

Los tokens del panel están en `src/styles/admin.css`, que es una hoja aparte: el
sitio público sigue con sus colores de siempre.

- El tema se guarda en `localStorage` (`lt-admin-theme`) y, si no hay nada
  guardado, sigue a `prefers-color-scheme`.
- Un script en línea en el `<head>` aplica la clase `dark` antes de pintar, en
  `AdminShell.astro` y en el login. Sin eso habría un destello del tema claro al
  recargar.
- Las utilidades usan tokens semánticos (`bg-panel`, `text-texto`,
  `border-texto/10`), no colores literales. Un `bg-white` en el panel se ve
  glaring en modo oscuro: si añades superficie nueva, usa `bg-panel`.

### La barra lateral

`AdminShell.astro` monta un solo `#admin-sidebar` que se comporta de dos maneras
según el ancho, y un control los alterna:

- **Por debajo de `lg`** es un cajón superpuesto sobre el contenido, con fondo y
  bloqueo de scroll. El script solo conmuta atributos; la animación la lleva
  `transition-transform`.
- **Desde `lg`** es una columna fija que se pliega a un riel de iconos de `4.25rem`
  (frente a `17.5rem` desplegada). El ancho y el margen del contenido se animan
  con Motion.

La elección se recuerda en `localStorage` (`lt-admin-sidebar`) y un script en línea
en el `<head>` la aplica antes de pintar, así que recargar no da un salto de ancho.
Ese valor antigua marca `collapsed` se sigue leyendo como el riel.

Dos detalles que conviene no romper al tocarlo:

- **Las anchuras son variables de `:root`, no del `#admin-sidebar`.** El sidebar y
  `.admin-content` son hermanos, y una variable CSS solo se hereda hacia abajo:
  definidas en el sidebar, el margen del contenido no las vería y en modo riel
  caería a `0`.
- **Los `width` en línea son del riel y se borran al cruzar el breakpoint.** Si se
  dejan, el cajón móvil heredaría el ancho del riel y aparecería como una tira de
  `4.25rem`.

Con `prefers-reduced-motion` no hay animación: los valores se aplican de golpe y la
preferencia se guarda igualmente.

La dependencia es [`motion`](https://motion.dev), y solo para esto: se usa
`motion/mini` con `spring`, que pesa `5.86 KB` gzip compilado dentro del script del
shell. `motion/mini` no admite `type: "spring"` como cadena, hay que pasarle la
función generadora; internamente la muestrea a un `linear()` para WAAPI. Si algún
día hace falta animar algo más compuesto, el paquete completo está en el mismo
`node_modules`, pero pesa bastante más y no está justificado todavía.

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
parámetros, las rutas, el formato en español, la validación de la sesión, el
agrupado por día de las series (`admin-trend`), la geometría de las gráficas
(`admin-chart`) y los iconos de cada sección.

### Tipos

No hay script de typecheck, pero se puede comprobar sin instalar nada:

```sh
./node_modules/.bin/tsc --noEmit -p tsconfig.json
```

Fallan los `import ... from "bun:test"` porque `tsc` no conoce los tipos de Bun;
eso es esperado y no lo cubre `astro check` sin añadir `@astrojs/check`.
