// ══════════════════════════════════════════
// SISTEMA DE ÍCONOS (SVG inline propio · "platform-like")
// Estilo uniforme: viewBox 24, stroke currentColor, weight 1.75, linecaps round.
// Uso: icon('nombre', 16) → string SVG. En HTML estático: <span data-icon="nombre"></span> + hydrateIcons().
// ══════════════════════════════════════════
const ICONS = {
  // — Navegación —
  dashboard:  '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  releases:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/><path d="M12 3a9 9 0 0 1 9 9"/>',
  label:      '<path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><line x1="9" y1="21" x2="9" y2="13"/><line x1="15" y1="21" x2="15" y2="13"/><line x1="12" y1="9" x2="12" y2="9.01"/>',
  artist:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
  dna:        '<path d="M9 3c4 3 4 6 0 9s-4 6 0 9"/><path d="M15 3c-4 3-4 6 0 9s4 6 0 9"/><line x1="9.5" y1="6" x2="14.5" y2="6"/><line x1="8.2" y1="12" x2="15.8" y2="12"/><line x1="9.5" y1="18" x2="14.5" y2="18"/>',
  references: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v15H7.5A2.5 2.5 0 0 0 5 19.5z"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H20v5H7.5A2.5 2.5 0 0 1 5 19.5z"/>',
  ideas:      '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5.9 1.1 1 1.8h6c.1-.7.4-1.3 1-1.8A7 7 0 0 0 12 2z"/>',
  calendar:   '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/>',
  goals:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  metrics:    '<path d="M4 20h16"/><line x1="7" y1="20" x2="7" y2="13"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="17" y1="20" x2="17" y2="4"/>',
  learnings:  '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>',
  ai:         '<path d="M12 3.5l1.7 4.8L18.5 10l-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/>',
  // — Paneles / acciones —
  team:       '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6"/><path d="M16 5.2a3.4 3.4 0 0 1 0 5.6"/><path d="M18 14.8c2.1.7 3.5 2.4 3.5 4.8"/>',
  person:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
  mic:        '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8.5" y1="21" x2="15.5" y2="21"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13.5" width="4" height="6.5" rx="1.6"/><rect x="17" y="13.5" width="4" height="6.5" rx="1.6"/>',
  sound:      '<path d="M11 5L6.5 9H3v6h3.5L11 19z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.5 6a8 8 0 0 1 0 12"/>',
  identity:   '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11.5" r="2.4"/><path d="M5.5 16.5c.4-1.8 1.9-2.7 3.5-2.7s3.1.9 3.5 2.7"/><line x1="15" y1="10" x2="18" y2="10"/><line x1="15" y1="14" x2="18" y2="14"/>',
  chart:      '<path d="M4 20h16"/><line x1="7" y1="20" x2="7" y2="13"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="17" y1="20" x2="17" y2="4"/>',
  report:     '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><line x1="8.5" y1="17" x2="8.5" y2="14"/><line x1="12" y1="17" x2="12" y2="12.5"/><line x1="15.5" y1="17" x2="15.5" y2="15"/>',
  checklist:  '<path d="M9.5 6h10"/><path d="M9.5 12h10"/><path d="M9.5 18h10"/><path d="M4 6l1.3 1.3L7.8 4.8"/><path d="M4 12l1.3 1.3L7.8 10.8"/><path d="M4 18l1.3 1.3L7.8 16.8"/>',
  file:       '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  contacts:   '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="10.5" cy="10.5" r="2.3"/><path d="M6.8 16.5c.4-1.7 1.8-2.6 3.7-2.6s3.3.9 3.7 2.6"/><line x1="4" y1="8.5" x2="2.5" y2="8.5"/><line x1="4" y1="12" x2="2.5" y2="12"/><line x1="4" y1="15.5" x2="2.5" y2="15.5"/>',
  finance:    '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.5h18"/><circle cx="16.5" cy="14.5" r="1.4"/>',
  receipt:    '<path d="M5 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4L17 3l-2 1.4L13 3l-2 1.4L9 3 7 4.4z"/><line x1="8.5" y1="9" x2="15.5" y2="9"/><line x1="8.5" y1="13" x2="13.5" y2="13"/>',
  tag:        '<path d="M3.5 12.5L11 5a2 2 0 0 1 1.4-.6h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.6 1.4l-7.5 7.5a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8z"/><circle cx="16" cy="8" r="1.4" fill="currentColor"/>',
  invite:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  key:        '<circle cx="8" cy="14" r="4"/><path d="M10.8 11.2L20 2"/><path d="M16 6l2.2 2.2"/><path d="M18.5 3.5l2.2 2.2"/>',
  save:       '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h7"/>',
  clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 2"/>',
  zap:        '<path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10.5H13z"/>',
  settings:   '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  wrench:     '<path d="M14.5 5.6a3.6 3.6 0 0 0-4.7 4.7L3 17.1 6.9 21l6.8-6.8a3.6 3.6 0 0 0 4.7-4.7l-2.4 2.4-2.2-.6-.6-2.2z"/>',
  music:      '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  warning:    '<path d="M12 3L2 20.5h20z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17.3" r="0.7" fill="currentColor" stroke="none"/>',
  refresh:    '<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.6-4.1"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 7.6 4.1"/><path d="M21 3.5V8h-4.5"/><path d="M3 20.5V16h4.5"/>',
  close:      '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  check:      '<path d="M5 12.5l4.5 4.5L19 7"/>',
  star:       '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 18.1 6.6 20l1-6.1L3.2 9.5l6.1-.9z"/>',
  starFill:   '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 18.1 6.6 20l1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
  plus:       '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  eye:        '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  lock:       '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  moon:       '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun:        '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8"/>',
  link:       '<path d="M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1L11 4.9"/><path d="M14 11a5 5 0 0 0-7.1 0L4.1 13.8a5 5 0 0 0 7.1 7.1L13 19.1"/>',
  disc:       '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  video:      '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  camera:     '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8 7l1.4-2h5.2L16 7"/>',
  phone:      '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/>',
  image:      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 17l5-5 4 4 3-3 6 6"/>',
  play:       '<path d="M7 4.5v15l13-7.5z"/>',
  apple:      '<path d="M16 13c0-2.2 1.7-3.2 1.8-3.3-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.04 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1-.02 1.8-1 2.5-2.1.5-.8.8-1.5 1-1.8-1.6-.6-2.6-2.4-2.6-3.8z"/><path d="M14 6c.6-.7.9-1.7.8-2.7-.8.04-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1z"/>',
  video2:     '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  graduation: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4.5c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V11"/><line x1="21" y1="9" x2="21" y2="14"/>',
  trend:      '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  chat:       '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z"/>',
  trophy:     '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H5v2a3 3 0 0 0 3 3"/><path d="M16 5h3v2a3 3 0 0 1-3 3"/><line x1="12" y1="13" x2="12" y2="17"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/>',
  flame:      '<path d="M12 3c2.2 3 1 5 3 7s1.8 5.2-3 9.5C7.2 15.2 7 12.2 9 10c0 0-.8-3.8 3-7z"/>',
  heart:      '<path d="M12 20.5C5.5 16 3 12.5 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3.5-2.5 7-9 11.5z"/>',
  smile:      '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none"/>',
  pin:        '<path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  book:       '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v15H7.5A2.5 2.5 0 0 0 5 19.5z"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H20v5H7.5A2.5 2.5 0 0 1 5 19.5z"/>',
  rocket:     '<path d="M5 15c-1.5 1-2 4-2 4s3-.5 4-2c.6-.9.5-2 .5-2L7 13s-1.1-.1-2 .5z"/><path d="M9 15l-3-3c1-4 4-8 9-9 0 5-4 8-9 9z"/><circle cx="14" cy="10" r="1.3"/>',
  scissors:   '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><line x1="8.2" y1="7.5" x2="20" y2="18"/><line x1="8.2" y1="16.5" x2="20" y2="6"/>',
  thumb:      '<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/><path d="M7 11l4-7a2 2 0 0 1 2 2v3h5.5a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17 20H7"/>',
  menu:       '<line x1="3.5" y1="6.5" x2="20.5" y2="6.5"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="3.5" y1="17.5" x2="20.5" y2="17.5"/>',
  logout:     '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M9 16l-4-4 4-4"/><line x1="5" y1="12" x2="15" y2="12"/>',
  upload:     '<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/>',
  download:   '<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/>',
  info:       '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none"/>',
  bell:       '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  pencil:     '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/><line x1="14.5" y1="5.5" x2="18.5" y2="9.5"/>',
  copy:       '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  trash:      '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
  cloud:      '<path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.5 3.5 0 0 1 17 18z"/>',
  palette:    '<path d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.8 1.5-1.5 0-.5-.3-.9-.6-1.2-.3-.4-.5-.7-.5-1.1 0-.7.6-1.2 1.3-1.2H15a5 5 0 0 0 5-5c0-4.2-3.6-7-8-7z"/><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="8.5" r="1" fill="currentColor" stroke="none"/>',
  galaxy:     '<circle cx="12" cy="12" r="2"/><path d="M12 4c5 0 8 3 8 6s-5 2-8 2-8 1-8-2 3-6 8-6z" transform="rotate(25 12 12)"/>',
  edit2:      '<path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  signature:  '<path d="M3 17c2.5 0 3-9 5-9s1.5 7 3 7 2-4 4-4 2 3 4 3"/><line x1="3" y1="20.5" x2="21" y2="20.5"/>',
  flag:       '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  megaphone:  '<path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M14 8a4 4 0 0 1 0 8"/>',
  placeholder:'<rect x="4" y="4" width="16" height="16" rx="2"/>',
};
function icon(name, size = 16) {
  const body = ICONS[name] || ICONS.placeholder;
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
// Hidrata íconos declarados en HTML estático: <span data-icon="team" data-isize="20"></span>
function hydrateIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    const n = el.getAttribute('data-icon'); if (!n) return;
    const sz = parseInt(el.getAttribute('data-isize') || '16', 10);
    el.innerHTML = icon(n, sz);
    el.removeAttribute('data-icon');
  });
}
// Quita un emoji/pictograma inicial de una etiqueta de datos (CSV) sin tocar el dato crudo.
function stripEmoji(str) { return s(str).replace(/^[\s\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]+/u, '').trim(); }

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

// Categoría de contenido → nombre de ícono (cubre cats del banco CSV + del DEMO).
const CAT_ICON = {
  // DEMO / internas
  bts:'headphones', awareness:'identity', engagement:'mic', storytelling:'book',
  trend:'trend', humor:'smile', educativo:'graduation', pov:'eye', 'conversión':'ideas',
  behind:'video', viral:'flame', reel:'phone', short:'zap',
  // CSV (normalizadas sin emoji por stripEmoji)
  'behind the scenes':'video', 'funny videos for inspiration':'smile',
  'show your skills / challenge':'trophy', 'song promotion':'music',
  'talking to camera':'mic', 'trending sounds':'trend',
  'tutorials/recommendations':'graduation', 'vibes':'ai', 'educational':'graduation',
  'relatable':'person', 'about me':'person', 'transition hook':'trend',
  'performance':'sound', 'comedy/sketch':'smile', 'reaction':'eye',
  'motivational / emotional':'heart',
};
function catIcon(cats) {
  const first = stripEmoji(cats[0]).toLowerCase();
  return CAT_ICON[first] || 'pin';
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
    const forTags = toTags(obj['for'] || obj['para'] || '').map(stripEmoji).filter(Boolean);
    const catTags = toTags(obj['cat'] || obj['categoria'] || '').map(stripEmoji).filter(Boolean);
    return {
      _idx: idx,
      id: obj.id || '',
      title: obj.title || obj.titulo || '',
      hook: obj.hook || '',
      for: forTags,
      cat: catTags,
      link: obj.link || obj.url || '',
      comentarios: obj.comentarios || obj.notas || '',
      icon: catIcon(catTags),
    };
  }).filter(r => r.title.trim().length > 0);
}

const DEMO = [
  {_idx:0,id:1,title:"BTS en estudio — Natanael Cano",hook:"Lo que nadie vio...",for:["lanzamiento","single"],cat:["bts","storytelling"],link:"",comentarios:"Muy auténtico",icon:"headphones"},
  {_idx:1,id:2,title:"Hook emocional en espejo",hook:"¿Tú también lo sentiste?",for:["lanzamiento","álbum"],cat:["awareness","pov"],link:"",comentarios:"Primera semana",icon:"identity"},
  {_idx:2,id:3,title:"Trend: antes/después del quiebre",hook:"Antes vs después",for:["single","ep"],cat:["trend","engagement"],link:"",comentarios:"Alta viralidad",icon:"trend"},
  {_idx:3,id:4,title:"Mini documental 60 seg",hook:"Un año en 60 segundos",for:["álbum","lanzamiento"],cat:["storytelling"],link:"",comentarios:"Ancla YouTube",icon:"video"},
  {_idx:4,id:5,title:"Texto en pantalla con mensajes",hook:"Esto es lo que aprendí...",for:["single","lanzamiento"],cat:["engagement","educativo"],link:"",comentarios:"Alta compartición IG",icon:"file"},
  {_idx:5,id:6,title:"Reacción del productor",hook:"La cara cuando escuchó el take...",for:["lanzamiento"],cat:["bts","humor"],link:"",comentarios:"Humaniza el proceso",icon:"headphones"},
  {_idx:6,id:7,title:"Duet con fans",hook:"Cántalo conmigo",for:["single","ep","álbum"],cat:["engagement"],link:"",comentarios:"Genera UGC",icon:"mic"},
  {_idx:7,id:8,title:"POV: eres el artista en estudio",hook:"POV: son las 3am",for:["single","lanzamiento"],cat:["pov","humor"],link:"",comentarios:"Trending TikTok",icon:"eye"},
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
    + `<div style="margin:-10px 0 18px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:0.5px;display:flex;align-items:center;gap:5px"><span style="color:var(--accent)">${icon('starFill',12)}</span><strong style="color:var(--accent)">${n}</strong> idea${n===1?'':'s'} seleccionada${n===1?'':'s'} para ${a ? s(a.name) : 'este lanzamiento'} · la estrella agrega o quita</div>`;
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
        <span style="color:var(--text-muted)">${icon(s(r.icon)||'pin',30)}</span>
        <button onclick="event.stopPropagation();toggleIdea(${r._idx},this)" title="Seleccionar idea para el lanzamiento activo"
          style="position:absolute;top:6px;right:6px;background:none;border:none;cursor:pointer;display:flex;color:${sel?'var(--accent)':'var(--text-dim)'};opacity:${sel?1:0.5};transition:all 0.2s">${icon(sel?'starFill':'star',15)}</button>
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
    a.ideas.push({ key, title:r.title, hook:r.hook, cat:r.cat, for:r.for, link:r.link, comentarios:r.comentarios, icon:r.icon });
    selected = true;
  }
  saveLaunches();
  if (btn) { btn.innerHTML = icon(selected ? 'starFill' : 'star', 15); btn.style.color = selected ? 'var(--accent)' : 'var(--text-dim)'; btn.style.opacity = selected ? '1' : '0.5'; }
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
  const briefIco = `<span style="color:var(--text-muted)">${icon(s(r.icon)||'pin',34)}</span>`;
  const card  = document.getElementById('bd-thumb-card');
  if (thumb) {
    card.innerHTML = `
      <img class="brief-thumb-img" src="${thumb}" alt="${s(r.title)}" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="brief-thumb-fallback" style="display:none">${briefIco}</div>
      <div style="padding:10px;border-top:1px solid var(--border)">
        <a href="${s(r.link)}" target="_blank" style="font-size:11px;color:var(--accent);font-family:var(--font-mono);text-decoration:none">${icon('link',12)} Abrir original</a>
      </div>`;
  } else {
    card.innerHTML = `
      <div class="brief-thumb-fallback" style="display:flex">${briefIco}</div>
      <div style="padding:10px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text-dim);text-align:center">SIN LINK ASOCIADO</div>`;
  }

  const selLabel = a ? `Seleccionar para ${s(a.name)}` : 'Seleccionar idea';
  document.getElementById('bd-actions').innerHTML = `
    <button id="bd-sel-btn" onclick="toggleIdea(${idx}, null); openRefBoxdrop(${idx})"
      style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:3px;font-size:11px;font-family:var(--font-mono);cursor:pointer;border:1px solid ${sel?'rgba(255,107,48,0.3)':'var(--border)'};background:transparent;color:${sel?'var(--accent)':'var(--text-muted)'};transition:all 0.15s">${icon(sel?'starFill':'star',13)} ${sel?'Seleccionada':selLabel}</button>
    <button onclick="generarContenidoBanco(${idx})"
      style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:3px;font-size:11px;font-family:var(--font-mono);cursor:pointer;border:1px solid rgba(167,139,250,0.4);background:transparent;color:#a78bfa;transition:all 0.15s">${icon('ai',13)} Generar contenido</button>
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
    const dropBadge = isDrop ? `<div style="font-size:8px;font-family:var(--font-mono);color:var(--accent);letter-spacing:1px;margin-bottom:3px;display:flex;align-items:center;gap:4px">${icon('goals',10)} DROP</div>` : '';
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
      <div style="width:26px;height:26px;border-radius:4px;background:${col}22;color:${col};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(s(r.icon)||'pin',15)}</div>
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
const ESTADO_ICON = { pendiente:'', aprobado:icon('thumb',13), grabando:icon('video',13), editando:icon('scissors',13), programado:icon('calendar',13), publicado:icon('check',13) };
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
        <button class="goal-btn reject" onclick="prodGuionDel(${i})" title="Quitar">${icon('close',12)}</button>
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
          <button class="goal-btn reject" onclick="prodShotDel(${i})" title="Quitar">${icon('close',12)}</button>
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
      <button class="goal-btn reject" onclick="prodAssetDel(${i})" title="Quitar">${icon('close',12)}</button>
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
      <button class="btn btn-ghost" style="border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarContenidoIA()">${icon('ai',13)} ${c ? 'Regenerar' : 'Generar'} contenido</button>
      ${c && c.at ? `<span style="font-size:10px;font-family:var(--font-mono);color:var(--text-dim)">generado ${new Date(c.at).toLocaleString()}</span>` : ''}
    </div>
    ${aiHintHTML(promptStr, 1000)}
    <div id="prod-content-result" style="margin-top:14px">${c ? contentResultHTML(c) : '<div class="empty-hint">Aún no hay contenido. Genera caption, script y hashtags a partir del ADN del artista + el Campaign DNA + esta pieza.</div>'}</div>`;
}
async function generarContenidoIA() {
  const ci = prodItem(); if (!ci) return;
  if (!aiReady()) { abrirAISettings(); return; }
  const res = document.getElementById('prod-content-result');
  res.innerHTML = `<div class="empty-hint">${icon('ai',13)} Generando contenido…</div>`;
  try {
    const { text } = await callClaude(buildContentPrompt(ci), 1600);
    const obj = parseJSONObj(text);
    if (!obj) throw new Error('La IA no devolvió contenido en formato válido.');
    obj.at = Date.now();
    ensureProduction(ci).content = obj;
    saveLaunches();
    renderProd();
  } catch (e) {
    res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.</div>`;
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
  res.innerHTML = `<div class="empty-hint">${icon('ai',13)} Generando contenido…</div>`;
  try {
    const { text } = await callClaude(buildContentPromptFromRef(r, a, art), 1600);
    const obj = parseJSONObj(text);
    if (!obj) throw new Error('La IA no devolvió contenido válido.');
    res.innerHTML = contentResultHTML(obj);
  } catch (e) {
    res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.</div>`;
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
      <h4>${icon('check',14)} Semana pasada · hit rate ${hit}%</h4>
      <div style="font-size:13px;margin-bottom:8px">${d.lastPublished.length} de ${d.lastWeekItems.length} piezas publicadas.</div>
      <div class="progress-track"><div class="progress-fill" style="width:${hit}%"></div></div>
    </div>

    <div class="pow-section">
      <h4>${icon('calendar',14)} Esta semana · ${d.pending.length} pendiente${d.pending.length===1?'':'s'}</h4>
      ${d.pending.length ? d.pending.map(c => `<div class="pow-row"><span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);width:48px">${powDM(c.fecha)}</span><span style="flex:1">${ESTADO_ICON[(c.production&&c.production.estado)||'pendiente']||''} ${s(c.title)}</span><span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${(c.production&&c.production.estado)||'pendiente'}</span></div>`).join('') : '<div style="font-size:12px;color:var(--text-dim)">Sin piezas pendientes esta semana.</div>'}
    </div>

    <div class="pow-section">
      <h4>${icon('chart',14)} Métricas top — ${s(d.a.name)}</h4>
      ${d.metrics.length ? `<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);gap:10px">${d.metrics.map(m => `<div class="stat-card" style="padding:14px"><div class="stat-label">${s(m.metric)}</div><div class="stat-value" style="font-size:24px">${fmtNum(m.value)}</div></div>`).join('')}</div>` : '<div style="font-size:12px;color:var(--text-dim)">Sin métricas cargadas (impórtalas en Métricas).</div>'}
    </div>

    <div class="pow-section" style="margin-bottom:0">
      <h4>${icon('ideas',14)} Recomendación IA</h4>
      <div id="pow-rec">${powRecommendation
        ? `<div class="brief-value" style="background:var(--surface2);padding:12px;border-radius:6px;line-height:1.6">${s(powRecommendation)}</div>`
        : `<button class="btn btn-ghost" style="border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarPOWRecomendacion()">${icon('ai',13)} Generar recomendación</button>${aiHintHTML(powRecPrompt(d), 300)}`}</div>
    </div>`;
}
async function generarPOWRecomendacion() {
  if (!aiReady()) { abrirAISettings(); return; }
  const d = powData(); const rec = document.getElementById('pow-rec');
  rec.innerHTML = `<div class="empty-hint">${icon('ai',13)} Generando recomendación…</div>`;
  try {
    const { text } = await callClaude(powRecPrompt(d), 400);
    powRecommendation = s(text).trim();
    renderPOW();
  } catch (e) { rec.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.</div>`; }
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
      host.innerHTML = `<div class="empty-hint">${icon('ai',13)} Generando sugerencias de metas con IA (según ADN, campaña e histórico)…</div>`;
      sugerirObjetivosIA(true);
      return;
    }
    if (!hasGoalInfo(a, art)) {
      host.innerHTML = `<div class="empty-hint">No hay suficiente información para sugerir metas todavía.<br>
        <span style="color:var(--text-muted)">Agrégalas con <b>“+ Meta manual”</b>, o completa el <b>ADN</b> del artista y los datos del lanzamiento (fecha, campaña). Tener métricas de lanzamientos anteriores también ayuda a que la IA proponga metas.</span></div>`;
    } else {
      host.innerHTML = `<div class="empty-hint">Aún no hay metas para “${s(a.name)}”. Usa <b>“Sugerir con IA”</b> o <b>“+ Meta manual”</b>.</div>`;
    }
    return;
  }
  host.innerHTML = a.goals.map((g, i) => {
    const cls = g.status === 'accepted' ? ' accepted' : (g.status === 'rejected' ? ' rejected' : '');
    const accOn = g.status === 'accepted' ? ' on-accept' : '';
    const rejOn = g.status === 'rejected' ? ' on-reject' : '';
    const dl = g.deadline ? ` · ${icon('calendar',11)} ${g.deadline}` : '';
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
      <div class="goal-platform" style="background:${g.bg || 'var(--surface2)'};display:flex;align-items:center;justify-content:center;color:var(--text)">${icon(ICONS[s(g.icon)]?s(g.icon):'goals',18)}</div>
      <div><div class="goal-metric">${s(g.metric)}</div><div class="goal-sub">${s(g.sub)}${dl}</div>${progHTML}</div>
      <div class="goal-target">${s(g.target)}<small>OBJETIVO</small></div>
      <div class="goal-ai">${s(g.ai || (g.source === 'manual' ? 'manual' : ''))}</div>
      <div class="goal-actions">
        <div class="goal-btn accept${accOn}" title="Aceptar" onclick="goalSetStatus(${i},'accepted')">${icon('check',13)}</div>
        <div class="goal-btn reject${rejOn}" title="Quitar" onclick="goalSetStatus(${i},'rejected')">${icon('close',13)}</div>
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
      const pc = pr.pct != null ? ` (${pr.pct}%${pr.pct >= 100 ? ' '+icon('check',11)+' cumplida' : ''})` : '';
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
  let sig = 'gray', label = 'Sin métricas', rank = 2; // rank: 0=rojo(prioridad), 1=amarillo, 2=neutro, 3=verde
  if (avg != null) {
    if (avg >= 100) { sig = 'green'; label = 'Meta cumplida'; rank = 3; }
    else if (avg >= 60) { sig = 'yellow'; label = 'Cerca'; rank = 1; }
    else { sig = 'red'; label = 'Necesita atención'; rank = 0; }
    if (avg < 100 && dleft != null && dleft < 0) { sig = 'red'; label = 'Atrasado'; rank = 0; }
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
  const proximos = upcomingReleases(30).length;
  const legalPend = artists.reduce((a, ar) => a + artistLegalPending(ar.id), 0);
  const fin = artists.reduce((acc, ar) => { const f = artistFinance(ar.id); acc.inv += f.inv; acc.ing += f.ing; return acc; }, { inv: 0, ing: 0 });
  const card = (label, val, sub, col) => `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value" style="${col ? `color:${col}` : ''}">${val}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
  statsHost.innerHTML =
    card('Artistas', artists.length, '') +
    card('Necesitan atención', need, need ? 'priorízalos' : 'todo en orden', need ? 'var(--accent2)' : '') +
    card('Próximos a salir', proximos, '≤ 30 días') +
    card('Legal pendiente', legalPend, legalPend ? 'requiere acción' : 'al día', legalPend ? 'var(--beat)' : '') +
    card('Recoupment', fin.inv ? Math.min(100, Math.round(fin.ing / fin.inv * 100)) + '%' : '—', `inv ${money(fin.inv)} · ing ${money(fin.ing)}`);
  listHost.innerHTML = perf.map(({ art, p }) => {
    const col = rankColor(p.rank);
    const launchInfo = p.latest ? `${s(p.latest.name)} · ${(STATUS_MAP[p.latest.status] || {}).tag || p.latest.status}` : 'sin lanzamientos';
    const cierre = p.end ? `${p.end}${p.dleft != null ? ` (${p.dleft >= 0 ? 'en ' + p.dleft + 'd' : Math.abs(p.dleft) + 'd atrás'})` : ''}` : '—';
    const bar = p.avg != null ? `<div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;max-width:180px;margin-top:6px"><div style="height:100%;width:${Math.min(100, p.avg)}%;background:${col}"></div></div>` : '';
    const alerts = artistAlertCount(art.id), legal = artistLegalPending(art.id), next = nextRelease(art.id);
    const chips = [
      alerts ? `<span class="chip" style="cursor:default;color:var(--accent2)">${alerts} alerta${alerts > 1 ? 's' : ''}</span>` : '',
      legal ? `<span class="chip" style="cursor:default;color:var(--beat)">legal: ${legal}</span>` : '',
      next ? `<span class="chip" style="cursor:default">próximo: ${s(next.name)} · ${diasRestantes(next.date) >= 0 ? 'en ' + diasRestantes(next.date) + 'd' : 'hoy'}</span>` : '',
    ].filter(Boolean).join(' ');
    return `<div onclick="setActiveArtist('${art.id}');showPage('lanzamientos')" style="cursor:pointer;border:1px solid var(--border);border-left:3px solid ${col};border-radius:10px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <div class="artist-avatar" style="width:40px;height:40px;font-size:15px">${up(art.name).slice(0, 1)}</div>
      <div style="flex:1;min-width:200px">
        <div style="font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px">${dotHTML(col, 9)} ${s(art.name)}</div>
        <div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-top:2px">${launchInfo} · cierre ${cierre}</div>
        ${chips ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${chips}</div>` : ''}
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
  const platOpts = cats.map(p => `<option ${p.name === _metaSel.platform ? 'selected' : ''}>${s(p.name)}</option>`).join('') + '<option value="__add">+ otra plataforma…</option>';
  const metricOpts = (cur.metrics || []).map(m => `<option ${m === _metaSel.metric ? 'selected' : ''}>${s(m)}</option>`).join('') + '<option value="__add">+ otra métrica…</option>';
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
const PLAT_ICON = { spotify:['headphones','rgba(74,222,128,0.12)'], tiktok:['phone','rgba(255,0,80,0.12)'], instagram:['camera','rgba(225,48,108,0.12)'], youtube:['play','rgba(255,0,0,0.12)'], apple:['apple','rgba(255,255,255,0.08)'] };
function platIcon(p) {
  const key = Object.keys(PLAT_ICON).find(k => s(p).toLowerCase().includes(k));
  return PLAT_ICON[key] || ['goals','rgba(255,107,48,0.12)'];
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
  host.insertAdjacentHTML('afterbegin', `<div id="obj-loading" class="empty-hint" style="margin-bottom:10px">${icon('ai',13)} Proponiendo objetivos con IA…</div>`);
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
    if (l) l.innerHTML = `${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.`;
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
  if (!L.length) { host.innerHTML = `<div class="empty-hint">Aún no hay aprendizajes para ${s(art.name)}. Usa “Analizar con IA” (revisa tus lanzamientos y métricas) o registra uno manualmente.</div>`; return; }
  host.innerHTML = L.map((it, i) => {
    const cls = it.type === 'good' ? ' good' : (it.type === 'bad' ? ' bad' : '');
    return `<div class="learn-card${cls}">
      <button class="goal-btn reject" style="float:right" onclick="quitarAprendizaje(${i})" title="Quitar">${icon('close',12)}</button>
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
  host.insertAdjacentHTML('afterbegin', `<div id="aprend-loading" class="empty-hint" style="margin-bottom:10px">${icon('ai',13)} Analizando lanzamientos…</div>`);
  try {
    const { text } = await callClaude(buildLearningsPrompt(art), 900);
    const arr = parseJSONArray(text);
    if (!arr.length) throw new Error('La IA no devolvió aprendizajes válidos.');
    arr.forEach(x => art.learnings.unshift({ tag: s(x.tag) || art.name, type: (x.type || 'neutral'), q: s(x.q), a: s(x.a), meta: s(x.meta) }));
    saveArtists(); renderAprendizajes();
  } catch (e) { const l = document.getElementById('aprend-loading'); if (l) l.innerHTML = `${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.`; }
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
      <div class="panel-head"><span class="ph-icon">${icon('ai',18)}</span><span class="ph-title">Recomendaciones para ${s(art.name)}</span>
        <button class="btn btn-ghost" style="margin-left:auto;border-color:rgba(167,139,250,0.4);color:#a78bfa" onclick="generarEstrategiaIA()">${icon('ai',13)} Generar recomendaciones</button>
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
  if (lim.note) res.innerHTML = `<div class="empty-hint" style="border-color:var(--beat)">${icon('info',13)} ${lim.note}</div>`;
  res.innerHTML = `<div class="empty-hint">${icon('ai',13)} Analizando estrategia…</div>`;
  try {
    const { text } = await callClaude(buildStrategyPrompt(art), 1200);
    const obj = parseJSONObj(text);
    const items = obj && Array.isArray(obj.items) ? obj.items : [];
    if (!items.length) throw new Error('La IA no devolvió recomendaciones válidas.');
    art.strategy = { generatedAt: Date.now(), items };
    saveArtists(); renderIA();
  } catch (e) { res.innerHTML = `<div class="empty-hint" style="border-color:var(--accent2)">${icon('warning',13)} ${s(e.message)} — revisa ${icon('settings',12)} API.</div>`; }
}

// ══════════════════════════════════════════
// MÉTRICAS (scoped al lanzamiento activo)
// ══════════════════════════════════════════
const PLAT_META = {
  spotify:   { name:'Spotify',     icon:icon('headphones',14), color:'#1db954' },
  tiktok:    { name:'TikTok',      icon:icon('phone',14),      color:'#ff0050' },
  instagram: { name:'Instagram',   icon:icon('camera',14),     color:'#e1306c' },
  youtube:   { name:'YouTube',     icon:icon('play',14),       color:'#ff0000' },
  apple:     { name:'Apple Music', icon:icon('apple',14),      color:'#fc3c44' },
  other:     { name:'Otra',        icon:icon('chart',14),      color:'#888' },
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
      <div class="panel-head"><span class="ph-icon">${icon('file',18)}</span><span class="ph-title">Importar CSV de plataforma</span></div>
      <div class="field-grid" style="margin-bottom:12px">
        <div class="field"><label>Nivel</label>${levelSelectHTML('csv-level')}</div>
        <div class="field"><label>Plataforma</label>${platSelectHTML('csv-plat')}</div>
      </div>
      <label for="mcsv-file" class="btn btn-ghost" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:10px">${icon('upload',14)} Subir archivo .csv</label>
      <input type="file" id="mcsv-file" accept=".csv,text/csv" style="display:none" onchange="csvFileToText(event)">
      <textarea class="textarea" id="mcsv-text" placeholder="…o pega aquí el contenido del CSV" style="min-height:90px;font-family:var(--font-mono);font-size:11px"></textarea>
      <button class="btn btn-primary" style="margin-top:10px" onclick="analizarMetricasCSV()">Analizar CSV</button>
      <div id="mcsv-preview"></div>
      <div style="font-size:10px;color:var(--text-dim);margin-top:10px;font-family:var(--font-mono);line-height:1.6">Tomamos la <b style="color:var(--text-muted)">última fila</b> (la más reciente) y detectamos las columnas numéricas. ¿No sabes exportar? → pestaña “Instrucciones CSV”.</div>
    </div>

    <div class="panel" style="margin:0">
      <div class="panel-head"><span class="ph-icon">${icon('image',18)}</span><span class="ph-title">Cargar por captura (sin IA)</span></div>
      <div class="field-grid" style="margin-bottom:12px">
        <div class="field"><label>Nivel</label>${levelSelectHTML('shot-level')}</div>
        <div class="field"><label>Plataforma</label>${platSelectHTML('shot-plat')}</div>
      </div>
      <label for="shot-file" class="btn btn-ghost" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:10px">${icon('camera',14)} Subir screenshot</label>
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
        <button class="goal-btn reject" onclick="csvMetricRows.splice(${i},1);renderCSVPreview()">${icon('close',12)}</button>
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
    <button class="goal-btn reject" onclick="shotFields.splice(${i},1);renderShotFields()">${icon('close',12)}</button>
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
      {icon:'headphones', bg:'rgba(74,222,128,0.12)',  metric:'Spotify Streams',       sub:'Primeros 30 días',   target:'150K', ai:'IA: basado en Groserías', status:'proposed'},
      {icon:'phone', bg:'rgba(255,0,80,0.12)',   metric:'TikTok Views',          sub:'Campaña completa',   target:'2M',   ai:'IA: +34% vs prev.',       status:'proposed'},
      {icon:'camera', bg:'rgba(225,48,108,0.12)', metric:'Instagram Seguidores',  sub:'Crecimiento neto',   target:'+5K',  ai:'IA: conservador',         status:'proposed'},
      {icon:'play',  bg:'rgba(255,0,0,0.12)',    metric:'YouTube Suscriptores',  sub:'Campaña completa',   target:'+2K',  ai:'IA: basado en histórico', status:'proposed'},
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
  // CRM (Sprint 0): release type + tracklist (aditivo, no rompe nada)
  l.type = l.type || 'single';                                  // single | ep | album
  l.tracklist = Array.isArray(l.tracklist) ? l.tracklist : [];  // [{trackId, order}]
  // CRM (Sprint 1): checklist release-level (visual/distrib/mkt)
  l.releaseChecklist = (l.releaseChecklist && typeof l.releaseChecklist === 'object') ? l.releaseChecklist : {};
  l.releaseChecklist.visual  = l.releaseChecklist.visual  || {};
  l.releaseChecklist.distrib = l.releaseChecklist.distrib || {};
  l.releaseChecklist.mkt     = l.releaseChecklist.mkt     || {};
  // CRM (Sprint 2): identidad release-level + assets + tareas (aditivo)
  l.upc = l.upc || '';
  l.distributor = l.distributor || '';
  l.notes = l.notes || '';
  l.assets = Array.isArray(l.assets) ? l.assets : [];   // [{id, tipo, url, label}]
  l.tasks  = Array.isArray(l.tasks)  ? l.tasks  : [];   // [{id, titulo, capability, estado, dueDate}]
  // CRM (Sprint 4): finanzas
  l.expenses = Array.isArray(l.expenses) ? l.expenses : []; // [{id, monto, categoria, proveedor, fecha, metodo, reciboLink, note}]
  l.recoup = (l.recoup && typeof l.recoup === 'object') ? l.recoup : {}; // {ingresos, inversionTotal?}
  return l;
}
function artistLaunches() { return launches.filter(l => l.artistId === currentArtistId); }

let launches = [];
try { launches = JSON.parse(localStorage.getItem('ao_launches')); } catch(e){}
if (!Array.isArray(launches) || !launches.length) { launches = SEED_LAUNCHES.map(normalizeLaunch); saveLaunchesLocal(); }
else { launches = launches.map(normalizeLaunch); }

function saveLaunchesLocal() { localStorage.setItem('ao_launches', JSON.stringify(launches)); }
function saveLaunches() { saveLaunchesLocal(); scheduleCloudSync(); }

// ══════════════════════════════════════════
// MODELO DE DATOS — TRACKS (canción durable, CRM Sprint 0)
// ══════════════════════════════════════════
function normalizeTrack(t) {
  t = t || {};
  t.id = t.id || ('TRK-' + Date.now() + '-' + Math.floor(Math.random() * 9999));
  t.artistId = t.artistId || (artists[0] && artists[0].id);
  t.title = t.title || '';
  t.version = t.version || '';
  t.isrc = t.isrc || '';
  t.credits = t.credits || {};
  t.credits.featured  = Array.isArray(t.credits.featured)  ? t.credits.featured  : [];
  t.credits.producers = Array.isArray(t.credits.producers) ? t.credits.producers : [];
  t.credits.composers = Array.isArray(t.credits.composers) ? t.credits.composers : [];
  t.credits.writers   = Array.isArray(t.credits.writers)   ? t.credits.writers   : [];
  t.links = t.links || {}; t.meta = t.meta || {}; t.master = t.master || {}; t.publishing = t.publishing || {};
  t.labelCopy = t.labelCopy || {}; t.labelCopy.contacts = Array.isArray(t.labelCopy.contacts) ? t.labelCopy.contacts : [];
  t.legal = Array.isArray(t.legal) ? t.legal : [];
  t.checklist = t.checklist || {};
  t.checklist.audio   = t.checklist.audio   || {};
  t.checklist.legal   = t.checklist.legal   || {};
  t.checklist.distrib = t.checklist.distrib || {};
  t.status = (t.status && typeof t.status === 'object') ? t.status : {}; // {phase, override}
  t.metrics = (t.metrics && typeof t.metrics === 'object') ? t.metrics : {};
  t.metricEntries = Array.isArray(t.metricEntries) ? t.metricEntries : [];
  t.tasks = Array.isArray(t.tasks) ? t.tasks : [];
  t.createdAt = t.createdAt || new Date().toISOString();
  return t;
}
let tracks = [];
try { tracks = JSON.parse(localStorage.getItem('ao_tracks')); } catch (e) {}
if (!Array.isArray(tracks)) tracks = [];
tracks = tracks.map(normalizeTrack);
function saveTracksLocal() { localStorage.setItem('ao_tracks', JSON.stringify(tracks)); }
function saveTracks() { saveTracksLocal(); scheduleCloudSync(); }
function tracksOfLaunch(l) { return ((l && l.tracklist) || []).map(ref => tracks.find(t => t.id === ref.trackId)).filter(Boolean); }

// Migración (idempotente): cada launch sin tracklist → release type=single con 1 track extraído.
function migrateLaunchesToTracks() {
  let changed = false;
  (launches || []).forEach(l => {
    if (!l.type) { l.type = 'single'; changed = true; }
    if (!Array.isArray(l.tracklist)) l.tracklist = [];
    if (!l.tracklist.length) {
      const tid = 'TRK-' + l.id;
      if (!tracks.find(t => t.id === tid)) {
        tracks.push(normalizeTrack({ id: tid, artistId: l.artistId, title: l.name, createdAt: l.createdAt || new Date().toISOString() }));
      }
      l.tracklist = [{ trackId: tid, order: 0 }];
      changed = true;
    }
  });
  if (changed) { saveLaunchesLocal(); saveTracksLocal(); }
  return changed;
}
migrateLaunchesToTracks(); // sobre la data local al arrancar

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
      <button class="del-btn" title="Eliminar" onclick="event.stopPropagation();borrarLanzamiento('${l.id}')">${icon('close',12)}</button>
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
    </div>
    ${(function(){ if(!art) return ''; const f=artistFinance(art.id), legal=artistLegalPending(art.id), alerts=artistAlertCount(art.id), rec=f.inv?Math.min(100,Math.round(f.ing/f.inv*100)):null;
      return `<div class="stat-card">
      <div class="stat-label">CRM del artista</div>
      <div class="stat-value">${rec!=null?rec+'%':'—'}<span style="font-size:13px;color:var(--text-muted)"> recoup</span></div>
      <div class="stat-trend" style="color:${f.roi!=null&&f.roi>=0?'#4ade80':'var(--accent2)'}">${f.roi!=null?'ROI '+f.roi+'%':'sin inversión'} · inv ${money(f.inv)}</div>
      <div class="stat-sub">${alerts?alerts+' alerta'+(alerts>1?'s':'')+' · ':''}${legal?legal+' legal pend.':'legal al día'}</div>
    </div>`; })()}`;

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
