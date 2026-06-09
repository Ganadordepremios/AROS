// ══════════════════════════════════════════
// FICHA DE TRACK (dentro del release — pestañas) — Sprint 1
// ══════════════════════════════════════════
let currentTrackId = null, _trackTab = 'checklist';
function curTrack() { return tracks.find(x => x.id === currentTrackId); }
function openTrack(id) { currentTrackId = id; _trackTab = 'checklist'; renderTrackDetail(); const c = document.querySelector('.content'); if (c) c.scrollTop = 0; }
function backToRelease() { currentTrackId = null; renderLaunchDetail(); }
function setTrackField(path, val, cap) { if (cap && !requireCan(cap)) return; const t = curTrack(); if (!t) return; setPath(t, path, val); saveTracks(); }

function renderTrackDetail() {
  const t = curTrack(), l = launches.find(x => x.id === currentLaunchId);
  const host = document.getElementById('launch-detail'); if (!t || !host) return;
  const rd = trackReady(t), pct = rd.total ? Math.round(rd.done / rd.total * 100) : 0;
  const phase = trackPhase(t);
  const TABS = [['checklist','Checklist'],['audio','Audio'],['labelcopy','Label Copy'],['legal','Legal'],['tareas','Tareas']];
  host.innerHTML = `
    <div style="margin-bottom:16px"><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);cursor:pointer" onclick="backToRelease()">← ${s(l ? l.name : 'Release')}</span></div>
    <div class="panel" style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <div style="font-family:var(--font-display);font-size:30px;letter-spacing:1px">${s(t.title) || '(sin título)'}</div>
        <div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-top:4px">${t.version ? s(t.version) + ' · ' : ''}ISRC ${s(t.isrc) || '— por asignar'}</div>
        <div style="margin-top:10px"><span class="chip on" style="cursor:default;color:${phaseColor(phase)}">${phase}</span></div>
      </div>
      <div style="min-width:220px;flex:1">${readyBarHTML(pct, 'LISTO PARA LANZAR · TRACK')}<div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:6px">${rd.done}/${rd.total} ítems del checklist</div></div>
    </div>
    <div class="mtabs" id="track-tabbar" style="margin-bottom:16px;flex-wrap:wrap">${TABS.map(x => `<div class="mtab ${x[0] === _trackTab ? 'active' : ''}" data-ttab="${x[0]}" onclick="setTrackTab('${x[0]}')">${x[1]}</div>`).join('')}</div>
    <div id="track-tab-body"></div>`;
  renderTrackTab(_trackTab);
}
function setTrackTab(name) { _trackTab = name; document.querySelectorAll('#track-tabbar .mtab').forEach(b => b.classList.toggle('active', b.dataset.ttab === name)); renderTrackTab(name); }
function renderTrackTab(name) {
  const t = curTrack(); const host = document.getElementById('track-tab-body'); if (!t || !host) return;
  if (name === 'checklist') host.innerHTML = trackChecklistHTML(t);
  else if (name === 'audio') host.innerHTML = trackAudioHTML(t);
  else if (name === 'labelcopy') host.innerHTML = trackLabelCopyHTML(t);
  else if (name === 'legal') host.innerHTML = trackLegalHTML(t);
  else if (name === 'tareas') host.innerHTML = trackTareasHTML(t);
}

// ── Checklist ──
function trackChecklistHTML(t) {
  const c = t.checklist || {};
  return Object.keys(TRACK_CHECKLIST).map(g => `
    <div class="panel"><div class="panel-head"><span class="ph-title">${CHECKLIST_GROUP_LABEL[g]}</span></div>
      <div style="display:flex;flex-direction:column">
        ${TRACK_CHECKLIST[g].map(([k, label]) => { const on = !!(c[g] && c[g][k]); return `<label style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px"><input type="checkbox" ${on ? 'checked' : ''} onchange="toggleTrackCheck('${g}','${k}')"> ${label}</label>`; }).join('')}
      </div></div>`).join('');
}
function toggleTrackCheck(g, k) {
  if (!requireCan('editar_crm')) return;
  const t = curTrack(); if (!t) return;
  t.checklist = t.checklist || {}; t.checklist[g] = t.checklist[g] || {};
  t.checklist[g][k] = !t.checklist[g][k];
  saveTracks(); renderTrackDetail(); // recalcula fase + barra
}

// ── Audio ──
function trackAudioHTML(t) {
  const f = (label, path, val, ph) => `<div class="field" style="margin-bottom:12px"><label>${label}</label><input class="input" value="${s(val)}" placeholder="${ph || ''}" onchange="setTrackField('${path}',this.value,'editar_audio')"></div>`;
  return `<div class="panel"><div class="panel-head"><span class="ph-icon">🎧</span><span class="ph-title">Audio & metadata</span></div>
    ${f('Título', 'title', t.title)}
    ${f('Versión', 'version', t.version, 'Remix, Acoustic, Sped Up…')}
    ${f('ISRC', 'isrc', t.isrc, 'MX-XXX-YY-NNNNN')}
    ${f('Link de referencia', 'links.reference', (t.links || {}).reference, 'Drive / Dropbox / WeTransfer')}
    ${f('Link de mezcla', 'links.mix', (t.links || {}).mix)}
    ${f('Link de máster', 'links.master', (t.links || {}).master)}
    ${f('Idioma', 'meta.language', (t.meta || {}).language)}
    ${f('Explícito (sí/no)', 'meta.explicit', (t.meta || {}).explicit)}
  </div>`;
}

// ── Label Copy (documento madre) ──
function trackLabelCopyHTML(t) {
  const lc = t.labelCopy || {};
  const f = (label, path, val) => `<div class="field" style="margin-bottom:12px"><label>${label}</label><input class="input" value="${s(val)}" onchange="setTrackField('${path}',this.value,'editar_labelcopy')"></div>`;
  return `<div class="panel"><div class="panel-head"><span class="ph-icon">📄</span><span class="ph-title">Label Copy</span><span class="ph-sub">documento madre</span></div>
    ${f('Artista principal', 'credits.mainArtist', (t.credits || {}).mainArtist)}
    ${f('Sello', 'labelCopy.label', lc.label)}
    ${f('Distribuidora', 'labelCopy.distributor', lc.distributor)}
    ${f('Género', 'labelCopy.genre', lc.genre)}
    ${f('Dueño del máster', 'master.owner', (t.master || {}).owner)}
    ${f('% máster', 'master.ownerSplit', (t.master || {}).ownerSplit)}
    ${f('Editorial (publisher)', 'publishing.publisher', (t.publishing || {}).publisher)}
    ${f('Sociedad de gestión (PRO)', 'publishing.pro', (t.publishing || {}).pro)}
    <div class="field"><label>Notas</label><textarea class="textarea" onchange="setTrackField('labelCopy.notes',this.value,'editar_labelcopy')">${s(lc.notes)}</textarea></div>
  </div>`;
}

// ── Legal (por canción) ──
function trackLegalHTML(t) {
  const legal = t.legal || [];
  const rows = legal.map((d, i) => `<div class="panel" style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
    <div style="flex:1"><div style="font-size:13px;font-weight:600">${s(d.type) || 'documento'}</div><div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted)">${s(d.state) || 'pendiente'}${d.responsable ? ' · ' + s(d.responsable) : ''}</div></div>
    <select class="input" style="width:auto;padding:4px 8px;font-size:11px" onchange="setLegalState(${i},this.value)">${['pendiente','enviado','firmado','aprobado'].map(x => `<option ${d.state === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <button class="goal-btn reject" title="Quitar" onclick="quitarLegal(${i})">✕</button></div>`).join('');
  return `<div class="empty-hint" style="margin-bottom:12px">Documentos legales de esta canción (split sheets, producer agreements, autorizaciones de feature/sample).</div>
    ${rows || '<div class="empty-hint">Sin documentos.</div>'}
    <button class="btn btn-ghost" style="margin-top:10px" onclick="agregarLegal()">+ Documento legal</button>`;
}
async function agregarLegal() {
  if (!requireCan('editar_legal')) return;
  const t = curTrack(); if (!t) return;
  const type = await uiPrompt('Tipo (split_sheet / producer_agreement / feature_clearance / sample_clearance / other):', { title: 'Nuevo documento legal' });
  if (!type) return;
  t.legal = t.legal || []; t.legal.push({ id: 'lg-' + Date.now(), type: type.trim(), state: 'pendiente', responsable: '', fileLink: '', note: '', updatedAt: new Date().toISOString() });
  saveTracks(); renderTrackTab('legal');
}
function setLegalState(i, state) { if (!requireCan('editar_legal')) return; const t = curTrack(); if (t && t.legal[i]) { t.legal[i].state = state; t.legal[i].updatedAt = new Date().toISOString(); saveTracks(); renderTrackTab('legal'); } }
function quitarLegal(i) { if (!requireCan('editar_legal')) return; const t = curTrack(); if (t && t.legal[i]) { t.legal.splice(i, 1); saveTracks(); renderTrackTab('legal'); } }

// ── Tareas (del track) ──
function trackTareasHTML(t) {
  const tasks = t.tasks || [];
  const rows = tasks.map((tk, i) => `<div class="panel" style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
    <input type="checkbox" ${tk.estado === 'hecho' ? 'checked' : ''} onchange="toggleTrackTask(${i})">
    <div style="flex:1"><div style="font-size:13px;${tk.estado === 'hecho' ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${s(tk.titulo)}</div>${tk.dueDate ? `<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted)">${s(tk.dueDate)}</div>` : ''}</div>
    <button class="goal-btn reject" title="Quitar" onclick="quitarTrackTask(${i})">✕</button></div>`).join('');
  return `${rows || '<div class="empty-hint">Sin tareas técnicas para este track.</div>'}<button class="btn btn-ghost" style="margin-top:10px" onclick="agregarTrackTask()">+ Tarea</button>`;
}
async function agregarTrackTask() { if (!requireCan('gestionar_tareas')) return; const t = curTrack(); if (!t) return; const tit = await uiPrompt('Tarea técnica:', { title: 'Nueva tarea' }); if (!tit) return; t.tasks = t.tasks || []; t.tasks.push({ id: 'tk-' + Date.now(), titulo: tit.trim(), capability: '', estado: 'pendiente', dueDate: '' }); saveTracks(); renderTrackTab('tareas'); }
function toggleTrackTask(i) { if (!requireCan('gestionar_tareas')) return; const t = curTrack(); if (t && t.tasks[i]) { t.tasks[i].estado = t.tasks[i].estado === 'hecho' ? 'pendiente' : 'hecho'; saveTracks(); renderTrackTab('tareas'); } }
function quitarTrackTask(i) { if (!requireCan('gestionar_tareas')) return; const t = curTrack(); if (t && t.tasks[i]) { t.tasks.splice(i, 1); saveTracks(); renderTrackTab('tareas'); } }
