// ══════════════════════════════════════════
// CRM — checklist, "Listo para lanzar" y macro-fase (PLAN_CRM §2.5)
// ══════════════════════════════════════════

// Checklist por TRACK — definición POR DEFECTO (editable por track; templates por equipo)
const DEFAULT_TRACK_CHECKLIST = {
  audio:   [['refSubida','Ref subida'],['mezclaRecibida','Mezcla recibida'],['masterRecibido','Máster recibido'],['masterWAV','Máster WAV'],['calidadOK','Calidad OK'],['versionClean','Versión clean'],['versionExplicit','Versión explícita']],
  legal:   [['splitCreado','Split sheet creado'],['splitFirmado','Split firmado'],['producerCreado','Producer agreement creado'],['producerFirmado','Producer firmado'],['featureAuth','Feature autorizado'],['sampleAuth','Sample autorizado'],['labelCopyCompleto','Label Copy completo']],
  distrib: [['metadataCompleta','Metadata completa'],['isrcGenerado','ISRC generado']],
};
// Checklist a nivel RELEASE
const RELEASE_CHECKLIST = {
  visual:  [['coverCreado','Cover creado'],['coverAprobado','Cover aprobado'],['coverFormatoOK','Cover formato OK'],['assetsSubidos','Assets subidos']],
  distrib: [['distribuidoraSeleccionada','Distribuidora seleccionada'],['upcGenerado','UPC generado'],['fechaConfirmada','Fecha confirmada'],['subidoADistribucion','Subido a distribución'],['pitchEditorial','Pitch editorial']],
  mkt:     [['adnCampanaCompleto','ADN de campaña completo'],['planContenido','Plan de contenido'],['calendarioCreado','Calendario creado'],['presupuestoDefinido','Presupuesto definido'],['planMediosDefinido','Plan de medios definido']],
};
const CHECKLIST_GROUP_LABEL = { audio:'Audio', legal:'Legal', distrib:'Distribución', visual:'Visual', mkt:'Marketing', otros:'Otros' };

function _countChecklist(obj, def) {
  let done = 0, total = 0;
  Object.keys(def).forEach(g => (def[g] || []).forEach(([k]) => { total++; if (obj && obj[g] && obj[g][k]) done++; }));
  return { done, total };
}
// Definición efectiva del checklist de un track (propia si la editó/aplicó template; si no, la default)
function trackChecklistDef(t) {
  return (t && t.checklistDef && typeof t.checklistDef === 'object') ? t.checklistDef : DEFAULT_TRACK_CHECKLIST;
}
function trackReady(t) { return _countChecklist((t && t.checklist) || {}, trackChecklistDef(t)); }

// ── Templates de checklist (flujos propios reutilizables, por equipo) ──
function checklistTemplatesKey() { return 'ao_checklist_templates_' + (typeof _teamId !== 'undefined' && _teamId ? _teamId : 'local'); }
function getChecklistTemplates() { try { return JSON.parse(localStorage.getItem(checklistTemplatesKey())) || []; } catch (e) { return []; } }
function setChecklistTemplates(arr) { try { localStorage.setItem(checklistTemplatesKey(), JSON.stringify(arr)); } catch (e) {} }
function cloneDef(def) { const o = {}; Object.keys(def || {}).forEach(g => o[g] = (def[g] || []).map(it => [it[0], it[1]])); return o; }
function checklistSlug(label) { return (s(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'item') + '_' + Math.random().toString(36).slice(2, 6); }
// "Listo para lanzar %" del release = checklists de TODOS sus tracks + checklist del release
function releaseReady(l) {
  let done = 0, total = 0;
  (typeof tracksOfLaunch === 'function' ? tracksOfLaunch(l) : []).forEach(t => { const c = trackReady(t); done += c.done; total += c.total; });
  const rc = _countChecklist((l && l.releaseChecklist) || {}, RELEASE_CHECKLIST); done += rc.done; total += rc.total;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}

// Macro-fase (fase más avanzada alcanzada según el checklist; override manual gana)
const PHASES = ['Idea', 'Producción', 'Legal', 'Distribución', 'Lanzado', 'Post'];
function trackPhase(t) {
  if (t && t.status && t.status.override) return t.status.override;
  const c = (t && t.checklist) || {}, a = c.audio || {}, lg = c.legal || {}, dd = c.distrib || {};
  let phase = 'Idea';
  if (Object.keys(a).some(k => a[k])) phase = 'Producción';
  if (a.masterRecibido) phase = 'Legal';
  if (lg.labelCopyCompleto && dd.metadataCompleta && dd.isrcGenerado) phase = 'Distribución';
  return phase;
}
function releasePhase(l) {
  if (!l) return 'Idea';
  if (l.status === 'complete') return 'Post';
  const ts = (typeof tracksOfLaunch === 'function' ? tracksOfLaunch(l) : []);
  let phase = 'Idea';
  if (ts.length) { const idx = Math.min.apply(null, ts.map(t => PHASES.indexOf(trackPhase(t)))); phase = PHASES[Math.max(0, idx)]; } // cuello de botella
  const rd = (l.releaseChecklist && l.releaseChecklist.distrib) || {};
  if (rd.subidoADistribucion) phase = 'Distribución';
  if (l.status === 'active' && l.date && new Date(l.date + 'T00:00:00') <= new Date()) phase = 'Lanzado';
  return phase;
}
function readyColor(pct) { return pct >= 80 ? '#4ade80' : pct >= 40 ? 'var(--beat)' : 'var(--accent2)'; }
function phaseColor(phase) {
  return { 'Idea':'var(--text-dim)','Producción':'#a78bfa','Legal':'var(--beat)','Distribución':'#38bdf8','Lanzado':'#4ade80','Post':'var(--accent)' }[phase] || 'var(--text-dim)';
}
// Barra "Listo para lanzar" reutilizable
function readyBarHTML(pct, label) {
  const col = readyColor(pct);
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
      <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);letter-spacing:1px">${label || 'LISTO PARA LANZAR'}</span>
      <span style="font-family:var(--font-display);font-size:20px;color:${col}">${pct}%</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${col}"></div></div>
  </div>`;
}

// ══════════════════════════════════════════
// TAREAS (release + track) — motor compartido (Sprint 3)
// ══════════════════════════════════════════
const TASK_STATES = [['pendiente','Pendiente'],['en_progreso','En progreso'],['hecho','Hecho']];
function _taskArray(kind){
  if(kind==='track'){ const t=(typeof curTrack==='function')?curTrack():null; if(!t) return null; t.tasks=t.tasks||[]; return t.tasks; }
  const l=launches.find(x=>x.id===currentLaunchId); if(!l) return null; l.tasks=l.tasks||[]; return l.tasks;
}
function _taskSave(kind){ if(kind==='track') saveTracks(); else saveLaunches(); }
function _taskRerender(kind){ if(kind==='track') renderTrackTab('tareas'); else renderReleaseTab('tareas'); }
function tareasPanelHTML(kind){
  const arr=_taskArray(kind)||[]; const editable=canDo('gestionar_tareas');
  const rows=arr.map((tk,i)=>{ const done=tk.estado==='hecho'; const overdue=tk.dueDate && tk.estado!=='hecho' && new Date(tk.dueDate+'T00:00:00')<new Date(new Date().toDateString());
    return `<div class="panel" style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
      <input class="input" style="flex:1;min-width:150px;font-size:13px;padding:6px 9px;${done?'text-decoration:line-through;color:var(--text-muted)':''}" value="${s(tk.titulo)}" placeholder="Tarea" onchange="setTaskField('${kind}',${i},'titulo',this.value)">
      <input class="input" style="width:130px;padding:6px 9px;font-size:12px" placeholder="Responsable" value="${s(tk.responsable)}" onchange="setTaskField('${kind}',${i},'responsable',this.value)">
      <input class="input" type="date" style="width:auto;padding:6px 9px;font-size:12px;${overdue?'border-color:var(--accent2);color:var(--accent2)':''}" value="${s(tk.dueDate)}" onchange="setTaskField('${kind}',${i},'dueDate',this.value)">
      <select class="input" style="width:auto;padding:6px 8px;font-size:11px" onchange="setTaskField('${kind}',${i},'estado',this.value)">${TASK_STATES.map(x=>`<option value="${x[0]}" ${tk.estado===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select>
      ${editable?`<button class="goal-btn reject" title="Quitar" onclick="removeTask('${kind}',${i})">✕</button>`:''}
    </div>`;}).join('');
  return `<div class="empty-hint" style="margin-bottom:12px">Tareas ${kind==='track'?'técnicas de la canción':'de campaña/operación del release'} — con responsable, fecha límite y estado.</div>${rows||'<div class="empty-hint">Sin tareas.</div>'}${editable?`<button class="btn btn-ghost" style="margin-top:6px" onclick="addTask('${kind}')">+ Tarea</button>`:''}`;
}
async function addTask(kind){ if(!requireCan('gestionar_tareas')) return; const arr=_taskArray(kind); if(!arr) return; const tit=(await uiPrompt('Tarea:',{title:'Nueva tarea'})||'').trim(); if(!tit) return; arr.push({id:'tk-'+Date.now(),titulo:tit,responsable:'',estado:'pendiente',dueDate:''}); _taskSave(kind); _taskRerender(kind); }
function setTaskField(kind,i,f,val){ if(!requireCan('gestionar_tareas')) return; const arr=_taskArray(kind); if(arr&&arr[i]){ arr[i][f]=val; _taskSave(kind); if(f==='estado'||f==='dueDate') _taskRerender(kind); } }
function removeTask(kind,i){ if(!requireCan('gestionar_tareas')) return; const arr=_taskArray(kind); if(arr&&arr[i]){ arr.splice(i,1); _taskSave(kind); _taskRerender(kind); } }
