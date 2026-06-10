// ══════════════════════════════════════════
// ACCOUNTABILITY — Sprint 9 (UI sobre las tablas de collab.js)
// Aprobaciones por gate · comentarios con canales + @menciones · feed de actividad · notificaciones in-app.
// ══════════════════════════════════════════

function _ago(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime(); if (isNaN(t)) return '';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return 'ahora';
  const min = Math.floor(sec / 60); if (min < 60) return 'hace ' + min + ' min';
  const h = Math.floor(min / 60); if (h < 24) return 'hace ' + h + ' h';
  const d = Math.floor(h / 24); if (d < 30) return 'hace ' + d + ' d';
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}
function _initials(x) { return up(s(x).replace(/@.*/, '')).slice(0, 2) || '?'; }

// ── Miembros del equipo (para @menciones / responsables) ──
function _members() { return (typeof _teamMembers !== 'undefined' && Array.isArray(_teamMembers)) ? _teamMembers : []; }
function _memberLabel(uid) { const m = _members().find(x => x.user_id === uid); return m ? (s(m.email) || uid) : uid; }

// ══════════════════════════════════════════
// NOTIFICACIONES (campana en el topbar)
// ══════════════════════════════════════════
const NOTIF_ICON = { assigned: 'person', due_soon: 'clock', overdue: 'warning', approval_request: 'bell', approved: 'check', comment: 'chat', mention: 'chat', system: 'info' };
function renderNotifBadge() {
  const dot = document.getElementById('notif-dot'); if (!dot) return;
  const n = (typeof unreadNotifCount === 'function') ? unreadNotifCount() : 0;
  if (n) { dot.textContent = n > 9 ? '9+' : n; dot.style.display = 'flex'; } else { dot.style.display = 'none'; }
}
function toggleNotifPanel(force) {
  const p = document.getElementById('notif-panel'); if (!p) return;
  const open = force != null ? force : p.style.display === 'none';
  if (open) { renderNotifPanel(); p.style.display = 'block'; setTimeout(() => document.addEventListener('click', _notifOutside), 0); }
  else { p.style.display = 'none'; document.removeEventListener('click', _notifOutside); }
}
function _notifOutside(e) { const w = e.target.closest('.notif-wrap'); if (!w) toggleNotifPanel(false); }
function renderNotifPanel() {
  const p = document.getElementById('notif-panel'); if (!p) return;
  const list = (typeof myNotifications === 'function') ? myNotifications() : [];
  const unread = list.filter(n => !n.isRead).length;
  const rows = list.length ? list.slice(0, 40).map(n => `<div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="openNotif('${n.id}')">
      <div class="notif-ic">${icon(NOTIF_ICON[n.type] || 'info', 15)}</div>
      <div style="flex:1;min-width:0"><div class="nt">${s(n.title)}</div>${n.body ? `<div class="nb">${s(n.body)}</div>` : ''}<div class="ntime">${_ago(n.createdAt)}</div></div>
    </div>`).join('') : `<div class="notif-empty">${icon('bell', 26)}<div style="margin-top:8px">Sin notificaciones</div></div>`;
  p.innerHTML = `<div class="notif-head"><span>Notificaciones</span>${unread ? `<button class="btn btn-ghost" style="margin-left:auto;padding:3px 8px;font-size:10px" onclick="event.stopPropagation();markAllNotifsRead()">Marcar leídas</button>` : ''}</div>${rows}`;
  if (typeof hydrateIcons === 'function') hydrateIcons(p);
}
function openNotif(id) {
  if (typeof markNotifRead === 'function') markNotifRead(id);
  renderNotifBadge();
  const n = (typeof notifications !== 'undefined') ? notifications.find(x => x.id === id) : null;
  toggleNotifPanel(false);
  const link = n && n.link;
  if (link) {
    if (link.taskId && typeof openTaskContext === 'function') openTaskContext(link.taskId);
    else if (link.releaseId && typeof openLaunch === 'function') openLaunch(link.releaseId);
    else if (link.page && typeof showPage === 'function') showPage(link.page);
  }
}
function markAllNotifsRead() {
  (typeof myNotifications === 'function' ? myNotifications() : []).forEach(n => { n.isRead = true; });
  if (typeof saveNotifs === 'function') saveNotifs();
  renderNotifBadge(); renderNotifPanel();
}

// ══════════════════════════════════════════
// COMENTARIOS (canales por área + @menciones)
// ══════════════════════════════════════════
let _cmtCanal = 'general';
function _renderMentions(body) {
  return s(body).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/@([\w.\-+]+@?[\w.\-]*)/g, '<span class="mention">@$1</span>');
}
function commentsPanelHTML(scope) {
  const all = (typeof commentsOf === 'function') ? commentsOf(scope) : [];
  const list = all.filter(c => (c.canal || 'general') === _cmtCanal);
  const tabs = COMMENT_CANALES.map(([k, lbl]) => { const cnt = all.filter(c => (c.canal || 'general') === k).length; return `<div class="cmt-tab ${k === 'interno-privado' ? 'priv' : ''} ${_cmtCanal === k ? 'active' : ''}" onclick="setCmtCanal('${k}')">${lbl}${cnt ? ` · ${cnt}` : ''}</div>`; }).join('');
  const thread = list.length ? list.map(c => `<div class="cmt">
      <div class="cmt-av">${_initials(c.author)}</div>
      <div class="cmt-body"><div class="cmt-meta">${s(c.author)} · ${_ago(c.createdAt)}</div><div class="cmt-text">${_renderMentions(c.body)}</div></div>
    </div>`).join('') : `<div class="empty-hint">Sin comentarios en este canal.</div>`;
  const mem = _members();
  const mentionSel = mem.length ? `<select class="input" style="width:auto;padding:6px 8px;font-size:11px" onchange="if(this.value){cmtInsertMention(this.value);this.value=''}"><option value="">@ mencionar…</option>${mem.map(m => `<option value="${s(m.email) || m.user_id}">${s(m.email) || m.user_id}</option>`).join('')}</select>` : '';
  const composer = canDo('gestionar_tareas') ? `<div class="cmt-compose">
      <textarea class="textarea" id="cmt-input" placeholder="Escribe un comentario… usa @ para mencionar" style="min-height:60px"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">${mentionSel}<button class="btn btn-primary" style="margin-left:auto" onclick="sendComment()">${icon('chat', 13)} Comentar${_cmtCanal === 'interno-privado' ? ' (privado)' : ''}</button></div>
    </div>` : '';
  return `<div class="panel"><div class="panel-head"><span class="ph-icon">${icon('chat', 18)}</span><span class="ph-title">Comentarios</span><span class="ph-sub">canales por área + @menciones</span></div>
    <div class="cmt-tabs">${tabs}</div>${thread}${composer}</div>`;
}
function setCmtCanal(k) { _cmtCanal = k; if (currentLaunchId && typeof renderReleaseTab === 'function') renderReleaseTab('actividad'); }
function cmtInsertMention(token) { const ta = document.getElementById('cmt-input'); if (!ta) return; ta.value = (ta.value + (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + '@' + token + ' '); ta.focus(); }
function _scopeOfCurrentRelease() { const l = launches.find(x => x.id === currentLaunchId); return l ? { artistId: l.artistId, releaseId: l.id, trackId: null, taskId: null } : null; }
function sendComment() {
  if (!requireCan('gestionar_tareas')) return;
  const ta = document.getElementById('cmt-input'); const body = ta ? ta.value.trim() : ''; if (!body) return;
  const scope = _scopeOfCurrentRelease(); if (!scope) return;
  // resolver @menciones contra miembros del equipo
  const tokens = (body.match(/@([\w.\-+]+@?[\w.\-]*)/g) || []).map(x => x.slice(1).toLowerCase());
  const mentions = _members().filter(m => tokens.includes(s(m.email).toLowerCase()) || tokens.includes(s(m.user_id).toLowerCase())).map(m => m.user_id);
  addComment(scope, _cmtCanal, body, mentions);
  if (typeof renderReleaseTab === 'function') renderReleaseTab('actividad');
  renderNotifBadge();
}

// ══════════════════════════════════════════
// FEED DE ACTIVIDAD
// ══════════════════════════════════════════
const ACT_ICON = { created: 'plus', status_changed: 'refresh', assigned: 'person', commented: 'chat', approved: 'check', rejected: 'close', approval_request: 'bell', deleted: 'trash', unblocked: 'check', template_applied: 'checklist', phase: 'flag', automation: 'zap', updated: 'pencil' };
function activityFeedHTML(scope) {
  const list = (typeof activityOf === 'function') ? activityOf(scope) : [];
  if (!list.length) return `<div class="panel"><div class="panel-head"><span class="ph-icon">${icon('clock', 18)}</span><span class="ph-title">Actividad</span></div><div class="empty-hint">Sin actividad registrada todavía.</div></div>`;
  const rows = list.slice(0, 60).map(a => `<div class="act-row">
      <div class="act-ic">${icon(ACT_ICON[a.verb] || 'info', 14)}</div>
      <div style="flex:1;min-width:0"><div class="as">${s(a.summary)}</div><div class="am">${s(a.actor)} · ${_ago(a.createdAt)}</div></div>
    </div>`).join('');
  return `<div class="panel"><div class="panel-head"><span class="ph-icon">${icon('clock', 18)}</span><span class="ph-title">Actividad</span><span class="ph-sub">${list.length} eventos</span></div>${rows}</div>`;
}

// Pestaña "Actividad" del release = comentarios + feed
function releaseActividadHTML(l) {
  const scope = { artistId: l.artistId, releaseId: l.id, trackId: null, taskId: null };
  return commentsPanelHTML(scope) + activityFeedHTML(scope);
}

// ══════════════════════════════════════════
// APROBACIONES (9 gates) — panel en el Resumen
// ══════════════════════════════════════════
const APR_ST_COLOR = { pendiente: 'var(--text-muted)', en_revision: 'var(--beat)', aprobado: '#4ade80', rechazado: 'var(--accent2)' };
function approvalsPanelHTML(l) {
  const aprs = (typeof approvalsOfRelease === 'function') ? approvalsOfRelease(l.id) : [];
  const latest = {}; aprs.forEach(a => { if (!latest[a.gate] || a.createdAt > latest[a.gate].createdAt) latest[a.gate] = a; });
  const canReq = canDo('gestionar_tareas'), canDec = canDo('aprobar_tareas');
  const rows = APPROVAL_GATES.map(([g, lbl]) => {
    const a = latest[g];
    const st = a ? a.estado : null;
    const stHTML = a ? `<span class="apr-st" style="background:${APR_ST_COLOR[st]}1f;color:${APR_ST_COLOR[st]}">${st.replace('_', ' ')}</span>` : `<span class="apr-st" style="background:var(--surface2);color:var(--text-dim)">sin solicitar</span>`;
    let actions = '';
    if (a && (st === 'pendiente' || st === 'en_revision') && canDec) actions = `<button class="btn btn-ghost" style="padding:3px 9px;font-size:11px;color:#4ade80;border-color:rgba(74,222,128,.35)" onclick="decideApprovalUI('${a.id}','aprobado')">Aprobar</button><button class="btn btn-ghost" style="padding:3px 9px;font-size:11px;color:var(--accent2)" onclick="decideApprovalUI('${a.id}','rechazado')">Rechazar</button>`;
    else if (!a && canReq) actions = `<button class="btn btn-ghost" style="padding:3px 9px;font-size:11px" onclick="requestApproval('${l.id}','${g}')">Solicitar</button>`;
    else if (a && (st === 'aprobado' || st === 'rechazado')) actions = `<span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">${a.decidedBy ? 'por ' + _memberLabel(a.decidedBy) : ''} ${_ago(a.decidedAt)}</span>${canReq ? `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px" onclick="requestApproval('${l.id}','${g}')" title="Volver a solicitar">${icon('refresh', 11)}</button>` : ''}`;
    return `<div class="apr-row"><span class="apr-gate">${lbl}</span>${stHTML}<span style="margin-left:auto;display:flex;gap:6px;align-items:center">${actions}</span></div>`;
  }).join('');
  return `<div class="panel"><div class="panel-head"><span class="ph-icon">${icon('check', 18)}</span><span class="ph-title">Aprobaciones</span><span class="ph-sub">propone → revisa → aprueba</span></div>${rows}</div>`;
}
function requestApproval(launchId, gate) {
  if (!requireCan('gestionar_tareas')) return;
  const l = launches.find(x => x.id === launchId); if (!l) return;
  const ap = createApproval({ artistId: l.artistId, releaseId: l.id, trackId: null }, gate);
  updateApprovalEstado(ap.id, 'en_revision');
  // notificar a quienes pueden aprobar (manager/owner) — en demo, al creador del release
  if (typeof renderReleaseTab === 'function') renderReleaseTab('resumen');
  renderNotifBadge();
  if (typeof uiToast === 'function') uiToast('Aprobación solicitada');
}
function updateApprovalEstado(id, estado) { const ap = approvals.find(x => x.id === id); if (ap) { ap.estado = estado; if (typeof saveApprovals === 'function') saveApprovals(); } }
async function decideApprovalUI(id, estado) {
  if (!requireCan('aprobar_tareas')) return;
  let note = '';
  if (estado === 'rechazado') { note = await uiPrompt('Motivo del rechazo (opcional):', { title: 'Rechazar aprobación' }) || ''; }
  decideApproval(id, estado, note);
  if (typeof renderReleaseTab === 'function') renderReleaseTab('resumen');
  renderNotifBadge();
  if (typeof uiToast === 'function') uiToast(estado === 'aprobado' ? 'Aprobado' : 'Rechazado');
}
