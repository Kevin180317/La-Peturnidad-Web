# Backlog — Lucky Tracker Web

> Actualizado 2026-11-09. Sitio: https://luckytracker.com.mx (Astro 5 en Vercel). La app móvil tiene su propio backlog en `La-Peturnidad-Mobile/docs/BACKLOG.md`.

## Por revisar (decisiones pendientes)

Nada de esto está decidido: cada punto necesita una decisión del equipo antes de tocar el código o el texto.

### Páginas legales (`/policy`, `/terms`)
Los textos viven en `src/i18n/legal.ts` (es/en).

- [ ] **Cláusula de respaldos.** `/policy` sección 6 dice "No mantenemos copias de respaldo", pero el plan de la app propone un `supabase db dump` semanal. Decidir una de las dos y alinear la otra; si se hacen respaldos, la política debe decir cuánto tiempo se guardan y cuándo desaparecen los datos de una cuenta eliminada
- [ ] **Retención de notificaciones.** La política no dice cuánto tiempo se guardan los avisos de la bandeja. El borrado a 90 días (`pg_cron`) todavía no existe en la app; agregar la frase a la política solo cuando el job esté activo
- [ ] **Perfiles privados, solicitudes de seguimiento y usuarios sugeridos** (branch `feat-followers` de la app). La sección 4 "Qué ven otros usuarios" no los describe. Actualizarla (es y en) antes de que esa versión llegue a producción
- [ ] **Edad mínima, proveedores y región:** revisar la política si cambia alguno (18 años, Supabase `us-west-1`, Firebase Cloud Messaging, Resend, Expo)

### Correo y formulario de contacto
- [ ] **Destino del formulario.** `src/pages/api/send-email.ts` entrega a `prometheustij.dev@gmail.com` (constante `TO`), mientras que las páginas legales y el footer publican `contact@prometheustij.com`. Decidir si el formulario debe entregar al buzón publicado
- [ ] **Remitente.** El formulario envía desde `contact@luckytracker.com.mx` (alias que no recibe correo; las respuestas se van por `replyTo` al correo de quien escribió). El SMTP de Supabase de la app usa `assist@luckytracker.com.mx`. Confirmar que ambos remitentes estén permitidos en Resend
- [ ] **Cuota de Resend.** Resend cuenta los envíos por cuenta, así que los correos de acceso de la app (confirmación, OTP) y el formulario probablemente comparten cuota (plan gratuito: 100 al día, 3,000 al mes). Confirmar que las dos claves son de la misma cuenta. Una cuota agotada bloquearía registros y recuperación de contraseña
- [ ] **Confirmación al remitente (descartada).** Se probó mandar un correo de confirmación a quien escribe y se quitó para no gastar cuota. Retomarla solo si se sube el plan de Resend; el diseño usaba un segundo envío con solo el nombre del remitente, nunca el mensaje, para que el formulario no sirva para mandar texto a terceros

## Pruebas pendientes
- [ ] Probar el envío real del formulario de contacto en producción (necesita Turnstile y las variables `RESEND_API_KEY` y `TURNSTILE_SECRET_KEY` de Vercel; no se ha probado)
- [ ] Revisar las páginas `/en/*` completas: solo se verificó que respondan 200 y que tengan título en inglés
- [ ] Revisar con Google Search Console que el sitemap (17 URLs) y los canonicals nuevos se indexen

## Infra
- [ ] `robots.txt`: Cloudflare antepone sus propias reglas ("content signals") al archivo del repo; el `Disallow: /admin` y `/api/` del repo queda en el bloque de abajo. Si se quiere un solo bloque, hay que cambiarlo en Cloudflare
- [ ] Cloudflare "Email Address Obfuscation": hoy se evita con `<!--email_off-->` en `legal.ts` y `Footer.astro`. Cualquier correo nuevo en el sitio debe llevar el mismo marcador (o desactivar la opción en Cloudflare)

## Hecho el 2026-11-09 (commits `fa6d764` y `7af38e1`)
- Canonical y `og:url` con `site: 'https://luckytracker.com.mx'` (antes salían como `localhost:4321` en las páginas prerenderizadas), sin barra final
- Título y descripción propios en la home y en `/en` (antes "Home")
- Correo de contacto `contact@prometheustij.com` en texto plano en `/policy`, `/terms` y el footer
- `robots.txt` con `Disallow: /admin` y `/api/`; sitemap con `/en` sin barra final
- Borrada la página temporal `/shell-probe`; quitado un bloque comentado con `{t(...)}` y un import roto de `Awards.astro` en `/en`
