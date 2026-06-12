# Enriquecedor de miniaturas — Banco de Referencias

`enrich-thumbnails.mjs` toma tu CSV de referencias, resuelve la **miniatura real** de cada
`link`, la **sube a Supabase Storage** (bucket público) y escribe la **URL permanente** en la
columna `thumb`. La app ya prioriza `thumb`, así que tras correrlo solo reimportas el CSV.

| Plataforma | Fuente de la miniatura | Key |
|---|---|---|
| TikTok | oEmbed oficial (`thumbnail_url`) | — |
| YouTube | `i.ytimg.com/vi/<id>/maxres` (cae a `hqdefault`) | — |
| Vimeo | Vimeo oEmbed | — |
| Instagram | Meta oEmbed (si hay `META_TOKEN`) → si no/falla, `og:image` del `/embed/` público | opcional |
| Otros / falla | (sin thumb → la app muestra el ícono) | — |

Idempotente: si la imagen ya está en el bucket, reusa su URL (puedes re-correrlo sin re-subir).

---

## 1. Requisitos
- **Node 18+** (usa `fetch` nativo; no instala dependencias).
- La **service_role key** de Supabase (Dashboard → Project Settings → API → `service_role`). **Es secreta**; va por variable de entorno, nunca en el código.

## 2. (Opcional pero recomendado) Token de Meta para Instagram
Sin token, IG usa el scrape público (funciona en muchos posts; algunos caen al ícono).
Con token de Meta, IG usa el oEmbed **oficial** (más fiable). Cómo sacarlo (~15 min, 1 vez):

1. Entra a <https://developers.facebook.com/> → **My Apps** → **Create App** → tipo **Business**.
2. En el panel de la app, agrega el producto **oEmbed Read** (o "Instagram oEmbed").
3. Copia tu **App ID** y **App Secret** (Settings → Basic).
4. El token de app es la cadena: `APP_ID|APP_SECRET` (con la barra `|` en medio).
   - Ej.: `META_TOKEN="1234567890|abcdef0123456789abcdef0123456789"`

> Para volumen alto Meta puede pedir App Review; para una corrida puntual del catálogo suele alcanzar el token de app. Lo que no resuelva queda con ícono y puedes completarlo a mano en `thumb`.

## 3. Correr
```bash
# Prueba primero en seco con 20 filas (no sube nada):
node tools/enrich-thumbnails.mjs miBanco.csv salida.csv --dry --limit 20

# Corrida real (rehostea a Supabase):
SUPABASE_URL=https://fzemsxyrzyssxprewwzs.supabase.co \
SUPABASE_SERVICE_KEY=eyJ...service_role... \
META_TOKEN="APP_ID|APP_SECRET" \   # omite esta línea si no usas Meta
node tools/enrich-thumbnails.mjs miBanco.csv salida.csv
```
Flags: `--limit N` (solo N filas) · `--dry` (no sube) · `--bucket nombre` (default `ref-thumbs`) · `--conc N` (concurrencia, default 5).

El script imprime un resumen (`uploaded`, `cached`, `no-thumb`, etc.) y deja `salida.csv` con la columna `thumb` llena de URLs de Supabase.

## 4. Cargar el resultado en Tempo OS
- **Rápido:** en la app → **Banco de Referencias** → **Importar CSV** → sube `salida.csv`
  (marca *“Agregar a las existentes”* si quieres sumarlas en vez de reemplazar).
- **De fábrica para todos:** pega el contenido de `salida.csv` en el bloque
  `<script type="text/plain" id="bank-csv">` de `app.html` y haz push.

## Notas
- El bucket `ref-thumbs` se crea **público** automáticamente (las miniaturas se sirven por URL directa).
- Las URLs de Supabase son **permanentes** (a diferencia de las de TikTok/IG, que caducan).
- Re-correr el script solo procesa lo que falte (las ya subidas se detectan y se reusan).
