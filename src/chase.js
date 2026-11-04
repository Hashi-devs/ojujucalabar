/* ================= THE HUNT: Ojuju chases, hiding places, "do not answer", the roof ================= */
/* Ojuju Calabar walks toward you. He is slower than you, but he does not stop, and he does not go round furniture.
   If he reaches you, a lantern goes out. Hide (the water drum in the boys' quarters)
   and he searches, sniffs, and goes. On the roof there is nowhere to hide: run for the chimney. */
const CH = { on: false, node: null, hidden: false, spot: null, saved: null, lingering: 0, slow: 1 };
function chaseReset() {
  if (CH.node) removeNode(CH.node);
  const wasHidden = CH.hidden;
  CH.on = false; CH.node = null; CH.hidden = false; CH.spot = null; CH.lingering = 0; CH.slow = 1;
  if (wasHidden) { HURT.frozenUntil = 0; if (Rm && Rm.api.drumWalls) Rm.api.drumWalls(true); if (Rm && Rm.sc.held) Rm.sc.held.hide = false; G.cam.pos[1] = 1.6; }   // never wake up still crouched in a hiding place
  setPeek(false); setQuietUi(false); QUIET.on = false;
}
function setPeek(on) { const p = $('#peek'); if (p) p.classList.toggle('on', !!on); }

/* o: { from:[x,z], speed, timeout, onEnd(caught), roof } */
function startChase(o) {
  if (!Rm || CH.on) return;
  CH.on = true; CH.lingering = 0;   // already in the drum when he comes? then you are hidden from the start
  const gentle = G.mode === 'gentle';
  const sp = (o.speed || .8) * (gentle ? .75 : 1);
  const n = figure('silas', o.from[0], o.from[1]); n.alpha = 0; CH.node = n;
  let t = 0, stepT = 0, beatT = 0, searched = 0, fade = 1;
  Snd.drop(); Snd.slam();
  fx.push(dt => {
    if (!CH.on || CH.node !== n || !Rm) return false;
    if (modalOpen() || G.paused) return true; // he does not move while a page, puzzle or the menu is open
    t += dt;
    n.alpha = Math.min(.95, t * 1.6) * fade;
    const c = G.cam, tx = CH.hidden ? CH.spot[0] : c.pos[0], tz = CH.hidden ? CH.spot[1] : c.pos[2];
    const dx = tx - n.pos[0], dz = tz - n.pos[2], d = Math.hypot(dx, dz) || 1;
    const stop = CH.hidden ? 1.0 : .1;
    if (d > stop && t > (o.delay || .6)) { const m = Math.min(d - stop, sp * CH.slow * dt); n.pos[0] += dx / d * m; n.pos[2] += dz / d * m; }
    n.pos[1] = SPR.silas[2] + Math.abs(Math.sin(t * 5.2)) * .05; // a lurching walk
    const pd = Math.hypot(c.pos[0] - n.pos[0], c.pos[2] - n.pos[2]);
    stepT -= dt; if (stepT <= 0) { stepT = .62; Snd.stomp(Math.max(.08, 1 - pd / 7)); }
    beatT -= dt; if (pd < 3 && beatT <= 0) { beatT = .55 + pd * .15; Snd.heartbeat(); }
    if (CH.hidden && d <= 1.1) { // at the drum: he sniffs, he waits, he goes
      searched += dt;
      if (searched > .2 && searched - dt <= .2) { Snd.whisper(); say('Something stops right outside the drum. It breathes in, slowly. It is smelling for you.', 4200); vibe([30, 80, 30]); }
      if (searched > 4.2) { fade = Math.max(0, fade - dt * 1.5); if (fade <= 0) { endChase(false, o); return false; } }
      return true;
    }
    if (!CH.hidden && pd < .8) { endChase(true, o); return false; }
    if (t > (o.timeout || 35)) { fade = Math.max(0, fade - dt * 1.5); if (fade <= 0) { endChase(false, o); return false; } }
    return true;
  });
}
function endChase(caught, o) {
  if (CH.node) removeNode(CH.node);
  CH.node = null; CH.on = false;
  if (caught) {
    if (G.mode === 'gentle') { say('Long fingers close on your shoulder, then let go. You stumble away.', 4000); stumble(.6); }
    else { overlay('silas'); loseLife(o.roof ? 'roof' : 'chase'); }
  }
  if (CH.hidden) setTimeout(unhide, 1600);
  if (o.onEnd) o.onEnd(caught);
}
function hideIn(spot, label, o = {}) {
  if (CH.hidden) return;
  const c = G.cam;
  CH.saved = [c.pos[0], c.pos[2], c.yaw, c.pitch];
  CH.hidden = true; CH.spot = spot;
  c.pos[0] = spot[0]; c.pos[2] = spot[1]; c.pos[1] = .8;
  HURT.frozenUntil = performance.now() + 1e9;
  setPeek(true); Snd.creak(); if (Rm.api.drumWalls) Rm.api.drumWalls(false); if (Rm.sc.held) Rm.sc.held.hide = true;
  if (o.visit) { say(o.txt + ' Through the gap you can see the door. Do not breathe.', 4200); return; }   // hiding from a visit: out again when he has gone
  say(CH.on ? 'You climb into the ' + label + ' and pull the lid down. Do not breathe.' : 'You climb into the ' + label + '. It smells of rust and old water. Nothing comes.', 4200);
  if (!CH.on && !chasePending()) setTimeout(() => { if (!CH.on && !chasePending()) unhide(); }, 2600);   // if he is about to come, or came meanwhile, stay hidden: the chase lets you out
}
function unhide() {
  if (!CH.hidden) return;
  CH.hidden = false; setPeek(false); if (Rm && Rm.api.drumWalls) Rm.api.drumWalls(true); if (Rm && Rm.sc.held) Rm.sc.held.hide = false;
  HURT.frozenUntil = 0;
  const c = G.cam, s = CH.saved;
  if (s) { c.pos[0] = s[0]; c.pos[2] = s[1]; }
  c.pos[1] = 1.6; Snd.creak();
  say('You climb out. Your legs are shaking.', 2600);
}

/* ---------- "if something calls your name, do not answer" ---------- */
const QUIET = { on: false };
function setQuietUi(on, frac = 1) {
  const q = $('#quiet'); if (!q) return;
  q.classList.toggle('on', !!on);
  q.style.setProperty('--q', frac.toFixed(3));
}
function callName() {
  if (!Rm || !canAct() || CH.on || CH.hidden || QUIET.on || G.over || (typeof PRES !== 'undefined' && PRES.on) || (typeof NEPA !== 'undefined' && NEPA.on)) return false;   // never on top of a visit, a hiding place or a power cut: it waits and tries again
  QUIET.on = true;
  if (!warnRoll()) { quietBegin(); return true; }   // no warning this time
  setTimeout(() => { if (QUIET.on && Rm && !G.over) quietBegin(); else QUIET.on = false; }, WARN_LEAD);
  return true;
}
const WARN_LEAD = 3400;   // ms between the first click and the voice: the voice comes on the clicker's last double click

/* ---------- the clicker: an unreliable warning ---------- */
/* Before Ojuju calls your name or walks into the room, the clicker sounds only some of the time (WARN_CHANCE).
   And now and then it clicks when nothing comes at all. Players learn to dread it, never to trust it. */
const WARN_CHANCE = .1;   // about one time in ten
const WARN_GAP = 180000;   // and never within three minutes of the last click
const WARN = { last: 0, falseT: 0 };
function warnRoll() {
  if (Date.now() - WARN.last < WARN_GAP || Math.random() >= WARN_CHANCE) return false;
  Snd.warn(); WARN.last = Date.now(); return true;
}
function falseWarnLoop() {
  clearTimeout(WARN.falseT);
  WARN.falseT = setTimeout(() => {
    const quiet = !(typeof PRES !== 'undefined' && PRES.on) && !(typeof NEPA !== 'undefined' && NEPA.on);
    if (Rm && G.started && !G.over && !G.paused && !G.busy && !modalOpen() && !document.hidden && canAct() && quiet &&
        !CH.on && !CH.hidden && !QUIET.on && roomKey() !== 'roof' && Date.now() - WARN.last > WARN_GAP && Math.random() < .1) {
      Snd.warn(); WARN.last = Date.now();
    }
    falseWarnLoop();
  }, (40 + Math.random() * 50) * 1000);
}
falseWarnLoop();
function quietBegin() {
  const gentle = G.mode === 'gentle', dur = gentle ? 3.2 : 4.6;
  const c = G.cam, x0 = c.pos[0], z0 = c.pos[2];
  if (typeof resetQuietText === 'function') resetQuietText();
  speak('o_effiong', { side: Math.random() < .5 ? -1 : 1 });
  setQuietUi(true, 1);
  let t = 0;
  fx.push(dt => {
    if (!QUIET.on || !Rm) return false;
    t += dt; setQuietUi(true, Math.max(0, 1 - t / dur));
    const moved = Math.hypot(c.pos[0] - x0, c.pos[2] - z0) > .15;
    if (moved && t > .3) {
      QUIET.on = false; setQuietUi(false);
      say('You moved. It heard you.', 2600);
      if (gentle) scare('shade'); else { scare('behind', { face: 'silas', kind: 'silas' }); addDread(12); }   // his face: a lantern burns out
      return false;
    }
    if (t >= dur) {
      QUIET.on = false; setQuietUi(false);
      say('The voice moves on down the corridor, calling someone else.', 3600); addDread(-6);
      return false;
    }
    return true;
  });
  return true;
}
let callT = 0;
function scheduleCall() {
  clearTimeout(callT);
  const k = roomKey();
  if (!['study', 'chapel', 'attic'].includes(k) || G.f.called) return;
  callT = setTimeout(function tryCall() {
    if (!G.started || roomKey() !== k || G.f.called) return;
    if (callName()) { G.f.called = true; queueSave(); } else callT = setTimeout(tryCall, 5000);
  }, (22 + Math.random() * 25) * 1000);
}

/* ---------- what happens when you walk into a room ---------- */
/* a memory that was due in this room but got interrupted (a catch, closing the game) plays when you are back */
const MEMORY_DUE = { foyer: ['F1', f => f.drawerOpen], nursery: ['F2', f => f.wd], kitchen: ['F3', f => f.pantryOpen], cellar: ['F5', f => f.chaseDone],
  study: ['F4', f => f.helloPapa || f.drawerOpen || (f.zn && f.zn.desk)], chapel: ['F6', f => f.panelOpen], attic: ['F7', f => f.readMirror] };
function resumeMemories() {
  const m = MEMORY_DUE[roomKey()];
  if (m && m[1](G.f) && !(G.flash || []).includes(m[0])) flashback(m[0]);
}
function onRoomStart() {
  chaseReset(); presenceStop(); schedulePresence(true); resumeMemories(); nepaRoomStart();
  const k = roomKey(), f = G.f;
  if (Snd.ambience) Snd.ambience(k);   // crickets outside; the clock in the Living Room
  scheduleCall();
  if (k === 'cellar' && f.coffinOpen && !f.chaseDone) after(3000, cellarChase);
  if (k === 'roof') after(2600, roofChase);
}
function cellarChase() {
  if (roomKey() !== 'cellar' || G.f.chaseDone || CH.on) return;
  if (modalOpen() || G.busy || G.over) { after(1200, cellarChase); return; } // wait until you can run
  say('The crate lid lifts by itself. Something long and grey, in a raffia fringe, unfolds out of it. HIDE. The blue water drum in the corner.', 6500);
  startChase({ from: [2.0, .3], speed: .92, timeout: 34, onEnd: caught => { G.f.chaseDone = true; queueSave(); if (!caught) flashback('F5'); } });
}
function roofChase() {
  if (roomKey() !== 'roof' || CH.on || G.f.left) return;
  Snd.glass && Snd.glass();
  say(G.f.atChimney ? 'Behind you, the window glass breaks outward again. He is coming. Back to the chimney.' : 'Behind you, the window glass breaks outward. It is climbing onto the roof. RUN for the chimney.', 5000);
  startChase({
    from: [0, 6.8], speed: 1.25, delay: 2.4, timeout: 900, roof: true,
    onEnd: caught => {
      if (!caught || G.mode !== 'gentle') return; // in Haunted a lantern goes out instead
      setTimeout(() => {
        openModal(`<h2 class="smear">Caught on the roof</h2><p class="lead">Long fingers close round your ankle, and the zinc slides away under you.</p><p>Try again. Don’t stop running.</p>
          <div class="col"><button class="btn primary" data-retry>Run again</button></div>`, { dismiss: false, cls: 'blood' });
        panel.onclick = e => { if (e.target.closest('[data-retry]')) { closeModal(); enterRoom(G.room, { restore: true, keep: true }); } };
      }, 1300);
    }
  });
}
/* ---------- the chimney: the end of the night ---------- */
/* Reach it and he slows, watching. Break the new bricks with the mason's hammer, cover what is inside with
   Mama's white cloth, and say his name. The wrong name, and he comes for you. */
function reachChimney() {
  if (G.f.atChimney) { CH.slow = G.mode === 'gentle' ? .08 : .14; return; }
  G.f.atChimney = true; CH.slow = G.mode === 'gentle' ? .08 : .14; queueSave();
  Snd.heartbeat();
  say('The chimney. Up close, the bricks at the bottom are newer than the rest, and the mortar is a different colour. Behind you, he slows down. He is watching what you do.', 7000);
}
function checkTree() {
  if (roomKey() === 'roof' && G.cam.pos[2] < -4.6 && !G.f.left && !G.busy) reachChimney();
}
function hitChimney() {
  if (!G.f.atChimney) return say('Get to the chimney first.');
  if (G.f.bricksOut) return say('The bricks are already out.');
  G.f.hits = (G.f.hits || 0) + 1; Snd.thump(); Snd.drop(); vibe(40); shake(600, 1);
  if (G.f.hits < 3) { say(G.f.hits === 1 ? 'Crack. Old cement, badly mixed in the dark. Again.' : 'A brick moves. Something inside smells of dust and camphor. Again.', 3000); return; }
  G.f.bricksOut = true; Snd.open(); redraw(); queueSave();
  say('The bricks fall inward. Inside, wrapped in a faded Ankara wrapper, someone small and dry and very still. A driver’s cap rests on top.', 7000);
  after(1500, () => speak('E01'));
}
function coverHim() {
  if (!G.f.bricksOut) return say('Not yet. The bricks first.');
  if (G.f.covered) return;
  take('whitecloth'); G.f.covered = true; Snd.flame(); redraw(); queueSave();
  say('You lay Mama’s white cloth over him, gently, the way she would have. Behind you, he has stopped moving.', 5600);
  CH.slow = 0;
  after(2200, nameHim);
}
function nameHim() {
  if (!G.f.covered || G.f.left) return;
  CH.slow = 0;
  const names = ['Ojuju Calabar', 'Effiong Etim', 'Etim Akpan', 'Olumide Adeleke'];
  openModal(`<div class="fold namegate"><div class="fold-k">He is right behind you.</div><p>Say his name. Out loud.</p></div>
    <div class="col">${names.map(n => `<button class="btn" data-n="${esc(n)}">“${esc(n)}”</button>`).join('')}</div>`, { dismiss: false, cls: 'note' });
  panel.onclick = e => {
    const b = e.target.closest('[data-n]'); if (!b) return;
    closeModal();
    if (b.dataset.n === 'Effiong Etim') {
      G.f.named = true; chaseReset(); Snd.bell(); vibe([30, 60, 120]);
      G.busy = true;
      setTimeout(() => { G.busy = false; G.f.left = true; finale(); }, 900);
    } else {
      say(b.dataset.n === 'Ojuju Calabar' ? 'That is what the children called him. It is not his name.' : b.dataset.n === 'Olumide Adeleke' ? 'That is the name of the man who put him here.' : 'That is his grandfather’s name, from the photograph.', 4200);
      speak('O03'); CH.slow = 3.5;
      setTimeout(() => { if (CH.on && !G.over) CH.slow = 3.5; }, 100);
    }
  };
}

/* ---------- the roof: zinc, a black water tank, a dish, and the mango tree ---------- */
ROOMS3D.roof = B => {
  const sc = B.sc;
  sc.amb = [.16, .18, .26]; sc.fog = [.03, .04, .08]; sc.fogD = .03;
  sc.player.k0 = sc.player.k = .4;
  // sky
  B.N(null, { geo: 'sph', tex: 'nightSky', unlit: true, pos: [0, 0, 0], scl: [30, 30, 30], nopick: true });
  // the zinc roof: a walkway between two drops
  B.pln(null, 0, 0, 0, 3.2, 14.4, { t: 'zinc', uv: [3, 10], s: 30 }, 0, -PI / 2);
  [-1.62, 1.62].forEach(x => { B.box(null, x, -.04, 0, .1, .1, 14.4, { c: '#5a4a3a', s: 20 }); B.pln(null, x * 1.6, -2.2, 0, 2, 14.4, { c: '#040508', un: true }, 0, -PI / 2); });
  // the house behind you, and the window you came out of
  B.box(null, 0, 1.6, 7.45, 6, 4.6, .3, { t: 'wallUpstairs', uv: [3, 2.4] });
  B.pln(null, 0, 1.25, 7.29, 1.1, 1.4, { c: [1, .78, .45], un: true }, PI);
  B.box(null, 0, 1.25, 7.27, 1.3, .08, .06, '#2c2019', PI); B.box(null, 0, .52, 7.25, 1.3, .08, .12, '#2c2019', PI);
  B.light(0, 1.4, 6.6, [1, .7, .4], 1.1, 6);
  // a black plastic water tank, a TV aerial, a satellite dish, a loose sheet of zinc
  B.cyl(null, .7, .6, -.6, .55, 1.2, { c: '#17181b', s: 30 }); B.cyl(null, .7, 1.23, -.6, .2, .06, '#202226'); B.box(null, .7, .02, -.6, 1.3, .04, 1.3, '#3a2a1a');
  B.col(.1, -1.2, 1.3, 0);
  B.cyl(null, -.9, 1.3, 2.6, .025, 2.6, '#6a6e74'); [.0, .18, .36].forEach(y => B.box(null, -.9, 2.3 + y, 2.6, .9 - y, .02, .02, '#8a8e94'));
  B.col(-1.05, 2.45, -.75, 2.75);
  const dish = B.grp(null, .95, 0, 3.9, -.6);
  B.cyl(dish, 0, .4, 0, .03, .8, '#9a9ea4'); B.sph(dish, 0, .9, .1, .38, { c: '#c9ccd0', s: 30 }, 1, .3); B.cyl(dish, 0, .95, .45, .015, .5, '#9a9ea4', PI / 2.6);
  B.col(.6, 3.6, 1.3, 4.2);
  B.box(null, -.6, .18, -3.2, 1.4, .05, .9, { t: 'zinc', c: [.85, .8, .75], s: 30 }, .3, 0, .18);
  B.col(-1.3, -3.6, .1, -2.8);
  // the chimney nobody ever lit, at the far end of the roof
  const BRK = { c: '#7a3a2a', s: 6 }, NEW = { c: '#a8644a', s: 6 };
  const ch = B.grp(null, 0, 0, -6.3, 0, 'tree');
  B.box(ch, 0, 1.55, 0, 1.1, 3.1, 1.1, BRK); B.box(ch, 0, 3.15, 0, 1.25, .14, 1.25, { c: '#5a2a1e', s: 6 });
  for (let i = 0; i < 14; i++) B.box(ch, 0, .2 + i * .21, .556, 1.1, .02, .01, '#3a1a12');
  for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) B.box(ch, -.37 + j * .37 + (i % 2) * .18, .3 + i * .21, .557, .02, .19, .01, '#3a1a12');
  const newB = B.grp(ch, 0, .55, .56, 0);
  B.box(newB, 0, 0, 0, .7, .9, .03, NEW); for (let i = 0; i < 4; i++) B.box(newB, 0, -.34 + i * .22, .018, .7, .02, .01, '#d8c8b0');
  const hole = B.grp(ch, 0, .55, .5, 0);
  B.box(hole, 0, 0, 0, .66, .86, .05, '#050304');
  const body = B.grp(hole, 0, -.2, .02, 0);
  B.box(body, 0, 0, 0, .5, .36, .3, { c: '#8a5a2a', s: 4 }); B.box(body, 0, .1, .0, .52, .06, .32, { c: '#2a6a4a' }); B.box(body, .02, .26, 0, .26, .06, .24, { c: '#2c2a30' });
  const sheet = B.grp(hole, 0, -.18, .08, 0);
  B.box(sheet, 0, 0, 0, .62, .42, .34, { c: '#f2ede2', s: 10 });
  B.hit(ch, 0, 1.0, .3, 1.6, 2.2, 1.6);
  const gCh = B.glint(0, 1.2, -5.6);
  B.col(-.85, -6.9, .85, -5.7); B.col(-1.4, -7.4, 1.4, -6.9);   // no gap to squeeze into beside or behind the chimney
  // for older saves: if the hammer or the cloth did not come up the ladder, they are here by the window
  const extra = [];
  if (!has('hammer')) { const h = B.grp(null, .5, 0, 3.6, .6, 'roofhammer'); B.box(h, 0, .03, 0, .06, .05, .34, { c: '#6a4a2a' }); B.box(h, 0, .05, .18, .16, .08, .06, { c: '#8a8f98', s: 40 }); B.hit(h, 0, .1, 0, .5, .4, .6); extra.push(h); }
  if (!has('whitecloth') && !G.f.covered) { const c = B.grp(null, -.6, 0, 3.4, -.3, 'roofcloth'); B.box(c, 0, .04, 0, .5, .06, .4, { c: '#f2ede2', s: 10 }); B.hit(c, 0, .1, 0, .6, .4, .6); extra.push(c); }
  B.light(3, 6, -1, [.45, .55, .9], 1.1, 20);
  B.light(-2, 3, -6, [.35, .45, .75], .7, 9);
  // nowhere to go but forward
  B.col(-20, -20, -1.4, 20); B.col(1.4, -20, 20, 20); B.col(-20, 7.0, 20, 20); B.col(-20, -20, 20, -7.4);
  return {
    spawn: { x: 0, z: 4.3, yaw: 0 }, dark: true,
    apply(f) {
      newB.vis = !f.bricksOut; hole.vis = !!f.bricksOut; sheet.vis = !!f.covered; gCh.off = !!f.covered && !f.named;
      extra.forEach(n => { n.vis = n.id === 'roofhammer' ? !has('hammer') && !f.bricksOut : !has('whitecloth') && !f.covered; });
    }
  };
};

// the crate is open and he has not come out yet: hiding early is allowed, and keeps you hidden until he has been and gone
function chasePending() { return roomKey() === 'cellar' && !!G.f.coffinOpen && !G.f.chaseDone; }
/* safety net: nobody stays crouched in a hiding place once nothing is hunting them */
let hideSafeT = 0;
setInterval(() => {
  const danger = CH.on || chasePending() || (typeof PRES !== 'undefined' && PRES.on);
  if (CH.hidden && !danger && !G.paused && !modalOpen()) { hideSafeT += .5; if (hideSafeT >= 5) { hideSafeT = 0; unhide(); } } else hideSafeT = 0;
  if (!CH.hidden && HURT.frozenUntil > performance.now() + 60000) { HURT.frozenUntil = 0; setPeek(false); if (G.cam) G.cam.pos[1] = 1.6; }   // frozen with nowhere to hide: let go
}, 500);
// from inside a hiding place there may be nothing to tap: a tap anywhere on the view climbs out when it is safe
document.addEventListener('pointerup', e => {
  if (!CH.hidden || CH.on || chasePending() || (typeof PRES !== 'undefined' && PRES.on) || modalOpen()) return;
  if (e.target && e.target.closest && e.target.closest('#hud, #bag, #modal, button')) return;
  unhide();
});
