// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
const s  = v => (v == null ? '' : String(v));
const up = v => s(v).toUpperCase();
const trim = v => s(v).replace(/^["'﻿\r\s]+|["'\r\s]+$/g, '');

// ══════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════
let referencias   = [];
// La selección de ideas es POR LANZAMIENTO (launch.ideas), no global.
function refKey(r) { return r && s(r.id).trim() ? ('id:' + s(r.id).trim()) : ('t:' + s(r.title).trim().toLowerCase()); }
function ideaSelected(r) { const a = activeLaunch(); return !!(a && a.ideas && a.ideas.some(x => x.key === refKey(r))); }
let bancoCargado  = false;
let activeForFilter = 'all';
let activeCatFilter = 'all';
let paginaActual  = 1;
let porPagina     = 25;

const CAT_PALETTE = ['#FF6B30','#a78bfa','#fb923c','#4ade80','#ff4757','#38bdf8','#f472b6','#fbbf24','#34d399','#f87171','#60a5fa','#c084fc'];
const catColorMap = {};
let paletteIdx = 0;
function catColor(c) {
  const key = s(c).toLowerCase();
  if (!key) return '#666';
  if (!catColorMap[key]) { catColorMap[key] = CAT_PALETTE[paletteIdx % CAT_PALETTE.length]; paletteIdx++; }
  return catColorMap[key];
}

const CAT_EMOJI = { bts:'🎧', awareness:'🪞', engagement:'🎤', storytelling:'🎬', trend:'🔀', humor:'😂', educativo:'📖', pov:'👁️', conversión:'💡', behind:'🎙️', viral:'🔥', reel:'📱', short:'⚡' };
function catEmoji(cats) {
  const first = s(cats[0]);
  const m = first.match(/^\s*([\p{Extended_Pictographic}])/u);
  if (m) return m[1];
  return CAT_EMOJI[first.toLowerCase()] || '📌';
}

// ══════════════════════════════════════════
// PARSER CSV
// ══════════════════════════════════════════
function parsearCSV(csv) {
  function toTags(raw) {
    return trim(raw).split(',').map(t => trim(t).toLowerCase()).filter(t => t.length > 0);
  }
  // Tokenizador CSV completo: respeta comillas, comas y saltos de línea dentro de campos.
  function tokenize(text) {
    const rows = []; let row = []; let cur = ''; let inQ = false;
    text = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i+1] === '"') { cur += '"'; i++; }   // comilla escapada ""
          else inQ = false;
        } else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(cur); cur = ''; }
        else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else cur += c;
      }
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  const rows = tokenize(csv).filter(r => r.some(v => trim(v).length > 0));
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => trim(h).toLowerCase());
  return rows.slice(1).map((vals, idx) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = trim(vals[i] || ''); });
    const forTags = toTags(obj['for'] || obj['para'] || '');
    const catTags = toTags(obj['cat'] || obj['categoria'] || '');
    return {
      _idx: idx,
      id: obj.id || '',
      title: obj.title || obj.titulo || '',
      hook: obj.hook || '',
      for: forTags,
      cat: catTags,
      link: obj.link || obj.url || '',
      comentarios: obj.comentarios || obj.notas || '',
      emoji: catEmoji(catTags),
    };
  }).filter(r => r.title.trim().length > 0);
}

const DEMO = [
  {_idx:0,id:1,title:"BTS en estudio — Natanael Cano",hook:"Lo que nadie vio...",for:["lanzamiento","single"],cat:["bts","storytelling"],link:"",comentarios:"Muy auténtico",emoji:"🎧"},
  {_idx:1,id:2,title:"Hook emocional en espejo",hook:"¿Tú también lo sentiste?",for:["lanzamiento","álbum"],cat:["awareness","pov"],link:"",comentarios:"Primera semana",emoji:"🪞"},
  {_idx:2,id:3,title:"Trend: antes/después del quiebre",hook:"Antes vs después",for:["single","ep"],cat:["trend","engagement"],link:"",comentarios:"Alta viralidad",emoji:"🔀"},
  {_idx:3,id:4,title:"Mini documental 60 seg",hook:"Un año en 60 segundos",for:["álbum","lanzamiento"],cat:["storytelling"],link:"",comentarios:"Ancla YouTube",emoji:"🎬"},
  {_idx:4,id:5,title:"Texto en pantalla con mensajes",hook:"Esto es lo que aprendí...",for:["single","lanzamiento"],cat:["engagement","educativo"],link:"",comentarios:"Alta compartición IG",emoji:"✍️"},
  {_idx:5,id:6,title:"Reacción del productor",hook:"La cara cuando escuchó el take...",for:["lanzamiento"],cat:["bts","humor"],link:"",comentarios:"Humaniza el proceso",emoji:"🎧"},
  {_idx:6,id:7,title:"Duet con fans",hook:"Cántalo conmigo",for:["single","ep","álbum"],cat:["engagement"],link:"",comentarios:"Genera UGC",emoji:"🎤"},
  {_idx:7,id:8,title:"POV: eres el artista en estudio",hook:"POV: son las 3am",for:["single","lanzamiento"],cat:["pov","humor"],link:"",comentarios:"Trending TikTok",emoji:"👁️"},
];
function setReferencias(arr) { referencias = arr || []; referencias.forEach((r, i) => { r._idx = i; }); }
setReferencias(DEMO);

// ══════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════
function toggleSidebar(force) {
  const open = (force === undefined) ? !document.body.classList.contains('sidebar-open') : force;
  document.body.classList.toggle('sidebar-open', open);
}
function showPage(id) {
  document.body.classList.remove('sidebar-open'); // cierra el menú en móvil al navegar
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const titles = {dashboard:'Dashboard',lanzamientos:'Lanzamientos',label:'Dashboard del Label',perfil:'Perfil del Artista',adn:'ADN Artístico',banco:'Banco de Referencias',ideas:'Generador de Ideas',calendario:'Calendario',objetivos:'Objetivos SMART',metricas:'Métricas',aprendizajes:'Aprendizajes',ia:'IA Estratégica'};
  document.getElementById('page-title').textContent = up(titles[id] || id);
  document.getElementById('btn-sheet-config').style.display = id === 'banco' ? '' : 'none';
  document.querySelector(`.nav-item[data-page="${id}"]`)?.classList.add('active');
  if (id === 'banco')      { bancoCargado ? (renderFiltros(), renderBanco()) : iniciarBanco(); }
  if (id === 'calendario') renderCalendar();
  if (id === 'objetivos')  renderObjetivos();
  if (id === 'metricas')   renderMetricas();
  if (id === 'perfil' || id === 'adn') renderArtistForms();
  if (id === 'ideas')      renderIdeas();
  if (id === 'aprendizajes') renderAprendizajes();
  if (id === 'ia')           renderIA();
  if (id === 'lanzamientos') renderLaunches();
  if (id === 'dashboard')    renderDashboard();
  if (id === 'label')        renderLabel();
  document.querySelector('.content').scrollTop = 0;
}

// ══════════════════════════════════════════
// BANCO — filtros dinámicos
// ══════════════════════════════════════════
function getUniqueTags(key) {
  const all = new Set();
  referencias.forEach(r => (r[key] || []).forEach(v => { if (v) all.add(v); }));
  return [...all].sort();
}
function iniciarBanco() {
  activeForFilter = 'all'; activeCatFilter = 'all'; paginaActual = 1;
  renderFiltros(); renderBanco();
}
function renderFiltros() {
  const forTags = getUniqueTags('for');
  const catTags = getUniqueTags('cat');
  function makeBtns(tags, containerId, activeFn, activeVal) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn' + (activeVal === 'all' ? ' active' : '');
    allBtn.textContent = 'Todo';
    allBtn.addEventListener('click', function() { activeFn(this, 'all'); });
    container.appendChild(allBtn);
    tags.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (activeVal === t ? ' active' : '');
      btn.textContent = t;
      btn.addEventListener('click', function() { activeFn(this, t); });
      container.appendChild(btn);
    });
  }
  makeBtns(forTags, 'filtros-for', setForFilter, activeForFilter);
  makeBtns(catTags, 'filtros-cat', setCatFilter, activeCatFilter);
}
function setForFilter(btn, val) {
  activeForFilter = val; paginaActual = 1;
  document.querySelectorAll('#filtros-for .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderBanco();
}
function setCatFilter(btn, val) {
  activeCatFilter = val; paginaActual = 1;
  document.querySelectorAll('#filtros-cat .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderBanco();
}
function catBadgeHTML(cats, small) {
  return (cats || []).filter(Boolean).map(c => {
    const col = catColor(c);
    const sz = small ? '9px' : '10px';
    return `<span style="display:inline-block;padding:2px 6px;border-radius:2px;font-size:${sz};font-family:var(--font-mono);margin:1px;background:${col}22;color:${col};border:1px solid ${col}44">${up(c)}</span>`;
  }).join('');
}
function forBadgeHTML(fors, small) {
  const sz = small ? '9px' : '10px';
  return (fors || []).filter(Boolean).map(f =>
    `<span style="display:inline-block;padding:2px 6px;border-radius:2px;font-size:${sz};font-family:var(--font-mono);margin:1px;background:rgba(255,255,255,0.04);color:var(--text-dim);border:1px solid var(--border)">${s(f)}</span>`
  ).join('');
}
function renderBancoContext() {
  const host = document.getElementById('ctx-banco'); if (!host) return;
  const a = activeLaunch();
  const n = a ? a.ideas.length : 0;
  host.innerHTML = launchContextHTML()
    + `<div style="margin:-10px 0 18px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:0.5px">★ <strong style="color:var(--accent)">${n}</strong> idea${n===1?'':'s'} seleccionada${n===1?'':'s'} para ${a ? s(a.name) : 'este lanzamiento'} · la estrella ★ agrega o quita</div>`;
}
function renderBanco() {
  renderBancoContext();
  const grid = document.getElementById('refs-grid');
  let filtered = referencias;
  if (activeForFilter !== 'all') filtered = filtered.filter(r => (r.for||[]).includes(activeForFilter));
  if (activeCatFilter !== 'all') filtered = filtered.filter(r => (r.cat||[]).includes(activeCatFilter));
  if (!filtered.length) {
    grid.style.gridTemplateColumns = '1fr';
    grid.innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-muted)"><div style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px">SIN REFERENCIAS CON ESTOS FILTROS</div></div>`;
    return;
  }
  grid.style.gridTemplateColumns = '';
  const totalPags = Math.ceil(filtered.length / porPagina);
  paginaActual = Math.max(1, Math.min(paginaActual, totalPags));
  const inicio = (paginaActual - 1) * porPagina;
  const slice  = filtered.slice(inicio, inicio + porPagina);
  const cards = slice.map(r => {
    const sel = ideaSelected(r);
    return `
    <div class="ref-page-card fade-in" onclick="openRefBoxdrop(${r._idx})">
      <div class="ref-page-thumb" style="background:linear-gradient(135deg,#111,#1a1a1a);position:relative;min-height:90px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:28px">${s(r.emoji)||'📌'}</span>
        <button onclick="event.stopPropagation();toggleIdea(${r._idx},this)" title="Seleccionar idea para el lanzamiento activo"
          style="position:absolute;top:6px;right:6px;background:none;border:none;cursor:pointer;font-size:14px;opacity:${sel?1:0.3};transition:opacity 0.2s">${sel?'★':'☆'}</button>
        ${r.link ? `<a href="${s(r.link)}" target="_blank" onclick="event.stopPropagation()" style="position:absolute;bottom:6px;right:6px;font-size:9px;font-family:var(--font-mono);background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:2px;color:var(--accent);text-decoration:none;border:1px solid rgba(255,107,48,0.2)">↗ VER</a>` : ''}
      </div>
      <div class="ref-page-info">
        <div class="ref-page-title">${s(r.title)}</div>
        ${r.hook ? `<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-bottom:5px;line-height:1.4">"${s(r.hook)}"</div>` : ''}
        <div style="margin-bottom:3px;display:flex;flex-wrap:wrap">${catBadgeHTML(r.cat, true) || '<span style="font-size:9px;color:var(--text-dim)">sin cat</span>'}</div>
        <div style="display:flex;flex-wrap:wrap">${forBadgeHTML(r.for, true)}</div>
      </div>
    </div>`;
  }).join('');
  const desde = inicio + 1, hasta = Math.min(inicio + porPagina, filtered.length);
  const paginacion = `
    <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:16px 4px 0;border-top:1px solid var(--border);margin-top:8px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">Mostrar</span>
        ${[10,25,50].map(n => `<button onclick="cambiarPorPagina(${n})" style="padding:4px 9px;border-radius:3px;font-family:var(--font-mono);font-size:10px;cursor:pointer;border:1px solid ${porPagina===n?'var(--accent)':'var(--border)'};background:${porPagina===n?'rgba(255,107,48,0.1)':'transparent'};color:${porPagina===n?'var(--accent)':'var(--text-muted)'}">${n}</button>`).join('')}
      </div>
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${desde}–${hasta} de ${filtered.length}</span>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" ${paginaActual===1?'disabled':''} onclick="cambiarPagina(${paginaActual-1})">‹</button>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);min-width:56px;text-align:center">Pág ${paginaActual}/${totalPags}</span>
        <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" ${paginaActual===totalPags?'disabled':''} onclick="cambiarPagina(${paginaActual+1})">›</button>
      </div>
    </div>`;
  grid.innerHTML = cards + paginacion;
}
function cambiarPagina(n) { paginaActual = n; renderBanco(); document.querySelector('.content').scrollTop = 0; }
function cambiarPorPagina(n) { porPagina = n; paginaActual = 1; renderBanco(); }

// ══════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════
function toggleIdea(idx, btn) {
  const a = activeLaunch();
  if (!a) { uiAlert('No hay un lanzamiento activo para seleccionar ideas.'); return false; }
  const r = referencias[idx]; if (!r) return false;
  const key = refKey(r);
  const i = a.ideas.findIndex(x => x.key === key);
  let selected;
  if (i >= 0) { a.ideas.splice(i, 1); selected = false; }
  else {
    a.ideas.push({ key, title:r.title, hook:r.hook, cat:r.cat, for:r.for, link:r.link, comentarios:r.comentarios, emoji:r.emoji });
    selected = true;
  }
  saveLaunches();
  if (btn) { btn.textContent = selected ? '★' : '☆'; btn.style.opacity = selected ? '1' : '0.3'; }
  renderBancoContext();
  return selected;
}

// ══════════════════════════════════════════
// THUMBNAIL desde link (servicios públicos)
// ══════════════════════════════════════════
function refThumb(link) {
  const url = s(link).trim();
  if (!url) return null;
  // YouTube (watch / shorts / youtu.be / embed)
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://vumbnail.com/${vm[1]}.jpg`;
  // Universal: screenshot público de la página (TikTok, IG, X, posts, etc.)
  return `https://image.thum.io/get/width/600/crop/800/${url}`;
}

// ══════════════════════════════════════════
// BOXDROP REFERENCIA
// ══════════════════════════════════════════
function openRefBoxdrop(idx) {
  const r = referencias[idx];
  if (!r) return;
  const cats = (r.cat||[]).filter(Boolean);
  const fors = (r.for||[]).filter(Boolean);
  const a = activeLaunch();
  const sel = ideaSelected(r);
  document.getElementById('bd-title').textContent = up(r.title);
  document.getElementById('bd-date').textContent  = cats.map(up).join(' · ') || '—';
  document.getElementById('bd-idea').textContent  = s(r.title);
  document.getElementById('bd-hook').textContent   = s(r.hook) || 'Sin hook definido';
  document.getElementById('bd-desc').textContent   = s(r.comentarios) || 'Sin comentarios';

  // Tags & Keywords = cat + for
  const tagHTML = [
    ...cats.map(c => `<span class="brief-tag accent">${s(c)}</span>`),
    ...fors.map(f => `<span class="brief-tag">${s(f)}</span>`)
  ].join('');
  document.getElementById('bd-tags').innerHTML = tagHTML || '<span style="font-size:11px;color:var(--text-dim)">Sin tags</span>';

  // Badge de categoría en header
  const badge = document.getElementById('bd-cat-badge');
  badge.removeAttribute('class');
  const fc = cats[0] || '';
  const fcol = catColor(fc);
  badge.style.cssText = `background:${fcol}22;color:${fcol};border:1px solid ${fcol}44;padding:3px 10px;border-radius:2px;font-size:9px;font-family:var(--font-mono)`;
  badge.textContent   = up(fc) || 'REF';

  // Miniatura (lado derecho del brief)
  const thumb = refThumb(r.link);
  const emoji = s(r.emoji) || '📌';
  const card  = document.getElementById('bd-thumb-card');
  if (thumb) {
    card.innerHTML = `
      <img class="brief-thumb-img" src="${thumb}" alt="${s(r.title)}" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="brief-thumb-fallback" style="display:none">${emoji}</div>
      <div style="padding:10px;border-top:1px solid var(--border)">
        <a href="${s(r.link)}" target="_blank" style="font-size:11px;color:var(--accent);font-family:var(--font-mono);text-decoration:none">↗ Abrir original</a>
      </div>`;
  } else {
    card.innerHTML = `
      <div class="brief-thumb-fallback" style="display:flex">${emoji}</div>
      <div style="padding:10px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text-dim);text-align:center">SIN LINK ASOCIADO</div>`;
  }

  const selLabel = a ? `Seleccionar para ${s(a.name)}` : 'Seleccionar idea';
  document.getElementById('bd-actions').innerHTML = `
    <button id="bd-sel-btn" onclick="(function(b){ const on = toggleIdea(${idx}, null); b.innerHTML = on ? '★ Seleccionada' : '☆ ${selLabel}'; b.style.color = on ? 'var(--accent)' : 'var(--text-muted)'; b.style.borderColor = on ? 'rgba(255,107,48,0.3)' : 'var(--border)'; })(this)"
      style="padding:5px 12px;border-radius:3px;font-size:11px;font-family:var(--font-mono);cursor:pointer;border:1px solid ${sel?'rgba(255,107,48,0.3)':'var(--border)'};background:transparent;color:${sel?'var(--accent)':'var(--text-muted)'};transition:all 0.15s">${sel?'★ Seleccionada':'☆ '+selLabel}</button>
    <button onclick="generarContenidoBanco(${idx})"
      style="padding:5px 12px;border-radius:3px;font-size:11px;font-family:var(--font-mono);cursor:pointer;border:1px solid rgba(167,139,250,0.4);background:transparent;color:#a78bfa;transition:all 0.15s">✨ Generar contenido</button>
    <button onclick="abrirModalCal(${idx})"
      style="padding:5px 12px;border-radius:3px;font-size:11px;font-family:var(--font-mono);cursor:pointer;border:1px solid rgba(255,107,48,0.3);background:rgba(255,107,48,0.06);color:var(--accent);transition:all 0.15s">+ Agregar al Calendario</button>`;
  const cres = document.getElementById('bd-content-result'); if (cres) cres.innerHTML = '';
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.boxdrop-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-brief').classList.add('active');
  document.querySelectorAll('.boxdrop-tab')[0].classList.add('active');
  document.getElementById('boxdrop').classList.add('open');
}

// ══════════════════════════════════════════
// AGREGAR AL CALENDARIO (del lanzamiento activo)
// ══════════════════════════════════════════
let calModalIdx = null;
function abrirModalCal(idx) {
  calModalIdx = idx;
  const r = referencias[idx];
  const a = activeLaunch();
  document.getElementById('mc-title').innerHTML =
    `${s(r.title)} ${a ? `<span style="color:var(--text-dim);font-weight:400">→ ${s(a.name)}</span>` : ''}`;
  document.getElementById('mc-fecha').value = '';
  document.getElementById('mc-status').textContent = '';
  document.getElementById('modal-cal').classList.add('open');
}
function cerrarModalCal(e) {
  if (!e || e.target === document.getElementById('modal-cal'))
    document.getElementById('modal-cal').classList.remove('open');
}
function confirmarCal() {
  const fecha = document.getElementById('mc-fecha').value;
  if (!fecha) { document.getElementById('mc-status').textContent = 'Selecciona una fecha'; return; }
  const a = activeLaunch();
  if (!a) { document.getElementById('mc-status').textContent = 'No hay lanzamiento activo'; return; }
  const r = referencias[calModalIdx];
  const cats = (r.cat||[]).filter(Boolean);
  a.cal.push({ id: 'ci-' + Date.now(), title: s(r.title), cat: cats[0]||'awareness', fecha, refIdx: calModalIdx, refLink: s(r.link) });
  saveLaunches();
  document.getElementById('mc-status').style.color = '#4ade80';
  document.getElementById('mc-status').textContent = `✓ Agregado a ${s(a.name)}`;
  setTimeout(() => { document.getElementById('modal-cal').classList.remove('open'); }, 800);
}

// ══════════════════════════════════════════
// CALENDARIO (scoped al lanzamiento activo)
// ══════════════════════════════════════════
const DAYS = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const MESES_CAL = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
let weekOffset = 0;
let monthOffset = 0;
let calView = 'calendar';   // 'calendar' | 'kanban'
let calRange = '1w';        // '1w' | '2w' | '1m'

function launchBaseMonday() {
  const a = activeLaunch();
  const base = (a && a.date) ? new Date(a.date + 'T00:00:00') : new Date(2026, 5, 2);
  const dow = (base.getDay() + 6) % 7; // lunes = 0
  base.setDate(base.getDate() - dow);
  return base;
}
function weekStart() {
  const d = launchBaseMonday();
  d.setDate(d.getDate() + weekOffset * 7);
  return d;
}
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function calMonthGrid() {
  const a = activeLaunch();
  const base = (a && a.date) ? new Date(a.date + 'T00:00:00') : new Date(2026, 5, 2);
  base.setDate(1); base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const start = new Date(first); start.setDate(1 - startDow);
  const days = [];
  for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
  return { days, month, label: `${MESES_CAL[month]} ${year}` };
}

// Vista / rango
function setCalView(v) { calView = v; renderCalendar(); }
function setCalRange(r) { calRange = r; weekOffset = 0; monthOffset = 0; renderCalendar(); }
function changeWeek(dir) {
  if (calView === 'kanban') return;
  if (calRange === '1m') monthOffset += dir;
  else weekOffset += dir * (calRange === '2w' ? 2 : 1);
  renderCalendar();
}

// Entrada maestra
function renderCalendar() {
  const ctx = document.getElementById('ctx-cal'); if (ctx) ctx.innerHTML = launchContextHTML();
  document.querySelectorAll('#page-calendario .view-toggle button').forEach(b => b.classList.toggle('active', b.dataset.view === calView));
  document.querySelectorAll('#cal-range-sel button').forEach(b => b.classList.toggle('active', b.dataset.range === calRange));
  const rsel = document.getElementById('cal-range-sel'); if (rsel) rsel.style.display = calView === 'calendar' ? '' : 'none';
  const wnav = document.getElementById('cal-weeknav'); if (wnav) wnav.style.display = calView === 'calendar' ? '' : 'none';
  document.getElementById('cal-calendar-view').style.display = calView === 'calendar' ? '' : 'none';
  document.getElementById('cal-board').style.display = calView === 'kanban' ? '' : 'none';
  if (calView === 'calendar') renderCalGrid(); else renderKanban();
}

function renderCalGrid() {
  const a = activeLaunch();
  const campLabel = document.getElementById('cal-campaign-label');
  if (campLabel) campLabel.textContent = a ? (up(a.name) + ' · CAMPAÑA') : 'CAMPAÑA';
  const grid = document.getElementById('cal-grid');
  const sideRefs = document.getElementById('side-refs');

  let days = [], label = '', month = null;
  if (calRange === '1m') { const g = calMonthGrid(); days = g.days; label = g.label; month = g.month; }
  else {
    const n = calRange === '2w' ? 14 : 7; const monday = weekStart();
    for (let i = 0; i < n; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); days.push(d); }
    const last = days[days.length - 1];
    label = (monday.getMonth() === last.getMonth())
      ? `${MESES_CAL[monday.getMonth()]} ${monday.getDate()}–${last.getDate()}, ${last.getFullYear()}`
      : `${MESES_CAL[monday.getMonth()]} ${monday.getDate()} – ${MESES_CAL[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
  }
  document.getElementById('week-label').textContent = label;

  grid.innerHTML = DAYS.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  const today = new Date(); today.setHours(0,0,0,0);
  const dropKey = (a && a.date) ? a.date : null;
  const items = a ? a.cal : [];

  days.forEach(day => {
    const dk = dateKey(day);
    const isToday = day.getTime() === today.getTime();
    const isDrop = dk === dropKey;
    const outMonth = (month !== null && day.getMonth() !== month);
    const dayItems = items.filter(ci => ci.fecha === dk);
    const itemsHTML = dayItems.map(ci => {
      const col = catColor(ci.cat);
      const est = (ci.production && ci.production.estado) || 'pendiente';
      const estIcon = ESTADO_ICON[est] || '';
      return `<div onclick="openProduction('${a.id}','${ci.id}')" style="border-radius:3px;padding:3px 5px;font-size:9px;font-weight:500;margin-bottom:3px;cursor:pointer;line-height:1.3;background:${col}18;color:${col};border-left:2px solid ${col}" title="${s(ci.title)} · ${est}">${estIcon ? estIcon + ' ' : ''}${s(ci.title)}</div>`;
    }).join('');
    const dropBadge = isDrop ? `<div style="font-size:8px;font-family:var(--font-mono);color:var(--accent);letter-spacing:1px;margin-bottom:3px">🎯 DROP</div>` : '';
    const div = document.createElement('div');
    div.className = 'cal-day' + (isToday ? ' today' : '');
    if (calRange === '1m') div.style.minHeight = '78px';
    if (isDrop) div.style.borderColor = 'rgba(255,107,48,0.5)';
    if (outMonth) div.style.opacity = '0.38';
    div.innerHTML = `<div class="cal-day-num">${day.getDate()}</div>${dropBadge}${itemsHTML}`;
    grid.appendChild(div);
  });

  const allCats = getUniqueTags('cat');
  const leyendaEl = document.getElementById('cal-leyenda');
  if (leyendaEl) {
    leyendaEl.innerHTML = allCats.length
      ? allCats.map(c => { const col = catColor(c); return `<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:2px;background:${col};display:inline-block;flex-shrink:0"></span><span style="font-size:11px;color:var(--text-muted)">${s(c)}</span></div>`; }).join('')
      : '<div style="font-size:10px;color:var(--text-dim)">Carga el banco para ver categorías</div>';
  }
  if (sideRefs) sideRefs.innerHTML = referencias.slice(0, 6).map((r) => {
    const cats = (r.cat||[]).filter(Boolean); const col = catColor(cats[0]);
    return `<div class="ref-item" onclick="openRefBoxdrop(${r._idx})">
      <div style="width:26px;height:26px;border-radius:4px;background:${col}22;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">${s(r.emoji)||'📌'}</div>
      <div class="ref-info"><div class="ref-title">${s(r.title)}</div><div class="ref-meta">${cats.map(up).join(' · ') || '—'}</div></div>
    </div>`;
  }).join('');
}

// ── Tablero Kanban (3 etapas) ──
const STAGE_DEF = [
  { key:'pre',  title:'Preproducción',  setTo:'pendiente', estados:['pendiente','aprobado'],
    desc:'Se define la pieza: idea, brief, guión, aprobación y plan de grabación (shot list). Aún no se ha grabado nada.' },
  { key:'prod', title:'Producción',     setTo:'grabando',  estados:['grabando'],
    desc:'Se ejecuta la grabación / captura del material siguiendo el shot list. Manos a la cámara.' },
  { key:'post', title:'Postproducción', setTo:'editando',  estados:['editando','programado','publicado'],
    desc:'Edición, montaje, aprobación final, programación y publicación de la pieza.' },
];
function stageOf(estado) {
  const st = STAGE_DEF.find(s2 => s2.estados.includes(estado));
  return st ? st.key : 'pre';
}
function launchProgress(l) {
  const items = (l && l.cal) || [];
  const total = items.length;
  const published = items.filter(c => (c.production && c.production.estado) === 'publicado').length;
  const byStage = { pre: 0, prod: 0, post: 0 };
  items.forEach(c => { byStage[stageOf((c.production && c.production.estado) || 'pendiente')]++; });
  return { total, published, pct: total ? Math.round(published / total * 100) : 0, byStage };
}
function donutSVG(segments, size, thickness, centerLabel, centerSub) {
  size = size || 130; thickness = thickness || 16;
  const r = (size - thickness) / 2, cx = size/2, cy = size/2, C = 2 * Math.PI * r;
  const total = segments.reduce((a, sg) => a + sg.value, 0) || 1;
  let offset = 0;
  const arcs = segments.filter(sg => sg.value > 0).map(sg => {
    const len = sg.value / total * C;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sg.color}" stroke-width="${thickness}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="round"></circle>`;
    offset += len; return el;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="${thickness}"></circle>
    ${arcs}
    ${centerLabel ? `<text x="${cx}" y="${cy - (centerSub?6:0)}" text-anchor="middle" dominant-baseline="central" fill="var(--text)" font-family="Bebas Neue" font-size="${size*0.28}">${centerLabel}</text>` : ''}
    ${centerSub ? `<text x="${cx}" y="${cy + size*0.13}" text-anchor="middle" dominant-baseline="central" fill="var(--text-muted)" font-family="Space Mono" font-size="${size*0.08}">${centerSub}</text>` : ''}
  </svg>`;
}
function kanbanCardHTML(launchId, ci) {
  const col = catColor(ci.cat);
  const est = (ci.production && ci.production.estado) || 'pendiente';
  const fecha = ci.fecha ? `${MESES_CAL[new Date(ci.fecha+'T00:00:00').getMonth()]} ${new Date(ci.fecha+'T00:00:00').getDate()}` : '—';
  return `<div class="kanban-card" draggable="true" ondragstart="kanbanDrag(event,'${ci.id}')" onclick="openProduction('${launchId}','${ci.id}')" style="border-left:3px solid ${col}">
    <div class="kc-title">${s(ci.title)}</div>
    <div class="kc-meta">${fecha} · ${ESTADO_ICON[est] || ''} ${est}</div>
  </div>`;
}
function renderKanban() {
  const a = activeLaunch();
  const board = document.getElementById('cal-board');
  if (!a) { board.innerHTML = '<div class="empty-hint">Selecciona un lanzamiento.</div>'; return; }
  const items = a.cal || [];
  board.innerHTML = `<div class="kanban">${STAGE_DEF.map(st => {
    const cards = items.filter(ci => stageOf((ci.production && ci.production.estado) || 'pendiente') === st.key);
    return `<div class="kanban-col" data-stage="${st.key}" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="kanbanDrop(event,'${st.key}')">
      <div class="kanban-head">
        <span>${st.title}</span>
        <span class="kanban-count">${cards.length}</span>
        <span class="kanban-info">ⓘ<span class="kanban-tip">${st.desc}</span></span>
      </div>
      <div class="kanban-cards">${cards.map(ci => kanbanCardHTML(a.id, ci)).join('') || '<div class="kanban-empty">Arrastra piezas aquí</div>'}</div>
    </div>`;
  }).join('')}</div>`;
}
function kanbanDrag(e, id) { e.dataTransfer.setData('text/plain', id); }
function kanbanDrop(e, stageKey) {
  e.preventDefault();
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  const id = e.dataTransfer.getData('text/plain');
  const a = activeLaunch(); if (!a) return;
  const ci = (a.cal || []).find(c => c.id === id); if (!ci) return;
  const st = STAGE_DEF.find(x => x.key === stageKey); if (!st) return;
  ensureProduction(ci);
  // si ya está en una etapa de esa columna, no cambiar; si no, poner el estado por defecto
  if (stageOf(ci.production.estado) !== stageKey) ci.production.estado = st.setTo;
  saveLaunches(); renderKanban();
}

// ══════════════════════════════════════════
// CENTRO DE PRODUCCIÓN (Módulo 9) — por pieza del calendario
// ══════════════════════════════════════════
const ESTADO_ICON = { pendiente:'', aprobado:'👍', grabando:'🎥', editando:'✂️', programado:'🗓️', publicado:'✅' };
let prodCtx = { launchId: null, itemId: null };
let prodActiveTab = 'brief';

function prodItem() {
  const l = launches.find(x => x.id === prodCtx.launchId);
  if (!l) return null;
  return (l.cal || []).find(c => c.id === prodCtx.itemId) || null;
}
function ensureProduction(ci) {
  const p = ci.production = ci.production || {};
  p.estado = p.estado || 'pendiente';
  p.responsable = p.responsable || '';
  p.objetivo = p.objetivo || '';
  p.hook = p.hook || '';
  p.descripcion = p.descripcion || '';
  p.plataforma = p.plataforma || '';
  p.guion = Array.isArray(p.guion) ? p.guion : [];
  p.shots = Array.isArray(p.shots) ? p.shots : [];
  p.assets = Array.isArray(p.assets) ? p.assets : [];
  p.content = (p.content && typeof p.content === 'object') ? p.content : null;
  return p;
}
function openProduction(launchId, itemId) {
  prodCtx = { launchId, itemId };
  const ci = prodItem(); if (!ci) return;
  ensureProduction(ci);
  prodActiveTab = 'brief';
  document.getElementById('prod-title').value = s(ci.title);
  document.getElementById('prod-estado').value = ci.production.estado;
  const badge = document.getElementById('prod-cat');
  const col = catColor(ci.cat);
  badge.style.cssText = `margin:0;font-size:9px;padding:3px 9px;border-radius:2px;font-family:var(--font-mono);background:${col}22;color:${col};border:1px solid ${col}44`;
  badge.textContent = up(ci.cat || 'pieza');
  document.querySelectorAll('#prod-modal .boxdrop-tab').forEach(t => t.classList.toggle('active', t.dataset.ptab === 'brief'));
  renderProd();
  document.getElementById('prod-modal').classList.add('open');
}
function closeProd(e) { if (e.target === document.getElementById('prod-modal')) closeProdDirect(); }
function closeProdDirect() {
  document.getElementById('prod-modal').classList.remove('open');
  if (((document.querySelector('.page.active') || {}).id) === 'page-calendario') renderCalendar();
}
function prodTab(name, el) {
  prodActiveTab = name;
  document.querySelectorAll('#prod-modal .boxdrop-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderProd();
}
function prodSet(field, val) {
  const ci = prodItem(); if (!ci) return;
  if (field === 'title') ci.title = val;
  else ensureProduction(ci)[field] = val;
  saveLaunches();
  if (((document.querySelector('.page.active') || {}).id) === 'page-calendario') renderCalendar();
}
function prodSetFecha(val) {
  const ci = prodItem(); if (!ci) return;
  ci.fecha = val; saveLaunches();
  if (((document.querySelector('.page.active') || {}).id) === 'page-calendario') renderCalendar();
}
function renderProd() {
  const ci = prodItem(); const body = document.getElementById('prod-body'); if (!ci || !body) return;
  const p = ensureProduction(ci);
  if (prodActiveTab === 'brief') body.innerHTML = prodBriefHTML(ci, p);
  else if (prodActiveTab === 'guion') body.innerHTML = prodGuionHTML(p);
  else if (prodActiveTab === 'shots') body.innerHTML = prodShotsHTML(p);
  else if (prodActiveTab === 'content') body.innerHTML = prodContentHTML(ci, p);
  else body.innerHTML = prodAssetsHTML(ci, p);
}
function prodBriefHTML(ci, p) {
  const art = activeArtist();
  const team = (art && art.team) || [];
  const teamOpts = `<option value="">— Sin asignar —</option>` + team.map(m => `<option value="${s(m.name)}" ${p.responsable === m.name ? 'selected' : ''}>${s(m.name)}${m.role ? ' · ' + s(m.role) : ''}</option>`).join('');
  return `
    <div class="field-grid" style="margin-bottom:16px">
      <div class="field"><label>Objetivo</label><input class="input" value="${s(p.objetivo)}" onchange="prodSet('objetivo',this.value)" placeholder="¿Qué busca esta pieza?"></div>
      <div class="field"><label>Plataforma / formato</label><input class="input" value="${s(p.plataforma)}" onchange="prodSet('plataforma',this.value)" placeholder="TikTok · 9:16 · 15s"></div>
      <div class="field"><label>Responsable</label><select class="input" onchange="prodSet('responsable',this.value)">${teamOpts}</select></div>
      <div class="field"><label>Fecha</label><input type="date" class="input" value="${s(ci.fecha)}" onchange="prodSetFecha(this.value)"></div>
    </div>
    <div class="field" style="margin-bottom:16px"><label>Hook</label><input class="input" value="${s(p.hook)}" onchange="prodSet('hook',this.value)" placeholder="El gancho de los primeros segundos"></div>
    <div class="field"><label>Descripción / Brief</label><textarea class="textarea" onchange="prodSet('descripcion',this.value)" placeholder="Qué se graba, cómo, tono…">${s(p.descripcion)}</textarea></div>
    ${ci.refLink ? `<div style="margin-top:14px"><a href="${s(ci.refLink)}" target="_blank" style="font-size:11px;color:var(--accent);font-family:var(--font-mono);text-decoration:none">↗ Referencia de inspiración</a></div>` : ''}`;
}
function prodGuionHTML(p) {
  const blocks = p.guion.map((b, i) => `
    <div class="script-block">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input class="input" style="font-family:var(--font-mono);font-size:11px;color:var(--accent)" value="${s(b.time)}" onchange="prodGuionSet(${i},'time',this.value)" placeholder="00:00 – 00:03 · HOOK">
        <button class="goal-btn reject" onclick="prodGuionDel(${i})" title="Quitar">✕</button>
      </div>
      <textarea class="textarea" onchange="prodGuionSet(${i},'text',this.value)" placeholder="Qué pasa / qué se dice">${s(b.text)}</textarea>
      <input class="input" style="margin-top:8px;font-size:11px" value="${s(b.note)}" onchange="prodGuionSet(${i},'note',this.value)" placeholder="Nota (audio, tono, texto en pantalla…)">
    </div>`).join('');
  return `${blocks || '<div class="empty-hint">Sin guión. Agrega bloques por tiempo (hook, desarrollo, clímax, CTA).</div>'}<button class="btn btn-ghost" style="margin-top:6px" onclick="prodGuionAdd()">+ Bloque</button>`;
}
function prodGuionAdd() { ensureProduction(prodItem()).guion.push({ time:'', text:'', note:'' }); saveLaunches(); renderProd(); }
function prodGuionDel(i) { ensureProduction(prodItem()).guion.splice(i, 1); saveLaunches(); renderProd(); }
function prodGuionSet(i, k, v) { ensureProduction(prodItem()).guion[i][k] = v; saveLaunches(); }
function prodShotsHTML(p) {
  const shots = p.shots.map((sh, i) => `
    <div class="shot-item">
      <div class="shot-num">${String(i+1).padStart(2,'0')}</div>
      <div class="shot-content">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
          <input class="input" value="${s(sh.name)}" onchange="prodShotSet(${i},'name',this.value)" placeholder="Nombre del plano">
          <button class="goal-btn reject" onclick="prodShotDel(${i})" title="Quitar">✕</button>
        </div>
        <textarea class="textarea" style="min-height:50px" onchange="prodShotSet(${i},'detail',this.value)" placeholder="Encuadre, iluminación, duración…">${s(sh.detail)}</textarea>
      </div>
    </div>`).join('');
  return `${shots || '<div class="empty-hint">Sin shot list. Agrega los planos a grabar.</div>'}<button class="btn btn-ghost" style="margin-top:10px" onclick="prodShotAdd()">+ Plano</button>`;
}
function prodShotAdd() { ensureProduction(prodItem()).shots.push({ name:'', detail:'' }); saveLaunches(); renderProd(); }
function prodShotDel(i) { ensureProduction(prodItem()).shots.splice(i, 1); saveLaunches(); renderProd(); }
function prodShotSet(i, k, v) { ensureProduction(prodItem()).shots[i][k] = v; saveLaunches(); }
function prodAssetsHTML(ci, p) {
  const assets = p.assets.map((as, i) => `
    <div class="metric-entry-row" style="grid-template-columns:1fr 1.5fr 32px">
      <input class="input" value="${s(as.label)}" onchange="prodAssetSet(${i},'label',this.value)" placeholder="Etiqueta (Foto portada, B-roll…)">
      <input class="input" value="${s(as.link)}" onchange="prodAssetSet(${i},'link',this.value)" placeholder="Link (Drive, Dropbox, archivo…)">
      <button class="goal-btn reject" onclick="prodAssetDel(${i})" title="Quitar">✕</button>
    </div>`).join('');
  return `<div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;line-height:1.5">Enlaces a fotos, videos y archivos de la pieza (Drive, Dropbox, etc.).</div>
    ${assets || '<div class="empty-hint">Sin assets todavía.</div>'}
    <button class="btn btn-ghost" style="margin-top:6px" onclick="prodAssetAdd()">+ Asset</button>`;
}
function prodAssetAdd() { ensureProduction(prodItem()).assets.push({ label:'', link:'' }); saveLaunches(); renderProd(); }
function prodAssetDel(i) { ensureProduction(prodItem()).assets.splice(i, 1); saveLaunches(); renderProd(); }
function prodAssetSet(i, k, v) { ensureProduction(prodItem()).assets[i][k] = v; saveLaunches(); }

// ── FASE 1: Generador de contenido real con IA ──
function buildContentPrompt(ci) {
  const l = launches.find(x => x.id === prodCtx.launchId) || activeLaunch() || {};
  const art = (artists.find(a => a.id === l.artistId)) || activeArtist() || {};
  const adn = art.adn || {}; const d = l.dna || {}; const p = ci.production || {};
  return contentPromptText({
    name: art.name, genre: art.genre, country: art.country,
    tone: (adn.personality || {}).tone, audience: (adn.audience || {}).ideal,
    launch: l.name, about: d.about, emotion: d.emotion, message: d.message, keywords: d.keywords,
    title: ci.title, cat: ci.cat, hook: p.hook || ci.hook, brief: p.descripcion || ci.comentarios,
  });
}
function buildContentPromptFromRef(r, l, art) {
  const adn = (art && art.adn) || {}; const d = (l && l.dna) || {};
  return contentPromptText({
    name: art && art.name, genre: art && art.genre, country: art && art.country,
    tone: (adn.personality || {}).tone, audience: (adn.audience || {}).ideal,
    launch: l && l.name, about: d.about, emotion: d.emotion, message: d.message, keywords: d.keywords,
    title: r.title, cat: (r.cat || [])[0], hook: r.hook, brief: r.comentarios,
  });
}
function contentPromptText(x) {
  return `Eres copywriter y creador de contenido musical para redes (TikTok/Reels/Shorts). Genera el contenido para UNA pieza, alineado al ADN del artista y a la campaña.

ARTISTA: ${s(x.name)} · Género: ${s(x.genre)} · País: ${s(x.country)}
Tono de comunicación: ${s(x.tone)} · Audiencia ideal: ${s(x.audience)}
CAMPAÑA (${s(x.launch)}): Concepto: ${s(x.about)} · Emoción: ${s(x.emotion)} · Mensaje: ${s(x.message)} · Keywords: ${s(x.keywords)}
PIEZA: ${s(x.title)} · Categoría: ${s(x.cat)} · Hook de referencia: ${s(x.hook)} · Brief: ${s(x.brief)}

Devuelve SOLO un objeto JSON válido (sin texto extra), en español, con esta forma exacta:
{
 "hook": "gancho hablado para los primeros 3 segundos, 1 frase potente",
 "script": "guión de 30-60s con estructura HOOK / DESARROLLO / CTA, con marcas de tiempo y saltos de línea (\\n)",
 "caption_ig": "caption para Instagram (hasta ~120 palabras, con saltos de línea y 1-2 emojis)",
 "caption_tiktok": "caption para TikTok, corto y directo (1-2 líneas)",
 "story": "texto para una story con CTA claro (1-2 líneas)",
 "hashtags": ["10 a 15 hashtags relevantes por género y país, sin espacios, sin repetir"]
}`;
}
function prodContentHTML(ci, p) {
  const c = p.content;
  const promptStr = buildContentPrompt(ci);
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
      <button class="btn btn-ghost" style="border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarContenidoIA()">✨ ${c ? 'Regenerar' : 'Generar'} contenido</button>
      ${c && c.at ? `<span style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim)">generado ${new Date(c.at).toLocaleString()}</span>` : ''}
    </div>
    ${aiHintHTML(promptStr, 1000)}
    <div id="prod-content-result" style="margin-top:14px">${c ? contentResultHTML(c) : '<div class="empty-hint">Aún no hay contenido. Genera caption, script y hashtags a partir del ADN del artista + el Campaign DNA + esta pieza.</div>'}</div>`;
}
async function generarContenidoIA() {
  const ci = prodItem(); if (!ci) return;
  if (!aiReady()) { abrirAISettings(); return; }
  const res = document.getElementById('prod-content-result');
  res.innerHTML = '<div class="empty-hint">✨ Generando contenido…</div>';
  try {
    const { text } = await callClaude(buildContentPrompt(ci), 1600);
    const obj = parseJSONObj(text);
    if (!obj) throw new Error('La IA no devolvió contenido en formato válido.');
    obj.at = Date.now();
    ensureProduction(ci).content = obj;
    saveLaunches();
    renderProd();
  } catch (e) {
    res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)} — revisa ⚙ API.</div>`;
  }
}

// Render compartido (producción y banco)
let viewContent = null;
function contentResultHTML(c) {
  viewContent = c;
  const tags = (c.hashtags || []);
  return `<div class="content-result">
    <div class="ctabs">
      <span class="ctab active" data-ctab="caption" onclick="contentTab('caption',this)">Caption</span>
      <span class="ctab" data-ctab="script" onclick="contentTab('script',this)">Script</span>
      <span class="ctab" data-ctab="hashtags" onclick="contentTab('hashtags',this)">Hashtags</span>
    </div>
    <div data-cpane="caption">
      ${contentBlock('Hook (primeros 3s)', 'hook')}
      ${contentBlock('Caption · Instagram', 'caption_ig')}
      ${contentBlock('Caption · TikTok', 'caption_tiktok')}
      ${contentBlock('Story', 'story')}
    </div>
    <div data-cpane="script" style="display:none">
      ${contentBlock('Guión 30–60s', 'script', true)}
    </div>
    <div data-cpane="hashtags" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div class="brief-label" style="margin:0">Hashtags (${tags.length})</div><button class="btn btn-ghost" style="padding:3px 10px;font-size:10px" onclick="copyContent('hashtags',this)">Copiar todos</button></div>
      <div class="brief-tags">${tags.map(h => `<span class="brief-tag accent">${s(h).startsWith('#') ? s(h) : '#' + s(h)}</span>`).join('') || '—'}</div>
    </div>
  </div>`;
}
function contentBlock(label, key, pre) {
  const v = s(viewContent ? viewContent[key] : '');
  return `<div style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div class="brief-label" style="margin:0">${label}</div><button class="btn btn-ghost" style="padding:3px 10px;font-size:10px" onclick="copyContent('${key}',this)">Copiar</button></div>
    <div class="brief-value" style="background:var(--surface2);padding:12px;border-radius:6px;white-space:pre-wrap;line-height:1.6;font-size:${pre ? '12px' : '13px'}">${v || '—'}</div>
  </div>`;
}
function contentTab(name, el) {
  const wrap = el.closest('.content-result'); if (!wrap) return;
  wrap.querySelectorAll('[data-cpane]').forEach(p => p.style.display = p.dataset.cpane === name ? '' : 'none');
  wrap.querySelectorAll('.ctab').forEach(t => t.classList.toggle('active', t.dataset.ctab === name));
}
function copyContent(key, btn) {
  if (!viewContent) return;
  const v = key === 'hashtags' ? (viewContent.hashtags || []).map(h => s(h).startsWith('#') ? s(h) : '#' + s(h)).join(' ') : s(viewContent[key]);
  if (navigator.clipboard) navigator.clipboard.writeText(v);
  if (btn) { const t = btn.textContent; btn.textContent = '✓ Copiado'; setTimeout(() => { btn.textContent = t; }, 1200); }
}
// Banco: generación transitoria desde una referencia
async function generarContenidoBanco(idx) {
  if (!aiReady()) { abrirAISettings(); return; }
  const r = referencias[idx]; if (!r) return;
  const a = activeLaunch(); const art = activeArtist() || {};
  const res = document.getElementById('bd-content-result');
  res.innerHTML = '<div class="empty-hint">✨ Generando contenido…</div>';
  try {
    const { text } = await callClaude(buildContentPromptFromRef(r, a, art), 1600);
    const obj = parseJSONObj(text);
    if (!obj) throw new Error('La IA no devolvió contenido válido.');
    res.innerHTML = contentResultHTML(obj);
  } catch (e) {
    res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)} — revisa ⚙ API.</div>`;
  }
}

// ══════════════════════════════════════════
// FASE 2: POW — Plan de la Semana
// ══════════════════════════════════════════
let powRecommendation = null;
function weekBounds(offset) {
  const d = new Date(); d.setHours(0,0,0,0);
  const dow = (d.getDay() + 6) % 7;
  const mon = new Date(d); mon.setDate(d.getDate() - dow + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { mon, sun };
}
function inWeek(iso, wb) { const t = new Date(iso + 'T00:00:00'); return t >= wb.mon && t <= wb.sun; }
function powData() {
  const a = activeLaunch(); const art = activeArtist() || {};
  const last = weekBounds(-1), now = weekBounds(0);
  const items = (a && a.cal) || [];
  const lastWeekItems = items.filter(c => inWeek(c.fecha, last));
  const lastPublished = lastWeekItems.filter(c => (c.production && c.production.estado) === 'publicado');
  const thisWeekItems = items.filter(c => inWeek(c.fecha, now));
  const pending = thisWeekItems.filter(c => (c.production && c.production.estado) !== 'publicado').sort((x,y) => x.fecha < y.fecha ? -1 : 1);
  const metrics = latestEntries(a ? a.metricEntries : []).slice(0, 3);
  return { a, art, last, now, lastWeekItems, lastPublished, thisWeekItems, pending, metrics };
}
function powDM(iso) { const x = new Date(iso + 'T00:00:00'); return `${x.getDate()}/${x.getMonth()+1}`; }
function powDMd(d) { return `${d.getDate()}/${d.getMonth()+1}`; }
function powRecPrompt(d) {
  const m = d.metrics.map(x => `${x.metric} ${fmtNum(x.value)}`).join(', ') || 'sin métricas';
  return `Eres director de estrategia musical. En 2-3 frases, recomienda qué priorizar ESTA semana para la campaña y por qué.

ARTISTA: ${s(d.art.name)} · CAMPAÑA: ${s(d.a && d.a.name)}
Semana pasada: ${d.lastPublished.length}/${d.lastWeekItems.length} piezas publicadas.
Pendientes esta semana: ${d.pending.map(c => c.title).join('; ') || 'ninguna'}.
Métricas: ${m}.

Devuelve SOLO el texto de la recomendación (sin JSON), empezando por la acción a priorizar.`;
}
function openPOW() { powRecommendation = null; renderPOW(); document.getElementById('pow-modal').classList.add('open'); }
function closePOW(e) { if (e.target === document.getElementById('pow-modal')) closePOWDirect(); }
function closePOWDirect() { document.getElementById('pow-modal').classList.remove('open'); }
function renderPOW() {
  const d = powData(); const body = document.getElementById('pow-body');
  if (!d.a) { body.innerHTML = '<div class="empty-hint" style="margin:0">Selecciona un lanzamiento con calendario para generar el POW.</div>'; return; }
  const hit = d.lastWeekItems.length ? Math.round(d.lastPublished.length / d.lastWeekItems.length * 100) : 0;
  body.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:1px;margin-bottom:18px">${up(d.art.name)} · ${up(d.a.name)} · SEMANA DEL ${powDMd(d.now.mon)} AL ${powDMd(d.now.sun)}</div>

    <div class="pow-section">
      <h4>✅ Semana pasada · hit rate ${hit}%</h4>
      <div style="font-size:13px;margin-bottom:8px">${d.lastPublished.length} de ${d.lastWeekItems.length} piezas publicadas.</div>
      <div class="progress-track"><div class="progress-fill" style="width:${hit}%"></div></div>
    </div>

    <div class="pow-section">
      <h4>📅 Esta semana · ${d.pending.length} pendiente${d.pending.length===1?'':'s'}</h4>
      ${d.pending.length ? d.pending.map(c => `<div class="pow-row"><span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);width:48px">${powDM(c.fecha)}</span><span style="flex:1">${ESTADO_ICON[(c.production&&c.production.estado)||'pendiente']||''} ${s(c.title)}</span><span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${(c.production&&c.production.estado)||'pendiente'}</span></div>`).join('') : '<div style="font-size:12px;color:var(--text-dim)">Sin piezas pendientes esta semana.</div>'}
    </div>

    <div class="pow-section">
      <h4>📊 Métricas top — ${s(d.a.name)}</h4>
      ${d.metrics.length ? `<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);gap:10px">${d.metrics.map(m => `<div class="stat-card" style="padding:14px"><div class="stat-label">${s(m.metric)}</div><div class="stat-value" style="font-size:24px">${fmtNum(m.value)}</div></div>`).join('')}</div>` : '<div style="font-size:12px;color:var(--text-dim)">Sin métricas cargadas (impórtalas en Métricas).</div>'}
    </div>

    <div class="pow-section" style="margin-bottom:0">
      <h4>💡 Recomendación IA</h4>
      <div id="pow-rec">${powRecommendation
        ? `<div class="brief-value" style="background:var(--surface2);padding:12px;border-radius:6px;line-height:1.6">${s(powRecommendation)}</div>`
        : `<button class="btn btn-ghost" style="border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarPOWRecomendacion()">✨ Generar recomendación</button>${aiHintHTML(powRecPrompt(d), 300)}`}</div>
    </div>`;
}
async function generarPOWRecomendacion() {
  if (!aiReady()) { abrirAISettings(); return; }
  const d = powData(); const rec = document.getElementById('pow-rec');
  rec.innerHTML = '<div class="empty-hint">✨ Generando recomendación…</div>';
  try {
    const { text } = await callClaude(powRecPrompt(d), 400);
    powRecommendation = s(text).trim();
    renderPOW();
  } catch (e) { rec.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)} — revisa ⚙ API.</div>`; }
}
function powText() {
  const d = powData(); if (!d.a) return '';
  const hit = d.lastWeekItems.length ? Math.round(d.lastPublished.length / d.lastWeekItems.length * 100) : 0;
  let t = `📋 PLAN DE LA SEMANA — ${d.art.name} / ${d.a.name}\n(semana del ${powDMd(d.now.mon)} al ${powDMd(d.now.sun)})\n\n`;
  t += `✅ Semana pasada: ${d.lastPublished.length}/${d.lastWeekItems.length} publicadas (${hit}% hit rate)\n\n`;
  t += `📅 Esta semana — ${d.pending.length} pendientes:\n`;
  t += d.pending.length ? d.pending.map(c => `• ${c.title} — ${powDM(c.fecha)} (${(c.production && c.production.estado) || 'pendiente'})`).join('\n') : '• Sin pendientes';
  if (d.metrics.length) t += `\n\n📊 Métricas top:\n` + d.metrics.map(m => `• ${m.metric}: ${fmtNum(m.value)}`).join('\n');
  if (powRecommendation) t += `\n\n💡 ${powRecommendation}`;
  return t;
}
function copyPOW(btn) {
  const t = powText();
  if (navigator.clipboard) navigator.clipboard.writeText(t);
  if (btn) { const o = btn.textContent; btn.textContent = '✓ Copiado'; setTimeout(() => { btn.textContent = o; }, 1200); }
}
function ensureJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) return resolve();
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    sc.onload = () => resolve(); sc.onerror = () => reject(new Error('No se pudo cargar jsPDF (¿sin internet?)'));
    document.head.appendChild(sc);
  });
}
async function powPDF() {
  const d = powData(); if (!d.a) { uiAlert('Selecciona un lanzamiento.'); return; }
  try { await ensureJsPDF(); } catch (e) { uiAlert('No se pudo cargar el generador de PDF (¿sin internet?). Usa "Copiar (WhatsApp)" como alternativa.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(); let y = 120;
  const pline = (txt, size, rgb, gap) => {
    doc.setFontSize(size); doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    const lines = doc.splitTextToSize(txt, W - 80); doc.text(lines, 40, y); y += lines.length * (size * 1.25) + gap;
  };
  doc.setFillColor(10,10,10); doc.rect(0, 0, W, 92, 'F');
  doc.setTextColor(255,107,48); doc.setFontSize(22); doc.text('Tempo OS', 40, 42);
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.text('Plan de la Semana', 40, 64);
  doc.setTextColor(160,160,160); doc.setFontSize(10); doc.text(`${d.art.name}  ·  ${d.a.name}  ·  ${powDMd(d.now.mon)}-${powDMd(d.now.sun)}`, 40, 82);
  const hit = d.lastWeekItems.length ? Math.round(d.lastPublished.length / d.lastWeekItems.length * 100) : 0;
  pline('Semana pasada', 14, [0,0,0], 4);
  pline(`${d.lastPublished.length} de ${d.lastWeekItems.length} piezas publicadas - hit rate ${hit}%`, 11, [80,80,80], 16);
  pline('Esta semana - pendientes', 14, [0,0,0], 6);
  if (d.pending.length) d.pending.forEach(c => pline(`-  ${c.title}  (${powDM(c.fecha)} - ${(c.production && c.production.estado) || 'pendiente'})`, 11, [80,80,80], 3));
  else pline('Sin pendientes.', 11, [80,80,80], 3);
  y += 10;
  pline('Metricas top', 14, [0,0,0], 6);
  if (d.metrics.length) d.metrics.forEach(m => pline(`-  ${m.metric}: ${fmtNum(m.value)}`, 11, [80,80,80], 3));
  else pline('Sin metricas.', 11, [80,80,80], 3);
  if (powRecommendation) { y += 10; pline('Recomendacion IA', 14, [0,0,0], 6); pline(powRecommendation, 11, [80,80,80], 4); }
  doc.save(`POW-${s(d.art.name)}-${todayISO()}.pdf`.replace(/\s+/g, '_'));
}

// ══════════════════════════════════════════
// OBJETIVOS SMART (scoped al lanzamiento activo)
// ══════════════════════════════════════════
function renderObjetivos() {
  const a = activeLaunch();
  document.getElementById('ctx-objetivos').innerHTML = launchContextHTML();
  document.getElementById('objetivos-title').textContent = a ? `${up(a.name)} · METAS` : 'METAS';
  const hint = document.getElementById('obj-aihint');
  if (hint) hint.innerHTML = a ? aiHintHTML(buildGoalsPrompt(a), 600) : '';
  const host = document.getElementById('objetivos-list');
  const art = activeArtist();
  if (!a) { host.innerHTML = ''; return; }
  if (!a.goals.length) {
    // Generar-una-vez: si hay info suficiente, IA lista y aún no se intentó → genera y guarda
    if (hasGoalInfo(a, art) && aiReady() && canDo('use_generador_ia') && !a.goalsAITried) {
      a.goalsAITried = true; saveLaunches();
      host.innerHTML = `<div class="empty-hint">✨ Generando sugerencias de metas con IA (según ADN, campaña e histórico)…</div>`;
      sugerirObjetivosIA(true);
      return;
    }
    if (!hasGoalInfo(a, art)) {
      host.innerHTML = `<div class="empty-hint">No hay suficiente información para sugerir metas todavía.<br>
        <span style="color:var(--text-muted)">Agrégalas con <b>“+ Meta manual”</b>, o completa el <b>ADN</b> del artista y los datos del lanzamiento (fecha, campaña). Tener métricas de lanzamientos anteriores también ayuda a que la IA proponga metas.</span></div>`;
    } else {
      host.innerHTML = `<div class="empty-hint">Aún no hay metas para “${s(a.name)}”. Usa <b>“✨ Sugerir con IA”</b> o <b>“+ Meta manual”</b>.</div>`;
    }
    return;
  }
  host.innerHTML = a.goals.map((g, i) => {
    const cls = g.status === 'accepted' ? ' accepted' : (g.status === 'rejected' ? ' rejected' : '');
    const accOn = g.status === 'accepted' ? ' on-accept' : '';
    const rejOn = g.status === 'rejected' ? ' on-reject' : '';
    const dl = g.deadline ? ` · 📅 ${g.deadline}` : '';
    const pr = goalProgress(a, g);
    let progHTML = '';
    if (pr.actual != null) {
      const pct = pr.pct, barW = pct == null ? 0 : Math.min(100, pct);
      const col = pct == null ? 'var(--text-dim)' : (pct >= 100 ? '#4ade80' : pct >= 60 ? 'var(--accent)' : 'var(--beat)');
      progHTML = `<div style="margin-top:6px;max-width:240px">
        <div style="height:5px;background:var(--surface2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${barW}%;background:${col};transition:width .3s"></div></div>
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);margin-top:3px">logrado ${fmtNum(pr.actual)}${pct != null ? ` · <span style="color:${col}">${pct}%</span>` : ' (objetivo relativo)'}</div></div>`;
    }
    return `<div class="goal-row${cls}">
      <div class="goal-platform" style="background:${g.bg || 'var(--surface2)'}">${s(g.icon)}</div>
      <div><div class="goal-metric">${s(g.metric)}</div><div class="goal-sub">${s(g.sub)}${dl}</div>${progHTML}</div>
      <div class="goal-target">${s(g.target)}<small>OBJETIVO</small></div>
      <div class="goal-ai">${s(g.ai || (g.source === 'manual' ? 'manual' : ''))}</div>
      <div class="goal-actions">
        <div class="goal-btn accept${accOn}" title="Aceptar" onclick="goalSetStatus(${i},'accepted')">✓</div>
        <div class="goal-btn reject${rejOn}" title="Quitar" onclick="goalSetStatus(${i},'rejected')">✕</div>
      </div>
    </div>`;
  }).join('');
}
function goalSetStatus(i, status) {
  const a = activeLaunch();
  if (!a || !a.goals[i]) return;
  a.goals[i].status = (a.goals[i].status === status) ? 'proposed' : status;
  saveLaunches(); renderObjetivos();
}
// ── Catálogo de plataformas/métricas POR ARTISTA (reutilizable) ──
const DEFAULT_METRIC_CATALOG = [
  { name: 'Spotify',   metrics: ['Streams', 'Oyentes mensuales', 'Seguidores', 'Saves'] },
  { name: 'YouTube',   metrics: ['Suscriptores', 'Reproducciones', 'Likes'] },
  { name: 'TikTok',    metrics: ['Seguidores', 'Likes', 'Reproducciones', 'Saves'] },
  { name: 'Instagram', metrics: ['Seguidores', 'Likes', 'Alcance', 'Saves', 'Reproducciones'] },
];
function artistCatalog(art) {
  if (!art) return DEFAULT_METRIC_CATALOG.map(p => ({ name: p.name, metrics: p.metrics.slice() }));
  if (!art.metricCatalog || !Array.isArray(art.metricCatalog.platforms) || !art.metricCatalog.platforms.length) {
    art.metricCatalog = { platforms: DEFAULT_METRIC_CATALOG.map(p => ({ name: p.name, metrics: p.metrics.slice() })) };
  }
  return art.metricCatalog.platforms;
}
// Fecha límite sugerida = cierre del lanzamiento (drop + días de post)
function launchEndDate(l) {
  if (!l || !l.date) return '';
  const d = new Date(l.date + 'T00:00:00'); d.setDate(d.getDate() + (l.postDays != null ? l.postDays : 21));
  return d.toISOString().slice(0, 10);
}
// ¿Hay suficiente info para sugerir metas con IA?
function hasGoalInfo(a, art) {
  const adn = (art && art.adn) || {};
  const adnFilled = !!((adn.sound && adn.sound.genres) || (adn.audience && adn.audience.ideal) || (adn.universe && adn.universe.themes) || (adn.personality && adn.personality.tone));
  const d = (a && a.dna) || {};
  const dnaFilled = !!(d.about || d.message || d.emotion);
  let hist = false;
  try { hist = (artistLaunches() || []).some(l => latestEntries(l.metricEntries).length); } catch (e) {}
  return adnFilled || dnaFilled || hist;
}
// ── Objetivos ↔ Métricas: el resultado real sale del módulo de Métricas ──
function parseTarget(str) {
  if (str == null) return null;
  const t = String(str).trim().replace(/^[+~≈]/, '').replace(/,/g, '').toLowerCase();
  const m = t.match(/^([\d.]+)\s*([km]?)/);
  if (!m) return null;
  let n = parseFloat(m[1]); if (isNaN(n)) return null;
  if (m[2] === 'k') n *= 1e3; else if (m[2] === 'm') n *= 1e6;
  return n;
}
function isRelativeTarget(str) { return /^[+]/.test(String(str || '').trim()); }
// Empareja la meta con la métrica importada (CSV/screenshot/manual) del lanzamiento
function goalProgress(l, g) {
  if (!l || !g || !g.metric) return { actual: null, pct: null };
  const entries = latestEntries(l.metricEntries || []);
  const gm = g.metric.toLowerCase(), gp = (g.platform || '').toLowerCase();
  const matchMetric = x => { const xm = (x.metric || '').toLowerCase(); return xm === gm || xm.includes(gm) || gm.includes(xm); };
  // Si la meta tiene plataforma, solo casa métricas de ESA plataforma (evita cruces, p.ej. Seguidores TikTok vs Instagram)
  let e;
  if (gp) e = entries.find(x => (x.platform || '').toLowerCase() === gp && matchMetric(x));
  else e = entries.find(x => (x.metric || '').toLowerCase() === gm) || entries.find(matchMetric);
  if (!e) return { actual: null, pct: null };
  const actual = Number(e.value);
  const tgt = parseTarget(g.target);
  const pct = (tgt && !isRelativeTarget(g.target)) ? Math.max(0, Math.round(actual / tgt * 100)) : null;
  return { actual, pct };
}
// Resumen objetivo-vs-logrado para alimentar IA Estratégica y Aprendizajes
function goalsVsActuals(art) {
  const lines = [];
  (artistLaunches() || []).forEach(l => {
    (l.goals || []).filter(g => g.status !== 'rejected').forEach(g => {
      const pr = goalProgress(l, g);
      const got = pr.actual != null ? fmtNum(pr.actual) : 'sin dato';
      const pc = pr.pct != null ? ` (${pr.pct}%${pr.pct >= 100 ? ' ✓ cumplida' : ''})` : '';
      lines.push(`- [${l.name}] ${g.platform || ''} ${g.metric}: objetivo ${g.target} · logrado ${got}${pc}`);
    });
  });
  return lines.join('\n') || '(sin metas registradas)';
}

// ── Generar reporte de lanzamiento (abre report.html con contexto precargado) ──
function abrirReporteLanzamiento(id) {
  const l = launches.find(x => x.id === id) || activeLaunch(); if (!l) return;
  if (!requireCan('use_generador_ia')) return; // staff o el artista de su propio lanzamiento
  const art = artists.find(a => a.id === l.artistId) || activeArtist() || {};
  const metrics = [];
  (l.goals || []).filter(g => g.status !== 'rejected').forEach(g => {
    const pr = goalProgress(l, g);
    metrics.push({ platform: g.platform || '', metric: g.metric, value: pr.actual != null ? fmtNum(pr.actual) : null, target: g.target, pct: pr.pct });
  });
  latestEntries(l.metricEntries || []).forEach(e => {
    if (!metrics.some(m => (m.metric || '').toLowerCase() === (e.metric || '').toLowerCase()))
      metrics.push({ platform: e.platform || '', metric: e.metric, value: fmtNum(e.value) });
  });
  const ctx = { label: _teamName || '', artist: art.name || '', project: l.name || '', teamId: _teamId || null, launchId: l.id, metrics };
  try { localStorage.setItem('ao_report_ctx', JSON.stringify(ctx)); } catch (e) {}
  const w = window.open('report.html', '_blank');
  if (!w) uiAlert('Permite las ventanas emergentes para abrir el reporte, o abre report.html manualmente.');
}

// ══════════════════════════════════════════
// DASHBOARD DEL LABEL (rendimiento por artista, para staff)
// ══════════════════════════════════════════
function artistPerformance(art) {
  const ls = launches.filter(l => l.artistId === art.id);
  const withGoals = ls.filter(l => (l.goals || []).some(g => g.status !== 'rejected'));
  const latest = withGoals.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]
    || ls.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0] || null;
  const pcts = []; let totalGoals = 0, met = 0;
  if (latest) {
    (latest.goals || []).filter(g => g.status !== 'rejected').forEach(g => {
      totalGoals++;
      const pr = goalProgress(latest, g);
      if (pr.pct != null) { const p = Math.min(100, pr.pct); pcts.push(p); if (p >= 100) met++; }
    });
  }
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const end = latest ? launchEndDate(latest) : '';
  const dleft = end ? diasRestantes(end) : null;
  let sig = '⚪', label = 'Sin métricas', rank = 2; // rank: 0=rojo(prioridad), 1=amarillo, 2=neutro, 3=verde
  if (avg != null) {
    if (avg >= 100) { sig = '🟢'; label = 'Meta cumplida'; rank = 3; }
    else if (avg >= 60) { sig = '🟡'; label = 'Cerca'; rank = 1; }
    else { sig = '🔴'; label = 'Necesita atención'; rank = 0; }
    if (avg < 100 && dleft != null && dleft < 0) { sig = '🔴'; label = 'Atrasado'; rank = 0; }
  }
  return { latest, avg, totalGoals, met, end, dleft, sig, label, rank, measured: pcts.length };
}
function updateLabelNav() {
  const el = document.getElementById('nav-label'); if (!el) return;
  // Visible para staff cuando hay 2+ artistas; oculto para el artista restringido.
  el.style.display = (artists.length >= 2 && !_restrictedArtist) ? '' : 'none';
}
function renderLabel() {
  const statsHost = document.getElementById('label-stats');
  const listHost = document.getElementById('label-list');
  if (!artists.length) { statsHost.innerHTML = ''; listHost.innerHTML = '<div class="empty-hint">No hay artistas en este equipo todavía.</div>'; return; }
  const perf = artists.map(a => ({ art: a, p: artistPerformance(a) }));
  perf.sort((x, y) => (x.p.rank - y.p.rank) || ((x.p.avg == null ? 999 : x.p.avg) - (y.p.avg == null ? 999 : y.p.avg)));
  const need = perf.filter(x => x.p.rank === 0).length;
  const onTrack = perf.filter(x => x.p.rank === 3).length;
  const card = (label, val, sub) => `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${val}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
  statsHost.innerHTML = card('Artistas', artists.length, '') + card('Necesitan atención', need, need ? '🔴 priorízalos' : 'todo en orden') + card('Cumpliendo metas', onTrack, '🟢');
  listHost.innerHTML = perf.map(({ art, p }) => {
    const col = p.rank === 0 ? 'var(--accent2)' : p.rank === 1 ? 'var(--beat)' : p.rank === 3 ? '#4ade80' : 'var(--text-dim)';
    const launchInfo = p.latest ? `${s(p.latest.name)} · ${(STATUS_MAP[p.latest.status] || {}).tag || p.latest.status}` : 'sin lanzamientos';
    const cierre = p.end ? `${p.end}${p.dleft != null ? ` (${p.dleft >= 0 ? 'en ' + p.dleft + 'd' : Math.abs(p.dleft) + 'd atrás'})` : ''}` : '—';
    const bar = p.avg != null ? `<div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;max-width:180px;margin-top:6px"><div style="height:100%;width:${Math.min(100, p.avg)}%;background:${col}"></div></div>` : '';
    return `<div onclick="setActiveArtist('${art.id}');showPage('objetivos')" style="cursor:pointer;border:1px solid var(--border);border-left:3px solid ${col};border-radius:10px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <div class="artist-avatar" style="width:40px;height:40px;font-size:15px">${up(art.name).slice(0, 1)}</div>
      <div style="flex:1;min-width:160px">
        <div style="font-size:15px;font-weight:600">${p.sig} ${s(art.name)}</div>
        <div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-top:2px">${launchInfo} · cierre ${cierre}</div>
        ${bar}
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-display);font-size:26px;color:${col}">${p.avg != null ? p.avg + '%' : '—'}</div>
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${s(p.label)}${p.totalGoals ? ` · ${p.met}/${p.totalGoals} metas` : ''}</div>
      </div>
    </div>`;
  }).join('');
}

// ── Meta manual GUIADA (plataforma → métrica → objetivo → fecha) ──
let _metaSel = { platform: null, metric: null };
function agregarMetaManual() {
  const a = activeLaunch();
  if (!a) { uiAlert('Primero crea o selecciona un lanzamiento para agregarle metas.'); return; }
  if (!requireCan('edit_launch')) return;
  const cats = artistCatalog(activeArtist());
  _metaSel = { platform: (cats[0] || {}).name || null, metric: null };
  renderMetaModal();
  document.getElementById('modal-goal').classList.add('open');
}
function cerrarMetaModal(e) { if (!e || e.target === document.getElementById('modal-goal')) document.getElementById('modal-goal').classList.remove('open'); }
function renderMetaModal() {
  const art = activeArtist(), a = activeLaunch();
  const cats = artistCatalog(art);
  const cur = cats.find(p => p.name === _metaSel.platform) || cats[0] || { metrics: [] };
  const platOpts = cats.map(p => `<option ${p.name === _metaSel.platform ? 'selected' : ''}>${s(p.name)}</option>`).join('') + '<option value="__add">➕ otra plataforma…</option>';
  const metricOpts = (cur.metrics || []).map(m => `<option ${m === _metaSel.metric ? 'selected' : ''}>${s(m)}</option>`).join('') + '<option value="__add">➕ otra métrica…</option>';
  document.getElementById('goal-body').innerHTML = `
    <div class="field" style="margin-bottom:12px"><label>Plataforma</label>
      <select class="input" id="meta-plat" onchange="metaPlatChange(this.value)">${platOpts}</select></div>
    <div class="field" style="margin-bottom:12px"><label>Métrica</label>
      <select class="input" id="meta-metric" onchange="metaMetricChange(this.value)">${metricOpts}</select></div>
    <div class="field" style="margin-bottom:12px"><label>Objetivo</label>
      <input class="input" id="meta-target" placeholder="ej. 100K, +5K, 2M" value="${s(_metaSel.target || '')}"></div>
    <div class="field"><label>Fecha límite <span style="color:var(--text-dim);font-weight:400;font-size:10px">· sugerida: cierre del lanzamiento (editable)</span></label>
      <input class="input" id="meta-deadline" type="date" value="${launchEndDate(a)}"></div>
    <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="guardarMetaManual()">Agregar meta</button>`;
}
async function metaPlatChange(v) {
  _metaSel.target = (document.getElementById('meta-target') || {}).value || '';
  if (v === '__add') {
    const name = (await uiPrompt('Nombre de la plataforma:', { title: 'Nueva plataforma' }) || '').trim();
    if (name) { const cats = artistCatalog(activeArtist()); if (!cats.find(p => p.name.toLowerCase() === name.toLowerCase())) { cats.push({ name, metrics: [] }); saveArtists(); } _metaSel.platform = name; }
    _metaSel.metric = null; renderMetaModal(); return;
  }
  _metaSel.platform = v; _metaSel.metric = null; renderMetaModal();
}
async function metaMetricChange(v) {
  _metaSel.target = (document.getElementById('meta-target') || {}).value || '';
  if (v === '__add') {
    const m = (await uiPrompt('Nombre de la métrica:', { title: 'Nueva métrica' }) || '').trim();
    if (m) { const p = artistCatalog(activeArtist()).find(x => x.name === _metaSel.platform); if (p && !p.metrics.find(x => x.toLowerCase() === m.toLowerCase())) { p.metrics.push(m); saveArtists(); } _metaSel.metric = m; }
    renderMetaModal(); return;
  }
  _metaSel.metric = v;
}
function guardarMetaManual() {
  const a = activeLaunch(); if (!a) return;
  const plat = document.getElementById('meta-plat').value;
  const metric = document.getElementById('meta-metric').value;
  if (plat === '__add' || metric === '__add') { uiAlert('Elige una plataforma y una métrica.'); return; }
  const target = (document.getElementById('meta-target').value || '').trim();
  if (!target) { uiAlert('Escribe el objetivo (el número a alcanzar).'); return; }
  const deadline = document.getElementById('meta-deadline').value || '';
  const ic = platIcon(plat);
  a.goals.push({ icon: ic[0], bg: ic[1], platform: plat, metric, sub: plat, target, deadline, ai: '', status: 'accepted', source: 'manual' });
  saveLaunches(); renderObjetivos();
  document.getElementById('modal-goal').classList.remove('open');
  uiToast('✓ Meta agregada');
}
const PLAT_ICON = { spotify:['🎧','rgba(74,222,128,0.12)'], tiktok:['📱','rgba(255,0,80,0.12)'], instagram:['📷','rgba(225,48,108,0.12)'], youtube:['▶','rgba(255,0,0,0.12)'], apple:['🍎','rgba(255,255,255,0.08)'] };
function platIcon(p) {
  const key = Object.keys(PLAT_ICON).find(k => s(p).toLowerCase().includes(k));
  return PLAT_ICON[key] || ['🎯','rgba(255,107,48,0.12)'];
}
function buildGoalsPrompt(a) {
  const art = activeArtist() || {}; const adn = art.adn || {}; const d = a.dna || {};
  const hist = (artistLaunches() || []).filter(l => latestEntries(l.metricEntries).length)
    .map(l => `- ${l.name}: ${latestEntries(l.metricEntries).map(e => `${e.metric} ${fmtNum(e.value)}`).join(', ')}`).join('\n') || '(sin histórico de métricas)';
  return `Eres analista de marketing musical. Propón objetivos SMART (metas medibles) para la campaña de una canción.

ARTISTA: ${s(art.name)} · Géneros: ${s((adn.sound||{}).genres)} · Audiencia: ${s((adn.audience||{}).ideal)}
CAMPAÑA (${s(a.name)}): ${s(d.about)} · Mensaje: ${s(d.message)}
Plataforma principal: ${s((a.content||{}).platform)} · Pre/Post: ${a.preDays}/${a.postDays} días
HISTÓRICO DE LANZAMIENTOS DEL ARTISTA:
${hist}

Devuelve SOLO un array JSON (4-6 objetos), sin texto extra:
{"platform":"Spotify|TikTok|Instagram|YouTube","metric":"nombre de la métrica","sub":"ventana de tiempo","target":"valor objetivo (ej. 150K, +5K, 2M)"}`;
}
async function sugerirObjetivosIA(auto) {
  const a = activeLaunch(); if (!a) return;
  a.goalsAITried = true;
  if (!aiReady()) { if (!auto) abrirAISettings(); else renderObjetivos(); return; }
  if (!auto && !requireCan('use_generador_ia')) return;
  const host = document.getElementById('objetivos-list');
  host.insertAdjacentHTML('afterbegin', '<div id="obj-loading" class="empty-hint" style="margin-bottom:10px">✨ Proponiendo objetivos con IA…</div>');
  try {
    const { text } = await callClaude(buildGoalsPrompt(a), 800, 'objetivos');
    const arr = parseJSONArray(text);
    if (!arr.length) throw new Error('La IA no devolvió objetivos válidos.');
    // Regenerar: quitar metas IA previas, conservar las manuales
    a.goals = (a.goals || []).filter(g => g.source === 'manual');
    const end = launchEndDate(a);
    arr.forEach(g => {
      const ic = platIcon(g.platform);
      a.goals.push({ icon: ic[0], bg: ic[1], platform: s(g.platform), metric: s(g.metric) || 'Meta', sub: s(g.sub) || s(g.platform) || 'IA', target: s(g.target) || '—', deadline: end, ai: 'IA', status: 'proposed' });
    });
    saveLaunches(); renderObjetivos();
  } catch (e) {
    const l = document.getElementById('obj-loading');
    if (l) l.innerHTML = `⚠ ${s(e.message)} — revisa ⚙ API.`;
  }
}

// ══════════════════════════════════════════
// APRENDIZAJES (per-artista) + IA
// ══════════════════════════════════════════
function renderAprendizajes() {
  const art = activeArtist();
  const t = document.getElementById('aprend-title'); if (t) t.textContent = art ? `${up(art.name)} · BIBLIOTECA` : 'BIBLIOTECA';
  const hint = document.getElementById('aprend-aihint'); if (hint) hint.innerHTML = art ? aiHintHTML(buildLearningsPrompt(art), 700) : '';
  const host = document.getElementById('aprend-list'); if (!host) return;
  if (!art) { host.innerHTML = ''; return; }
  const L = art.learnings || [];
  if (!L.length) { host.innerHTML = `<div class="empty-hint">Aún no hay aprendizajes para ${s(art.name)}. Usa “✨ Analizar con IA” (revisa tus lanzamientos y métricas) o registra uno manualmente.</div>`; return; }
  host.innerHTML = L.map((it, i) => {
    const cls = it.type === 'good' ? ' good' : (it.type === 'bad' ? ' bad' : '');
    return `<div class="learn-card${cls}">
      <button class="goal-btn reject" style="float:right" onclick="quitarAprendizaje(${i})" title="Quitar">✕</button>
      <div class="learn-tag">${s(it.tag || art.name)}</div>
      <div class="learn-q">${s(it.q)}</div>
      <div class="learn-a">${s(it.a)}</div>
      ${it.meta ? `<div class="learn-meta">${s(it.meta)}</div>` : ''}
    </div>`;
  }).join('');
}
async function agregarAprendizaje() {
  const art = activeArtist(); if (!art) return;
  const q = await uiPrompt('¿Qué aprendiste? (título):', {title:'Nuevo aprendizaje'}); if (!q) return;
  const a = await uiPrompt('Detalle:') || '';
  const tt = (await uiPrompt('¿Funcionó? bueno / malo / neutro:', {def:'bueno'}) || '').toLowerCase();
  const type = tt.startsWith('b') ? 'good' : (tt.startsWith('m') ? 'bad' : 'neutral');
  art.learnings.unshift({ tag: art.name, type, q, a, meta: '' });
  saveArtists(); renderAprendizajes();
}
function quitarAprendizaje(i) { const art = activeArtist(); if (!art || !art.learnings[i]) return; art.learnings.splice(i, 1); saveArtists(); renderAprendizajes(); }
function buildLearningsPrompt(art) {
  const ls = artistLaunches().map(l => {
    const m = latestEntries(l.metricEntries).map(e => `${e.metric} ${fmtNum(e.value)}`).join(', ');
    return `- ${l.name} [${l.status}] piezas:${(l.cal || []).length}${m ? ' · métricas: ' + m : ''}`;
  }).join('\n') || '(sin lanzamientos con datos)';
  return `Eres analista de marketing musical. A partir de los lanzamientos y métricas del artista, extrae aprendizajes accionables (qué funcionó, qué no, qué formatos/plataformas rindieron mejor).

ARTISTA: ${s(art.name)}
LANZAMIENTOS:
${ls}
OBJETIVOS SMART (meta establecida vs. logrado real, según métricas):
${goalsVsActuals(art)}

Basa los aprendizajes en dónde se cumplió o no la meta (qué se hizo cuando se superó el objetivo, qué faltó cuando no). Devuelve SOLO un array JSON (3-6 objetos), sin texto extra:
{"type":"good|bad|neutral","tag":"contexto corto","q":"aprendizaje en una frase","a":"explicación 1-2 frases","meta":"dato/metric corto"}`;
}
async function generarAprendizajesIA() {
  const art = activeArtist(); if (!art) return;
  if (!aiReady()) { abrirAISettings(); return; }
  const host = document.getElementById('aprend-list');
  host.insertAdjacentHTML('afterbegin', '<div id="aprend-loading" class="empty-hint" style="margin-bottom:10px">✨ Analizando lanzamientos…</div>');
  try {
    const { text } = await callClaude(buildLearningsPrompt(art), 900);
    const arr = parseJSONArray(text);
    if (!arr.length) throw new Error('La IA no devolvió aprendizajes válidos.');
    arr.forEach(x => art.learnings.unshift({ tag: s(x.tag) || art.name, type: (x.type || 'neutral'), q: s(x.q), a: s(x.a), meta: s(x.meta) }));
    saveArtists(); renderAprendizajes();
  } catch (e) { const l = document.getElementById('aprend-loading'); if (l) l.innerHTML = `⚠ ${s(e.message)} — revisa ⚙ API.`; }
}

// ══════════════════════════════════════════
// IA ESTRATÉGICA (per-artista)
// ══════════════════════════════════════════
function strategyCardsHTML(st) {
  const items = st.items || [];
  return `${st.generatedAt ? `<div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);margin-bottom:12px">Generado ${new Date(st.generatedAt).toLocaleString()}</div>` : ''}
    <div class="dashboard-grid" style="grid-template-columns:repeat(2,1fr)">${items.map(it => `
      <div class="panel" style="margin:0">
        <div class="brief-label">${s(it.title)}</div>
        <div style="font-family:var(--font-display);font-size:26px;letter-spacing:1px;margin:6px 0;color:var(--accent)">${s(it.value)}</div>
        <div style="font-size:12px;color:var(--text-muted);line-height:1.5">${s(it.detail)}</div>
      </div>`).join('')}</div>`;
}
function buildStrategyPrompt(art) {
  const adn = art.adn || {};
  const ls = artistLaunches().map(l => {
    const m = latestEntries(l.metricEntries).map(e => `${e.metric} ${fmtNum(e.value)}`).join(', ');
    return `- ${l.name}: plataforma ${(l.content || {}).platform || ''}, ${(l.cal || []).length} piezas${m ? ' · ' + m : ''}`;
  }).join('\n') || '(sin datos)';
  const learn = (art.learnings || []).map(x => `- (${x.type}) ${x.q}`).join('\n') || '(sin aprendizajes)';
  return `Eres director de estrategia musical. Con base en los datos del artista, da recomendaciones accionables: mejor día/hora para publicar, formato más efectivo, duración ideal de campaña, cantidad ideal de contenido por semana y tipo de contenido más exitoso.

ARTISTA: ${s(art.name)} · Géneros: ${s((adn.sound || {}).genres)} · Audiencia: ${s((adn.audience || {}).ideal)} · Tono: ${s((adn.personality || {}).tone)}
LANZAMIENTOS:
${ls}
OBJETIVOS SMART (meta vs. logrado real):
${goalsVsActuals(art)}
APRENDIZAJES:
${learn}

Devuelve SOLO un objeto JSON, sin texto extra:
{"items":[{"title":"Mejor día para publicar","value":"valor corto","detail":"por qué, 1-2 frases"}]} con 5-6 items.`;
}
function renderIA() {
  const art = activeArtist();
  const host = document.getElementById('ia-body'); if (!host) return;
  if (!art) { host.innerHTML = ''; return; }
  const st = art.strategy;
  const promptStr = buildStrategyPrompt(art);
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head"><span class="ph-icon">⬡</span><span class="ph-title">Recomendaciones para ${s(art.name)}</span>
        <button class="btn btn-ghost" style="margin-left:auto;border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarEstrategiaIA()">✨ Generar recomendaciones</button>
      </div>
      ${aiHintHTML(promptStr, 900)}
    </div>
    <div id="ia-results">${(st && st.items && st.items.length) ? strategyCardsHTML(st) : `<div class="empty-hint">Aún no hay recomendaciones para ${s(art.name)}. Genera con IA usando ADN, lanzamientos, métricas y aprendizajes. (Mientras más datos, mejores recomendaciones.)</div>`}</div>`;
}
async function generarEstrategiaIA() {
  const art = activeArtist(); if (!art) return;
  if (!requireCan('use_ia_estrategica')) return;
  const lim = checkPlanLimit('ia_estrategica');
  if (!lim.ok) { uiAlert(lim.msg); return; }
  if (!aiReady()) { abrirAISettings(); return; }
  const res = document.getElementById('ia-results');
  if (lim.note) res.innerHTML = `<div class="empty-hint" style="border-color:var(--beat)">ℹ ${lim.note}</div>`;
  res.innerHTML = '<div class="empty-hint">✨ Analizando estrategia…</div>';
  try {
    const { text } = await callClaude(buildStrategyPrompt(art), 1200);
    const obj = parseJSONObj(text);
    const items = obj && Array.isArray(obj.items) ? obj.items : [];
    if (!items.length) throw new Error('La IA no devolvió recomendaciones válidas.');
    art.strategy = { generatedAt: Date.now(), items };
    saveArtists(); renderIA();
  } catch (e) { res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)} — revisa ⚙ API.</div>`; }
}

// ══════════════════════════════════════════
// MÉTRICAS (scoped al lanzamiento activo)
// ══════════════════════════════════════════
const PLAT_META = {
  spotify:   { name:'Spotify',     icon:'🎧', color:'#1db954' },
  tiktok:    { name:'TikTok',      icon:'📱', color:'#ff0050' },
  instagram: { name:'Instagram',   icon:'📷', color:'#e1306c' },
  youtube:   { name:'YouTube',     icon:'▶',  color:'#ff0000' },
  apple:     { name:'Apple Music', icon:'🍎', color:'#fc3c44' },
  other:     { name:'Otra',        icon:'📊', color:'#888' },
};
function todayISO() { return new Date().toISOString().slice(0,10); }
function normalizeDateStr(v) { const d = new Date(v); return isNaN(d) ? todayISO() : d.toISOString().slice(0,10); }
function csvTokenize(text) {
  const rows = []; let row = []; let cur = ''; let inQ = false;
  text = String(text).replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else { if (c === '"') inQ = true; else if (c === ',') { row.push(cur); cur=''; } else if (c === '\n') { row.push(cur); rows.push(row); row=[]; cur=''; } else cur += c; }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function latestEntries(entries) {
  const map = {};
  (entries || []).forEach(e => { const k = e.platform + '|' + e.metric; if (!map[k] || (e.date||'') >= (map[k].date||'')) map[k] = e; });
  return Object.values(map);
}
function sparklineSVG(values, w, h, color) {
  w = w || 110; h = h || 30; color = color || 'var(--accent)';
  if (!values || values.length < 2) return '';
  const max = Math.max(...values), min = Math.min(...values), range = (max - min) || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i*step).toFixed(1)},${(h - ((v-min)/range)*(h-6) - 3).toFixed(1)}`).join(' ');
  const lx = (values.length-1)*step, ly = h - ((values[values.length-1]-min)/range)*(h-6) - 3;
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible;margin-top:8px">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></polyline>
    <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.6" fill="${color}"></circle>
  </svg>`;
}
function metricCardHTML(e, allEntries) {
  const pm = PLAT_META[e.platform] || PLAT_META.other;
  let spark = '';
  if (allEntries) {
    const series = allEntries.filter(x => x.platform === e.platform && x.metric === e.metric)
      .sort((a, b) => a.date < b.date ? -1 : 1).map(x => x.value);
    if (series.length >= 2) spark = sparklineSVG(series, 120, 30, pm.color);
  }
  const first = (allEntries || []).filter(x => x.platform === e.platform && x.metric === e.metric).sort((a,b)=>a.date<b.date?-1:1)[0];
  const delta = (first && first.value && e.value !== first.value) ? Math.round((e.value - first.value) / first.value * 100) : null;
  return `<div class="stat-card">
    <div class="stat-label">${s(e.metric)}</div>
    <div class="stat-value">${fmtNum(e.value)}</div>
    <div class="stat-trend" style="color:${pm.color}">${pm.icon} ${pm.name}${delta!=null?` · <span style="color:${delta>=0?'#4ade80':'var(--accent2)'}">${delta>=0?'↑':'↓'} ${Math.abs(delta)}%</span>`:''}</div>
    <div class="stat-sub">${s(e.date)}${e.source && e.source!=='seed' ? ' · ' + s(e.source) : ''}</div>
    ${spark}
  </div>`;
}
function metricsTimeSeriesHTML(entries) {
  const groups = {};
  (entries || []).forEach(e => { const k = e.platform + '|' + e.metric; (groups[k] = groups[k] || []).push(e); });
  let best = null;
  Object.values(groups).forEach(g => { if (g.length >= 2 && (!best || g.length > best.length)) best = g; });
  if (!best) return '';
  best = best.slice().sort((a,b) => a.date < b.date ? -1 : 1);
  const pm = PLAT_META[best[0].platform] || PLAT_META.other;
  const max = Math.max(...best.map(e => e.value), 1);
  const bars = best.map((e,i) => {
    const h = Math.round(e.value / max * 100); const last = i === best.length - 1;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;justify-content:flex-end;height:100%">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--text-muted)">${fmtNum(e.value)}</div>
      <div style="background:linear-gradient(180deg,var(--accent),var(--accent-dark));width:100%;height:${h}%;border-radius:4px 4px 0 0;opacity:${last?1:0.55};box-shadow:${last?'0 0 14px var(--glow)':'none'}"></div>
      <div style="font-family:var(--font-mono);font-size:8px;color:${last?'var(--accent)':'var(--text-dim)'}">${s(e.date).slice(5)}</div>
    </div>`;
  }).join('');
  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px;margin-top:14px">
    <div class="section-title" style="margin-bottom:16px">EVOLUCIÓN — ${up(best[0].metric)} · ${pm.name}</div>
    <div style="display:flex;align-items:flex-end;gap:10px;height:130px">${bars}</div>
  </div>`;
}
function screenshotsStripHTML() {
  const art = activeArtist(); const a = activeLaunch();
  const shots = [].concat((art ? art.screenshots : []).map(x => Object.assign({scope:'Artista'}, x)),
                         (a ? a.screenshots : []).map(x => Object.assign({scope:a.name}, x)));
  if (!shots.length) return '';
  return `<div class="section-header" style="margin-top:24px"><div class="section-title">CAPTURAS DE RESPALDO</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${shots.map(sc => `<a href="${sc.dataUrl}" target="_blank" title="${s(sc.label)} · ${s(sc.scope)} · ${s(sc.date)}"><img src="${sc.dataUrl}" class="screenshot-thumb"></a>`).join('')}</div>`;
}

// ── Sub-pestañas ──
function metricasTab(name) {
  ['resumen','importar','instrucciones'].forEach(n => { const p = document.getElementById('mtab-'+n); if (p) p.style.display = n===name ? '' : 'none'; });
  document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t.dataset.mtab === name));
}

function renderMetricas() {
  const ctx = document.getElementById('ctx-metricas'); if (ctx) ctx.innerHTML = launchContextHTML();
  const art = activeArtist();
  document.getElementById('mtab-resumen').innerHTML = art ? metricsResumenHTML() : '<div class="empty-hint">Crea un artista para ver métricas.</div>';
  document.getElementById('mtab-importar').innerHTML = art ? metricsImportarHTML() : '';
  document.getElementById('mtab-instrucciones').innerHTML = metricsInstruccionesHTML();
  renderShotFields();
}

function metricsResumenHTML() {
  const art = activeArtist(); const a = activeLaunch();
  const artLatest = latestEntries(art.metricEntries);
  const lnLatest = latestEntries(a ? a.metricEntries : []);
  return `
    <div class="section-header"><div class="section-title">MÉTRICAS DEL ARTISTA · ${up(art.name)}</div></div>
    ${artLatest.length ? `<div class="dashboard-grid">${artLatest.map(e => metricCardHTML(e, art.metricEntries)).join('')}</div>` : `<div class="empty-hint">Sin métricas del artista. Cárgalas en la pestaña “Importar / Cargar”.</div>`}
    <div class="section-header" style="margin-top:26px"><div class="section-title">MÉTRICAS DEL LANZAMIENTO · ${a ? up(a.name) : '—'}</div></div>
    ${lnLatest.length ? `<div class="dashboard-grid">${lnLatest.map(e => metricCardHTML(e, a.metricEntries)).join('')}</div>${metricsTimeSeriesHTML(a.metricEntries)}` : `<div class="empty-hint">Sin métricas para este lanzamiento.</div>`}
    ${screenshotsStripHTML()}`;
}

function levelSelectHTML(id) {
  const a = activeLaunch();
  return `<select class="input" id="${id}"><option value="artist">Artista (${s(activeArtist().name)})</option>${a ? `<option value="launch">Lanzamiento (${s(a.name)})</option>` : ''}</select>`;
}
function platSelectHTML(id) {
  return `<select class="input" id="${id}">${Object.keys(PLAT_META).map(k => `<option value="${k}">${PLAT_META[k].name}</option>`).join('')}</select>`;
}

function metricsImportarHTML() {
  return `
  <div class="field-grid" style="align-items:start">
    <div class="panel" style="margin:0">
      <div class="panel-head"><span class="ph-icon">📄</span><span class="ph-title">Importar CSV de plataforma</span></div>
      <div class="field-grid" style="margin-bottom:12px">
        <div class="field"><label>Nivel</label>${levelSelectHTML('csv-level')}</div>
        <div class="field"><label>Plataforma</label>${platSelectHTML('csv-plat')}</div>
      </div>
      <label for="mcsv-file" class="btn btn-ghost" style="display:inline-block;margin-bottom:10px">📎 Subir archivo .csv</label>
      <input type="file" id="mcsv-file" accept=".csv,text/csv" style="display:none" onchange="csvFileToText(event)">
      <textarea class="textarea" id="mcsv-text" placeholder="…o pega aquí el contenido del CSV" style="min-height:90px;font-family:var(--font-mono);font-size:11px"></textarea>
      <button class="btn btn-primary" style="margin-top:10px" onclick="analizarMetricasCSV()">Analizar CSV</button>
      <div id="mcsv-preview"></div>
      <div style="font-size:10px;color:var(--text-dim);margin-top:10px;font-family:var(--font-mono);line-height:1.6">Tomamos la <b style="color:var(--text-muted)">última fila</b> (la más reciente) y detectamos las columnas numéricas. ¿No sabes exportar? → pestaña “Instrucciones CSV”.</div>
    </div>

    <div class="panel" style="margin:0">
      <div class="panel-head"><span class="ph-icon">🖼️</span><span class="ph-title">Cargar por captura (sin IA)</span></div>
      <div class="field-grid" style="margin-bottom:12px">
        <div class="field"><label>Nivel</label>${levelSelectHTML('shot-level')}</div>
        <div class="field"><label>Plataforma</label>${platSelectHTML('shot-plat')}</div>
      </div>
      <label for="shot-file" class="btn btn-ghost" style="display:inline-block;margin-bottom:10px">📷 Subir screenshot</label>
      <input type="file" id="shot-file" accept="image/*" style="display:none" onchange="handleMetricScreenshot(event)">
      <div id="shot-preview" style="margin-bottom:10px"></div>
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);letter-spacing:1px;margin-bottom:8px">ESCRIBE LOS NÚMEROS QUE VES</div>
      <div id="shot-fields"></div>
      <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="addShotField()">+ Otra métrica</button>
      <div class="field" style="margin-top:12px;max-width:200px"><label>Fecha del dato</label><input type="date" class="input" id="shot-date" value="${todayISO()}"></div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="guardarScreenshotMetricas()">Guardar</button>
    </div>
  </div>`;
}

function metricsInstruccionesHTML() {
  const blocks = [
    { p:'spotify', title:'Spotify for Artists', steps:['Entra a <b>artists.spotify.com</b> e inicia sesión.','Ve a <b>Audience</b> o <b>Music → tu canción</b>.','Arriba a la derecha, abre el rango de fechas y elige el período.','Busca el botón <b>•••</b> / <b>Download</b> para exportar a CSV.','Sube el CSV aquí o pégalo. (Oyentes mensuales y seguidores = nivel Artista; streams de una canción = nivel Lanzamiento.)'] },
    { p:'tiktok', title:'TikTok Analytics', steps:['En la app: <b>Perfil → ☰ → Herramientas para creadores → Analytics</b>. O en <b>tiktok.com</b> escritorio.','En escritorio, pestaña <b>Overview</b> / <b>Content</b>.','Usa <b>Download data</b> para exportar CSV del período.','Sube/pega el CSV. (Seguidores = Artista; views de un video = Lanzamiento.)'] },
    { p:'instagram', title:'Instagram (Meta)', steps:['Instagram no exporta CSV fácil. Mejor usa <b>Meta Business Suite</b> (business.facebook.com).','Ve a <b>Insights</b> y exporta, o usa la opción de captura (screenshot).','Si no hay CSV, usa el panel “Cargar por captura” y teclea alcance/seguidores.'] },
    { p:'youtube', title:'YouTube Studio', steps:['Entra a <b>studio.youtube.com</b>.','Ve a <b>Analytics</b> y elige el período.','Botón <b>Export current view → Comma-separated values (.csv)</b>.','Sube/pega el CSV. (Suscriptores = Artista; views de un video = Lanzamiento.)'] },
  ];
  return blocks.map(b => {
    const pm = PLAT_META[b.p];
    return `<div class="panel">
      <div class="panel-head"><span class="ph-icon">${pm.icon}</span><span class="ph-title">${b.title}</span><span class="plat-pill" style="margin-left:auto;background:${pm.color}22;color:${pm.color}">CSV</span></div>
      ${b.steps.map((st,i) => `<div class="instr-step"><b>${i+1}.</b><span>${st}</span></div>`).join('')}
    </div>`;
  }).join('') + `<div class="empty-hint">¿Tu plataforma no deja exportar CSV o eres menos técnico? Usa “Cargar por captura”: subes un screenshot y solo escribes los números. Sin complicaciones.</div>`;
}

// ── Lógica de carga ──
function metricTarget(level) { return level === 'launch' ? activeLaunch() : activeArtist(); }
function saveMetricTarget(level) { if (level === 'launch') saveLaunches(); else saveArtists(); }
function addMetricEntries(level, platform, entries) {
  const t = metricTarget(level); if (!t) return;
  entries.forEach(e => t.metricEntries.push(Object.assign({ id: 'me-' + Date.now() + '-' + Math.floor(Math.random()*9999), platform, source: e.source || 'manual' }, e)));
  saveMetricTarget(level);
}

let csvMetricRows = [];
function csvFileToText(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { document.getElementById('mcsv-text').value = ev.target.result; analizarMetricasCSV(); };
  r.readAsText(f, 'UTF-8'); e.target.value = '';
}
function analizarMetricasCSV() {
  const txt = document.getElementById('mcsv-text').value;
  const rows = csvTokenize(txt).filter(r => r.some(c => trim(c).length));
  const prev = document.getElementById('mcsv-preview');
  if (rows.length < 2) { prev.innerHTML = '<div class="empty-hint" style="border-color:var(--accent2)">CSV vacío o inválido.</div>'; return; }
  const headers = rows[0].map(h => trim(h));
  const dateIdx = headers.findIndex(h => /date|fecha|d[ií]a|day|week|semana|mes|month/i.test(h));
  const last = rows[rows.length - 1];
  const date = dateIdx >= 0 ? normalizeDateStr(last[dateIdx]) : todayISO();
  csvMetricRows = [];
  headers.forEach((h, i) => {
    if (i === dateIdx) return;
    const raw = trim(last[i]);
    if (raw && /\d/.test(raw)) { const num = parseMetricNum(raw); if (num > 0) csvMetricRows.push({ metric: h || ('Columna ' + (i+1)), value: num, date }); }
  });
  renderCSVPreview();
}
function renderCSVPreview() {
  const prev = document.getElementById('mcsv-preview'); if (!prev) return;
  if (!csvMetricRows.length) { prev.innerHTML = '<div class="empty-hint">No se detectaron columnas numéricas en la última fila.</div>'; return; }
  prev.innerHTML = `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin:12px 0 8px">DETECTADO — edita o quita lo que no aplique:</div>`
    + csvMetricRows.map((e,i) => `<div class="metric-entry-row">
        <input class="input" value="${s(e.metric)}" onchange="csvMetricRows[${i}].metric=this.value">
        <input class="input" value="${e.value}" onchange="csvMetricRows[${i}].value=parseMetricNum(this.value)">
        <button class="goal-btn reject" onclick="csvMetricRows.splice(${i},1);renderCSVPreview()">✕</button>
      </div>`).join('')
    + `<button class="btn btn-primary" style="margin-top:8px" onclick="guardarCSVMetricas()">Guardar ${csvMetricRows.length} métrica(s)</button>`;
}
function guardarCSVMetricas() {
  if (!csvMetricRows.length) return;
  const level = document.getElementById('csv-level').value;
  const platform = document.getElementById('csv-plat').value;
  addMetricEntries(level, platform, csvMetricRows.map(e => Object.assign({ source:'csv' }, e)));
  csvMetricRows = [];
  uiToast('✓ Métricas importadas.');
  renderMetricas(); metricasTab('resumen');
}

let shotFields = [{ metric:'', value:'' }];
let pendingShot = null;
function handleMetricScreenshot(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 700; let w = img.width, h = img.height;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const cw = Math.round(w * scale), ch = Math.round(h * scale);
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      c.getContext('2d').drawImage(img, 0, 0, cw, ch);
      pendingShot = c.toDataURL('image/jpeg', 0.6);
      const pv = document.getElementById('shot-preview');
      if (pv) pv.innerHTML = `<img src="${pendingShot}" style="max-width:200px;border-radius:6px;border:1px solid var(--border)">`;
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(f); e.target.value = '';
}
function addShotField() { shotFields.push({ metric:'', value:'' }); renderShotFields(); }
function renderShotFields() {
  const host = document.getElementById('shot-fields'); if (!host) return;
  host.innerHTML = shotFields.map((f,i) => `<div class="metric-entry-row">
    <input class="input" placeholder="Métrica (ej. Oyentes mensuales)" value="${s(f.metric)}" onchange="shotFields[${i}].metric=this.value">
    <input class="input" placeholder="Valor (ej. 42K)" value="${s(f.value)}" onchange="shotFields[${i}].value=this.value">
    <button class="goal-btn reject" onclick="shotFields.splice(${i},1);renderShotFields()">✕</button>
  </div>`).join('');
}
function guardarScreenshotMetricas() {
  const level = document.getElementById('shot-level').value;
  const platform = document.getElementById('shot-plat').value;
  const date = document.getElementById('shot-date').value || todayISO();
  const entries = shotFields.filter(f => s(f.metric).trim() && s(f.value).trim())
    .map(f => ({ metric: f.metric.trim(), value: parseMetricNum(f.value), date, source: 'screenshot' }));
  if (!entries.length) { uiAlert('Agrega al menos una métrica con su valor.'); return; }
  const t = metricTarget(level); if (!t) return;
  let shotId = null;
  if (pendingShot) { shotId = 'sc-' + Date.now(); t.screenshots.push({ id: shotId, dataUrl: pendingShot, platform, date, label: (PLAT_META[platform]||PLAT_META.other).name }); }
  entries.forEach(e => { e.screenshotId = shotId; });
  addMetricEntries(level, platform, entries);
  shotFields = [{ metric:'', value:'' }]; pendingShot = null;
  uiToast('✓ Datos guardados.');
  renderMetricas(); metricasTab('resumen');
}

// ══════════════════════════════════════════
// BOXDROP GENERAL
// ══════════════════════════════════════════
function closeBoxdrop(e) { if (e.target === document.getElementById('boxdrop')) closeBoxdropDirect(); }
function closeBoxdropDirect() { document.getElementById('boxdrop').classList.remove('open'); }
function switchTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.boxdrop-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
}

// ══════════════════════════════════════════
// CSV IMPORT
// ══════════════════════════════════════════
function abrirImportCSV() { document.getElementById('modal-csv').classList.add('open'); }
function cerrarImportCSV(e) {
  if (!e || e.target === document.getElementById('modal-csv'))
    document.getElementById('modal-csv').classList.remove('open');
}
function handleCSVFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const parsed = parsearCSV(ev.target.result);
      if (!parsed.length) throw new Error('sin datos');
      setReferencias(parsed);
      bancoCargado = true;
      document.getElementById('csv-status').style.color = '#4ade80';
      document.getElementById('csv-status').textContent = `✓ ${parsed.length} referencias cargadas`;
      setTimeout(() => {
        document.getElementById('modal-csv').classList.remove('open');
        showPage('banco');
        iniciarBanco();
      }, 900);
    } catch(err) {
      document.getElementById('csv-status').style.color = 'var(--accent2)';
      document.getElementById('csv-status').textContent = '✕ Error al leer el CSV. Verifica el formato.';
    }
  };
  reader.readAsText(file, 'UTF-8');
}
function usarDemoData() {
  setReferencias(DEMO); bancoCargado = false;
  document.getElementById('modal-csv').classList.remove('open');
  showPage('banco'); iniciarBanco();
}
// render CSV column chips
document.getElementById('csv-cols').innerHTML =
  ['id','title','hook','for','cat','link','comentarios'].map(c =>
    `<div style="background:var(--surface2);padding:5px 10px;border-radius:3px;font-family:var(--font-mono);font-size:10px;color:var(--text);border:1px solid var(--border)">${c}</div>`
  ).join('');

// ══════════════════════════════════════════
// MODELO DE DATOS — LANZAMIENTOS (localStorage)
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// MODELO DE DATOS — ARTISTAS (localStorage)
// ══════════════════════════════════════════
function emptyADN() {
  return {
    identity:{history:'',mission:'',vision:'',values:''},
    personality:{archetypes:[],tone:'',expression:''},
    universe:{themes:'',conflicts:'',messages:''},
    aesthetics:{colors:'',photoStyle:''},
    sound:{genres:'',influences:'',references:''},
    audience:{current:'',ideal:'',buyer:''},
  };
}
function makeArtist(name, extra) {
  return Object.assign({
    id: 'A-' + Date.now() + '-' + Math.floor(Math.random()*999),
    name: name || 'Nuevo Artista', legalName:'', genre:'', country:'',
    socials:{ig:'',tiktok:'',youtube:'',x:''},
    dsps:{spotify:'',apple:'',ytmusic:'',other:''},
    team:[], adn: emptyADN(), bio:{oneLine:'',short:'',long:''}, keywords:'',
  }, extra || {});
}
function normalizeArtist(a) {
  a.socials = a.socials || {ig:'',tiktok:'',youtube:'',x:''};
  a.dsps = a.dsps || {spotify:'',apple:'',ytmusic:'',other:''};
  a.team = Array.isArray(a.team) ? a.team : [];
  a.adn = a.adn || emptyADN();
  const e = emptyADN();
  for (const k in e) a.adn[k] = Object.assign({}, e[k], a.adn[k]);
  if (!Array.isArray(a.adn.personality.archetypes)) a.adn.personality.archetypes = [];
  a.learnings = Array.isArray(a.learnings) ? a.learnings : [];
  a.strategy = (a.strategy && typeof a.strategy === 'object') ? a.strategy : null;
  a.metricEntries = Array.isArray(a.metricEntries) ? a.metricEntries : [];
  a.screenshots = Array.isArray(a.screenshots) ? a.screenshots : [];
  a.bio = (a.bio && typeof a.bio === 'object') ? a.bio : {oneLine:'',short:'',long:''};
  if (typeof a.keywords !== 'string') a.keywords = '';
  return a;
}
const SEED_ARTISTS = [
  normalizeArtist(makeArtist('Kintsugi', {
    id:'A-kintsugi', genre:'Pop alternativo', country:'México',
    adn: Object.assign(emptyADN(), {
      identity:{history:'Proyecto nacido de una ruptura, que convierte el dolor en arte.', mission:'Acompañar a quien sana.', vision:'Ser referente de pop honesto en LatAm.', values:'Autenticidad, vulnerabilidad, resiliencia'},
      personality:{archetypes:['El Héroe','El Sabio'], tone:'Íntimo y cercano', expression:'Habla en primera persona, sin filtros.'},
    }),
    learnings:[
      {tag:'Groserías · ¿Qué funcionó?', type:'good', q:'El BTS de estudio fue el formato con mejor retención', a:'Los videos de proceso crudo superaron 3x a los pulidos. La autenticidad generó más comentarios y guardados.', meta:'FORMATO: BTS · TikTok · +210% engagement'},
      {tag:'Groserías · ¿Qué no funcionó?', type:'bad', q:'Los teasers muy producidos no convirtieron', a:'El contenido demasiado "comercial" tuvo bajo alcance orgánico. La audiencia respondió mejor a lo espontáneo.', meta:'FORMATO: Teaser · Reels · -40% alcance'},
      {tag:'Groserías · ¿Mejor plataforma?', type:'neutral', q:'TikTok rindió mejor para descubrimiento', a:'Instagram funcionó para comunidad existente; TikTok trajo nuevos oyentes. Distribuir esfuerzo según objetivo.', meta:'DESCUBRIMIENTO: TikTok · COMUNIDAD: Instagram'},
    ],
    metricEntries:[
      {id:'am1', platform:'spotify',   metric:'Oyentes mensuales', value:42000, date:'2026-06-01', source:'seed'},
      {id:'am2', platform:'spotify',   metric:'Seguidores',        value:15000, date:'2026-06-01', source:'seed'},
      {id:'am3', platform:'tiktok',    metric:'Seguidores',        value:38000, date:'2026-06-01', source:'seed'},
      {id:'am4', platform:'instagram', metric:'Seguidores',        value:21000, date:'2026-06-01', source:'seed'},
    ],
  })),
];
function saveArtistsLocal() { localStorage.setItem('ao_artists', JSON.stringify(artists)); }
function saveArtists() { saveArtistsLocal(); scheduleCloudSync(); }

let artists = [];
try { artists = JSON.parse(localStorage.getItem('ao_artists')); } catch(e){}
if (!Array.isArray(artists) || !artists.length) { artists = SEED_ARTISTS.slice(); saveArtistsLocal(); }
else { artists = artists.map(normalizeArtist); }

let currentArtistId = localStorage.getItem('ao_active_artist') || (artists[0] && artists[0].id);
if (!artists.find(a => a.id === currentArtistId)) currentArtistId = artists[0] && artists[0].id;
function saveActiveArtist() { localStorage.setItem('ao_active_artist', currentArtistId); }
function activeArtist() { return artists.find(a => a.id === currentArtistId) || artists[0] || null; }

const SEED_LAUNCHES = [
  { id:'L-kintsugi', name:'Kintsugi', date:'2026-05-15', cover:'c1', status:'active', preDays:21, postDays:21,
    dna:{ about:'Sanar las heridas reconstruyéndose con oro, como el arte japonés del kintsugi', emotion:'Esperanza tras la ruptura', problem:'El miedo a mostrarse roto', conversation:'¿Tus cicatrices te hacen más valioso?', message:'Lo roto también brilla', keywords:'oro roto, sanar, kintsugi, resiliencia' },
    content:{perweek:'5 piezas / semana', platform:'TikTok', mix:['awareness','storytelling','bts']},
    budget:{ total:'12000', meta:'4000', tiktok:'5000', dsp:'2000', prod:'1000' },
    cal:[
      {fecha:'2026-05-12', title:'BTS Estudio', cat:'bts', production:{estado:'publicado'}},
      {fecha:'2026-05-13', title:'Historia del oro roto', cat:'storytelling', production:{estado:'editando'}},
      {fecha:'2026-05-14', title:'Concepto en espejo', cat:'awareness', production:{estado:'grabando'}},
      {fecha:'2026-05-16', title:'Antes/Después', cat:'trend', production:{estado:'publicado'}},
      {fecha:'2026-05-17', title:'Mensajes en pantalla', cat:'engagement', production:{estado:'programado'}},
      {fecha:'2026-05-19', title:'60 seg Mini Doc', cat:'storytelling', production:{estado:'grabando'}},
      {fecha:'2026-05-21', title:'Reacción productor', cat:'bts', production:{estado:'aprobado'}},
      {fecha:'2026-05-26', title:'Teaser visual', cat:'awareness', production:{estado:'publicado'}},
      {fecha:'2026-05-28', title:'Clip lyric', cat:'storytelling', production:{estado:'publicado'}},
      {fecha:'2026-05-30', title:'Behind the lyrics', cat:'bts', production:{estado:'programado'}},
      {fecha:'2026-06-04', title:'Q&A en vivo con fans', cat:'engagement', production:{estado:'pendiente'}},
      {fecha:'2026-06-06', title:'Trend: antes/después del quiebre', cat:'trend', production:{estado:'pendiente'}},
      {fecha:'2026-06-09', title:'Mini documental del proceso', cat:'storytelling', production:{estado:'pendiente'}},
    ],
    goals:[
      {icon:'🎧', bg:'rgba(74,222,128,0.12)',  metric:'Spotify Streams',       sub:'Primeros 30 días',   target:'150K', ai:'IA: basado en Groserías', status:'proposed'},
      {icon:'📱', bg:'rgba(255,0,80,0.12)',   metric:'TikTok Views',          sub:'Campaña completa',   target:'2M',   ai:'IA: +34% vs prev.',       status:'proposed'},
      {icon:'📷', bg:'rgba(225,48,108,0.12)', metric:'Instagram Seguidores',  sub:'Crecimiento neto',   target:'+5K',  ai:'IA: conservador',         status:'proposed'},
      {icon:'▶',  bg:'rgba(255,0,0,0.12)',    metric:'YouTube Suscriptores',  sub:'Campaña completa',   target:'+2K',  ai:'IA: basado en histórico', status:'proposed'},
    ],
    metrics:{ cards:[], weeks:[] },
    metricEntries:[
      {id:'m1', platform:'spotify',   metric:'Streams', value:60000,   date:'2026-05-18', source:'seed'},
      {id:'m2', platform:'spotify',   metric:'Streams', value:110000,  date:'2026-05-25', source:'seed'},
      {id:'m3', platform:'spotify',   metric:'Streams', value:198000,  date:'2026-06-01', source:'seed'},
      {id:'m4', platform:'tiktok',    metric:'Views',   value:1200000, date:'2026-06-01', source:'seed'},
      {id:'m5', platform:'instagram', metric:'Alcance', value:86000,   date:'2026-06-01', source:'seed'},
    ] },
  { id:'L-groserias', name:'Groserías', date:'2026-07-18', cover:'c2', status:'planning', preDays:21, postDays:21,
    dna:{}, content:{perweek:'5 piezas / semana', platform:'Instagram Reels', mix:['awareness','engagement']}, budget:{},
    cal:[], goals:[], metrics:{cards:[],weeks:[]} },
  { id:'L-xahi', name:'X Ahí', date:'2026-10-01', cover:'c3', status:'planning', preDays:21, postDays:21,
    dna:{}, content:{perweek:'3 piezas / semana', platform:'TikTok', mix:['storytelling','trend']}, budget:{},
    cal:[], goals:[], metrics:{cards:[],weeks:[]} },
];

function normalizeLaunch(l) {
  l.dna = l.dna || {}; l.content = l.content || {}; l.budget = l.budget || {};
  l.cal = Array.isArray(l.cal) ? l.cal : [];
  l.cal.forEach((ci, i) => { if (!ci.id) ci.id = 'ci-' + i + '-' + s(ci.fecha); });
  l.goals = Array.isArray(l.goals) ? l.goals : [];
  l.metrics = (l.metrics && typeof l.metrics === 'object') ? l.metrics : {cards:[],weeks:[]};
  if (!Array.isArray(l.metrics.cards)) l.metrics.cards = [];
  if (!Array.isArray(l.metrics.weeks)) l.metrics.weeks = [];
  l.ideas = Array.isArray(l.ideas) ? l.ideas : [];
  l.generated = Array.isArray(l.generated) ? l.generated : [];
  l.metricEntries = Array.isArray(l.metricEntries) ? l.metricEntries : [];
  l.screenshots = Array.isArray(l.screenshots) ? l.screenshots : [];
  l.revenue = (l.revenue && typeof l.revenue === 'object') ? l.revenue : {};
  l.artistId = l.artistId || (artists[0] && artists[0].id);
  return l;
}
function artistLaunches() { return launches.filter(l => l.artistId === currentArtistId); }

let launches = [];
try { launches = JSON.parse(localStorage.getItem('ao_launches')); } catch(e){}
if (!Array.isArray(launches) || !launches.length) { launches = SEED_LAUNCHES.map(normalizeLaunch); saveLaunchesLocal(); }
else { launches = launches.map(normalizeLaunch); }

function saveLaunchesLocal() { localStorage.setItem('ao_launches', JSON.stringify(launches)); }
function saveLaunches() { saveLaunchesLocal(); scheduleCloudSync(); }

// ── Contexto de lanzamiento activo ──
function activeLaunch() {
  const mine = artistLaunches();
  if (!mine.find(l => l.id === currentLaunchId)) currentLaunchId = mine[0] ? mine[0].id : null;
  return mine.find(l => l.id === currentLaunchId) || mine[0] || null;
}
function setActiveLaunch(id) {
  currentLaunchId = id;
  weekOffset = 0;
  const p = (document.querySelector('.page.active') || {}).id;
  if (p === 'page-calendario') renderCalendar();
  if (p === 'page-objetivos')  renderObjetivos();
  if (p === 'page-metricas')   renderMetricas();
  if (p === 'page-banco')      renderBanco();
  if (p === 'page-ideas')      renderIdeas();
}
function launchContextHTML() {
  const a = activeLaunch();
  if (!a) return '';
  const st = STATUS_MAP[a.status] || STATUS_MAP.planning;
  const opts = artistLaunches().map(l =>
    `<option value="${l.id}" ${l.id===a.id?'selected':''}>${s(l.name)}</option>`).join('');
  return `
    <div class="launch-ctx">
      <span class="ctx-label">Lanzamiento</span>
      <select class="ctx-select" onchange="setActiveLaunch(this.value)">${opts}</select>
      <span class="launch-status ${st.cls}" style="margin-left:4px"><span class="status-dot"></span>${st.word}</span>
      <span class="ctx-date">${launchDateLabel(a)}</span>
    </div>`;
}

const STATUS_MAP = {
  active:   { cls:'status-active',   word:'En campaña', tag:'EN CAMPAÑA' },
  planning: { cls:'status-planning', word:'Planeando',  tag:'PLANEADO' },
  complete: { cls:'status-complete', word:'Completado', tag:'LANZADO' },
};
const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

function launchDateLabel(l) {
  const st = STATUS_MAP[l.status] || STATUS_MAP.planning;
  if (!l.date) return st.tag + ' · SIN FECHA';
  const d = new Date(l.date + 'T00:00:00');
  return `${st.tag} · ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function launchCardHTML(l) {
  const st = STATUS_MAP[l.status] || STATUS_MAP.planning;
  const cover = /^c[1-5]$/.test(l.cover) ? l.cover : 'c5';
  return `
    <div class="launch-card fade-in" onclick="openLaunch('${l.id}')">
      <button class="del-btn" title="Eliminar" onclick="event.stopPropagation();borrarLanzamiento('${l.id}')">✕</button>
      <div class="launch-cover ${cover}">${up(l.name).slice(0,9)}</div>
      <div class="launch-info">
        <div class="launch-name">${s(l.name)}</div>
        <div class="launch-date">${launchDateLabel(l)}</div>
        <span class="launch-status ${st.cls}"><span class="status-dot"></span>${st.word}</span>
      </div>
    </div>`;
}

function renderLaunches() {
  const grid = document.getElementById('launches-grid');
  if (!grid) return;
  grid.innerHTML =
    `<div class="launch-card add" onclick="abrirWizard()"><div class="plus">+</div><div style="font-size:12px">Nuevo Lanzamiento</div></div>`
    + artistLaunches().map(launchCardHTML).join('');
}
function renderDashLaunches() {
  const grid = document.getElementById('dash-launches');
  if (!grid) return;
  const mine = artistLaunches();
  grid.innerHTML = mine.length
    ? mine.slice(0,3).map(launchCardHTML).join('')
    : `<div class="empty-hint" style="grid-column:1/-1">Aún no hay lanzamientos para este artista. Crea el primero con “+ Nuevo Lanzamiento”.</div>`;
}
function renderAllLaunches() { renderLaunches(); renderDashboard(); }

// ── Helpers numéricos para métricas ──
function parseMetricNum(v) {
  const m = s(v).trim().match(/([\d.,]+)\s*([KkMm]?)/);
  if (!m) return 0;
  let n = parseFloat(m[1].replace(/,/g, '')) || 0;
  const suf = m[2].toLowerCase();
  if (suf === 'k') n *= 1e3; else if (suf === 'm') n *= 1e6;
  return n;
}
function fmtNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n));
}
function diasRestantes(iso) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso + 'T00:00:00');
  return Math.round((d - today) / 86400000);
}

// ── DASHBOARD (per-artista, datos reales) ──
function renderDashboard() {
  renderDashLaunches();
  const art = activeArtist();
  const ls = artistLaunches();
  const statsHost = document.getElementById('dash-stats');
  const nextHost = document.getElementById('dash-next');
  const titleEl = document.getElementById('dash-launches-title');
  if (titleEl) titleEl.textContent = art ? `LANZAMIENTOS DE ${up(art.name)}` : 'LANZAMIENTOS';
  if (!statsHost) return;

  // conteos por estado
  const counts = { active: 0, planning: 0, complete: 0 };
  ls.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  // streams agregados (último valor por métrica tipo "stream/reproduc")
  let streams = 0, hasMetrics = false;
  ls.forEach(l => latestEntries(l.metricEntries).forEach(e => {
    if (/stream|reproduc/i.test(e.metric)) { streams += e.value; hasMetrics = true; }
  }));

  // contenido del calendario (todos los lanzamientos del artista)
  const today = new Date(); today.setHours(0,0,0,0);
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  let allCal = [];
  ls.forEach(l => (l.cal || []).forEach(ci => allCal.push(Object.assign({}, ci, { launch: l.name, launchId: l.id }))));
  const upcoming = allCal.filter(ci => new Date(ci.fecha + 'T00:00:00') >= today).sort((a, b) => a.fecha < b.fecha ? -1 : 1);
  const next7 = upcoming.filter(ci => new Date(ci.fecha + 'T00:00:00') < in7);

  // próximo drop
  const drops = ls.filter(l => l.date && diasRestantes(l.date) >= 0).sort((a, b) => a.date < b.date ? -1 : 1);
  const nextDrop = drops[0];

  // ideas seleccionadas (total)
  let ideasCount = 0; ls.forEach(l => ideasCount += (l.ideas || []).length);

  statsHost.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Streams / Reproducciones</div>
      <div class="stat-value">${hasMetrics ? fmtNum(streams) : '—'}</div>
      ${hasMetrics
        ? `<div class="stat-trend">Suma de lanzamientos con métricas</div>`
        : `<div class="stat-trend" style="color:var(--text-muted)">Sin métricas aún</div>`}
      <div class="stat-sub">${hasMetrics ? 'Total acumulado' : 'Impórtalas en Métricas →'}</div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Lanzamientos</div>
      <div class="stat-value">${ls.length}</div>
      <div class="stat-trend" style="color:#fb923c">${counts.active} en campaña · ${counts.planning} planeando${counts.complete ? ' · ' + counts.complete + ' lanzados' : ''}</div>
      <div class="stat-sub">${nextDrop ? `Próximo: ${s(nextDrop.name)} en ${diasRestantes(nextDrop.date)}d` : 'Sin próximos drops'}</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-label">Contenido Programado</div>
      <div class="stat-value">${next7.length}</div>
      <div class="stat-trend" style="color:#a78bfa">esta semana · ${upcoming.length} próximos en total</div>
      <div class="stat-sub">${ideasCount} ideas seleccionadas · ${allCal.length} piezas en calendario</div>
    </div>`;

  // próximo contenido (lista)
  const dueSoon = upcoming.filter(ci => diasRestantes(ci.fecha) <= 2 && (ci.production && ci.production.estado) !== 'publicado');
  if (nextHost) {
    if (!upcoming.length) {
      nextHost.innerHTML = `<div class="empty-hint">No hay contenido próximo. Agrega piezas desde el Banco de Referencias o el Generador de Ideas.</div>`;
    } else {
      const alert = dueSoon.length ? `<div class="deadline-alert">⏰ <strong>${dueSoon.length}</strong> pieza${dueSoon.length>1?'s':''} con deadline en las próximas 48h${(activeArtist()&&!aiReady())?'':''}</div>` : '';
      nextHost.innerHTML = alert + upcoming.slice(0, 6).map(ci => {
        const col = catColor(ci.cat);
        const dr = diasRestantes(ci.fecha);
        const estado = (ci.production && ci.production.estado) || 'pendiente';
        const urgent = dr <= 2 && estado !== 'publicado';
        const dlabel = dr === 0 ? 'HOY' : (dr === 1 ? 'MAÑANA' : (() => { const d = new Date(ci.fecha + 'T00:00:00'); return `${MESES_CAL[d.getMonth()]} ${d.getDate()}`; })());
        return `<div onclick="openProduction('${ci.launchId}','${ci.id}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface);border:1px solid ${urgent?'rgba(255,71,87,0.35)':'var(--border)'};border-radius:6px;cursor:pointer;">
          <div style="font-family:var(--font-mono);font-size:10px;color:${dr === 0 ? 'var(--accent)' : (urgent?'#ff8a8a':'var(--text-muted)')};width:64px">${urgent?'⏰ ':''}${dlabel}</div>
          <span class="cal-item" style="margin:0;background:${col}18;color:${col};border-left:2px solid ${col}">${ESTADO_ICON[estado]||''} ${s(ci.title)}</span>
          <div style="margin-left:auto;font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">${s(ci.launch)}</div>
        </div>`;
      }).join('');
    }
  }
}

async function borrarLanzamiento(id) {
  if (!requireCan('edit_launch')) return;
  const l = launches.find(x => x.id === id);
  if (!await uiConfirm(`¿Eliminar el lanzamiento “${l ? l.name : ''}”? Esta acción no se puede deshacer.`, {danger:true, okText:'Eliminar'})) return;
  launches = launches.filter(x => x.id !== id);
  saveLaunches(); renderAllLaunches();
  cloudDelete('launches', id);
  if (editingId === id) cerrarWizard();
  if (currentLaunchId === id) { currentLaunchId = null; showPage('lanzamientos'); }
}

// ══════════════════════════════════════════
// LANZAMIENTO COMO CENTRO — detalle / hub
// ══════════════════════════════════════════
let currentLaunchId = null;

function money(v) {
  const raw = s(v).replace(/[^0-9.]/g, '');
  const n = parseFloat(raw);
  if (!raw || isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US');
}
function dnaVal(v) {
  return (v != null && s(v).trim())
    ? `<div class="brief-value" style="line-height:1.5">${s(v)}</div>`
    : `<div class="dna-empty">— sin definir</div>`;
}
function mixBadges(mix) {
  if (!mix || !mix.length) return '<span class="dna-empty">— sin definir</span>';
  return mix.map(m => {
    const col = catColor(m);
    return `<span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-family:var(--font-mono);margin:2px;background:${col}18;color:${col};border:1px solid ${col}44">${s(m)}</span>`;
  }).join('');
}

function openLaunch(id) {
  const l = launches.find(x => x.id === id);
  if (!l) return;
  currentLaunchId = id;
  showPage('launch');
  renderLaunchDetail();
}

function renderLaunchDetail() {
  const l = launches.find(x => x.id === currentLaunchId);
  const host = document.getElementById('launch-detail');
  if (!l) { host.innerHTML = '<div class="empty-hint">Lanzamiento no encontrado.</div>'; return; }

  document.getElementById('page-title').textContent = up(l.name);

  const st = STATUS_MAP[l.status] || STATUS_MAP.planning;
  const cover = /^c[1-5]$/.test(l.cover) ? l.cover : 'c5';
  const d = l.dna || {}, c = l.content || {}, b = l.budget || {};

  // timeline
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const fmt = dt => `${dt.getDate()} ${months[dt.getMonth()]}`;
  const pre = l.preDays ?? 21, post = l.postDays ?? 21;
  let tlStart = `Inicio (−${pre}d)`, tlDrop = 'Lanzamiento', tlEnd = `Cierre (+${post}d)`;
  if (l.date) {
    const drop = new Date(l.date + 'T00:00:00');
    const start = new Date(drop); start.setDate(start.getDate() - pre);
    const end = new Date(drop);   end.setDate(end.getDate() + post);
    tlStart = fmt(start); tlDrop = `DROP ${fmt(drop)}`; tlEnd = fmt(end);
  }

  host.innerHTML = `
    <div style="margin-bottom:16px">
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);cursor:pointer" onclick="showPage('lanzamientos')">← Lanzamientos</span>
    </div>

    <div class="launch-hero">
      <div class="launch-hero-cover launch-cover ${cover}">${up(l.name)}</div>
      <div class="launch-hero-info">
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div class="lh-name">${s(l.name)}</div>
          <div class="lh-actions">
            <button class="btn btn-ghost" onclick="abrirReporteLanzamiento('${l.id}')" title="Generar reporte de lanzamiento (PPTX/HTML con IA)">📊 Generar reporte</button>
            <button class="btn btn-ghost" onclick="abrirWizard('${l.id}')">✎ Editar</button>
            <button class="btn btn-ghost" style="color:var(--accent2);border-color:rgba(255,71,87,0.3)" onclick="borrarLanzamiento('${l.id}')">Eliminar</button>
          </div>
        </div>
        <div class="lh-meta">
          <span class="launch-status ${st.cls}"><span class="status-dot"></span>${st.word}</span>
          <span class="lh-date">${launchDateLabel(l)}</span>
        </div>
        <div class="lh-timeline">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);letter-spacing:1px;margin-bottom:6px">TIMELINE DE CAMPAÑA</div>
          <div class="tl-bar">
            <div class="tl-seg pre" style="flex:${pre}">PRE · ${pre}d</div>
            <div class="tl-seg day">DROP</div>
            <div class="tl-seg post" style="flex:${post}">POST · ${post}d</div>
          </div>
          <div class="tl-dates"><span>${tlStart}</span><span>${tlDrop}</span><span>${tlEnd}</span></div>
        </div>
      </div>
    </div>

    ${(function(){ const pr = launchProgress(l);
      const segs = [{value:pr.byStage.pre,color:'#a78bfa'},{value:pr.byStage.prod,color:'var(--accent)'},{value:pr.byStage.post,color:'#38bdf8'}];
      return `
    <div class="panel">
      <div class="panel-head"><span class="ph-icon">📈</span><span class="ph-title">Progreso de Producción</span>
        <span class="ph-sub">${pr.published}/${pr.total} publicadas</span></div>
      <div class="donut-wrap">
        <div>${donutSVG(segs, 132, 16, pr.pct + '%', 'completo')}</div>
        <div class="donut-legend" style="flex:1;min-width:180px">
          <div class="dl"><span class="donut-dot" style="background:#a78bfa"></span> Preproducción <b>${pr.byStage.pre}</b></div>
          <div class="dl"><span class="donut-dot" style="background:var(--accent)"></span> Producción <b>${pr.byStage.prod}</b></div>
          <div class="dl"><span class="donut-dot" style="background:#38bdf8"></span> Postproducción <b>${pr.byStage.post}</b></div>
          <div class="progress-track" style="margin-top:6px"><div class="progress-fill" style="width:${pr.pct}%"></div></div>
        </div>
      </div>
      <button class="btn btn-ghost" style="margin-top:16px;width:100%" onclick="showPage('calendario');setTimeout(()=>setCalView('kanban'),50)">▤ Ver Tablero de Producción</button>
    </div>`; })()}

    <div class="panel">
      <div class="panel-head"><span class="ph-icon">✦</span><span class="ph-title">Campaign DNA</span><span class="ph-sub">Estrategia narrativa</span></div>
      <div class="dna-grid">
        <div class="dna-field"><div class="brief-label">¿De qué trata?</div>${dnaVal(d.about)}</div>
        <div class="dna-field"><div class="brief-label">Emoción</div>${dnaVal(d.emotion)}</div>
        <div class="dna-field"><div class="brief-label">Problema que aborda</div>${dnaVal(d.problem)}</div>
        <div class="dna-field"><div class="brief-label">Conversación que genera</div>${dnaVal(d.conversation)}</div>
        <div class="dna-field" style="grid-column:1/-1"><div class="brief-label">Mensaje principal</div>${dnaVal(d.message)}</div>
        <div class="dna-field" style="grid-column:1/-1"><div class="brief-label">Keywords & narrativas</div>${dnaVal(d.keywords)}</div>
      </div>
    </div>

    <div class="field-grid" style="align-items:start">
      <div class="panel" style="margin:0">
        <div class="panel-head"><span class="ph-icon">▦</span><span class="ph-title">Plan de Contenido</span></div>
        <div class="brief-grid" style="margin-bottom:14px">
          <div><div class="brief-label">Cadencia</div><div class="brief-value">${s(c.perweek) || '—'}</div></div>
          <div><div class="brief-label">Plataforma</div><div class="brief-value">${s(c.platform) || '—'}</div></div>
        </div>
        <div class="brief-label" style="margin-bottom:6px">Mix de contenido</div>
        <div>${mixBadges(c.mix)}</div>
        <button class="btn btn-ghost" style="margin-top:16px;width:100%" onclick="showPage('calendario')">▦ Ver Calendario</button>
      </div>

      <div class="panel" style="margin:0">
        <div class="panel-head"><span class="ph-icon">💸</span><span class="ph-title">Plan de Medios</span></div>
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:14px">
          <div class="brief-label">Presupuesto total</div>
          <div style="font-family:var(--font-display);font-size:28px;letter-spacing:1px">${money(b.total)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[['Meta Ads',b.meta],['TikTok Ads',b.tiktok],['Spotify / DSP',b.dsp],['Producción',b.prod]].map(([k,v]) =>
            `<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text-muted)">${k}</span><span style="font-family:var(--font-mono)">${money(v)}</span></div>`
          ).join('')}
        </div>
        <button class="btn btn-ghost" style="margin-top:16px;width:100%" onclick="showPage('objetivos')">◎ Ver Objetivos SMART</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="ph-icon">★</span><span class="ph-title">Ideas Seleccionadas</span><span class="ph-sub">${(l.ideas||[]).length} referencias</span></div>
      ${(l.ideas||[]).length
        ? `<div class="chips">${l.ideas.slice(0,8).map(it => `<span class="chip on" style="cursor:default">${s(it.emoji)||'★'} ${s(it.title).slice(0,28)}</span>`).join('')}${l.ideas.length>8?`<span class="chip" style="cursor:default">+${l.ideas.length-8} más</span>`:''}</div>`
        : `<div class="empty-hint">Sin ideas aún. Selecciónalas con ★ en el Banco de Referencias.</div>`}
      <button class="btn btn-ghost" style="margin-top:14px;width:100%" onclick="showPage('ideas')">✲ Abrir Generador de Ideas</button>
    </div>

    ${revenuePanelHTML(l)}`;
}

// ══════════════════════════════════════════
// FASE 5: Revenue Streams (checklist por lanzamiento)
// ══════════════════════════════════════════
const REVENUE_ITEMS = [
  { key:'pro', label:'PRO registrado (ASCAP / BMI / SAYCO / SGAE)', money:'Regalías por composición cada vez que tu canción suena en radio, streaming o en vivo.', link:'https://www.ascap.com/', linkLabel:'Registrar' },
  { key:'contentid', label:'YouTube Content ID activado', money:'Monetiza cualquier video que use tu música en YouTube (covers, ediciones de fans).', link:'https://support.google.com/youtube/answer/3244015', linkLabel:'Cómo activar' },
  { key:'tiktoksounds', label:'TikTok Sounds registrado', money:'Tu canción como sonido oficial → uso viral = más streams y descubrimiento.', link:'https://www.tiktok.com/business/es', linkLabel:'TikTok' },
  { key:'spotifyartist', label:'Spotify for Artists reclamado', money:'Datos, pitch a playlists editoriales, Canvas y Marquee.', link:'https://artists.spotify.com/', linkLabel:'Reclamar' },
  { key:'appleartist', label:'Apple Music for Artists activado', money:'Datos de Apple + Shazam y herramientas de promoción.', link:'https://artists.apple.com/', linkLabel:'Activar' },
  { key:'presave', label:'Pre-save configurado', money:'Guardados antes del drop → más streams el día 1 → mejor empuje del algoritmo.', link:'', linkLabel:'', hasInput:true, inputPh:'Link del pre-save' },
  { key:'smartlink', label:'Smart link creado (Feature.fm / Linktree)', money:'Un solo link a todas las plataformas → no pierdes oyentes.', link:'https://linktr.ee/', linkLabel:'Crear', hasInput:true, inputPh:'Link' },
  { key:'sync', label:'Sincronización disponible (sello / publisher notificado)', money:'Licencias para cine, TV y publicidad: pagos grandes por una sola colocación.', link:'', linkLabel:'' },
  { key:'merch', label:'Merchandise listo', money:'Margen alto y conexión con fans (camisetas, vinilos, posters).', link:'', linkLabel:'' },
  { key:'merchdigital', label:'Merch digital (samples / stems)', money:'Vende stems y samples a productores: ingreso pasivo de tu material.', link:'', linkLabel:'' },
];
function revenuePanelHTML(l) {
  const rev = l.revenue || {};
  const done = REVENUE_ITEMS.filter(it => rev[it.key] && rev[it.key].done).length;
  const pct = Math.round(done / REVENUE_ITEMS.length * 100);
  return `<div class="panel">
    <div class="panel-head"><span class="ph-icon">💰</span><span class="ph-title">Revenue Streams</span><span class="ph-sub">${done}/${REVENUE_ITEMS.length} activados · ${pct}%</span></div>
    <div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:${pct}%"></div></div>
    ${REVENUE_ITEMS.map(it => {
      const st = rev[it.key] || {};
      return `<div class="rev-item ${st.done ? 'done' : ''}">
        <div class="rev-check" onclick="revenueToggle('${l.id}','${it.key}')" title="Marcar">${st.done ? '✓' : ''}</div>
        <div style="flex:1;min-width:0">
          <div class="rev-label">${it.label}</div>
          <div class="rev-money">${it.money}</div>
          ${it.hasInput ? `<input class="input" style="margin-top:8px;font-size:11px" placeholder="${it.inputPh || 'Link'}" value="${s(st.value)}" onchange="revenueSetValue('${l.id}','${it.key}',this.value)">` : ''}
        </div>
        ${it.link ? `<a href="${it.link}" target="_blank" class="btn btn-ghost" style="padding:4px 10px;font-size:10px;text-decoration:none;align-self:flex-start;white-space:nowrap">${it.linkLabel || 'Ir'} ↗</a>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}
function revenueToggle(launchId, key) {
  const l = launches.find(x => x.id === launchId); if (!l) return;
  l.revenue = l.revenue || {}; l.revenue[key] = l.revenue[key] || {};
  l.revenue[key].done = !l.revenue[key].done;
  saveLaunches(); renderLaunchDetail();
}
function revenueSetValue(launchId, key, val) {
  const l = launches.find(x => x.id === launchId); if (!l) return;
  l.revenue = l.revenue || {}; l.revenue[key] = l.revenue[key] || {};
  l.revenue[key].value = val; saveLaunches();
}

// ══════════════════════════════════════════
// GENERADOR DE IDEAS (insumos del lanzamiento activo)
// ══════════════════════════════════════════
function renderIdeas() {
  const a = activeLaunch();
  document.getElementById('ctx-ideas').innerHTML = launchContextHTML();
  const host = document.getElementById('ideas-body');
  if (!a) { host.innerHTML = '<div class="empty-hint">Crea un lanzamiento para generar ideas.</div>'; return; }
  const art = activeArtist();
  const d = a.dna || {};
  const adn = (art && art.adn) || {};
  const chip = v => (v != null && s(v).trim()) ? `<div class="brief-value" style="font-size:12px;line-height:1.4">${s(v)}</div>` : `<div class="dna-empty">— sin definir</div>`;
  const adnBits = [
    ['Arquetipos', ((adn.personality||{}).archetypes||[]).join(', ')],
    ['Tono', (adn.personality||{}).tone],
    ['Temas', (adn.universe||{}).themes],
    ['Sonido', (adn.sound||{}).genres],
    ['Audiencia ideal', (adn.audience||{}).ideal],
  ];
  const dnaBits = [['Concepto', d.about], ['Emoción', d.emotion], ['Mensaje', d.message], ['Keywords', d.keywords]];
  const ideas = a.ideas || [];
  const ideasHTML = ideas.length
    ? ideas.map((it, i) => {
        const col = catColor((it.cat||[])[0]);
        return `<div class="idea-card" style="cursor:default">
          <button class="del-btn" style="position:static;float:right;opacity:1;background:var(--surface2)" onclick="quitarIdea(${i})" title="Quitar">✕</button>
          <span class="idea-cat" style="background:${col}18;color:${col}">${up((it.cat||[])[0]||'idea')}</span>
          <div class="idea-title">${s(it.title)}</div>
          ${it.hook ? `<div class="idea-hook">"${s(it.hook)}"</div>` : ''}
          <div class="idea-meta">${(it.for||[]).map(f=>s(f)).join(' · ')||'—'}${it.link ? ` · <a href="${s(it.link)}" target="_blank" style="color:var(--accent);text-decoration:none">↗ ref</a>` : ''}</div>
        </div>`;
      }).join('')
    : `<div class="empty-hint" style="grid-column:1/-1">Aún no hay ideas seleccionadas. Ve al <span style="color:var(--accent);cursor:pointer" onclick="showPage('banco')">Banco de Referencias</span> y marca ideas con la estrella ★ para este lanzamiento.</div>`;

  host.innerHTML = `
    <div class="field-grid" style="align-items:start;margin-bottom:18px">
      <div class="panel" style="margin:0">
        <div class="panel-head"><span class="ph-icon">✦</span><span class="ph-title">ADN del Artista</span><span class="ph-sub">${s(art ? art.name : '')}</span></div>
        ${adnBits.map(([k,v]) => `<div style="margin-bottom:10px"><div class="brief-label">${k}</div>${chip(v)}</div>`).join('')}
        <button class="btn btn-ghost" style="margin-top:6px" onclick="showPage('adn')">Editar ADN →</button>
      </div>
      <div class="panel" style="margin:0">
        <div class="panel-head"><span class="ph-icon">🎯</span><span class="ph-title">Campaign DNA</span><span class="ph-sub">${s(a.name)}</span></div>
        ${dnaBits.map(([k,v]) => `<div style="margin-bottom:10px"><div class="brief-label">${k}</div>${chip(v)}</div>`).join('')}
        <button class="btn btn-ghost" style="margin-top:6px" onclick="abrirWizard('${a.id}')">Editar Campaign DNA →</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="ph-icon">★</span><span class="ph-title">Ideas de Referencia Seleccionadas</span><span class="ph-sub">${ideas.length} para ${s(a.name)}</span></div>
      <div class="ideas-grid">${ideasHTML}</div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="ph-icon">⚡</span><span class="ph-title">Generar Ideas</span>
        ${ideasRestantes() !== null ? `<span class="ph-sub" style="margin-left:auto;color:${ideasRestantes()>0?'var(--text-muted)':'var(--accent2)'}">${ideasRestantes()} de 12 ideas restantes este mes</span>` : ''}
        ${(isAdmin() || !authed()) ? `<button class="btn btn-ghost" style="${ideasRestantes()!==null?'':'margin-left:auto;'}padding:4px 10px;font-size:11px" onclick="abrirAISettings()">⚙ API</button>` : ''}
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">Cantidad</span>
        <select class="input" id="gen-count" style="width:auto" onchange="updateCostLine()"><option>6</option><option selected>8</option><option>10</option><option>12</option></select>
        <button class="btn btn-primary" onclick="generarIdeasPlantilla()">⚡ Generar (plantillas)</button>
        <button class="btn btn-ghost" onclick="generarIdeasIA()" style="border-color:rgba(167,139,250,0.4);color:#a78bfa">✨ Generar con IA</button>
      </div>
      <div id="gen-cost" style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);line-height:1.6"></div>
    </div>
    <div id="ideas-results"></div>`;
  renderResults();
  updateCostLine();
}
function quitarIdea(i) {
  const a = activeLaunch(); if (!a || !a.ideas[i]) return;
  a.ideas.splice(i, 1); saveLaunches(); renderIdeas();
}

// ── Motor de plantillas (offline) ──
function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function objetivoFor(cat) {
  const m = { 'storytelling':'Conexión emocional','awareness':'Descubrimiento','behind the scenes':'Humanizar al artista','engagement':'Interacción','trend':'Alcance / viralidad','pov':'Relatabilidad','reaction':'Prueba social','performance':'Mostrar talento','relatable':'Identificación','song promotion':'Conversión a streams','comedy/sketch':'Entretener','motivational / emotional':'Inspirar','vibes':'Estética / mood','about me':'Construir marca' };
  return m[s(cat).toLowerCase()] || 'Awareness';
}
function hookFor(d, kw) {
  const k0 = kw[0] || (s(d.keywords).split(',')[0] || '').trim() || 'esto';
  return _pick([
    `Lo que nadie vio sobre ${k0}…`,
    d.emotion ? `${d.emotion}, en 15 segundos` : `No estabas listo para esto`,
    d.message ? `"${d.message}"` : `POV: ${k0}`,
    `Si sientes ${k0}, quédate`,
    d.about ? `Esto nació de: ${s(d.about).split(' ').slice(0,5).join(' ')}…` : `Esto nació de algo roto…`,
  ]);
}
function tituloFor(cat, a) {
  const n = a.name;
  const m = { 'storytelling':`La historia detrás de ${n}`,'awareness':`El concepto de ${n} en un solo plano`,'behind the scenes':`BTS: cómo nació ${n}`,'engagement':`Tú decides el próximo paso de ${n}`,'trend':`${n} x el trend del momento`,'pov':`POV: vives ${n}` };
  return m[cat] || `Idea para ${n}`;
}
function plantillaIdeas(a, count) {
  const art = activeArtist() || {}; const adn = art.adn || {}; const d = a.dna || {};
  const tone = (adn.personality && adn.personality.tone) || 'auténtico';
  const kw = s(d.keywords).split(',').map(x => x.trim()).filter(Boolean);
  const platform = (a.content && a.content.platform) || 'TikTok';
  const out = [];
  (a.ideas || []).forEach(it => {
    const cat = (it.cat || [])[0] || 'storytelling';
    out.push({
      cat, format: `${platform} · 15-30s`, title: it.title, hook: hookFor(d, kw),
      objetivo: objetivoFor(cat),
      descripcion: `Adapta "${s(it.hook || it.title)}" al mundo de ${art.name}: ${s(d.about || d.message)}. Tono ${tone}.${kw.length ? ` Menciona: ${kw.slice(0,3).join(', ')}.` : ''}`,
      refLink: it.link || '', source: 'plantilla'
    });
  });
  const cats = ['storytelling','awareness','behind the scenes','engagement','trend','pov'];
  let i = 0;
  while (out.length < count) {
    const cat = cats[i % cats.length]; i++;
    out.push({
      cat, format: `${platform} · 15-30s`, title: tituloFor(cat, a), hook: hookFor(d, kw),
      objetivo: objetivoFor(cat),
      descripcion: `${objetivoFor(cat)} para ${art.name}. ${s(d.about || d.message)} Tono ${tone}.${kw.length ? ` Keywords: ${kw.slice(0,3).join(', ')}.` : ''}`,
      refLink: '', source: 'plantilla'
    });
  }
  return out.slice(0, count);
}
function generarIdeasPlantilla() {
  const a = activeLaunch(); if (!a) return;
  const count = parseInt((document.getElementById('gen-count') || {}).value) || 8;
  a.generated = plantillaIdeas(a, count);
  a.lastUsage = null;
  saveLaunches(); renderResults();
}

// ── Resultados ──
function renderResults() {
  const a = activeLaunch(); const host = document.getElementById('ideas-results'); if (!host || !a) return;
  const g = a.generated || [];
  if (!g.length) { host.innerHTML = ''; return; }
  const usage = a.lastUsage
    ? `<div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);margin-bottom:10px">✨ IA · ${a.lastUsage.in} tok in + ${a.lastUsage.out} tok out · costo real ≈ <strong style="color:var(--accent)">$${a.lastUsage.cost.toFixed(4)}</strong></div>`
    : `<div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);margin-bottom:10px">⚡ Generado con plantillas · sin costo</div>`;
  host.innerHTML = `
    <div class="section-header" style="margin-top:8px"><div class="section-title">IDEAS GENERADAS · ${g.length}</div></div>
    ${usage}
    <div class="ideas-grid">${g.map((it, i) => {
      const col = catColor(it.cat);
      return `<div class="idea-card" style="cursor:default">
        <span class="idea-cat" style="background:${col}18;color:${col}">${up(it.cat || 'idea')}</span>
        <div class="idea-title">${s(it.title)}</div>
        ${it.hook ? `<div class="idea-hook">"${s(it.hook)}"</div>` : ''}
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;line-height:1.5">${s(it.descripcion || '')}</div>
        <div class="idea-meta">${s(it.format || '')}${it.objetivo ? ' · ' + s(it.objetivo) : ''}</div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn btn-ghost" style="padding:4px 9px;font-size:10px" onclick="addGeneratedToCal(${i})">+ Calendario</button>
          ${it.refLink ? `<a class="btn btn-ghost" style="padding:4px 9px;font-size:10px;text-decoration:none" href="${s(it.refLink)}" target="_blank">↗ ref</a>` : ''}
        </div>
      </div>`;
    }).join('')}</div>`;
}
async function addGeneratedToCal(i) {
  const a = activeLaunch(); if (!a || !a.generated[i]) return;
  const it = a.generated[i];
  const fecha = await uiPrompt('Fecha de publicación (YYYY-MM-DD):', {def: a.date || '', title:'Agregar al calendario'});
  if (!fecha) return;
  a.cal.push({ id: 'ci-' + Date.now(), title: it.title, cat: (it.cat || 'awareness'), fecha, refLink: it.refLink || '',
    production: { objetivo: it.objetivo || '', hook: it.hook || '', descripcion: it.descripcion || '', plataforma: it.format || '', estado: 'pendiente', responsable: '', guion: [], shots: [], assets: [] } });
  saveLaunches();
  uiToast('✓ Agregado al calendario de ' + a.name);
}

// ── Ajustes de IA + estimación de costo ──
function aiSettings() {
  let st = {};
  try { st = JSON.parse(localStorage.getItem('ao_ai_settings')) || {}; } catch (e) {}
  return {
    key: st.key || '',
    model: st.model || 'claude-3-5-haiku-latest',
    priceIn: st.priceIn != null ? +st.priceIn : 0.80,
    priceOut: st.priceOut != null ? +st.priceOut : 4.00,
    maxTokens: st.maxTokens || 2000,
  };
}

// ── Capa de IA reutilizable (todos los módulos) ──
// En modo equipo (con sesión) la IA está lista vía Edge Function (key en el servidor).
// En modo demo, requiere key local.
function aiReady() { return (typeof cloudEnabled === 'function' && cloudEnabled() && authed()) || !!aiSettings().key; }
async function callClaude(prompt, maxTokens, feature) {
  const ai = aiSettings();
  // ── Modo equipo: proxy seguro (Edge Function 'claude') — la key NUNCA toca el cliente ──
  if (cloudEnabled() && authed()) {
    const sb = await getSb();
    const { data, error } = await sb.functions.invoke('claude', {
      body: { prompt, model: ai.model, max_tokens: maxTokens || ai.maxTokens, team_id: _teamId, feature: feature || null },
    });
    if (error) throw new Error(error.message || 'Error de la función claude (¿está desplegada?)');
    if (data && data.error) throw new Error(data.error);
    return { text: (data && data.text) || '', usage: (data && data.usage) || {}, ai };
  }
  // ── Modo demo: key directa en el cliente ──
  if (!ai.key) throw new Error('NO_KEY');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ai.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: ai.model, max_tokens: maxTokens || ai.maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || 'Error de API');
  const text = (data.content || []).map(b => b.text || '').join('');
  return { text, usage: data.usage || {}, ai };
}
function parseJSONArray(text) { try { const m = s(text).match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : []; } catch (e) { return []; } }
function parseJSONObj(text)   { try { const m = s(text).match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (e) { return null; } }
function aiCostHint(prompt, expectedOut) {
  const ai = aiSettings();
  const inTok = Math.ceil(s(prompt).length / 4);
  const outTok = Math.min(ai.maxTokens, expectedOut || 800);
  const cost = inTok / 1e6 * ai.priceIn + outTok / 1e6 * ai.priceOut;
  return { inTok, outTok, cost, ai };
}
function aiHintHTML(prompt, expectedOut) {
  const e = aiCostHint(prompt, expectedOut);
  const perDollar = e.cost > 0 ? Math.max(1, Math.floor(1 / e.cost)) : '∞';
  return `<div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);margin-top:8px">IA: ${e.ai.key ? '<span style="color:#4ade80">key ✓</span>' : '<span style="color:var(--accent2)">sin key — ⚙ API</span>'} · ${s(e.ai.model)} · estimado ≈ <strong style="color:var(--accent)">$${e.cost.toFixed(4)}</strong> (${e.inTok} in + ${e.outTok} out · ~${perDollar}/US$1)</div>`;
}
function usageBadge(u, ai) {
  if (!u) return '';
  return `<div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim);margin-bottom:10px">✨ IA · ${u.input_tokens || 0} in + ${u.output_tokens || 0} out · costo real ≈ <strong style="color:var(--accent)">$${costFromUsage(u, ai || aiSettings()).toFixed(4)}</strong></div>`;
}
function buildIdeaPrompt(a, count) {
  const art = activeArtist() || {}; const adn = art.adn || {}; const d = a.dna || {};
  const refs = (a.ideas || []).map(it => `- ${s(it.title)} (${(it.cat||[]).join(', ')}) — ${s(it.hook)}`).join('\n') || '(ninguna)';
  return `Eres estratega de contenido musical. Genera ${count} ideas de contenido EJECUTABLES para redes (TikTok/Reels/Shorts) para el artista, alineadas a su ADN y a la campaña de la canción.

ARTISTA: ${s(art.name)}
Arquetipos: ${((adn.personality||{}).archetypes||[]).join(', ')}
Tono: ${s((adn.personality||{}).tone)}
Temas: ${s((adn.universe||{}).themes)}
Sonido/Géneros: ${s((adn.sound||{}).genres)}
Audiencia ideal: ${s((adn.audience||{}).ideal)}

CAMPAÑA (${s(a.name)}):
Concepto: ${s(d.about)}
Emoción: ${s(d.emotion)}
Problema: ${s(d.problem)}
Mensaje: ${s(d.message)}
Keywords: ${s(d.keywords)}

REFERENCIAS DE INSPIRACIÓN SELECCIONADAS:
${refs}

Devuelve SOLO un array JSON válido, sin texto adicional, con objetos de esta forma:
{"cat":"categoría","format":"plataforma + duración","title":"título de la idea","hook":"gancho corto en español","objetivo":"objetivo","descripcion":"cómo grabarlo en 1-2 frases"}`;
}
function estimateCost(a, count) {
  const ai = aiSettings();
  const prompt = buildIdeaPrompt(a, count || 8);
  const inTok = Math.ceil(prompt.length / 4);
  const outTok = Math.min(ai.maxTokens, (count || 8) * 200);
  const cost = inTok / 1e6 * ai.priceIn + outTok / 1e6 * ai.priceOut;
  return { inTok, outTok, cost, ai };
}
function costFromUsage(u, ai) {
  return (u.input_tokens || 0) / 1e6 * ai.priceIn + (u.output_tokens || 0) / 1e6 * ai.priceOut;
}
function updateCostLine() {
  const a = activeLaunch(); const el = document.getElementById('gen-cost'); if (!a || !el) return;
  const count = parseInt((document.getElementById('gen-count') || {}).value) || 8;
  const est = estimateCost(a, count);
  const perDollar = est.cost > 0 ? Math.max(1, Math.floor(1 / est.cost)) : '∞';
  el.innerHTML = `IA: ${est.ai.key ? '<span style="color:#4ade80">key configurada ✓</span>' : '<span style="color:var(--accent2)">sin key — configúrala en ⚙ API</span>'} · modelo <strong>${s(est.ai.model)}</strong><br>Estimado por generación: ≈ ${est.inTok} tok entrada + ${est.outTok} tok salida ≈ <strong style="color:var(--accent)">$${est.cost.toFixed(4)}</strong> (~${perDollar} generaciones por US$1)`;
}
function parseIdeasJSON(text) {
  try { const m = s(text).match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : []; } catch (e) { return []; }
}
async function generarIdeasIA() {
  const a = activeLaunch(); if (!a) return;
  if (!requireCan('use_generador_ia')) return;
  const lim = checkPlanLimit('ideas_ia');
  if (!lim.ok) { uiAlert(lim.msg); return; }
  const ai = aiSettings();
  if (!aiReady()) { abrirAISettings(); return; }
  const count = parseInt((document.getElementById('gen-count') || {}).value) || 8;
  const prompt = buildIdeaPrompt(a, count);
  const res = document.getElementById('ideas-results');
  res.innerHTML = `<div class="empty-hint">✨ Generando con IA (${s(ai.model)})… esto puede tardar unos segundos.</div>`;
  try {
    const { text, usage } = await callClaude(prompt);
    const ideas = parseIdeasJSON(text);
    if (!ideas.length) throw new Error('La IA no devolvió ideas en formato válido.');
    a.generated = ideas.map(x => ({
      cat: x.cat || 'idea', format: x.format || '', title: x.title || 'Idea',
      hook: x.hook || '', objetivo: x.objetivo || '', descripcion: x.descripcion || '', refLink: '', source: 'ia'
    }));
    a.lastUsage = { in: usage.input_tokens || 0, out: usage.output_tokens || 0, cost: costFromUsage(usage, ai) };
    bumpTeamCounter('ideas_generadas_mes'); // cuota mensual (solo cuenta si BILLING_ENFORCED)
    saveLaunches(); renderResults();
    if (typeof updateCostLine === 'function') updateCostLine();
  } catch (e) {
    res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2);color:var(--text-muted)">⚠ Error con la IA: ${s(e.message)}.<br>Revisa tu API key / modelo en ⚙ API. (También puede ser límite de CORS o de créditos.)</div>`;
  }
}
function abrirAISettings() {
  if (authed() && !isAdmin()) return; // config de IA: solo super-admin en modo equipo
  const ai = aiSettings();
  document.getElementById('ai-key').value = ai.key;
  document.getElementById('ai-model').value = ai.model;
  document.getElementById('ai-pricein').value = ai.priceIn;
  document.getElementById('ai-priceout').value = ai.priceOut;
  document.getElementById('ai-maxtok').value = ai.maxTokens;
  document.getElementById('modal-ai').classList.add('open');
}
function cerrarAISettings(e) {
  if (!e || e.target === document.getElementById('modal-ai'))
    document.getElementById('modal-ai').classList.remove('open');
}
function guardarAISettings() {
  const obj = {
    key: document.getElementById('ai-key').value.trim(),
    model: document.getElementById('ai-model').value.trim() || 'claude-3-5-haiku-latest',
    priceIn: parseFloat(document.getElementById('ai-pricein').value) || 0,
    priceOut: parseFloat(document.getElementById('ai-priceout').value) || 0,
    maxTokens: parseInt(document.getElementById('ai-maxtok').value) || 2000,
  };
  localStorage.setItem('ao_ai_settings', JSON.stringify(obj));
  document.getElementById('modal-ai').classList.remove('open');
  if ((document.querySelector('.page.active') || {}).id === 'page-ideas') { updateCostLine(); }
}

// ══════════════════════════════════════════
// CAMPAIGN PLANNER WIZARD
// ══════════════════════════════════════════
let wizStepN = 1;
let editingId = null;
const WIZ_STEPS = ['Fecha de Lanzamiento','Estrategia Narrativa','Calendario de Contenido','Plan de Medios'];
let preDays = 21, postDays = 21;

const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };
const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v == null ? '' : v); };

function abrirWizard(id) {
  // Permisos por rol + límite de tier (este último solo aplica si BILLING_ENFORCED)
  if (id) { if (!requireCan('edit_launch')) return; }
  else {
    if (!requireCan('create_launch')) return;
    const lim = checkPlanLimit('create_launch');
    if (!lim.ok) { uiAlert(lim.msg); return; }
  }
  editingId = id || null;
  wizStepN = 1;
  const l = editingId ? launches.find(x => x.id === editingId) : null;
  l ? wizPrefill(l) : wizReset();
  wizRender();
  document.getElementById('wizard').classList.add('open');
}
function cerrarWizard() {
  document.getElementById('wizard').classList.remove('open');
  editingId = null;
}

function wizSetDays(p, q) {
  preDays = p; postDays = q;
  document.getElementById('pre-days').textContent  = preDays;
  document.getElementById('post-days').textContent = postDays;
}
function wizSetCover(cover) {
  document.querySelectorAll('.cover-opt').forEach(c => c.classList.remove('sel'));
  const match = document.querySelector('.cover-opt.' + (/^c[1-5]$/.test(cover) ? cover : 'c1'));
  (match || document.querySelector('.cover-opt')).classList.add('sel');
}
function wizGetCover() {
  const el = document.querySelector('.cover-opt.sel');
  if (!el) return 'c1';
  return [...el.classList].find(c => /^c[1-5]$/.test(c)) || 'c1';
}
function wizSetMix(arr) {
  const set = new Set((arr || []).map(x => s(x).toLowerCase()));
  document.querySelectorAll('#wiz-mix .chip').forEach(c =>
    c.classList.toggle('on', set.has(c.textContent.trim().toLowerCase())));
}
function wizGetMix() {
  return [...document.querySelectorAll('#wiz-mix .chip.on')].map(c => c.textContent.trim().toLowerCase());
}

function wizReset() {
  setVal('wiz-name',''); setVal('wiz-date','');
  wizSetDays(21,21);
  wizSetCover('c1');
  ['wiz-about','wiz-emotion','wiz-problem','wiz-conversation','wiz-message','wiz-keywords'].forEach(id => setVal(id,''));
  setVal('wiz-perweek','5 piezas / semana'); setVal('wiz-platform','TikTok');
  wizSetMix(['awareness','storytelling','bts']);
  ['wiz-budget-total','wiz-budget-meta','wiz-budget-tiktok','wiz-budget-dsp','wiz-budget-prod'].forEach(id => setVal(id,''));
  document.getElementById('timeline-result').classList.remove('show');
}
function wizPrefill(l) {
  const d = l.dna || {}, c = l.content || {}, b = l.budget || {};
  setVal('wiz-name', l.name); setVal('wiz-date', l.date);
  wizSetDays(l.preDays ?? 21, l.postDays ?? 21);
  wizSetCover(l.cover);
  setVal('wiz-about', d.about); setVal('wiz-emotion', d.emotion); setVal('wiz-problem', d.problem);
  setVal('wiz-conversation', d.conversation); setVal('wiz-message', d.message); setVal('wiz-keywords', d.keywords);
  setVal('wiz-perweek', c.perweek || '5 piezas / semana'); setVal('wiz-platform', c.platform || 'TikTok');
  wizSetMix(c.mix);
  setVal('wiz-budget-total', b.total); setVal('wiz-budget-meta', b.meta); setVal('wiz-budget-tiktok', b.tiktok);
  setVal('wiz-budget-dsp', b.dsp); setVal('wiz-budget-prod', b.prod);
  if (l.date) wizCalcTimeline(); else document.getElementById('timeline-result').classList.remove('show');
}

function wizCollect() {
  const existing = editingId ? launches.find(x => x.id === editingId) : null;
  return {
    id: editingId || ('L-' + Date.now()),
    artistId: existing ? existing.artistId : currentArtistId,
    name: getVal('wiz-name').trim() || 'Nuevo Lanzamiento',
    date: getVal('wiz-date'),
    cover: wizGetCover(),
    status: existing ? existing.status : 'planning',
    preDays, postDays,
    dna: {
      about: getVal('wiz-about'), emotion: getVal('wiz-emotion'), problem: getVal('wiz-problem'),
      conversation: getVal('wiz-conversation'), message: getVal('wiz-message'), keywords: getVal('wiz-keywords'),
    },
    content: { perweek: getVal('wiz-perweek'), platform: getVal('wiz-platform'), mix: wizGetMix() },
    budget: {
      total: getVal('wiz-budget-total'), meta: getVal('wiz-budget-meta'), tiktok: getVal('wiz-budget-tiktok'),
      dsp: getVal('wiz-budget-dsp'), prod: getVal('wiz-budget-prod'),
    },
    createdAt: existing ? existing.createdAt : Date.now(),
  };
}

function wizRender() {
  document.querySelectorAll('.wiz-panel').forEach(p => p.classList.toggle('active', +p.dataset.panel === wizStepN));
  document.querySelectorAll('.wiz-step').forEach(st => {
    const n = +st.dataset.step;
    st.classList.toggle('active', n === wizStepN);
    st.classList.toggle('done', n < wizStepN);
  });
  const banner = document.getElementById('wiz-banner');
  if (wizStepN < 4) {
    banner.style.display = 'flex';
    document.getElementById('wiz-banner-next').textContent = WIZ_STEPS[wizStepN];
  } else {
    banner.style.display = 'none';
  }
  document.getElementById('wiz-back').style.display = wizStepN > 1 ? '' : 'none';
  document.getElementById('wiz-delete').style.display = editingId ? '' : 'none';
  document.getElementById('wiz-progress').textContent = `Paso ${wizStepN} de 4`;
  document.getElementById('wiz-next').textContent = wizStepN === 4
    ? (editingId ? '✓ Guardar Cambios' : '✓ Crear Lanzamiento')
    : 'Continuar →';
  document.querySelector('.wiz-logo small').textContent = editingId ? 'Editar Lanzamiento' : 'Campaign Planner';
  document.querySelector('.wiz-body').scrollTop = 0;
}
function wizNext() { if (wizStepN < 4) { wizStepN++; wizRender(); } else { wizFinish(); } }
function wizPrev() { if (wizStepN > 1) { wizStepN--; wizRender(); } }

async function wizFinish() {
  const data = wizCollect();
  const wasEditing = editingId;
  if (wasEditing) {
    const i = launches.findIndex(x => x.id === wasEditing);
    if (i >= 0) launches[i] = data; else launches.push(data);
  } else {
    // ¿Arrastrar metas del lanzamiento anterior del mismo artista?
    const prev = launches.filter(l => l.artistId === data.artistId && (l.goals || []).length)
      .sort((x, y) => (y.date || '').localeCompare(x.date || ''))[0];
    if (prev) {
      const keep = await uiConfirm(`¿Mantener las metas del lanzamiento anterior (“${s(prev.name)}”) en este nuevo lanzamiento, o empezar con metas nuevas?`,
        { title: 'Metas del lanzamiento', okText: 'Mantenerlas', cancelText: 'Empezar nuevas' });
      if (keep) {
        const end = launchEndDate(data);
        data.goals = (prev.goals || []).map(g => Object.assign({}, g, { status: 'proposed', deadline: end }));
        data.goalsAITried = true; // ya tiene metas, no auto-generar
      }
    }
    launches.push(data);
  }
  saveLaunches();
  renderAllLaunches();
  cerrarWizard();
  // si editaba el lanzamiento abierto, vuelve a su detalle actualizado
  if (wasEditing) { openLaunch(wasEditing); }
  else { openLaunch(data.id); }
}
function wizDelete() { if (editingId) borrarLanzamiento(editingId); }

function wizValidateStep1() { /* gating futuro */ }
function wizPickCover(el) {
  document.querySelectorAll('.cover-opt').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}
function wizStep(which, dir) {
  if (which === 'pre')  { preDays  = Math.max(0, preDays + dir);  document.getElementById('pre-days').textContent  = preDays; }
  else                  { postDays = Math.max(0, postDays + dir); document.getElementById('post-days').textContent = postDays; }
  if (document.getElementById('timeline-result').classList.contains('show')) wizCalcTimeline();
}
function wizCalcTimeline() {
  const dateVal = document.getElementById('wiz-date').value;
  const res = document.getElementById('timeline-result');
  res.classList.add('show');
  document.getElementById('tl-pre').style.flex  = preDays;
  document.getElementById('tl-post').style.flex = postDays;
  document.getElementById('tl-pre').textContent  = `PRE · ${preDays}d`;
  document.getElementById('tl-post').textContent = `POST · ${postDays}d`;
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const fmt = d => `${d.getDate()} ${months[d.getMonth()]}`;
  if (dateVal) {
    const drop = new Date(dateVal + 'T00:00:00');
    const start = new Date(drop); start.setDate(start.getDate() - preDays);
    const end = new Date(drop);   end.setDate(end.getDate() + postDays);
    document.getElementById('tl-start').textContent = fmt(start);
    document.getElementById('tl-drop').textContent  = `DROP ${fmt(drop)}`;
    document.getElementById('tl-end').textContent   = fmt(end);
  } else {
    document.getElementById('tl-start').textContent = `Inicio (−${preDays}d)`;
    document.getElementById('tl-drop').textContent  = 'Lanzamiento';
    document.getElementById('tl-end').textContent   = `Cierre (+${postDays}d)`;
  }
}

// ══════════════════════════════════════════
// ARTISTAS — switcher, binding de formularios, equipo
// ══════════════════════════════════════════
function renderSidebarArtist() {
  const a = activeArtist();
  if (typeof updateLabelNav === 'function') updateLabelNav();
  document.getElementById('sb-avatar').textContent = a ? up(a.name).slice(0,1) : '?';
  document.getElementById('sb-name').textContent = a ? a.name : '—';
  const so = document.getElementById('topbar-signout'); if (so) so.style.display = authed() ? '' : 'none';
  const menu = document.getElementById('artist-menu');
  menu.innerHTML = (_restrictedArtist ? '' : artists.map(ar => `
    <div class="artist-menu-item ${ar.id===currentArtistId?'active':''}" onclick="setActiveArtist('${ar.id}')">
      <div class="artist-avatar" style="width:24px;height:24px;font-size:11px">${up(ar.name).slice(0,1)}</div>
      <span>${s(ar.name)}</span>
      ${ar.id===currentArtistId?'<span style="margin-left:auto">✓</span>':''}
    </div>`).join('')
    + `<div class="artist-menu-item artist-menu-add" onclick="abrirNuevoArtista()">+ Nuevo artista</div>`)
    + `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`
    + (authed() ? `<div class="artist-menu-item" onclick="abrirCuenta()">⚙ Mi cuenta</div>` + (_restrictedArtist ? '' : `<div class="artist-menu-item" onclick="abrirTeam()">👥 Mi equipo · ${s(_teamName)}</div>`) : '')
    + (isAdmin() ? `<div class="artist-menu-item" onclick="abrirAdmin()" style="color:var(--accent)">🛠 Backend admin</div>` : '')
    + `<div class="artist-menu-item" onclick="abrirSync()">☁ Sincronización <span id="sync-menu-dot" style="margin-left:auto;font-size:10px;color:${cloudEnabled()?'#4ade80':'var(--text-dim)'}">${cloudEnabled()?'●':'○'}</span></div>`
    + (authed() ? '' : `<div class="artist-menu-item" onclick="exportarDatos()">⤓ Exportar backup (.json)</div><div class="artist-menu-item" onclick="importarDatos()">⤒ Importar backup</div>`);
}
function toggleArtistMenu(force) {
  const menu = document.getElementById('artist-menu');
  const open = (force === undefined) ? !menu.classList.contains('open') : force;
  menu.classList.toggle('open', open);
}
function setActiveArtist(id) {
  if (!artists.find(a => a.id === id)) return;
  currentArtistId = id; saveActiveArtist();
  currentLaunchId = null;
  toggleArtistMenu(false);
  renderSidebarArtist();
  renderAllLaunches();
  const p = (document.querySelector('.page.active') || {}).id;
  if (p === 'page-calendario') renderCalendar();
  else if (p === 'page-objetivos') renderObjetivos();
  else if (p === 'page-metricas') renderMetricas();
  else if (p === 'page-banco') renderBanco();
  else if (p === 'page-ideas') renderIdeas();
  else if (p === 'page-aprendizajes') renderAprendizajes();
  else if (p === 'page-ia') renderIA();
  else if (p === 'page-perfil' || p === 'page-adn') renderArtistForms();
  else if (p === 'page-launch') showPage('lanzamientos');
  else renderDashboard();
}

function abrirNuevoArtista() { toggleArtistMenu(false); openArtistWizard(); }
function cerrarNuevoArtista(e) {
  if (!e || e.target === document.getElementById('modal-artist'))
    document.getElementById('modal-artist').classList.remove('open');
}
function crearArtista() {
  const name = document.getElementById('na-name').value.trim();
  if (!name) { document.getElementById('na-status').textContent = 'Escribe un nombre'; return; }
  const a = makeArtist(name, { genre: document.getElementById('na-genre').value.trim(), country: document.getElementById('na-country').value.trim() });
  artists.push(a); saveArtists();
  currentArtistId = a.id; saveActiveArtist(); currentLaunchId = null;
  document.getElementById('modal-artist').classList.remove('open');
  renderSidebarArtist(); renderAllLaunches();
  showPage('perfil');
}

// ══════════════════════════════════════════
// FASE 4: Wizard de ADN artístico (onboarding con IA)
// ══════════════════════════════════════════
const AW_STEPS = ['Básicos','Historia','Sonido','Estética','Fan ideal','ADN IA'];
let awStep = 1;
let awData = null;
function awBlank() {
  return { name:'', genre:'', country:'', ig:'', tiktok:'', spotify:'',
    hist:{from:'',drive:'',who:''},
    refs:[{a:'',why:''},{a:'',why:''},{a:'',why:''}],
    aes:{w1:'',w2:'',w3:'',color:''}, fan:'', generated:null };
}
function openArtistWizard() { awData = awBlank(); awStep = 1; awRender(); document.getElementById('artist-wizard').classList.add('open'); }
function closeArtistWizard() { document.getElementById('artist-wizard').classList.remove('open'); }
function awRender() {
  document.getElementById('aw-steps').innerHTML = AW_STEPS.map((lbl,i) => {
    const n = i+1; const cls = n===awStep ? 'active' : (n<awStep ? 'done' : '');
    return `<div class="wiz-step ${cls}"><span class="num">${n<awStep?'✓':n}</span><span class="lbl">${lbl}</span></div>${n<AW_STEPS.length?'<span class="wiz-arrow">›</span>':''}`;
  }).join('');
  document.getElementById('aw-panel').innerHTML = awPanelHTML(awStep);
  document.getElementById('aw-back').style.display = awStep>1 ? '' : 'none';
  document.getElementById('aw-progress').textContent = `Paso ${awStep} de 6`;
  document.getElementById('aw-next').textContent = awStep===6 ? '✓ Crear Artista' : 'Continuar →';
  document.querySelector('#artist-wizard .wiz-body').scrollTop = 0;
}
function awNext() { if (awStep<6) { awStep++; awRender(); } else awFinish(); }
function awPrev() { if (awStep>1) { awStep--; awRender(); } }
function awPanelHTML(step) {
  if (step===1) return `<h2>DATOS BÁSICOS</h2><div class="sub">Lo esencial del artista.</div>
    <div class="wiz-field"><label>Nombre artístico *</label><input class="input" value="${s(awData.name)}" oninput="awData.name=this.value"></div>
    <div class="stepper-row" style="grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px">
      <div class="wiz-field" style="margin:0"><label>Género</label><input class="input" value="${s(awData.genre)}" oninput="awData.genre=this.value" placeholder="Ej. Pop alternativo"></div>
      <div class="wiz-field" style="margin:0"><label>País</label><input class="input" value="${s(awData.country)}" oninput="awData.country=this.value"></div>
    </div>
    <div class="stepper-row" style="grid-template-columns:1fr 1fr 1fr;gap:14px">
      <div class="wiz-field" style="margin:0"><label>Instagram</label><input class="input" value="${s(awData.ig)}" oninput="awData.ig=this.value" placeholder="@"></div>
      <div class="wiz-field" style="margin:0"><label>TikTok</label><input class="input" value="${s(awData.tiktok)}" oninput="awData.tiktok=this.value" placeholder="@"></div>
      <div class="wiz-field" style="margin:0"><label>Spotify</label><input class="input" value="${s(awData.spotify)}" oninput="awData.spotify=this.value" placeholder="link"></div>
    </div>`;
  if (step===2) return `<h2>TU HISTORIA</h2><div class="sub">3 preguntas que definen tu raíz.</div>
    <div class="wiz-field"><label>¿De dónde vengo?</label><textarea class="textarea" oninput="awData.hist.from=this.value" placeholder="Tu origen, tu contexto…">${s(awData.hist.from)}</textarea></div>
    <div class="wiz-field"><label>¿Qué me mueve?</label><textarea class="textarea" oninput="awData.hist.drive=this.value" placeholder="Tu motor, tu misión…">${s(awData.hist.drive)}</textarea></div>
    <div class="wiz-field"><label>¿A quién le hablo?</label><textarea class="textarea" oninput="awData.hist.who=this.value" placeholder="A quién va dirigida tu música…">${s(awData.hist.who)}</textarea></div>`;
  if (step===3) return `<h2>REFERENCIAS SONORAS</h2><div class="sub">3 artistas que te inspiran — no que suenas igual, sino qué te mueve de ellos.</div>
    ${[0,1,2].map(i => `<div class="stepper-row" style="grid-template-columns:1fr 2fr;gap:14px;margin-bottom:14px">
      <div class="wiz-field" style="margin:0"><label>Artista ${i+1}</label><input class="input" value="${s(awData.refs[i].a)}" oninput="awData.refs[${i}].a=this.value"></div>
      <div class="wiz-field" style="margin:0"><label>¿Qué te inspira?</label><input class="input" value="${s(awData.refs[i].why)}" oninput="awData.refs[${i}].why=this.value"></div>
    </div>`).join('')}`;
  if (step===4) return `<h2>ESTÉTICA VISUAL</h2><div class="sub">3 palabras que describen tu mundo visual + tu color dominante.</div>
    <div class="stepper-row" style="grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:22px">
      <div class="wiz-field" style="margin:0"><label>Palabra 1</label><input class="input" value="${s(awData.aes.w1)}" oninput="awData.aes.w1=this.value"></div>
      <div class="wiz-field" style="margin:0"><label>Palabra 2</label><input class="input" value="${s(awData.aes.w2)}" oninput="awData.aes.w2=this.value"></div>
      <div class="wiz-field" style="margin:0"><label>Palabra 3</label><input class="input" value="${s(awData.aes.w3)}" oninput="awData.aes.w3=this.value"></div>
    </div>
    <div class="wiz-field"><label>Color dominante</label><input class="input" value="${s(awData.aes.color)}" oninput="awData.aes.color=this.value" placeholder="Ej. dorado y negro, #FF6B30"></div>`;
  if (step===5) return `<h2>FAN IDEAL</h2><div class="sub">Describe en ~5 líneas a la persona que más conecta contigo.</div>
    <div class="wiz-field"><textarea class="textarea" style="min-height:150px" oninput="awData.fan=this.value" placeholder="Edad, qué siente, qué escucha, dónde vive, qué le mueve…">${s(awData.fan)}</textarea></div>`;
  // step 6
  return `<h2>REVISIÓN IA</h2><div class="sub">La IA toma tus respuestas y genera tu bio, tono, narrativa y keywords. Esto se vuelve el "system prompt base" de todos los generadores.</div>
    <div style="margin-bottom:6px"><button class="btn btn-ghost" style="border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="awGenerar()">✨ ${awData.generated?'Regenerar':'Generar'} ADN con IA</button></div>
    ${aiHintHTML(buildADNPrompt(), 800)}
    <div id="aw-result" style="margin-top:14px">${awData.generated ? awResultHTML(awData.generated) : '<div class="empty-hint">Genera el ADN para revisarlo. (También puedes crear el artista sin IA y completar el ADN luego en su perfil.)</div>'}</div>`;
}
function awResultHTML(g) {
  return `
    <div class="wiz-field"><label>Bio · 1 línea</label><input class="input" value="${s(g.bio_1line)}" oninput="awData.generated.bio_1line=this.value"></div>
    <div class="wiz-field"><label>Bio · ~100 palabras</label><textarea class="textarea" oninput="awData.generated.bio_100=this.value">${s(g.bio_100)}</textarea></div>
    <div class="wiz-field"><label>Bio · ~300 palabras</label><textarea class="textarea" style="min-height:120px" oninput="awData.generated.bio_300=this.value">${s(g.bio_300)}</textarea></div>
    <div class="stepper-row" style="grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px">
      <div class="wiz-field" style="margin:0"><label>Tono de comunicación</label><input class="input" value="${s(g.tono)}" oninput="awData.generated.tono=this.value"></div>
      <div class="wiz-field" style="margin:0"><label>Keywords</label><input class="input" value="${s((g.keywords||[]).join(', '))}" oninput="awData.generated.keywords=this.value.split(',').map(x=>x.trim()).filter(Boolean)"></div>
    </div>
    <div class="wiz-field"><label>Narrativa de campaña base</label><textarea class="textarea" oninput="awData.generated.narrativa=this.value">${s(g.narrativa)}</textarea></div>`;
}
function buildADNPrompt() {
  const r = awData.refs.map(x => x.a && x.why ? `${x.a} (${x.why})` : x.a).filter(Boolean).join('; ') || '—';
  return `Eres estratega de marca de artistas musicales. Con base en el onboarding, genera el ADN del artista.

NOMBRE: ${s(awData.name)} · Género: ${s(awData.genre)} · País: ${s(awData.country)}
HISTORIA — De dónde vengo: ${s(awData.hist.from)} | Qué me mueve: ${s(awData.hist.drive)} | A quién le hablo: ${s(awData.hist.who)}
REFERENCIAS SONORAS: ${r}
ESTÉTICA: ${[awData.aes.w1,awData.aes.w2,awData.aes.w3].filter(Boolean).join(', ')} · Color: ${s(awData.aes.color)}
FAN IDEAL: ${s(awData.fan)}

Devuelve SOLO un objeto JSON válido, en español, con esta forma:
{
 "bio_1line": "bio en 1 línea potente",
 "bio_100": "bio de ~100 palabras",
 "bio_300": "bio de ~300 palabras",
 "tono": "tono de comunicación definido en 1 frase",
 "narrativa": "narrativa de campaña base en 2-3 frases",
 "keywords": ["8 a 12 keywords estratégicos de marca"]
}`;
}
async function awGenerar() {
  if (!aiReady()) { abrirAISettings(); return; }
  const res = document.getElementById('aw-result');
  res.innerHTML = '<div class="empty-hint">✨ Generando ADN…</div>';
  try {
    const { text } = await callClaude(buildADNPrompt(), 1500);
    const obj = parseJSONObj(text);
    if (!obj) throw new Error('La IA no devolvió un ADN válido.');
    awData.generated = obj;
    awRender();
  } catch (e) { res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)} — revisa ⚙ API.</div>`; }
}
function awFinish() {
  const name = (awData.name || '').trim() || 'Nuevo Artista';
  const g = awData.generated;
  const a = makeArtist(name, {
    genre: awData.genre, country: awData.country,
    socials: { ig: awData.ig, tiktok: awData.tiktok, youtube:'', x:'' },
    dsps: { spotify: awData.spotify, apple:'', ytmusic:'', other:'' },
    bio: g ? { oneLine: g.bio_1line || '', short: g.bio_100 || '', long: g.bio_300 || '' } : { oneLine:'', short:'', long:'' },
    keywords: g ? (Array.isArray(g.keywords) ? g.keywords.join(', ') : s(g.keywords)) : '',
    adn: Object.assign(emptyADN(), {
      identity: { history: awData.hist.from, mission: awData.hist.drive, vision:'', values:'' },
      personality: { archetypes: [], tone: g ? g.tono : '', expression:'' },
      universe: { themes:'', conflicts:'', messages: g ? g.narrativa : '' },
      aesthetics: { colors: awData.aes.color, photoStyle: [awData.aes.w1,awData.aes.w2,awData.aes.w3].filter(Boolean).join(', ') },
      sound: { genres: awData.genre, influences: awData.refs.map(r => r.a).filter(Boolean).join(', '), references: awData.refs.map(r => r.a && r.why ? `${r.a} (${r.why})` : r.a).filter(Boolean).join(' · ') },
      audience: { current:'', ideal: awData.fan, buyer:'' },
    }),
  });
  normalizeArtist(a);
  artists.push(a); saveArtists();
  currentArtistId = a.id; saveActiveArtist(); currentLaunchId = null;
  closeArtistWizard();
  renderSidebarArtist(); renderAllLaunches();
  showPage('perfil');
}

// ── Export / Import (backup local, Fase 0) ──
function exportarDatos() {
  if (!requireCan('export')) return;
  toggleArtistMenu(false);
  const ai = aiSettings();
  const data = {
    app: 'Tempo OS', version: 1, exportedAt: new Date().toISOString(),
    artists: (function(){ try { return JSON.parse(localStorage.getItem('ao_artists')) || []; } catch(e){ return []; } })(),
    launches: (function(){ try { return JSON.parse(localStorage.getItem('ao_launches')) || []; } catch(e){ return []; } })(),
    activeArtist: localStorage.getItem('ao_active_artist') || '',
    aiSettings: { model: ai.model, priceIn: ai.priceIn, priceOut: ai.priceOut, maxTokens: ai.maxTokens }, // sin key
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tempo-os-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importarDatos() {
  toggleArtistMenu(false);
  document.getElementById('import-file').click();
}
function handleImportFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || !Array.isArray(data.artists)) throw new Error('Archivo de backup inválido (falta "artists").');
      const nA = data.artists.length, nL = Array.isArray(data.launches) ? data.launches.length : 0;
      if (!await uiConfirm(`Esto REEMPLAZARÁ todos los datos actuales por el backup:\n· ${nA} artista(s)\n· ${nL} lanzamiento(s)\n\n¿Continuar?`, {danger:true, okText:'Reemplazar'})) { e.target.value = ''; return; }
      localStorage.setItem('ao_artists', JSON.stringify(data.artists));
      localStorage.setItem('ao_launches', JSON.stringify(data.launches || []));
      if (data.activeArtist) localStorage.setItem('ao_active_artist', data.activeArtist);
      if (data.aiSettings) {
        const cur = aiSettings(); // conservar la key local
        localStorage.setItem('ao_ai_settings', JSON.stringify(Object.assign({}, data.aiSettings, { key: cur.key })));
      }
      await uiAlert('✓ Backup restaurado. La app se recargará.');
      location.reload();
    } catch (err) {
      uiAlert('✕ No se pudo importar: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// binding genérico de formularios (Perfil / ADN)
function getPath(obj, path) { return path.split('.').reduce((o,k) => (o==null?undefined:o[k]), obj); }
function setPath(obj, path, val) {
  const ks = path.split('.'); let o = obj;
  for (let i=0;i<ks.length-1;i++){ if(o[ks[i]]==null||typeof o[ks[i]]!=='object') o[ks[i]]={}; o=o[ks[i]]; }
  o[ks[ks.length-1]] = val;
}
function renderArtistForms() {
  const a = activeArtist(); if (!a) return;
  const b1=document.getElementById('perfil-artist-badge'); if(b1) b1.textContent = a.name;
  const b2=document.getElementById('adn-artist-badge'); if(b2) b2.textContent = a.name;
  const vis = document.getElementById('perfil-visibility');
  if (vis) vis.innerHTML = authed()
    ? `<span style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);letter-spacing:1px">VISIBILIDAD</span>
       <select class="input" style="padding:4px 8px;font-size:11px;width:auto" ${canEdit()?'':'disabled'} onchange="setArtistVisibility('${a.id}',this.value)">
         <option value="team" ${(a.visibility||'team')==='team'?'selected':''}>Todo el equipo</option>
         <option value="private" ${a.visibility==='private'?'selected':''}>Solo yo</option>
       </select>`
    : '';
  document.querySelectorAll('[data-bind]').forEach(el => {
    const v = getPath(a, el.dataset.bind);
    el.value = (v==null ? '' : v);
  });
  document.querySelectorAll('[data-bind-array]').forEach(cont => {
    const arr = getPath(a, cont.dataset.bindArray) || [];
    cont.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('on', arr.includes(ch.textContent.trim())));
  });
  renderTeam();
}
function toggleArchetype(ch) {
  const cont = ch.closest('[data-bind-array]'); if (!cont) return;
  const a = activeArtist(); if (!a) return;
  const path = cont.dataset.bindArray;
  let arr = getPath(a, path); if (!Array.isArray(arr)) { arr = []; setPath(a, path, arr); }
  const label = ch.textContent.trim();
  const i = arr.indexOf(label);
  if (i>=0) { arr.splice(i,1); ch.classList.remove('on'); } else { arr.push(label); ch.classList.add('on'); }
  saveArtists();
}

// equipo de trabajo
function renderTeam() {
  const a = activeArtist(); const host = document.getElementById('team-list'); if (!host) return;
  if (!a || !a.team.length) { host.innerHTML = `<div class="empty-hint">Aún no hay miembros. Agrega manager, productor, editor, social media…</div>`; return; }
  host.innerHTML = a.team.map((m,i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div class="artist-avatar" style="width:30px;height:30px;font-size:12px">${up(m.name||'?').slice(0,1)}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:500">${s(m.name)}</div><div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${s(m.role)||'—'}</div></div>
      <button class="goal-btn reject" onclick="quitarMiembro(${i})" title="Quitar">✕</button>
    </div>`).join('');
}
async function agregarMiembro() {
  if (!requireCan('edit_perfil_adn')) return;
  const a = activeArtist(); if (!a) return;
  const name = await uiPrompt('Nombre del miembro:', {title:'Agregar miembro'}); if (!name) return;
  const role = await uiPrompt('Rol (ej. Manager, Productor, Editor):') || '';
  a.team.push({ name: name.trim(), role: role.trim() });
  saveArtists(); renderTeam();
}
function quitarMiembro(i) {
  if (!requireCan('edit_perfil_adn')) return;
  const a = activeArtist(); if (!a || !a.team[i]) return;
  a.team.splice(i,1); saveArtists(); renderTeam();
}

// guardado en vivo de inputs con data-bind
document.addEventListener('input', function(e) {
  const el = e.target.closest && e.target.closest('[data-bind]');
  if (!el) return;
  if (!canDo('edit_perfil_adn')) { return; } // lector/sin permiso: no guarda (campos van deshabilitados visualmente)
  const a = activeArtist(); if (!a) return;
  setPath(a, el.dataset.bind, el.value);
  saveArtists();
  if (el.dataset.bind === 'name') renderSidebarArtist();
});
// cerrar el menú de artista al hacer click afuera
document.addEventListener('click', function(e) {
  const sw = document.getElementById('artist-switcher');
  if (sw && !sw.contains(e.target)) toggleArtistMenu(false);
});

// ══════════════════════════════════════════
// SINCRONIZACIÓN EN LA NUBE (Supabase)
// ══════════════════════════════════════════
let _sb = null, _cloudTimer = null, syncState = 'off';
// ── Credenciales del proyecto, horneadas en la app (la anon key es PÚBLICA por diseño; la protege RLS+Auth) ──
// Los usuarios comunes nunca las ven ni las teclean. El super-admin puede sobreescribirlas (se guardan en localStorage).
const TEMPO_SUPABASE = {
  url: 'https://fzemsxyrzyssxprewwzs.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6ZW1zeHlyenlzc3hwcmV3d3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTI3OTcsImV4cCI6MjA5NjI2ODc5N30.6rZw5gzIhUryZOzC2Mx4-kgrZSxWtjXSXS_-EL--FUg' // anon key pública (la protege RLS+Auth)
};
// Solo estos correos ven el "backend" (credenciales Supabase + config de IA).
const ADMIN_EMAILS = ['josh@hookspa.com'];
let _isSuperAdmin = false; // se confirma con el RPC is_super_admin() al cargar sesión (autoritativo del servidor)
function isAdmin() { return _isSuperAdmin || !!(_user && ADMIN_EMAILS.indexOf(((_user.email)||'').toLowerCase()) >= 0); }
function supaCfg() {
  let c = {}; try { c = JSON.parse(localStorage.getItem('ao_supabase')) || {}; } catch (e) {}
  return { url: c.url || TEMPO_SUPABASE.url, key: c.key || TEMPO_SUPABASE.key };
}
function saveSupaCfg(c) { localStorage.setItem('ao_supabase', JSON.stringify(c)); }
function cloudEnabled() { const c = supaCfg(); return !!(c.url && c.key); }
function ensureSupabaseLib() {
  return new Promise((res, rej) => {
    if (window.supabase && window.supabase.createClient) return res();
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    sc.onload = () => res(); sc.onerror = () => rej(new Error('No se pudo cargar la librería de Supabase (¿sin internet?)'));
    document.head.appendChild(sc);
  });
}
async function getSb() {
  const c = supaCfg(); if (!c.url || !c.key) return null;
  await ensureSupabaseLib();
  if (!_sb) _sb = window.supabase.createClient(c.url, c.key);
  return _sb;
}
function setSyncStatus(state, msg) {
  syncState = state;
  const map = { off:['○','var(--text-dim)','Sin conectar'], syncing:['◍','var(--beat)','Sincronizando…'], ok:['●','#4ade80','Sincronizado'], error:['●','var(--accent2)', msg || 'Error'] };
  const m = map[state] || map.off;
  const st = document.getElementById('sync-status'); if (st) { st.textContent = m[2]; st.style.color = m[1]; }
  const dot = document.getElementById('sync-menu-dot'); if (dot) { dot.textContent = m[0]; dot.style.color = m[1]; }
}
function scheduleCloudSync() {
  if (!cloudEnabled() || !authed() || !canEdit()) return;
  clearTimeout(_cloudTimer);
  _cloudTimer = setTimeout(cloudSyncAll, 1500);
}
async function cloudSyncAll() {
  if (!cloudEnabled() || !authed()) return;
  try {
    const sb = await getSb(); if (!sb) return;
    setSyncStatus('syncing');
    const now = new Date().toISOString();
    const aRows = artists.map(a => ({ id: a.id, data: a, team_id: _teamId, owner: _user && _user.id, visibility: a.visibility || 'team', user_id: a.userId || null, updated_at: now }));
    const lRows = launches.map(l => ({ id: l.id, artist_id: l.artistId, team_id: _teamId, data: l, updated_at: now }));
    const r1 = await sb.from('artists').upsert(aRows);
    const r2 = await sb.from('launches').upsert(lRows);
    if (r1.error) throw new Error(r1.error.message);
    if (r2.error) throw new Error(r2.error.message);
    setSyncStatus('ok');
  } catch (e) { setSyncStatus('error', e.message); }
}
async function cloudLoad() {
  try {
    const sb = await getSb(); if (!sb) return;
    setSyncStatus('syncing');
    const aq = sb.from('artists').select('data, user_id');  if (_teamId) aq.eq('team_id', _teamId);
    const lq = sb.from('launches').select('data'); if (_teamId) lq.eq('team_id', _teamId);
    const [ar, lr] = await Promise.all([ aq, lq ]);
    if (ar.error) throw new Error(ar.error.message);
    if (lr.error) throw new Error(lr.error.message);
    // La nube es la ÚNICA fuente de verdad (aunque esté vacía). Nunca subimos residuos locales.
    artists = (ar.data || []).map(r => { const a = normalizeArtist(r.data); a.userId = r.user_id || null; return a; });
    launches = (lr.data || []).map(r => normalizeLaunch(r.data));
    saveArtistsLocal(); saveLaunchesLocal();
    if (!artists.find(a => a.id === currentArtistId)) currentArtistId = artists[0] && artists[0].id;
    renderSidebarArtist(); renderAllLaunches();
    const p = (document.querySelector('.page.active') || {}).id;
    if (p === 'page-perfil' || p === 'page-adn') renderArtistForms();
    if (p === 'page-dashboard') renderDashboard();
    setSyncStatus('ok');
  } catch (e) { setSyncStatus('error', e.message); }
}
async function cloudDelete(table, id) {
  if (!cloudEnabled()) return;
  try { const sb = await getSb(); if (sb) await sb.from(table).delete().eq('id', id); } catch (e) {}
}
// Modal de conexión
function abrirSync() {
  toggleArtistMenu(false);
  const admin = isAdmin();
  const adminBox = document.getElementById('sync-admin');
  const userNote = document.getElementById('sync-note-user');
  if (adminBox) adminBox.style.display = admin ? '' : 'none';
  if (userNote) userNote.style.display = admin ? 'none' : '';
  if (admin) {
    let raw = {}; try { raw = JSON.parse(localStorage.getItem('ao_supabase')) || {}; } catch (e) {}
    const c = supaCfg();
    const su = document.getElementById('sync-url'); if (su) su.value = raw.url || c.url || '';
    const sk = document.getElementById('sync-key'); if (sk) sk.value = raw.key || '';
  }
  setSyncStatus(cloudEnabled() ? syncState : 'off');
  document.getElementById('modal-sync').classList.add('open');
}
function cerrarSync(e) { if (!e || e.target === document.getElementById('modal-sync')) document.getElementById('modal-sync').classList.remove('open'); }
async function conectarSupabase() {
  const url = document.getElementById('sync-url').value.trim().replace(/\/$/, '');
  const key = document.getElementById('sync-key').value.trim();
  if (!url || !key) { setSyncStatus('error', 'Falta URL o anon key'); return; }
  saveSupaCfg({ url, key });
  setSyncStatus('syncing', 'Recargando para iniciar sesión…');
  setTimeout(() => location.reload(), 400); // recarga → authInit muestra el login
}
async function desconectarSupabase() {
  if (!await uiConfirm('¿Restablecer las credenciales a las horneadas por defecto en este navegador?')) return;
  localStorage.removeItem('ao_supabase'); _sb = null; setSyncStatus('off');
  location.reload();
}

// ── AUTH + EQUIPOS + INVITACIONES ──
let _user = null, _teamId = null, _teamMembers = [], _teamName = 'Mi equipo', _myRole = 'owner';
let _teams = []; // todos los equipos del usuario: [{id, name, role}]
// ── PLANES / TIERS / ASIENTOS (v0.11) ──
let _teamPlan = 'free';   // 'free' | 'pro' | 'manager' | 'custom'
let _teamStatus = 'active'; // 'active' | 'suspended'
let _myArtistId = null, _restrictedArtist = false; // artista ligado a su ficha → solo ve lo suyo
function computeArtistRestriction() {
  _myArtistId = null; _restrictedArtist = false;
  if (!authed() || !_user) return;
  const mine = artists.find(a => a.userId && a.userId === _user.id);
  if (mine) { _myArtistId = mine.id; _restrictedArtist = !isOwner(); _isArtist = true; } // el owner nunca se restringe
}
function applyArtistRestriction() {
  computeArtistRestriction();
  document.body.classList.toggle('artist-restricted', _restrictedArtist);
  if (_restrictedArtist) {
    if (_myArtistId && currentArtistId !== _myArtistId) { currentArtistId = _myArtistId; if (typeof saveActiveArtist === 'function') saveActiveArtist(); }
    const ap = document.querySelector('.page.active');
    if (ap && (ap.id === 'page-label')) showPage('perfil');
  }
  applyRolePerms();
  if (typeof updateLabelNav === 'function') updateLabelNav();
}
let _isArtist = false;    // el miembro actual es "el artista" del equipo
let _teamCounters = { ideas_generadas_mes: 0, ideas_reset_date: null, banco_refreshes: 0, banco_refreshes_reset_date: null };

// ════════════════════════════════════════════════════════════════
// CAPA DE PERMISOS Y LÍMITES
// ────────────────────────────────────────────────────────────────
// BILLING_ENFORCED controla SOLO los límites ligados a pago (tiers/cuotas).
// Hoy en false → ningún límite numérico aplica (operación libre sin pagos).
// Los permisos por ROL (canDo) SIEMPRE están activos: son colaboración, no pago.
// Para abrir TODO durante desarrollo (incluidos roles), poner DEV_OPEN = true.
// ════════════════════════════════════════════════════════════════
const BILLING_ENFORCED = false;
const DEV_OPEN = false;

// Permisos por rol/asiento (no dependen de pago)
function canDo(action) {
  if (DEV_OPEN || !authed()) return true; // demo/dev: todo permitido
  const role = myRole();      // 'owner' | 'editor' | 'lector'
  const artist = _isArtist || !!_myArtistId;
  switch (action) {
    case 'create_launch':
    case 'edit_launch':
    case 'use_ia_estrategica':
    case 'use_generador_ia':
    case 'export':
    case 'banco_add':
    case 'calendar_edit':
      return role === 'owner' || role === 'editor' || artist; // el artista trabaja en lo suyo
    case 'edit_perfil_adn':
      return role === 'owner' || artist;
    case 'invite_members':
    case 'manage_roles':
    case 'assign_artist':
      return role === 'owner';
    default:
      return true; // ver = libre para todos
  }
}
// Guard para handlers: si no puede, avisa y devuelve false.
function requireCan(action, msg) {
  if (canDo(action)) return true;
  uiAlert(msg || 'Solo lectura · necesitas rol Editor u Owner para hacer esto.');
  return false;
}

// Límites numéricos por tier (ligados a pago). Devuelve { ok, msg }.
// Con BILLING_ENFORCED=false siempre { ok:true } → no limita nada.
function checkPlanLimit(kind, ctx) {
  if (!BILLING_ENFORCED || DEV_OPEN) return { ok: true };
  ctx = ctx || {};
  const plan = _teamPlan;
  const resetMsg = () => {
    const d = _teamCounters.ideas_reset_date ? new Date(_teamCounters.ideas_reset_date) : new Date();
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return next.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  };
  switch (kind) {
    case 'create_launch': {
      const active = launches.filter(l => l.status === 'active').length;
      if (plan === 'free' && active >= 1)
        return { ok: false, msg: 'Completa tu lanzamiento actual para iniciar uno nuevo. (Plan Free)' };
      return { ok: true };
    }
    case 'banco_add': {
      if (plan === 'free' && (referencias.length >= 50))
        return { ok: false, msg: 'Alcanzaste el límite de 50 referencias del plan Free.' };
      return { ok: true };
    }
    case 'banco_refresh': {
      if (plan === 'free' && (_teamCounters.banco_refreshes || 0) >= 2)
        return { ok: false, msg: 'Usaste tus 2 actualizaciones del banco este mes (plan Free). Vuelven el ' + resetMsg() + '.' };
      return { ok: true };
    }
    case 'ideas_ia': {
      if (['pro', 'manager'].indexOf(plan) >= 0 && (_teamCounters.ideas_generadas_mes || 0) >= 12)
        return { ok: false, msg: 'Alcanzaste las 12 ideas de este mes. Vuelven el ' + resetMsg() + '.' };
      return { ok: true };
    }
    case 'ia_estrategica': {
      const done = launches.filter(l => l.status === 'complete').length;
      if (done < 3)
        return { ok: false, msg: 'La IA estratégica se activa después de tu 3er lanzamiento completado.' };
      return { ok: true, note: done < 5 ? 'Mejores resultados a partir del 5to lanzamiento completado.' : null };
    }
    default:
      return { ok: true };
  }
}
// Incrementa un contador del equipo en Supabase (best-effort).
async function bumpTeamCounter(field) {
  if (!BILLING_ENFORCED) return;
  _teamCounters[field] = (_teamCounters[field] || 0) + 1;
  try { const sb = await getSb(); if (sb && _teamId) await sb.from('teams').update({ [field]: _teamCounters[field] }).eq('id', _teamId); } catch (e) {}
}
// Ideas restantes del mes (para mostrar en UI). null = sin límite aplicable.
function ideasRestantes() {
  if (!BILLING_ENFORCED || ['pro', 'manager'].indexOf(_teamPlan) < 0) return null;
  return Math.max(0, 12 - (_teamCounters.ideas_generadas_mes || 0));
}
function authed() { return !!(_user && _teamId); }
function activeTeam() { return _teams.find(t => t.id === _teamId) || null; }
function myRole() { if (!authed()) return 'owner'; const t = activeTeam(); return (t && t.role) || 'editor'; }
function canEdit() { return myRole() !== 'lector' || !!_myArtistId; } // el artista vinculado edita lo suyo
function isOwner() { return myRole() === 'owner'; }
function applyRolePerms() {
  const r = authed() ? myRole() : null;
  const lector = (r === 'lector') && !_myArtistId; // el artista vinculado no queda en solo-lectura sobre lo suyo
  document.body.classList.toggle('role-lector', lector);
  document.body.classList.toggle('role-editor', r === 'editor');
  document.body.classList.toggle('role-owner', r === 'owner');
  const tip = 'Solo lectura · necesitas rol Editor u Owner';
  const nb = document.querySelector('.topbar .btn-primary');
  if (nb) nb.title = lector ? tip : '';
}
const agVal = id => (document.getElementById(id) || {}).value || '';
function agStatus(msg, err) { const el = document.getElementById('ag-status'); if (el) { el.textContent = msg; el.style.color = err ? 'var(--accent2)' : 'var(--text-muted)'; } }
function showAuthGate(show) { const g = document.getElementById('auth-gate'); if (g) g.style.display = show ? 'flex' : 'none'; }

async function authInit() {
  const sb = await getSb(); if (!sb) return;
  const inv = new URL(location.href).searchParams.get('invite');
  if (inv) localStorage.setItem('ao_pending_invite', inv);
  sb.auth.onAuthStateChange((_e, session) => { handleSession(session); });
  const { data } = await sb.auth.getSession();
  handleSession(data ? data.session : null);
}
async function handleSession(session) {
  if (session && session.user) { _user = session.user; await onAuthed(); }
  else { _user = null; _teamId = null; showAuthGate(true); }
}
async function onAuthed() {
  const sb = await getSb();
  let invitedTeam = null;
  const pend = localStorage.getItem('ao_pending_invite');
  if (pend) {
    try { const r = await sb.rpc('accept_invite', { tok: pend }); if (!r.error && r.data) invitedTeam = r.data; } catch (e) {}
    localStorage.removeItem('ao_pending_invite');
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }
  await loadTeams();
  if (!_teams.length) {
    const r = await sb.rpc('provision_team');
    if (r.error) { agStatus('Error de equipo: ' + r.error.message, true); showAuthGate(true); return; }
    await loadTeams();
  }
  // Si vino por invitación, abrir ese equipo; si no, el guardado o el primero.
  const saved = localStorage.getItem('ao_active_team');
  const pick = (invitedTeam && _teams.find(t => t.id === invitedTeam)) ? invitedTeam
             : (_teams.find(t => t.id === saved) ? saved : (_teams[0] && _teams[0].id));
  _teamId = pick || null;
  if (_teamId) localStorage.setItem('ao_active_team', _teamId);
  await loadTeam();
  // Cuenta suspendida → bloquear (el super-admin nunca se bloquea)
  if (_teamStatus === 'suspended' && !isAdmin()) {
    showAuthGate(true);
    agStatus('Tu cuenta está suspendida. Contacta al administrador.', true);
    setSyncStatus('error', 'Suspendida');
    return;
  }
  showAuthGate(false);
  await cloudLoad();
  applyArtistRestriction();
  renderSidebarArtist();
  setSyncStatus('ok');
}
// Carga TODOS los equipos del usuario (para el selector multi-equipo)
async function loadTeams() {
  const sb = await getSb(); if (!sb || !_user) return;
  const tm = await sb.from('team_members').select('team_id, role').eq('user_id', _user.id);
  const rows = tm.data || [];
  const ids = rows.map(r => r.team_id);
  let names = {};
  if (ids.length) {
    const tn = await sb.from('teams').select('id, name').in('id', ids);
    (tn.data || []).forEach(t => { names[t.id] = t.name; });
  }
  _teams = rows.map(r => ({ id: r.team_id, role: r.role, name: names[r.team_id] || 'Mi equipo' }));
}
// Carga miembros + nombre del equipo ACTIVO
async function loadTeam() {
  const sb = await getSb(); if (!sb || !_teamId) return;
  // Reset mensual de contadores (best-effort; no rompe si el RPC no existe aún)
  try { await sb.rpc('reset_monthly_counters', { tid: _teamId }); } catch (e) {}
  // Miembros + is_artist (con fallback si la columna aún no existe)
  let tm = await sb.from('team_members').select('user_id, role, email, is_artist').eq('team_id', _teamId);
  if (tm.error) tm = await sb.from('team_members').select('user_id, role, email').eq('team_id', _teamId);
  _teamMembers = tm.data || [];
  const mine = _teamMembers.find(m => m.user_id === (_user && _user.id));
  _isArtist = !!(mine && mine.is_artist);
  // Plan + contadores del equipo (con fallback si las columnas aún no existen)
  _teamPlan = 'free';
  _teamCounters = { ideas_generadas_mes: 0, ideas_reset_date: null, banco_refreshes: 0, banco_refreshes_reset_date: null };
  try {
    const tr = await sb.from('teams').select('plan, ideas_generadas_mes, ideas_reset_date, banco_refreshes, banco_refreshes_reset_date').eq('id', _teamId).single();
    if (!tr.error && tr.data) {
      _teamPlan = tr.data.plan || 'free';
      _teamCounters = {
        ideas_generadas_mes: tr.data.ideas_generadas_mes || 0,
        ideas_reset_date: tr.data.ideas_reset_date || null,
        banco_refreshes: tr.data.banco_refreshes || 0,
        banco_refreshes_reset_date: tr.data.banco_refreshes_reset_date || null,
      };
    }
  } catch (e) {}
  // Estado de la cuenta (suspendida) — query separada para no romper si la columna no existe
  _teamStatus = 'active';
  try { const ss = await sb.from('teams').select('status').eq('id', _teamId).single(); if (!ss.error && ss.data) _teamStatus = ss.data.status || 'active'; } catch (e) {}
  // ¿Soy super-admin? (autoritativo del servidor; cae a false si el RPC no existe aún)
  try { const sa = await sb.rpc('is_super_admin'); _isSuperAdmin = !(sa && sa.error) && !!(sa && sa.data); } catch (e) { _isSuperAdmin = false; }
  const t = activeTeam();
  _teamName = (t && t.name) || 'Mi equipo';
  applyRolePerms();
}
// Cambiar de equipo activo
async function switchTeam(id) {
  if (id === _teamId || !_teams.find(t => t.id === id)) return;
  _teamId = id; localStorage.setItem('ao_active_team', id);
  setSyncStatus('syncing');
  await loadTeam();
  await cloudLoad();
  applyArtistRestriction();
  renderSidebarArtist();
  if (document.getElementById('modal-team').classList.contains('open')) renderTeamModal();
  setSyncStatus('ok');
}
// Crear un equipo nuevo (RPC create_team en Supabase) y cambiarse a él
async function createTeam() {
  const sb = await getSb(); if (!sb) return;
  const name = (await uiPrompt('Nombre del nuevo equipo:', {title:'Nuevo equipo'}) || '').trim();
  if (!name) return;
  const r = await sb.rpc('create_team', { team_name: name });
  if (r.error) { uiAlert('No se pudo crear el equipo: ' + r.error.message); return; }
  await loadTeams();
  await switchTeam(r.data);
}
// Mover un artista (y sus lanzamientos) a otro equipo
async function moveArtistToTeam(artistId, targetId) {
  if (!targetId || targetId === _teamId) return;
  if (!requireCan('assign_artist')) return;
  const a = artists.find(x => x.id === artistId); if (!a) return;
  if (!await uiConfirm(`¿Mover "${s(a.name)}" y sus lanzamientos al equipo "${s((_teams.find(t=>t.id===targetId)||{}).name)}"? Dejará de verse en el equipo actual.`)) return;
  const sb = await getSb(); if (!sb) return;
  try {
    setSyncStatus('syncing');
    const r1 = await sb.from('artists').update({ team_id: targetId }).eq('id', artistId);
    if (r1.error) throw new Error(r1.error.message);
    await sb.from('launches').update({ team_id: targetId }).eq('artist_id', artistId);
    // quitar de la vista local del equipo actual
    artists = artists.filter(x => x.id !== artistId);
    launches = launches.filter(l => l.artistId !== artistId);
    if (currentArtistId === artistId) currentArtistId = artists[0] && artists[0].id;
    saveArtistsLocal(); saveLaunchesLocal();
    renderSidebarArtist(); renderAllLaunches();
    if (document.getElementById('modal-team').classList.contains('open')) renderTeamModal();
    setSyncStatus('ok');
  } catch (e) { setSyncStatus('error', e.message); uiAlert('No se pudo mover: ' + e.message); }
}
async function signIn() {
  const sb = await getSb(); agStatus('Entrando…');
  const r = await sb.auth.signInWithPassword({ email: agVal('ag-email'), password: agVal('ag-pass') });
  if (r.error) agStatus(r.error.message, true);
}
async function signUp() {
  const sb = await getSb(); agStatus('Creando cuenta…');
  const r = await sb.auth.signUp({ email: agVal('ag-email'), password: agVal('ag-pass') });
  if (r.error) return agStatus(r.error.message, true);
  if (r.data && r.data.session) agStatus('¡Listo!'); else agStatus('Cuenta creada. Revisa tu correo para confirmar (o usa enlace mágico).');
}
async function signInMagic() {
  const sb = await getSb(); const email = agVal('ag-email');
  if (!email) return agStatus('Escribe tu correo', true);
  agStatus('Enviando enlace…');
  const r = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href } });
  if (r.error) agStatus(r.error.message, true); else agStatus('Te enviamos un enlace mágico a ' + email);
}
async function signOutTempo() {
  const sb = await getSb(); if (sb) await sb.auth.signOut();
  _user = null; _teamId = null;
  location.reload();
}
// equipo
function abrirTeam() { toggleArtistMenu(false); renderTeamModal(); document.getElementById('modal-team').classList.add('open'); }
function cerrarTeam(e) { if (!e || e.target === document.getElementById('modal-team')) document.getElementById('modal-team').classList.remove('open'); }
function renderTeamModal() {
  const body = document.getElementById('team-body');
  const me = _user ? _user.email : '';
  const canEditName = isOwner();
  // Selector de equipos (si hay más de uno) + crear nuevo
  const teamsList = _teams.map(t => {
    const active = t.id === _teamId;
    return `<div onclick="switchTeam('${t.id}')" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid ${active?'var(--accent)':'var(--border)'};border-radius:8px;cursor:pointer;background:${active?'rgba(255,107,48,0.06)':'transparent'}">
      <div class="artist-avatar" style="width:26px;height:26px;font-size:11px">${up(t.name||'?').slice(0,1)}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:500">${s(t.name)}</div><div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${s(t.role)}</div></div>
      ${active?'<span style="color:var(--accent);font-size:12px">● activo</span>':'<span style="font-size:11px;color:var(--text-dim)">cambiar →</span>'}
    </div>`;
  }).join('');
  // Panel de asignación de artistas al equipo
  const otherTeams = _teams.filter(t => t.id !== _teamId);
  const userOpts = m => `<option value="">— sin asignar</option>` + _teamMembers.map(u => `<option value="${u.user_id}" ${m===u.user_id?'selected':''}>${s(u.email)||u.user_id}</option>`).join('');
  const assignList = canEdit() && artists.length ? artists.map(a => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
      <div class="artist-avatar" style="width:26px;height:26px;font-size:11px">${up(a.name||'?').slice(0,1)}</div>
      <span style="flex:1;min-width:90px;font-size:13px">${s(a.name)}</span>
      ${isOwner() ? `<select class="input" style="width:auto;padding:4px 8px;font-size:11px" title="Usuario-artista (solo verá esta ficha)" onchange="setArtistUser('${a.id}',this.value)">${userOpts(a.userId)}</select>` : ''}
      ${otherTeams.length ? `<select class="input" style="width:auto;padding:4px 8px;font-size:11px" onchange="if(this.value){moveArtistToTeam('${a.id}',this.value);this.value='';}">
        <option value="">Mover a…</option>
        ${otherTeams.map(t => `<option value="${t.id}">${s(t.name)}</option>`).join('')}
      </select>` : ''}
    </div>`).join('') : `<div class="empty-hint">${artists.length ? '' : 'No hay artistas en este equipo.'}</div>`;
  body.innerHTML = `
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">🏷</span><span class="ph-title">Tus equipos (${_teams.length})</span></div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">${teamsList}</div>
    <button class="btn btn-ghost" style="margin-bottom:18px;font-size:12px" onclick="createTeam()">+ Crear equipo nuevo</button>
    <div class="field" style="margin-bottom:16px"><label>Nombre del equipo activo</label>
      <div style="display:flex;gap:8px"><input class="input" id="team-name" value="${s(_teamName)}" ${canEditName?'':'disabled'}>${canEditName?'<button class="btn btn-ghost" onclick="renameTeam()">Guardar</button>':''}</div>
    </div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">🎤</span><span class="ph-title">Artistas de ${s(_teamName)} (${artists.length})</span><span class="ph-sub">asigna a otro equipo</span></div>
    <div style="margin-bottom:18px">${assignList}</div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">👥</span><span class="ph-title">Miembros (${_teamMembers.length})</span><span class="ph-sub">tu rol: ${s(myRole())}</span></div>
    <div style="margin-bottom:18px">${_teamMembers.map(m => {
      const mine = m.user_id === (_user && _user.id);
      const roleCtl = (isOwner() && !mine)
        ? `<select class="input" style="width:auto;padding:4px 8px;font-size:11px" onchange="updateMemberRole('${m.user_id}',this.value)">
             <option value="owner" ${m.role==='owner'?'selected':''}>Owner</option>
             <option value="editor" ${m.role==='editor'?'selected':''}>Miembro</option>
             <option value="lector" ${m.role==='lector'?'selected':''}>Lector</option>
           </select>`
        : `<span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${s(m.role)}</span>`;
      const artistCtl = isOwner()
        ? `<label style="display:flex;align-items:center;gap:4px;font-size:10px;font-family:var(--font-mono);color:${m.is_artist?'var(--accent)':'var(--text-dim)'};cursor:pointer" title="Marca al artista del equipo (solo 1)">
             <input type="checkbox" ${m.is_artist?'checked':''} onchange="assignArtist('${m.user_id}',this.checked)">🎤</label>`
        : (m.is_artist ? '<span style="font-size:10px;color:var(--accent)" title="Artista del equipo">🎤</span>' : '');
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div class="artist-avatar" style="width:28px;height:28px;font-size:11px">${up(m.email||'?').slice(0,1)}</div>
        <span style="flex:1;font-size:13px">${s(m.email)||m.user_id}${mine?' <span style="color:var(--text-dim)">(tú)</span>':''}</span>
        ${artistCtl}
        ${roleCtl}
      </div>`;
    }).join('')}</div>
    <div style="font-size:10px;color:var(--text-dim);margin:-10px 0 16px;font-family:var(--font-mono);line-height:1.6">Owner: gestiona el equipo y permisos · Miembro: crea y edita · Lector: solo ve · 🎤 = el artista (puede editar Perfil/ADN).</div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">✉</span><span class="ph-title">Invitar al equipo</span></div>
    <div class="empty-hint" style="margin-bottom:10px">Genera un enlace y compártelo por correo o WhatsApp. Quien lo abra e inicie sesión se unirá a tu equipo.</div>
    <button class="btn btn-primary" onclick="createInvite()">Generar enlace de invitación</button>
    <div id="team-invite" style="margin-top:12px"></div>
    <div style="border-top:1px solid var(--border);margin-top:20px;padding-top:16px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">${s(me)}</span>
      <button class="btn btn-ghost" style="color:var(--accent2);border-color:rgba(255,77,77,0.3)" onclick="signOutTempo()">Cerrar sesión</button>
    </div>`;
}
async function renameTeam() {
  if (!requireCan('manage_roles')) return;
  const sb = await getSb(); if (!sb || !_teamId) return;
  const name = agVal('team-name').trim() || 'Mi equipo';
  await sb.from('teams').update({ name }).eq('id', _teamId);
  _teamName = name;
  const t = activeTeam(); if (t) t.name = name;
  renderSidebarArtist(); renderTeamModal();
}
async function createInvite() {
  if (!requireCan('invite_members')) return;
  const sb = await getSb(); if (!sb || !_teamId) return;
  const tok = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('inv-' + Date.now() + Math.random().toString(36).slice(2));
  const r = await sb.from('invites').insert({ token: tok, team_id: _teamId });
  if (r.error) { document.getElementById('team-invite').innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(r.error.message)}</div>`; return; }
  const link = `${location.origin}${location.pathname}?invite=${tok}`;
  document.getElementById('team-invite').innerHTML = `
    <div style="display:flex;gap:8px">
      <input class="input" id="invite-link" value="${link}" readonly style="font-size:11px">
      <button class="btn btn-ghost" onclick="copyInvite(this)">Copiar</button>
    </div>`;
}
function copyInvite(btn) {
  const v = (document.getElementById('invite-link') || {}).value || '';
  if (navigator.clipboard) navigator.clipboard.writeText(v);
  if (btn) { const o = btn.textContent; btn.textContent = '✓'; setTimeout(() => { btn.textContent = o; }, 1200); }
}
// visibilidad por artista
function setArtistVisibility(id, vis) {
  if (!canEdit()) return; // el rol solo limita edición, no la visibilidad de lectura
  const a = artists.find(x => x.id === id); if (!a) return;
  a.visibility = vis; saveArtists(); // el upsert lleva la nueva visibilidad → RLS aplica quién la ve
  renderArtistForms();
}
// Marcar/desmarcar al artista del equipo (único por equipo → limpia los demás primero)
// Vincular un usuario-artista a SU ficha (solo verá esa ficha; el staff ve todas)
async function setArtistUser(artistId, userId) {
  if (!requireCan('assign_artist')) return;
  const a = artists.find(x => x.id === artistId); if (!a) return;
  a.userId = userId || null; saveArtistsLocal();
  const sb = await getSb();
  if (sb) { const r = await sb.from('artists').update({ user_id: userId || null }).eq('id', artistId); if (r && r.error) { uiAlert(r.error.message); } }
  renderTeamModal();
  uiToast(userId ? '✓ Artista vinculado a su ficha' : '✓ Vínculo quitado');
}
async function assignArtist(userId, makeArtist) {
  if (!requireCan('assign_artist')) return;
  const sb = await getSb(); if (!sb || !_teamId) return;
  try {
    if (makeArtist) {
      await sb.from('team_members').update({ is_artist: false }).eq('team_id', _teamId);
      const r = await sb.from('team_members').update({ is_artist: true }).eq('team_id', _teamId).eq('user_id', userId);
      if (r.error) throw new Error(r.error.message);
    } else {
      const r = await sb.from('team_members').update({ is_artist: false }).eq('team_id', _teamId).eq('user_id', userId);
      if (r.error) throw new Error(r.error.message);
    }
    await loadTeam(); renderTeamModal();
  } catch (e) { uiAlert('No se pudo asignar el artista: ' + e.message); }
}
async function updateMemberRole(userId, role) {
  if (!requireCan('manage_roles')) return;
  const sb = await getSb(); if (!sb) return;
  const r = await sb.from('team_members').update({ role }).eq('team_id', _teamId).eq('user_id', userId);
  if (r && r.error) { uiAlert(r.error.message); return; }
  await loadTeam(); renderTeamModal();
}
// olvidé mi contraseña (desde el login)
async function forgotPassword() {
  const sb = await getSb(); const email = agVal('ag-email');
  if (!email) return agStatus('Escribe tu correo para recuperar la contraseña', true);
  const r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href });
  if (r.error) agStatus(r.error.message, true); else agStatus('Enviamos un enlace para restablecer tu contraseña a ' + email);
}
// ajustes de cuenta
function abrirCuenta() { toggleArtistMenu(false); renderCuenta(); document.getElementById('modal-account').classList.add('open'); }
function cerrarCuenta(e) { if (!e || e.target === document.getElementById('modal-account')) document.getElementById('modal-account').classList.remove('open'); }
function renderCuenta() {
  const body = document.getElementById('account-body');
  body.innerHTML = `
    <div class="field" style="margin-bottom:18px"><label>Correo</label><input class="input" value="${s(_user ? _user.email : '')}" readonly></div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">🔑</span><span class="ph-title">Cambiar contraseña</span></div>
    <div class="field" style="margin-bottom:10px"><input class="input" id="acc-pass" type="password" placeholder="Nueva contraseña (mín. 6)"></div>
    <button class="btn btn-primary" onclick="cambiarPassword()">Actualizar contraseña</button>
    <div id="acc-status" style="font-family:var(--font-mono);font-size:11px;margin-top:10px;min-height:14px;color:var(--text-muted)"></div>

    <div style="border-top:1px solid var(--border);margin-top:22px;padding-top:16px"></div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">💾</span><span class="ph-title">Respaldo de datos</span></div>
    <div class="empty-hint" style="margin-bottom:12px">Exporta una copia (.json) de tus artistas y lanzamientos, o restaura desde un archivo. La API key no se incluye por seguridad.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="exportarDatos()">⤓ Exportar backup (.json)</button>
      <button class="btn btn-ghost" onclick="importarDatos()">⤒ Importar backup</button>
    </div>

    <div style="border-top:1px solid var(--border);margin-top:22px;padding-top:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">Equipo: ${s(_teamName)} · rol ${s(myRole())}</span>
      <button class="btn btn-ghost" style="color:var(--accent2);border-color:rgba(255,77,77,0.3)" onclick="signOutTempo()">Cerrar sesión</button>
    </div>`;
}
async function cambiarPassword() {
  const sb = await getSb(); const pass = (document.getElementById('acc-pass') || {}).value || '';
  const st = document.getElementById('acc-status');
  if (pass.length < 6) { st.style.color = 'var(--accent2)'; st.textContent = 'Mínimo 6 caracteres'; return; }
  const r = await sb.auth.updateUser({ password: pass });
  if (r.error) { st.style.color = 'var(--accent2)'; st.textContent = r.error.message; }
  else { st.style.color = '#4ade80'; st.textContent = '✓ Contraseña actualizada'; }
}

// ══════════════════════════════════════════
// MODALES IN-APP (reemplazo de alert/confirm/prompt nativos)
// ══════════════════════════════════════════
let _uiResolve = null, _uiMode = 'alert', _toastTimer = null;
function uiModal(mode, message, opts) {
  opts = opts || {};
  _uiMode = mode;
  document.getElementById('ui-title').textContent = opts.title || (mode === 'confirm' ? 'Confirmar' : mode === 'prompt' ? '' : 'Aviso');
  document.getElementById('ui-message').textContent = message || '';
  const iw = document.getElementById('ui-input-wrap'), inp = document.getElementById('ui-input');
  iw.style.display = mode === 'prompt' ? '' : 'none';
  if (mode === 'prompt') { inp.value = opts.def || ''; inp.placeholder = opts.placeholder || ''; }
  const cancel = document.getElementById('ui-cancel');
  cancel.style.display = mode === 'alert' ? 'none' : '';
  cancel.textContent = opts.cancelText || 'Cancelar';
  const ok = document.getElementById('ui-ok');
  ok.textContent = opts.okText || (mode === 'alert' ? 'OK' : mode === 'confirm' ? 'Confirmar' : 'Aceptar');
  ok.style.borderColor = opts.danger ? 'rgba(255,77,77,.5)' : '';
  ok.style.color = opts.danger ? 'var(--accent2)' : '';
  document.getElementById('modal-ui').classList.add('open');
  if (mode === 'prompt') setTimeout(() => inp.focus(), 60);
  return new Promise(res => { _uiResolve = res; });
}
function uiModalResolve(ok) {
  const mode = _uiMode, r = _uiResolve; _uiResolve = null;
  document.getElementById('modal-ui').classList.remove('open');
  if (!r) return;
  if (mode === 'prompt') r(ok ? document.getElementById('ui-input').value : null);
  else if (mode === 'confirm') r(!!ok);
  else r(true);
}
function uiModalKey(e) { if (e.key === 'Enter') { e.preventDefault(); uiModalResolve(true); } else if (e.key === 'Escape') { uiModalResolve(false); } }
function uiModalBackdrop(e) { if (e.target === document.getElementById('modal-ui')) uiModalResolve(_uiMode === 'alert'); }
// API pública (promesas)
function uiAlert(message, opts) { return uiModal('alert', message, opts); }
function uiConfirm(message, opts) { return uiModal('confirm', message, opts); }
function uiPrompt(message, opts) { return uiModal('prompt', message, opts); }
// Toast no bloqueante para avisos de éxito breves
function uiToast(message, ms) {
  const el = document.getElementById('ui-toast'); if (!el) return;
  el.textContent = message;
  el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(20px)'; }, ms || 2600);
}

// ══════════════════════════════════════════
// BACKEND SUPER-ADMIN (panel)
// ══════════════════════════════════════════
let _adminData = {};
const _money = (n, d) => '$' + (Number(n) || 0).toFixed(d == null ? 2 : d);
const _fdate = v => v ? new Date(v).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function abrirAdmin() {
  if (!isAdmin()) return;
  toggleArtistMenu(false);
  document.getElementById('modal-admin').classList.add('open');
  document.querySelectorAll('#admin-tabs .mtab').forEach(b => b.classList.toggle('active', b.dataset.atab === 'cuentas'));
  adminTab('cuentas');
}
function cerrarAdmin(e) { if (!e || e.target === document.getElementById('modal-admin')) document.getElementById('modal-admin').classList.remove('open'); }

async function adminTab(name, el) {
  if (el) { document.querySelectorAll('#admin-tabs .mtab').forEach(b => b.classList.remove('active')); el.classList.add('active'); }
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="empty-hint">Cargando…</div>';
  try {
    if (name === 'cuentas') await renderAdminCuentas();
    else if (name === 'uso') await renderAdminUso();
    else if (name === 'keys') renderAdminKeys();
    else if (name === 'descuentos') await renderAdminDescuentos();
    else if (name === 'admins') await renderAdminSupers();
  } catch (e) {
    body.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(e.message)}<br><span style="font-size:10px">¿Corriste <b>admin_backend.sql</b> en Supabase?</span></div>`;
  }
}

// ── CUENTAS ──
async function renderAdminCuentas() {
  const sb = await getSb(); const r = await sb.rpc('admin_overview');
  if (r.error) throw new Error(r.error.message);
  const d = r.data || {}; _adminData.overview = d;
  const t = d.totals || {};
  const card = (label, val, sub) => `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${val}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
  const planChips = (d.by_plan || []).map(p => `<span class="chip">${s(p.plan)}: <b>${p.n}</b></span>`).join(' ');
  const rows = (d.teams || []).map(adminTeamRow).join('');
  document.getElementById('admin-body').innerHTML = `
    <div class="dashboard-grid" style="margin-bottom:16px">
      ${card('Equipos', t.teams || 0, `${t.active || 0} activos · ${t.suspended || 0} suspendidos`)}
      ${card('Usuarios', t.users || 0, '')}
      ${card('Llamadas IA', t.ia_calls || 0, 'histórico')}
      ${card('Costo IA', _money(t.ia_cost), `este mes ${_money(t.ia_cost_month)}`)}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${planChips}</div>
    <div style="display:flex;flex-direction:column;gap:8px">${rows || '<div class="empty-hint">Sin equipos.</div>'}</div>`;
}
function adminTeamRow(tm) {
  const planSel = ['free', 'pro', 'manager', 'custom'].map(p => `<option value="${p}" ${tm.plan === p ? 'selected' : ''}>${p}</option>`).join('');
  const suspended = tm.status === 'suspended';
  return `<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;${suspended ? 'opacity:.6;border-color:var(--accent2)' : ''}">
    <div style="flex:1;min-width:140px">
      <div style="font-size:13px;font-weight:500">${s(tm.name)} ${suspended ? '<span style="color:var(--accent2);font-size:10px">· SUSPENDIDO</span>' : ''}</div>
      <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${tm.members} miembros · ${tm.artists} artistas · ${tm.launches} lanz. · IA ${_money(tm.ia_cost)} · últ. ${_fdate(tm.last_ia)}</div>
      <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim)">ideas/mes: ${tm.ideas_generadas_mes} · refresh: ${tm.banco_refreshes}</div>
    </div>
    <select class="input" style="width:auto;padding:4px 8px;font-size:11px" onchange="adminSetPlan('${tm.id}',this.value)" title="Plan">${planSel}</select>
    <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="adminEditMembers('${tm.id}','${s(tm.name)}')">Miembros</button>
    <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="adminResetCounters('${tm.id}')" title="Resetear contadores">↺</button>
    <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;color:${suspended ? '#4ade80' : 'var(--accent2)'}" onclick="adminSetStatus('${tm.id}','${suspended ? 'active' : 'suspended'}')">${suspended ? 'Activar' : 'Suspender'}</button>
  </div>`;
}
async function adminRpc(fn, args, okMsg) {
  const sb = await getSb(); const r = await sb.rpc(fn, args || {});
  if (r.error) { uiAlert(r.error.message); return false; }
  return true;
}
async function adminSetPlan(tid, plan) { if (await adminRpc('admin_set_plan', { tid, new_plan: plan })) adminTab('cuentas'); }
async function adminSetStatus(tid, st) {
  if (st === 'suspended' && !await uiConfirm('¿Suspender esta cuenta? El equipo no podrá acceder.', {danger:true, okText:'Suspender'})) return;
  if (await adminRpc('admin_set_status', { tid, new_status: st })) adminTab('cuentas');
}
async function adminResetCounters(tid) { if (await uiConfirm('¿Resetear contadores (ideas/mes y refreshes) de este equipo?') && await adminRpc('admin_reset_counters', { tid })) adminTab('cuentas'); }
async function adminEditMembers(tid, name) {
  const body = document.getElementById('admin-body'); body.innerHTML = '<div class="empty-hint">Cargando miembros…</div>';
  const sb = await getSb(); const r = await sb.rpc('admin_team_members', { tid });
  if (r.error) { body.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">⚠ ${s(r.error.message)}</div>`; return; }
  const rows = (r.data || []).map(m => {
    const roleSel = ['owner', 'editor', 'lector'].map(x => `<option value="${x}" ${m.role === x ? 'selected' : ''}>${x}</option>`).join('');
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:13px">${s(m.email) || m.user_id}</span>
      <label style="display:flex;align-items:center;gap:4px;font-size:10px;font-family:var(--font-mono);color:${m.is_artist ? 'var(--accent)' : 'var(--text-dim)'};cursor:pointer">
        <input type="checkbox" ${m.is_artist ? 'checked' : ''} onchange="adminSetArtist('${tid}','${m.user_id}',this.checked,'${s(name)}')">🎤</label>
      <select class="input" style="width:auto;padding:4px 8px;font-size:11px" onchange="adminSetMemberRole('${tid}','${m.user_id}',this.value,'${s(name)}')">${roleSel}</select>
    </div>`;
  }).join('');
  body.innerHTML = `<button class="btn btn-ghost" style="margin-bottom:12px;font-size:12px" onclick="adminTab('cuentas')">← Volver a cuentas</button>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">👥</span><span class="ph-title">Miembros de ${s(name)}</span></div>
    <div>${rows || '<div class="empty-hint">Sin miembros.</div>'}</div>`;
}
async function adminSetMemberRole(tid, uid, role, name) { if (await adminRpc('admin_set_member_role', { tid, uid, new_role: role })) adminEditMembers(tid, name); }
async function adminSetArtist(tid, uid, val, name) { if (await adminRpc('admin_set_artist', { tid, uid, val })) adminEditMembers(tid, name); }

// ── USO IA ──
async function renderAdminUso() {
  const sb = await getSb(); const r = await sb.rpc('admin_usage', { days: 30 });
  if (r.error) throw new Error(r.error.message);
  const d = r.data || {}; _adminData.usage = d;
  const byModel = (d.by_model || []).map(m => `<tr>
    <td style="padding:6px 8px;font-family:var(--font-mono);font-size:11px">${s(m.model)}</td>
    <td style="padding:6px 8px;text-align:right">${m.calls}</td>
    <td style="padding:6px 8px;text-align:right;font-family:var(--font-mono);font-size:11px">${(m.in_tok || 0).toLocaleString()} / ${(m.out_tok || 0).toLocaleString()}</td>
    <td style="padding:6px 8px;text-align:right;color:var(--accent)">${_money(m.cost, 4)}</td></tr>`).join('');
  const recent = (d.recent || []).map(u => `<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px">
    <span style="font-family:var(--font-mono);color:var(--text-dim);white-space:nowrap">${_fdate(u.created_at)}</span>
    <span style="flex:1">${s(u.team) || '—'} · ${s(u.feature) || s(u.model)}</span>
    <span style="font-family:var(--font-mono);color:var(--accent)">${_money(u.cost, 4)}</span></div>`).join('');
  const totCost = (d.by_model || []).reduce((a, m) => a + (+m.cost || 0), 0);
  document.getElementById('admin-body').innerHTML = `
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">⚡</span><span class="ph-title">Consumo de IA (últimos 30 días)</span><span class="ph-sub">total ${_money(totCost, 4)}</span></div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
      <thead><tr style="text-align:left;font-size:10px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase">
        <th style="padding:6px 8px">Modelo</th><th style="padding:6px 8px;text-align:right">Llamadas</th><th style="padding:6px 8px;text-align:right">Tokens in/out</th><th style="padding:6px 8px;text-align:right">Costo</th></tr></thead>
      <tbody>${byModel || '<tr><td colspan="4" style="padding:10px;color:var(--text-dim)">Sin uso registrado todavía.</td></tr>'}</tbody>
    </table>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">🕑</span><span class="ph-title">Últimas llamadas</span></div>
    <div>${recent || '<div class="empty-hint">Sin llamadas registradas.</div>'}</div>`;
}

// ── KEYS / APIs ──
function renderAdminKeys() {
  const c = supaCfg();
  const lastIa = (_adminData.usage && (_adminData.usage.recent || [])[0]) || (_adminData.overview && null);
  const row = (label, val, note) => `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
    <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">${label}</div>
    <div style="font-family:var(--font-mono);font-size:12px;word-break:break-all;margin-top:3px">${val}</div>
    ${note ? `<div style="font-size:10px;color:var(--text-dim);margin-top:3px">${note}</div>` : ''}</div>`;
  document.getElementById('admin-body').innerHTML = `
    <div class="empty-hint" style="margin-bottom:14px">Inventario de APIs/keys del app. Solo tú (super-admin) ves esto. La key de Anthropic es un <b style="color:var(--text-muted)">secreto del servidor</b> y nunca se expone en el navegador.</div>
    ${row('Supabase · Project URL', s(c.url), 'pública')}
    ${row('Supabase · anon key', '<span style="color:#4ade80">configurada ✓</span> ' + (c.key ? '<span style="color:var(--text-dim)">…' + s(c.key.slice(-6)) + '</span>' : '<span style="color:var(--accent2)">falta</span>'), 'pública por diseño (la protege RLS + Auth)')}
    ${row('Anthropic · API key', '<span style="color:#4ade80">secreto en servidor ✓</span> <span style="color:var(--text-dim)">•••• (Edge Function)</span>', 'No accesible desde el cliente. Editar: Supabase → Edge Functions → Secrets → ANTHROPIC_API_KEY')}
    ${row('Edge Function · claude', '<span style="color:#4ade80">desplegada</span>', 'Proxy seguro a Anthropic (verify_jwt on). Inserta uso en ai_usage.')}
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" style="font-size:12px" onclick="adminTab('uso',document.querySelector('[data-atab=uso]'))">Ver uso de IA →</button>
      <button class="btn btn-ghost" style="font-size:12px" onclick="abrirSync()">Editar credenciales Supabase →</button>
    </div>`;
}

// ── DESCUENTOS ──
async function renderAdminDescuentos() {
  const sb = await getSb(); const r = await sb.from('discount_codes').select('*').order('created_at', { ascending: false });
  if (r.error) throw new Error(r.error.message);
  const list = (r.data || []).map(dc => {
    const val = dc.kind === 'percent' ? `${dc.value}%` : _money(dc.value);
    const exp = dc.expires_at ? ('vence ' + dc.expires_at) : 'sin vencimiento';
    const uses = (dc.max_uses != null) ? `${dc.used_count}/${dc.max_uses}` : `${dc.used_count}/∞`;
    return `<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;${dc.active ? '' : 'opacity:.55'}">
      <div style="flex:1;min-width:140px">
        <div style="font-size:13px;font-weight:600;font-family:var(--font-mono);letter-spacing:1px">${s(dc.code)} <span style="color:var(--accent)">${val}</span></div>
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${dc.plan ? 'plan ' + s(dc.plan) : 'cualquier plan'} · usos ${uses} · ${exp}${dc.note ? ' · ' + s(dc.note) : ''}</div>
      </div>
      <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="adminToggleDiscount('${s(dc.code)}',${!dc.active})">${dc.active ? 'Desactivar' : 'Activar'}</button>
      <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;color:var(--accent2)" onclick="adminDeleteDiscount('${s(dc.code)}')">✕</button>
    </div>`;
  }).join('');
  document.getElementById('admin-body').innerHTML = `
    <div class="panel" style="margin-bottom:16px">
      <div class="panel-head" style="margin-bottom:10px"><span class="ph-icon">🏷</span><span class="ph-title">Nuevo código</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
        <div class="field"><label>Código</label><input class="input" id="dc-code" placeholder="LANZA20" style="text-transform:uppercase"></div>
        <div class="field"><label>Tipo</label><select class="input" id="dc-kind"><option value="percent">% descuento</option><option value="fixed">monto fijo</option></select></div>
        <div class="field"><label>Valor</label><input class="input" id="dc-value" inputmode="decimal" placeholder="20"></div>
        <div class="field"><label>Plan</label><select class="input" id="dc-plan"><option value="">cualquiera</option><option value="pro">pro</option><option value="manager">manager</option><option value="custom">custom</option></select></div>
        <div class="field"><label>Máx. usos</label><input class="input" id="dc-max" inputmode="numeric" placeholder="∞"></div>
        <div class="field"><label>Vence</label><input class="input" id="dc-exp" type="date"></div>
        <div class="field" style="grid-column:1/-1"><label>Nota</label><input class="input" id="dc-note" placeholder="Opcional (ej. campaña verano)"></div>
      </div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="adminCreateDiscount()">Crear código</button>
    </div>
    <div class="panel-head" style="margin-bottom:8px"><span class="ph-icon">📋</span><span class="ph-title">Códigos (${(r.data || []).length})</span></div>
    <div style="display:flex;flex-direction:column;gap:8px">${list || '<div class="empty-hint">Aún no hay códigos.</div>'}</div>`;
}
async function adminCreateDiscount() {
  const code = (document.getElementById('dc-code').value || '').trim().toUpperCase();
  if (!code) { uiAlert('Escribe un código.'); return; }
  const obj = {
    code, kind: document.getElementById('dc-kind').value,
    value: parseFloat(document.getElementById('dc-value').value) || 0,
    plan: document.getElementById('dc-plan').value || null,
    max_uses: parseInt(document.getElementById('dc-max').value) || null,
    expires_at: document.getElementById('dc-exp').value || null,
    note: (document.getElementById('dc-note').value || '').trim() || null,
  };
  const sb = await getSb(); const r = await sb.from('discount_codes').insert(obj);
  if (r.error) { uiAlert(r.error.message); return; }
  adminTab('descuentos');
}
async function adminToggleDiscount(code, active) {
  const sb = await getSb(); const r = await sb.from('discount_codes').update({ active }).eq('code', code);
  if (r.error) { uiAlert(r.error.message); return; } adminTab('descuentos');
}
async function adminDeleteDiscount(code) {
  if (!await uiConfirm('¿Eliminar el código ' + code + '?', {danger:true, okText:'Eliminar'})) return;
  const sb = await getSb(); const r = await sb.from('discount_codes').delete().eq('code', code);
  if (r.error) { uiAlert(r.error.message); return; } adminTab('descuentos');
}

// ── SUPER-ADMINS ──
async function renderAdminSupers() {
  const sb = await getSb(); const r = await sb.from('super_admins').select('*').order('added_at');
  if (r.error) throw new Error(r.error.message);
  const me = (_user && (_user.email || '').toLowerCase());
  const rows = (r.data || []).map(a => {
    const mine = (a.email || '').toLowerCase() === me;
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:13px">${s(a.email)}${mine ? ' <span style="color:var(--text-dim)">(tú)</span>' : ''}</span>
      <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim)">${_fdate(a.added_at)}</span>
      ${mine ? '' : `<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;color:var(--accent2)" onclick="adminRemoveSuper('${s(a.email)}')">✕</button>`}
    </div>`;
  }).join('');
  document.getElementById('admin-body').innerHTML = `
    <div class="empty-hint" style="margin-bottom:14px">Quienes tengan acceso a este backend. Verificado del lado servidor (tabla <b>super_admins</b> + RLS).</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <input class="input" id="sa-email" type="email" placeholder="correo@dominio.com">
      <button class="btn btn-primary" onclick="adminAddSuper()">Agregar</button>
    </div>
    <div>${rows}</div>`;
}
async function adminAddSuper() {
  const email = (document.getElementById('sa-email').value || '').trim().toLowerCase();
  if (!email) { uiAlert('Escribe un correo.'); return; }
  const sb = await getSb(); const r = await sb.from('super_admins').insert({ email });
  if (r.error) { uiAlert(r.error.message); return; } adminTab('admins');
}
async function adminRemoveSuper(email) {
  if (!await uiConfirm('¿Quitar a ' + email + ' del backend?', {danger:true})) return;
  const sb = await getSb(); const r = await sb.from('super_admins').delete().eq('email', email);
  if (r.error) { uiAlert(r.error.message); return; } adminTab('admins');
}

// ══════════════════════════════════════════
// TEMA (light / dark)
// ══════════════════════════════════════════
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ao_theme', t);
  const b = document.getElementById('theme-toggle');
  if (b) b.textContent = t === 'light' ? '☀️' : '🌙';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'light' ? 'dark' : 'light');
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
applyTheme(localStorage.getItem('ao_theme') || 'dark');
renderSidebarArtist();
renderAllLaunches();

// Banco por defecto: CSV embebido (Test ArtistOS — Ideas de contenido)
(function loadEmbeddedBank() {
  try {
    const el = document.getElementById('bank-csv');
    if (el && el.textContent.trim()) {
      const parsed = parsearCSV(el.textContent);
      if (parsed.length) { setReferencias(parsed); bancoCargado = true; }
    }
  } catch (e) { console.warn('No se pudo cargar el banco embebido:', e); }
})();

iniciarBanco();

// sincronización en la nube al arrancar (si está configurada → pide login)
if (cloudEnabled()) { showAuthGate(true); setSyncStatus('syncing'); authInit(); } else { setSyncStatus('off'); }
