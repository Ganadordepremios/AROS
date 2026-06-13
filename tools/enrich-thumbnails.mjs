#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// Tempo OS — Enriquecedor de miniaturas del Banco de Referencias
// ────────────────────────────────────────────────────────────────────────────
// Lee un CSV de referencias, resuelve la miniatura real de cada `link` según la
// plataforma, DESCARGA la imagen, la SUBE a un bucket público de Supabase Storage
// y escribe la URL permanente en la columna `thumb`. Idempotente y reanudable.
//
//   TikTok   → oEmbed oficial (thumbnail_url)            [sin key]
//   YouTube  → i.ytimg.com/vi/<id>/maxres|hqdefault.jpg  [sin key]
//   Vimeo    → vimeo oEmbed (thumbnail_url)              [sin key]
//   Instagram→ Meta oEmbed si hay META_TOKEN; si no/falla → scrape del /embed/ público
//   Otros / falla → se deja sin thumb (la app muestra el ícono de categoría)
//
// Requisitos: Node 18+ (fetch global). No instala dependencias.
//
// Uso:
//   SUPABASE_URL=https://fzemsxyrzyssxprewwzs.supabase.co \
//   SUPABASE_SERVICE_KEY=<service_role_key> \
//   META_TOKEN="<APP_ID>|<APP_SECRET>"   # opcional (Instagram oEmbed) \
//   node tools/enrich-thumbnails.mjs entrada.csv salida.csv
//
// Flags:  --limit N   procesa solo N filas (prueba)
//         --dry       no sube nada (solo resuelve y reporta)
//         --bucket X  nombre del bucket (default: ref-thumbs)
//         --conc N    concurrencia (default: 5)
// ════════════════════════════════════════════════════════════════════════════

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

// ── Config ──
const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(['--bucket', '--limit', '--conc']); // flags que toman un valor
const BOOL_FLAGS = new Set(['--dry']);
const positional = [];
const opts = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (VALUE_FLAGS.has(a)) { opts[a] = argv[++i]; }
  else if (BOOL_FLAGS.has(a)) { opts[a] = true; }
  else if (a.startsWith('--')) { opts[a] = true; }
  else positional.push(a);
}
const flag = (name, def) => (name in opts ? opts[name] : def);
const INPUT = positional[0] || 'referencias.csv';
const OUTPUT = positional[1] || 'referencias.thumbs.csv';
const SUPA = (process.env.SUPABASE_URL || 'https://fzemsxyrzyssxprewwzs.supabase.co').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_KEY || '';
const META_TOKEN = process.env.META_TOKEN || '';
const BUCKET = flag('--bucket', 'ref-thumbs');
const LIMIT = parseInt(flag('--limit', '0'), 10) || 0;
const CONC = parseInt(flag('--conc', '5'), 10) || 5;
const DRY = !!opts['--dry'];
const IG_BROWSER = !!opts['--ig-browser']; // resolver IG con navegador headless (requiere `npm i puppeteer`)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

if (!DRY && !KEY) { console.error('✗ Falta SUPABASE_SERVICE_KEY (service_role). Usa --dry para probar sin subir.'); process.exit(1); }

// ── CSV: parse (respeta comillas/comas/saltos) y serialize ──
function parseCSV(text) {
  const rows = []; let row = [], cur = '', inQ = false;
  text = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else { if (c === '"') inQ = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c; }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(v => String(v).trim().length));
}
function csvCell(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function serializeCSV(headers, objs) {
  const lines = [headers.map(csvCell).join(',')];
  for (const o of objs) lines.push(headers.map(h => csvCell(o[h] ?? '')).join(','));
  return lines.join('\n') + '\n';
}

// ── Resolución de la imagen fuente por plataforma ──
async function fetchJSON(url, opts) { const r = await fetch(url, opts); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
async function head200(url) { try { const r = await fetch(url, { method: 'HEAD' }); return r.ok; } catch { return false; } }

async function sourceThumb(link) {
  const url = String(link || '').trim(); if (!url) return null;
  // YouTube
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  if (m) { const max = `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`; return (await head200(max)) ? max : `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`; }
  // Vimeo
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) { try { const d = await fetchJSON(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`); if (d.thumbnail_url) return d.thumbnail_url; } catch {} return `https://vumbnail.com/${m[1]}.jpg`; }
  // TikTok
  if (/tiktok\.com/.test(url)) { try { const d = await fetchJSON(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`); return d.thumbnail_url || null; } catch { return null; } }
  // Instagram
  if (/instagram\.com/.test(url)) return instagramThumb(url);
  return null;
}

async function instagramThumb(url) {
  // 1) Meta oEmbed oficial (si hay token) — vía recomendada/ToS.
  if (META_TOKEN) {
    try {
      const d = await fetchJSON(`https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&fields=thumbnail_url&omitscript=true&access_token=${encodeURIComponent(META_TOKEN)}`);
      if (d.thumbnail_url) return d.thumbnail_url;
    } catch {}
  }
  // 2) Sin token: el fetch simple NO sirve (IG entrega un shell JS sin la imagen).
  //    La única vía sin token que funciona es renderizar el /embed/ en un navegador headless (--ig-browser → requiere `npm i puppeteer`).
  if (IG_BROWSER) return igViaBrowser(url);
  return null;
}
// Resuelve la portada de IG renderizando el embed público en Chromium headless (Puppeteer, carga perezosa).
let _pptr = null, _browser = null, _pptrFailed = false;
async function igViaBrowser(url) {
  if (_pptrFailed) return null;
  const m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/); if (!m) return null;
  try {
    if (!_pptr) _pptr = (await import('puppeteer')).default;
    if (!_browser) _browser = await _pptr.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await _browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(`https://www.instagram.com/p/${m[1]}/embed/captioned/`, { waitUntil: 'networkidle2', timeout: 25000 });
    const src = await page.evaluate(() => {
      const im = document.querySelector('img.EmbeddedMediaImage') || document.querySelector('img[referrerpolicy]') ||
        [...document.images].find(i => /cdninstagram|fbcdn/.test(i.src));
      return im ? im.src : null;
    });
    await page.close();
    return (src && /cdninstagram|fbcdn/.test(src)) ? src : null;
  } catch (e) {
    if (/Cannot find package 'puppeteer'|ERR_MODULE_NOT_FOUND/.test(String(e))) { _pptrFailed = true; console.error('  ✗ --ig-browser requiere Puppeteer: corre `npm i puppeteer` primero.'); }
    return null;
  }
}
async function closeBrowser() { try { if (_browser) await _browser.close(); } catch {} }

// ── Supabase Storage ──
async function ensureBucket() {
  if (DRY) return;
  const r = await fetch(`${SUPA}/storage/v1/bucket`, {
    method: 'POST', headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (r.ok) console.log(`• bucket "${BUCKET}" creado (público)`);
  else { const t = await r.text(); if (!/already exists|Duplicate/i.test(t)) console.warn('· bucket:', t.slice(0, 120)); }
}
function publicUrl(file) { return `${SUPA}/storage/v1/object/public/${BUCKET}/${file}`; }
async function uploadImage(file, bytes, contentType) {
  const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${file}`, {
    method: 'POST', headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: bytes,
  });
  if (!r.ok) throw new Error('upload ' + r.status + ' ' + (await r.text()).slice(0, 100));
}

async function processRow(o, linkKey) {
  const link = String(o[linkKey] || '').trim();
  if ((o.thumb || '').trim()) return { status: 'skip-manual' };          // ya tiene thumb propio
  if (!link) return { status: 'no-link' };
  const file = createHash('sha1').update(link).digest('hex') + '.jpg';
  if (!DRY && await head200(publicUrl(file))) { o.thumb = publicUrl(file); return { status: 'cached', platform: platformOf(link) }; } // ya estaba rehosteada
  const src = await sourceThumb(link);
  if (!src) return { status: 'no-thumb', platform: platformOf(link) };
  if (DRY) { o.thumb = '(dry) ' + src; return { status: 'resolved', platform: platformOf(link) }; }
  const ir = await fetch(src, { headers: { 'User-Agent': UA } });
  if (!ir.ok) return { status: 'dl-fail', platform: platformOf(link) };
  const ct = ir.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await ir.arrayBuffer());
  await uploadImage(file, buf, ct.startsWith('image/') ? ct : 'image/jpeg');
  o.thumb = publicUrl(file);
  return { status: 'uploaded', platform: platformOf(link) };
}
function platformOf(u) { if (/tiktok/.test(u)) return 'tiktok'; if (/youtu/.test(u)) return 'youtube'; if (/vimeo/.test(u)) return 'vimeo'; if (/instagram/.test(u)) return 'instagram'; return 'otro'; }

// ── Main ──
(async () => {
  const text = readFileSync(INPUT, 'utf8');
  const rows = parseCSV(text);
  if (rows.length < 2) { console.error('✗ CSV sin datos'); process.exit(1); }
  const headers = rows[0].map(h => h.trim());
  const lower = headers.map(h => h.toLowerCase());
  const linkKey = headers[lower.indexOf('link')] || headers[lower.indexOf('url')];
  if (!linkKey) { console.error('✗ El CSV no tiene columna "link" (ni "url").'); process.exit(1); }
  if (lower.indexOf('thumb') < 0) headers.push('thumb');
  let objs = rows.slice(1).map(vals => { const o = {}; headers.forEach((h, i) => { o[h] = (vals[i] ?? '').trim(); }); return o; });
  if (LIMIT) objs = objs.slice(0, LIMIT);

  const igMode = META_TOKEN ? 'oEmbed' : (IG_BROWSER ? 'navegador headless' : 'omitido (sin token/--ig-browser)');
  console.log(`▶ ${objs.length} filas · bucket=${BUCKET} · IG=${igMode} ${DRY ? '· DRY-RUN' : ''}`);
  // Conteo por plataforma (para ver la composición del banco).
  const byPlat = {}; objs.forEach(o => { const p = platformOf(String(o[linkKey] || '')); byPlat[p] = (byPlat[p] || 0) + 1; });
  console.log('  Por plataforma:', JSON.stringify(byPlat));
  await ensureBucket();

  const stats = {}, okByPlat = {}; let done = 0;
  async function worker(slice) {
    for (const o of slice) {
      let res;
      try { res = await processRow(o, linkKey); }
      catch (e) { res = { status: 'error' }; console.warn('  ! ' + (o[linkKey] || '').slice(0, 50), '→', e.message); }
      stats[res.status] = (stats[res.status] || 0) + 1;
      if ((res.status === 'uploaded' || res.status === 'resolved' || res.status === 'cached') && res.platform) okByPlat[res.platform] = (okByPlat[res.platform] || 0) + 1;
      if (++done % 50 === 0) console.log(`  …${done}/${objs.length}`);
    }
  }
  // reparte en CONC workers
  const buckets = Array.from({ length: CONC }, () => []);
  objs.forEach((o, i) => buckets[i % CONC].push(o));
  await Promise.all(buckets.map(worker));
  await closeBrowser();

  writeFileSync(OUTPUT, serializeCSV(headers, objs), 'utf8');
  console.log('\n✓ Listo →', OUTPUT);
  console.log('  Resumen:', JSON.stringify(stats));
  console.log('  Resueltas por plataforma:', JSON.stringify(okByPlat));
  const ok = (stats.uploaded || 0) + (stats.cached || 0) + (stats['skip-manual'] || 0) + (stats.resolved || 0);
  console.log(`  Con miniatura: ${ok}/${objs.length}`);
})();
