# AndyCampers · Landing P70 ("Armá tu P70")

Landing de una sola página para el **P70 Acero 100%**: hero con la experiencia, **selector tipo videojuego** (4 equipamientos × 4 colores, el camper girando 360° sobre un pedestal), qué es el P70 (anatomía + ficha técnica en HTML), en acción, formulario de cotización con puntaje de leads, preguntas frecuentes y footer. Páginas extra: `/gracias` y `/privacidad`.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Framer Motion · Lenis · Zod. La landing es estática (SSG); los Route Handlers son el formulario (`/api/lead`) y el resumen semanal (`/api/cron/weekly-summary`). Deploy en Netlify, videos en un CDN externo.

```bash
npm install
cp .env.example .env.local   # todo es opcional en desarrollo
npm run dev                   # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Desarrollo, build de producción (corre antes el chequeo de pendientes) y servidor |
| `npm run pendientes` | Lista todos los carteles rojos con archivo y línea y escribe `docs/pendientes.md` para mandarle a Andrés |
| `npm run videos:demo` | Genera los 16 videos DEMO del selector (Three.js + Chrome + ffmpeg-static) |
| `npm run videos:check` | Controla los 16 videos contra las especificaciones de los renders |
| `npm run test:leads` | Manda un lead de cada categoría (y casos de error) al formulario |
| `npm run typecheck` | TypeScript sin emitir |

---

## 1. Datos que faltan (carteles rojos)

Nada se inventa. Todo dato que Andrés no confirmó aparece en el sitio como un **cartel rojo** (`⚠ FALTA: …`, fondo `#E00000`, borde punteado). Se carga como `falta("…")` y se completa reemplazando esa llamada por el dato real. Está todo centralizado en:

- **`config/p70.ts`**: los 4 equipamientos (nombre, nombre corto, descripción, qué incluye, stats), los 4 colores (nombre y hex), medidas, carga útil, personas, garantía, plazos, forma de pago.
- **`config/site.ts`**: dirección y horario del taller, Facebook, YouTube, logo SVG, razón social, financiación.
- **`content/faq.ts`**: respuestas de compra y entrega.

`npm run pendientes` arma la lista completa en `docs/pendientes.md`. Además faltan, fuera del código:
- Los **16 renders** del P70 girando (hoy se ven los DEMO, ver §2).
- **Clips** para el hero (ruta, off-road, nieve, playa, noche con estrellas, cocina) y para "En acción" (nieve, frenar en curva, estacionando, protecciones).
- Si Andrés quiere usar las barras de **stats**, sus valores por equipamiento.
- Si ofrece **financiación** (cambia el puntaje, ver §4).
- **Credenciales**: Google service account + ID de planilla, Resend, WhatsApp Cloud API, Turnstile, GA4, Meta Pixel y CDN de videos.

**Modo demo.** Mientras `NEXT_PUBLIC_DEMO` no sea `false`, arriba se ve el cartel rojo "DEMO" y el sitio pide a Google que no lo indexe. Con `NEXT_PUBLIC_DEMO=false`, si queda algún dato pendiente **el build falla** y dice cuáles.

---

## 2. Los 4 equipamientos y los 4 colores

Todo en `config/p70.ts`:

```ts
export const equipamientos: Equipamiento[] = [
  {
    n: 1,                                   // va en el nombre del video: p70-eq1-…
    nombre: "Esencial",                     // ← reemplaza falta("nombre del equipamiento 1")
    nombreCorto: "Esencial",                // pestañas en mobile (8–10 caracteres)
    descripcion: "Lo justo para salir este fin de semana",
    incluye: ["Toldo 270°", "Panel solar 150 W", "…"],
    stats: { autonomia: 40, confort: 55, offroad: 70 },   // o null para no mostrar barras
  },
  …
];

export const colores: ColorP70[] = [
  { id: "verde", nombre: "Verde", hex: "#4F8A5B", hexDemo: "#4f8a5b" },
  …
];
```

- **`id` del color**: minúsculas, sin espacios ni tildes. Es lo que va en el link compartido (`?eq=2&color=verde`) y en el nombre de los videos. Si cambiás los ids, renombrá los videos igual.
- **Stats**: se muestran solo si los 4 equipamientos tienen valores (0–100). Con `stats: null` no aparecen.
- **Precio**: `precioDesde` (único precio que se muestra, "Desde USD 16.500").
- **Combinación inicial** del selector: `inicial`.

---

## 3. Videos del selector (los 16 renders)

### Cómo funciona
Cada combinación tiene su video del camper girando 360° en loop. Al cambiar de opción, la web carga el nuevo en un segundo `<video>` oculto, lo lleva **a la misma fracción del giro** que el actual, espera el `seeked` y hace un fundido de 300 ms: el camper cambia de piel sin saltar de ángulo. Precarga en tiempo ocioso los "vecinos" (los otros colores del equipamiento actual y los otros equipamientos del color actual) y, con el mouse encima de una opción (o el dedo apoyado), esa misma. Con ahorro de datos o conexión lenta usa la versión mobile y no precarga. Con `prefers-reduced-motion` muestra el poster quieto y un botón de play.

Medido en esta máquina con los 16 demo: el ángulo se mantiene dentro de ±1 cuadro en los 15 cambios y el fundido arranca a los 20–40 ms con la opción precargada por hover, y a los 55–90 ms sin hover.

### Especificaciones para Andrés (renders finales)

| | |
|---|---|
| Cantidad | **16 videos**, uno por combinación (4 equipamientos × 4 colores) |
| Movimiento | **Un giro completo de 360°**, velocidad constante, **loop perfecto** (el último cuadro empalma con el primero: el cuadro siguiente al último sería el primero) |
| Duración | **La misma en los 16**, entre 8 y 12 s (los demo duran 10 s) |
| Cámara | **Misma cámara, encuadre, lente, iluminación y ángulo inicial** en los 16. Cámara fija, apenas elevada (unos 9°), el camper centrado |
| Encuadre | El contacto de las ruedas con el piso a la altura del **74 % del cuadro** (desde arriba). El camper, con lanza incluida y en su posición más ancha, ocupa como máximo el **62 % del ancho**. El 15 % superior queda libre |
| Fondo | **Liso, del color `#1C1F23`** (el grafito del sitio), sin degradés ni viñeta. Puede tener sombra de contacto. Con o sin piso: si trae piso o plataforma propia, poner `renderIncludesFloor: true` en `config/p70.ts` y la web oculta su pedestal |
| Exportación | **MP4 H.264** y **WebM VP9**, **30 fps**, **sin audio**. Desktop **1920×1080**; mobile **1280×720** (mismo encuadre). **Menos de 4 MB** cada archivo. Keyframe cada 15 cuadros si se puede (ayuda a sincronizar) |
| Poster | Un **JPG 1280×720** por combinación: el primer cuadro |
| Nombres | `p70-eq{número}-{color}.mp4` / `.webm` / `.jpg`. Ej.: `p70-eq1-verde.mp4`, `p70-eq3-gris.webm` (colores de ejemplo: usar los `id` de `config/p70.ts`) |

Estructura de carpetas (igual en `public/media/p70/` y en el CDN):

```
p70/
  desktop/  p70-eq1-c1.mp4  p70-eq1-c1.webm  …   (1920×1080)
  mobile/   p70-eq1-c1.mp4  p70-eq1-c1.webm  …   (1280×720)
  posters/  p70-eq1-c1.jpg  …                    (1280×720)
```

Si el encuadre final no respeta exactamente el 74 % / 62 %, se ajusta en `config/p70.ts → videoSelector.pisoY` y `pedestal` para que el pedestal de la web coincida con el piso del render.

### Reemplazar los demo por los reales
1. Pisar los archivos con los mismos nombres (si los colores ya tienen nombre, renombrar ids en `config/p70.ts` y archivos a la vez).
2. `npm run videos:check -- --dir=carpeta/de/los/renders` → tiene que dar "Todo en regla".
3. Subirlos al CDN (abajo) y poner `videoSelector.sonDemo = false` en `config/p70.ts` (saca el cartel "Videos demo").

Los demo se regeneran con `npm run videos:demo` (lee equipamientos, colores, fondo y duración de `config/p70.ts`; necesita Google Chrome instalado). Llevan una etiqueta roja "DEMO · Equipamiento N · Color X" y un camper genérico: no se pueden confundir con el producto.

### Hosting de los videos (CDN)
No conviene servirlos desde Netlify: con tráfico de Instagram se agota el ancho de banda del plan. `NEXT_PUBLIC_MEDIA_BASE_URL` apunta al CDN (sin barra final); vacía, se sirven desde `public/media` (solo desarrollo/demo).

**Cloudflare R2 (recomendado, sin costo de salida):**
1. Cloudflare → R2 → *Create bucket* `andycampers-media`.
2. *Settings → Public access → Custom domain* `media.andycampers.com.ar` (o el subdominio `r2.dev` para probar).
3. Subí la carpeta `p70/` completa (panel web, o `npx wrangler r2 object put andycampers-media/p70/desktop/p70-eq1-c1.mp4 --file=…`, o `rclone copy p70 r2:andycampers-media/p70`).
4. *Settings → CORS policy* (la web baja los videos con `fetch` para precargarlos):
   ```json
   [{ "AllowedOrigins": ["https://andycampers.com.ar"], "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 86400 }]
   ```
5. Cache: regla de caché de 1 año para `media.andycampers.com.ar/p70/*` (si se reemplaza un video, subirlo con otro nombre o purgar la caché).
6. `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.andycampers.com.ar` en Netlify y redeploy.

**Bunny CDN:** creá una *Storage Zone* + *Pull Zone*, subí `p70/` por el panel o FTP, activá *CORS* para `mp4,webm,jpg` y usá la URL de la Pull Zone (`https://andycampers.b-cdn.net`).

Sin CORS el selector funciona igual (usa la URL directa), pero sin precarga en memoria el cambio tarda más.

---

## 4. Formulario, puntaje y avisos

- Preguntas (textos de Andrés): `config/quote-questions.ts`. La primera es el "selector de dificultad" (¿Qué tan aventurero sos?).
- El equipamiento y el color del selector llegan **precargados** y viajan con el lead. Si la persona cambia el equipamiento en el formulario, el selector lo acompaña.
- **Puntajes y umbrales:** `config/lead-scoring.ts`. Se calculan **solo en el servidor** (`lib/scoring.ts`); el navegador nunca envía ni ve el puntaje.

| Pregunta | Puntos |
|---|---|
| Aventurero | Nivel 4 **10** · 3 **7** · 2 **4** · 1 **2** |
| Etapa de compra | Activo **30** · Comparando **20** · Proyectando **10** · Averiguando **0** |
| Inversión | Disponible **30** · Organizando **15** · Vende otro bien **15** · Financiación **10** · Sin definir **0** |
| Plazo | Próximamente **20** · 3 a 6 meses **15** · Este año **8** · Año que viene **4** · Sin fecha **0** |
| Equipamiento | Eq. 4 **5** · 3 **4** · 2 **3** · 1 **2** · Asesoramiento **2** |
| Vehículo | Marca, modelo y año completos **+5** |

- `FINANCING_OFFERED`: si Andrés confirma financiación, ponelo en `true` y "Necesitaría financiación" pasa a valer `financiacionSiSeOfrece` (20).
- Remolcar con **auto o SUV** no resta puntos: muestra una nota amable y el aviso a Andrés dice "⚠ remolca con auto/SUV".

| Puntaje | Categoría | Qué pasa |
|---|---|---|
| ≥ 70 | Caliente | Aviso inmediato por WhatsApp a Andrés (o email si WhatsApp está apagado/falla) + planilla |
| 40–69 | Tibio | Planilla + resumen semanal del lunes 9:00 |
| < 40 | Frío | Solo planilla |

Si la planilla falla se reintenta 3 veces; si igual falla, el lead completo queda en el log y se manda por email. **Nunca se pierde.** Antispam: honeypot + tiempo mínimo de llenado + Cloudflare Turnstile + límite de envíos por IP (en memoria por instancia: frena ráfagas, no es global).

`/gracias` muestra un mensaje según la categoría (nunca el puntaje), el poster de **su** P70 y el botón de WhatsApp precargado.

```bash
npm run dev            # en otra terminal:
npm run test:leads     # BASE_URL=http://localhost:3000 por defecto
```

---

## 5. Conectar los servicios

### Google Sheets
1. En [Google Cloud Console](https://console.cloud.google.com/) creá un proyecto y habilitá **Google Sheets API**.
2. *IAM → Cuentas de servicio → Crear*. En la cuenta: *Claves → Agregar clave → JSON*.
3. Del JSON: `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `private_key` → `GOOGLE_PRIVATE_KEY` (tal cual, con los `\n`).
4. Creá la planilla, compartila con ese email como **Editor** y copiá su ID (entre `/d/` y `/edit`) → `GOOGLE_SHEET_ID`.
5. La pestaña se llama `Leads` (o `GOOGLE_SHEET_TAB`). Los títulos se crean solos con el primer lead: fecha, contacto, puntaje, categoría, **equipamiento y color elegidos**, todas las respuestas, alerta de vehículo, origen, UTMs, página de entrada, ID y **Estado** (para el seguimiento de Andrés).

### Resend (email)
Cuenta en [resend.com](https://resend.com), verificá `andycampers.com.ar`, creá una API key → `RESEND_API_KEY`. Remitente → `RESEND_FROM`, destinatario(s) → `NOTIFY_EMAIL`.

### WhatsApp Business Cloud API
1. [Meta for Developers](https://developers.facebook.com/) → app tipo *Business* → producto **WhatsApp**.
2. Registrá un número emisor (no puede ser el WhatsApp que Andrés ya usa en la app). **Phone number ID** → `WA_PHONE_NUMBER_ID`.
3. Usuario del sistema en Business Manager con `whatsapp_business_messaging` y token permanente → `WA_ACCESS_TOKEN`.
4. Plantilla categoría **Utility**, Español (ARG), por ejemplo `lead_caliente` (el orden de las variables importa):
   ```
   🔥 Lead caliente: {{1}} ({{2}})
   Etapa: {{3}}
   Inversión: {{4}}
   Plazo: {{5}}
   Vehículo: {{6}}
   P70 elegido: {{7}}
   Responder: {{8}}
   ```
5. Aprobada: `WA_TEMPLATE_NAME=lead_caliente`, `WA_RECIPIENT=5493415641103`, `WHATSAPP_ENABLED=true`. Mientras tanto queda en `false` y los avisos van por email.

### Cloudflare Turnstile
Cloudflare → *Turnstile → Add site*. Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret → `TURNSTILE_SECRET_KEY`. Sin estas variables el formulario funciona igual (se loguea un aviso).

### Resumen semanal
`CRON_SECRET` (texto largo aleatorio). `netlify/functions/weekly-summary.mts` corre los **lunes 9:00 de Argentina** (12:00 UTC) y llama a `/api/cron/weekly-summary`, que manda por email los tibios de la semana ordenados por puntaje. Para probarlo:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://andycampers.com.ar/api/cron/weekly-summary
```

### Analítica (GA4 + Meta Pixel)
`NEXT_PUBLIC_GA4_ID` y `NEXT_PUBLIC_META_PIXEL_ID`. Se cargan después del load (no compiten con el LCP). Eventos, sin datos personales: `select_equipment`, `select_color`, `share_config`, `click_quiero_asi`, `start_quote`, `quote_step_n`, `submit_quote` (con categoría; en el Pixel va como `Lead`) y `click_whatsapp`.

---

## 6. SEO

- Una sola URL fuerte (`/`) con title, description, canonical, Open Graph (`public/og/camper-p70-og.jpg`), `sitemap.xml` y `robots.txt`.
- JSON-LD: `Organization`, `LocalBusiness` (dirección y horario se suman solos al completarlos), `Product` P70 con `Offer` de USD 16.500 como precio base, `FAQPage` (solo respuestas confirmadas) y `VideoObject` de los clips reales de "En acción" (no de los videos demo).
- Ficha técnica, equipamiento y preguntas en HTML, nunca dentro de imágenes.
- Después de publicar: validar `/` en la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) y subir el sitemap a Search Console.

---

## 7. Publicar (Netlify)

1. Conectá el repositorio; `netlify.toml` ya define el build (`NEXT_PUBLIC_SITE_URL=$URL npm run build`) y la función programada.
2. Cargá las variables de `.env.example` (*Site configuration → Environment variables*).
3. Subí los videos al CDN y definí `NEXT_PUBLIC_MEDIA_BASE_URL`.
4. Dominio: *Domain management → Add domain* `andycampers.com.ar`.
5. Para el lanzamiento real: `NEXT_PUBLIC_DEMO=false` (con todos los datos completos, si no el build falla).

---

## 8. Estructura

```
app/                 page.tsx (la landing), gracias/, privacidad/, api/lead, api/cron/weekly-summary
components/          hero/, selector/ (Selector, Stage, Pedestal), p70/ (anatomía, ficha),
                     accion/, cotizar/ (puente, formulario, gracias), faq/, layout/, ui/, providers/
config/              p70.ts (producto), site.ts (negocio), lead-scoring.ts, quote-questions.ts
content/             media.ts (fotos y clips reales), faq.ts, media/ (fotos optimizadas)
lib/                 video-switcher.ts (motor A/B), selection.ts, jsonld, analytics, scoring, server/
public/media/p70/    los 16 videos DEMO + posters (en producción, en el CDN)
scripts/             generate-placeholder-videos, check-videos, pendientes, test-leads
netlify/functions/   resumen semanal
```

Movimiento y accesibilidad: solo se anima `transform` y `opacity`; en mobile baja la intensidad; con `prefers-reduced-motion` todo queda en su estado final (sin parallax, sin escena fija, sin smooth scroll, video quieto con botón de play). El selector y el formulario se usan con teclado (← → equipamiento, ↑ ↓ color; letras A, B, C… eligen opciones del formulario) y lector de pantalla (`radiogroup`). Lenis se desactiva en pantallas táctiles.
