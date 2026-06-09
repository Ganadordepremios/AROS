// ══════════════════════════════════════════
// CRM — checklist, "Listo para lanzar" y macro-fase (PLAN_CRM §2.5)
// ══════════════════════════════════════════

// Checklist por TRACK (la granularidad de los ~20 estados)
const TRACK_CHECKLIST = {
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
const CHECKLIST_GROUP_LABEL = { audio:'Audio', legal:'Legal', distrib:'Distribución', visual:'Visual', mkt:'Marketing' };

function _countChecklist(obj, def) {
  let done = 0, total = 0;
  Object.keys(def).forEach(g => def[g].forEach(([k]) => { total++; if (obj && obj[g] && obj[g][k]) done++; }));
  return { done, total };
}
function trackReady(t) { return _countChecklist((t && t.checklist) || {}, TRACK_CHECKLIST); }
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
