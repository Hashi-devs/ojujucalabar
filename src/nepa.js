/* ================= NEPA TAKES LIGHT ================= */
/* In the rooms lit by mains power (Living Room, Tobi's Room, Kitchen, Master Bedroom) the power can cut once,
   a while after you walk in. The room goes black, the neighbours' generators cough to life down the hill, and Tobi's
   torch comes on: it lights the room around you, but its batteries run down. Tap the torch on screen to switch it
   off and save them. In Haunted mode the dark feeds your fear, faster once the torch dies. After 25 to 35 seconds
   the light comes back, and the whole hill shouts "Up NEPA!". It happens at most once per room. */
const NEPA_ROOMS = ['foyer', 'nursery', 'kitchen', 'attic'];
const NEPA = { on: false, room: -1, end: 0, batt: 1, torch: true, armAt: 0, saved: null, tk: 0 };

const torchEl = (() => {
  const b = document.createElement('button');
  b.id = 'torch'; b.type = 'button'; b.setAttribute('aria-label', 'Torch: tap to switch off or on');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l-2 6v11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 13h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span class="tb"><i></i></span><b class="tl">Torch</b>';
  $('#stage').appendChild(b);
  b.addEventListener('click', e => { e.stopPropagation(); if (!NEPA.on) return; NEPA.torch = !NEPA.torch; Snd.click && Snd.click(); syncTorch(); say(NEPA.torch ? 'You switch the torch back on.' : 'You switch the torch off to save the batteries. The dark comes right up to your face.', 2600); });
  return b;
})();
function syncTorch() {
  torchEl.classList.toggle('on', NEPA.on);
  torchEl.classList.toggle('off', !NEPA.torch || NEPA.batt <= 0);
  torchEl.classList.toggle('low', NEPA.batt < .25);
  const i = $('.tb i', torchEl); if (i) i.style.width = Math.round(NEPA.batt * 100) + '%';
}

// called from onRoomStart: decide whether, and when, the power goes in this room
function nepaRoomStart() {
  if (NEPA.on) nepaEnd(true);
  NEPA.armAt = 0;
  const k = roomKey();
  if (!NEPA_ROOMS.includes(k) || G.f.nepaDone || G.noNepa) return;
  if (G.f.nepaRoll == null) G.f.nepaRoll = Math.random() < .7 ? 1 : 0;   // seven rooms in ten
  if (!G.f.nepaRoll) return;
  NEPA.armAt = Date.now() + (30 + Math.random() * 45) * 1000;
}
function nepaReady() {
  return Rm && G.started && !G.over && !G.busy && !G.paused && !G.ending && !modalOpen() && !document.hidden &&
    !(typeof CH !== 'undefined' && (CH.on || CH.hidden)) && !(typeof PRES !== 'undefined' && PRES.on) && !(typeof QUIET !== 'undefined' && QUIET.on);
}
function nepaCut(force) {
  if (NEPA.on || !Rm || (!force && !nepaReady())) return false;
  const sc = Rm.sc, P = sc.player;
  NEPA.on = true; NEPA.room = G.room; NEPA.batt = 1; NEPA.torch = true; NEPA.tk = 0;
  NEPA.end = Date.now() + (25 + Math.random() * 10) * 1000;
  NEPA.saved = { k0: P.k0, k: P.k, r: P.r, fl: P.fl, c: P.c.slice() };
  G.f.nepaDone = true; queueSave();
  Snd.drop(); vibe && vibe([30]);
  say('Click. The fan winds down and every bulb dies at once. NEPA has taken light.', 4200, true);
  setTimeout(() => { if (NEPA.on) { Snd.generator(); say('Down the hill, the neighbours’ generators cough to life, one after another. Not this house. Your torch is in your hand.', 4800); } }, 2600);
  if (G.mode !== 'gentle' && typeof footstepsPass === 'function') setTimeout(() => { if (NEPA.on && nepaReady()) footstepsPass(); }, 9000 + Math.random() * 6000);
  syncTorch();
  let dimV = 1;
  fx.push(dt => {
    if (!NEPA.on || !Rm || Rm.sc !== sc) return false;
    dimV = Math.max(.035, dimV - dt * 6);
    sc.dim = sc.pdim = dimV;                       // re-asserted every frame, so a scare's blackout can't switch the mains back on
    const lit = NEPA.torch && NEPA.batt > 0;
    if (!G.paused && !modalOpen()) NEPA.batt = Math.max(0, NEPA.batt - (lit ? dt / 38 : 0));
    const flick = NEPA.batt < .25 && lit ? (Math.random() < .08 ? .3 : 1) : 1;
    P.k0 = P.k = lit ? (.8 + 1.5 * Math.min(1, NEPA.batt * 2.5)) * flick : .14;
    P.r = lit ? 7 : 1.8; P.fl = lit ? .02 : 0; P.c = lit ? [1, .95, .82] : [.6, .6, .75];
    return true;
  });
  return true;
}
function nepaEnd(quiet) {
  if (!NEPA.on) return;
  NEPA.on = false;
  const sameRoom = Rm && G.room === NEPA.room;
  if (Rm && NEPA.saved) Object.assign(Rm.sc.player, NEPA.saved, { c: NEPA.saved.c });
  if (Rm) Rm.sc.dim = Rm.sc.pdim = 1;
  syncTorch();
  if (quiet || !sameRoom) return;
  if (Rm.api.apply) redraw();
  scare('flicker'); setTimeout(() => Snd.cheer && Snd.cheer(), 900);
  say('The bulbs stutter, then hold. The fan creaks back to life. All over the hill, everybody shouts at once: “Up NEPA!”', 5200);
  if (G.mode !== 'gentle') addDread(-10);
}
setInterval(() => {
  if (NEPA.on) {
    if (!Rm || G.room !== NEPA.room || G.over) return nepaEnd(true);
    syncTorch();
    if (!G.paused && !modalOpen() && G.mode !== 'gentle') addDread(NEPA.torch && NEPA.batt > 0 ? .2 : 1);
    if (NEPA.batt <= 0 && !NEPA.tk) { NEPA.tk = 1; Snd.drop(); say('The torch gutters and dies. The dark comes all the way in.', 3400, true); }
    if (Date.now() >= NEPA.end && nepaReady()) nepaEnd(false);
    return;
  }
  if (NEPA.armAt && Date.now() >= NEPA.armAt && nepaReady()) { NEPA.armAt = 0; nepaCut(); }
}, 500);
if (window.__hm) Object.assign(window.__hm, { NEPA, nepaCut, nepaEnd, nepaRoomStart, HIDES, visitTap, nearestHide, HURT });
