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
