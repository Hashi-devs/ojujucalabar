/* ================= COMPUTER CONTROLS ================= */
/* WASD or the arrow keys to walk. Click the view once and the mouse looks around (Esc frees it).
   Click, E or Space uses what the dot is on. J journal, H hint, M menu, 1–6 hold a tray item, Q put it away.
   Esc also closes anything with a ✕. Touch controls are untouched. */
const isDesktop = () => !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
let lockFailed = false;
const lockOk = () => !!glEl.requestPointerLock && !lockFailed;
document.addEventListener('pointerlockerror', () => { lockFailed = true; syncClickHint(); say('Drag with the mouse to look around.', 3000); });
const locked = () => document.pointerLockElement === glEl;
const clickHint = document.createElement('div');
clickHint.id = 'clickLook'; clickHint.textContent = 'Click to look around';
stage.appendChild(clickHint);
function syncClickHint() {
  clickHint.classList.toggle('on', isDesktop() && lockOk() && G.started && !locked() && !modalOpen() && !G.over && !G.ending && $('#title').classList.contains('off'));
}
setInterval(syncClickHint, 300);

function lockMouse() {
  if (!isDesktop() || !lockOk() || locked()) return;
  try { const p = glEl.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here: drag to look still works */ }
}
function useCentre() {
  if (!Rm || !canAct()) return;
  const r = glEl.getBoundingClientRect(); tapAt(r.left + r.width / 2, r.top + r.height / 2);
}
// with a mouse, a click on the view either grabs the mouse or (once grabbed) uses what the dot is on
glEl.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || !isDesktop() || !lockOk()) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if (e.button !== 0) return;
  Snd.init();
  if (!locked()) { if (G.started && !modalOpen()) lockMouse(); return; }
  useCentre();
}, true);
glEl.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && isDesktop() && lockOk()) e.stopImmediatePropagation(); }, true);
document.addEventListener('mousemove', e => {
  if (!locked() || !canAct()) return;
  const k = (LOOK_SPD[G.look] || 1) * .0026;
  G.cam.yaw += e.movementX * k;
  G.cam.pitch = clamp(G.cam.pitch - e.movementY * k, -1.15, 1.15);
});
// anything that opens a page, a lock or the menu lets go of the mouse
new MutationObserver(() => { if (modalOpen() && locked()) document.exitPointerLock(); syncClickHint(); })
  .observe(modalEl, { attributes: true, attributeFilter: ['class'] });
document.addEventListener('pointerlockchange', syncClickHint);

window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.code === 'Escape') {
    if (modalOpen() && modalEl._dismiss) { $('#modalX').click(); e.preventDefault(); }
    return;
  }
  if (!G.started || G.busy || G.over) return;
  if (modalOpen()) return;
  if (e.code === 'KeyJ') { e.preventDefault(); openJournal(); }
  else if (e.code === 'KeyH') { e.preventDefault(); openHint(); }
  else if (e.code === 'KeyM') { e.preventDefault(); openMenu(); }
  else if (e.code === 'KeyQ' && G.sel) { const it = ITEMS[G.sel]; G.sel = null; renderBag(); say('You put the ' + it.name.toLowerCase() + ' away.', 1800); }
  else if (/^Digit[1-6]$/.test(e.code)) {
    const slot = $$('#bag .slot[data-item]')[+e.code.slice(5) - 1];
    if (slot) slot.click();
  }
});

if (isDesktop()) { const lb = $('#loading .btn'); if (lb) lb.textContent = 'Click to enter'; }
