/* ================= OJUJU WALKS THE HOUSE, AND FIVE LANTERNS ================= */
/* Between the set pieces he is never far: footsteps in the passage that pass the door, or stop.
   Sometimes he steps in and looks for you, and you must keep still until he goes.
   A glimpse of him at the far end of the room. A chair turned round while your back was turned.
   Being caught puts out one of your five lanterns. A cowrie relights one. When the last goes out,
   the house takes you back to the start of the chapter. */

const LIVES_MAX = 5;
const CHAPTERS = [
  { start: 0, name: 'Downstairs' },
  { start: 3, name: 'The Boys’ Quarters and Papa’s Office' },
  { start: 5, name: 'Upstairs' }
];
const chapterOf = room => { let c = CHAPTERS[0]; for (const ch of CHAPTERS) if (room >= ch.start) c = ch; return c; };

/* ---------- the lanterns in the corner ---------- */
const LANTERN_SVG = '<svg viewBox="0 0 16 22" aria-hidden="true"><path class="lh" d="M5 4h6M8 1v3"/><path class="lb" d="M4 6h8l1 3v8l-1 2H4l-1-2V9z"/><path class="lf" d="M8 9c-2 2.4-1.4 5 0 6c1.4-1 2-3.6 0-6z"/></svg>';
function renderLives(lostIdx = -1, gainIdx = -1) {
  const el = $('#lives'); if (!el) return;
  const n = G.lives == null ? LIVES_MAX : G.lives;
  el.innerHTML = Array.from({ length: LIVES_MAX }, (_, i) => `<i class="lt${i < n ? ' on' : ''}${i === lostIdx ? ' out' : ''}${i === gainIdx ? ' relit' : ''}">${LANTERN_SVG}</i>`).join('');
  el.setAttribute('aria-label', n + ' of ' + LIVES_MAX + ' lanterns left');
}

/* cause: 'fear' | 'chase' | 'roof' | 'visit' */
function loseLife(cause) {
  if (G.mode === 'gentle') return;
  chaseReset(); presenceStop();
  G.over = false;
  const before = G.lives == null ? LIVES_MAX : G.lives;
  G.lives = Math.max(0, before - 1);
  save(false);           // keep the lost lantern even if the game is closed now
  G.over = true;
  renderLives(G.lives); Snd.lanternOut(); vibe([60, 60, 120]);
  const lead = {
    fear: 'Your fear fills you up. Cold hands close round your ankles, and the light goes out.',
    chase: 'Long fingers close on your shoulder. His breath puts out your lantern.',
    roof: 'Long fingers close round your ankle, and the zinc slides away under you.',
    visit: 'You moved. He heard you. He crosses the room in three long steps.',
    scare: 'His face fills the dark, and your last lantern goes out.'
  }[cause] || 'The light goes out.';
  setTimeout(() => {
    if (G.lives > 0) {
      const left = G.lives === 1 ? 'One lantern left.' : G.lives + ' lanterns left.';
      openModal(`<h2 class="smear">A lantern goes out</h2><p class="lead">${lead}</p>
        <div class="lanterns-big">${Array.from({ length: LIVES_MAX }, (_, i) => `<i class="${i < G.lives ? 'on' : ''}">${LANTERN_SVG}</i>`).join('')}</div>
        <p>${left} You wake at the door of this room, with everything you had found. Each cowrie you find relights a lantern.</p>
        <div class="col"><button class="btn primary" data-retry>${cause === 'roof' ? 'Run again' : 'Wake up again'}</button></div>`, { dismiss: false, cls: 'blood' });
      panel.onclick = e => { if (e.target.closest('[data-retry]')) { closeModal(); restoreRoom(false); } };
    } else {
      const ch = chapterOf(G.room);
      // once per chapter, where ads can play: a short video relights one lantern and you stay in this room
      const canAd = adsCanReward() && !(G.chap && G.chap.adUsed);
      openModal(`<h2 class="smear">The last lantern goes out</h2><p class="lead">${lead}</p>
        <p>The house takes you back to the start of <b>${ch.name}</b>. Everything you found after that is gone. Your five lanterns are lit again.</p>
        ${canAd ? '<p class="adnote">Or watch a short ad to relight one lantern and wake at the door of this room instead. You can do this once in each chapter.</p>' : ''}
        <div class="col">${canAd ? `<button class="btn" data-ad>${AD_ICON} Watch an ad to relight a lantern</button>` : ''}<button class="btn" data-retry>Begin the chapter again</button></div>
        <p class="msg" id="adMsg" aria-live="polite"></p>`, { dismiss: false, cls: 'blood' });
      panel.onclick = e => {
        if (e.target.closest('[data-retry]')) { closeModal(); restartChapter(); }
        else if (e.target.closest('[data-ad]')) {
          const b = e.target.closest('[data-ad]'); b.disabled = true;
          rewardedAd(() => {
            if (G.chap) G.chap.adUsed = true;
            closeModal(); G.lives = 1; renderLives(-1, 0); Snd.relight();
            restoreRoom(false);
            setTimeout(() => say('One lantern flickers back to life. You wake at the door of the room, with everything you had found.', 5200), 900);
          }, () => { b.remove(); const m = $('#adMsg'); if (m) m.textContent = 'No ad is available right now. Try again another time.'; });
        }
      };
    }
  }, cause === 'fear' ? 300 : 1100);
}
/* a scare from him burns one lantern down without sending you back to the door; the last one is a full catch */
function burnLantern(msg) {
  if (G.mode === 'gentle' || G.over) return;
  const n = G.lives == null ? LIVES_MAX : G.lives;
  if (n <= 1) { G.over = true; setTimeout(() => loseLife('scare'), 500); return; }
  G.lives = n - 1; renderLives(G.lives); Snd.lanternOut(); vibe([40, 40, 90]);
  setTimeout(() => say((msg ? msg + ' ' : '') + (G.lives === 1 ? 'Only one lantern is left burning.' : 'One of your lanterns gutters out. ' + G.lives + ' left.'), 5200), 1600);
  queueSave();
}
function restartChapter() {
  const c = G.chap;
  G.lives = LIVES_MAX; G.dropped = null; G.over = false; G.busy = false;
  if (c && typeof c.room === 'number') {
    G.inv = c.inv.slice(); G.journal = c.journal.map(j => ({ ...j })); G.pages = c.pages.slice(); G.cowries = c.cowries.slice();
    withLoading(() => enterRoom(c.room), 900);
  } else restoreRoom(true);  // an older save without a chapter mark: start this room over
  renderLives();
}
function relightLantern() {
  if (G.mode === 'gentle' || G.lives == null || G.lives >= LIVES_MAX) return false;
  G.lives++; renderLives(-1, G.lives - 1); Snd.relight();
  return true;
}

/* ---------- presence ---------- */
const PRES = { on: false, t: 0, node: null };
const MOVABLE = { foyer: 'chair', nursery: 'horse', cellar: 'skull', study: 'sarm', chapel: 'lectern', attic: 'rchair' };
function presenceStop() {
  clearTimeout(PRES.t);
  if (PRES.node) { removeNode(PRES.node); PRES.node = null; }
  if (PRES.on) { PRES.on = false; setQuietUi(false); }
  if (PRES.hid && typeof CH !== 'undefined' && CH.hidden && !CH.on) unhide();   // never leave someone stuck in a hiding place
  PRES.hid = false;
  resetQuietText();
}
function schedulePresence(first) {
  clearTimeout(PRES.t);
  if (G.mode === 'gentle') return;
  PRES.t = setTimeout(runPresence, (first ? rnd(22000, 38000) : rnd(38000, 70000)));
}
function presenceOk() {
  const k = roomKey();
  return Rm && G.started && G.mode !== 'gentle' && !G.noAmbient && !G.noPresence && canAct() && !document.hidden && !CH.on && !CH.hidden && !QUIET.on && !PRES.on && !G.f.left && k !== 'roof';
}
function runPresence() {
  if (!presenceOk()) { PRES.t = setTimeout(runPresence, 6000); return; }
  const f = G.f, r = Math.random();
  const visits = f.visits || 0, canVisit = visits < 3 && G.room > 0;
  if (canVisit && r < .4) visit();
  else if (r < .62) footstepsPass();
  else if (r < .82 && glimpse()) { /* done */ }
  else if (!f.movedDone && MOVABLE[roomKey()]) moveBehind();
  else footstepsPass();
  schedulePresence(false);
}

/* where the passage is: the door you came in by */
function entryPoint() {
  const sp = (Rm && Rm.api && Rm.api.spawn) || { x: 0, z: 2 };
  return [sp.x || 0, Math.min(2.65, (sp.z || 2) + .65)];
}
function panTo(x, z) {
  const c = G.cam, dx = x - c.pos[0], dz = z - c.pos[2], l = Math.hypot(dx, dz) || 1;
  const rx = Math.cos(c.yaw), rz = Math.sin(c.yaw);
  return Math.max(-1, Math.min(1, (dx * rx + dz * rz) / l));
}

function footstepsPass() {
  const [ex, ez] = entryPoint(), side = Math.random() < .5 ? -1 : 1, stop = Math.random() < .5;
  say(pick(['Footsteps in the passage outside. Slow. Heavy.', 'Bare feet on the terrazzo outside the door, coming closer, and the dry whisper of raffia.', 'Something walks the passage. Each step is a long time after the last.']), 4200);
  const n = 9;
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      if (!Rm) return;
      const k = i / (n - 1), near = 1 - Math.abs(k - .5) * 2; // loudest at the door
      const pan = panTo(ex + side * (2.5 - k * 5), ez + .6);
      Snd.stompAt(.12 + near * .5, pan);
      if (i === Math.floor(n / 2)) { Snd.breath(pan); if (stop) { say('They stop outside the door. Something breathes in, slowly. Then they go on.', 4200); Snd.heartbeat(); } }
    }, i * 720 + (stop && i > n / 2 ? 2200 : 0));
  }
}

function visit() {
  const f = G.f; f.visits = (f.visits || 0) + 1;
  const [ex, ez] = entryPoint(), c = G.cam;
  PRES.on = true; PRES.hid = false;
  warnRoll();   // the clicker, some of the time
  const nh = nearestHide();
  say(nh && nh.d < 4.2 ? 'Footsteps in the passage, coming straight for this door. ' + nh.h.hint + ', or keep still.' : 'Footsteps in the passage, coming straight for this door.', 3600);
  for (let i = 0; i < 5; i++) setTimeout(() => PRES.on && Snd.stompAt(.2 + i * .14, panTo(ex, ez)), i * 650);
  setTimeout(() => {
    if (!PRES.on || !Rm) return;
    Snd.rattle(panTo(ex, ez)); Snd.creakAt(panTo(ex, ez));
    const q = $('#quiet');
    if (q) { $('b', q).textContent = 'He is in the room'; $('span', q).textContent = 'Keep still. Don’t touch anything.'; }
    say(PRES.hid ? 'The door handle turns. He is in the room. Stay hidden.' : 'The door handle turns. He is coming in. Keep still. Touch nothing.', 4200); vibe([30, 60, 30]);
    const x0 = c.pos[0], z0 = c.pos[2];
    const n = figure('silas', ex, ez); n.alpha = 0; PRES.node = n;
    // he walks a little way in, looks about, and goes back out
    const ins = [ex * .6, ez - 1.3];
    const dur = 8.5;
    let t = 0, stepT = 0, failed = false;
    PRES.tapped = false;
    fx.push(dt => {
      if (!PRES.on || PRES.node !== n || !Rm) { if (PRES.node === n) { removeNode(n); PRES.node = null; } return false; }
      t += dt;
      if (!failed) {
        const k = t < 2.2 ? t / 2.2 : t < 5.6 ? 1 : Math.max(0, 1 - (t - 5.6) / 2.2);
        n.pos[0] = ex + (ins[0] - ex) * k; n.pos[2] = ez + (ins[1] - ez) * k;
        n.alpha = Math.min(.92, t * 1.4) * (t > dur - .8 ? Math.max(0, (dur - t) / .8) : 1);
        n.pos[1] = SPR.silas[2] + Math.abs(Math.sin(t * 4)) * .04;
        stepT -= dt; if ((t < 2.2 || t > 5.6) && stepT <= 0) { stepT = .7; Snd.stompAt(.5, panTo(n.pos[0], n.pos[2])); }
        if (t > 2.4 && t - dt <= 2.4) { Snd.breath(panTo(n.pos[0], n.pos[2])); }
        if (t > 3.8 && t - dt <= 3.8) Snd.heartbeat();
        setQuietUi(true, Math.max(0, 1 - t / dur));
        const moved = !PRES.hid && Math.hypot(c.pos[0] - x0, c.pos[2] - z0) > .18;   // hidden = safe
        if ((moved || (PRES.tapped && !PRES.hid)) && t > .4) {
          failed = true; Snd.shriek();
        }
        if (t >= dur) {
          removeNode(n); PRES.node = null; PRES.on = false; setQuietUi(false); resetQuietText();
          say('The door closes behind him. The footsteps go away down the passage. You breathe out.', 4200); addDread(PRES.hid ? -10 : -6); queueSave();
          if (PRES.hid) { PRES.hid = false; setTimeout(() => { if (CH.hidden && !CH.on) unhide(); }, 1400); }
          return false;
        }
        return true;
      }
      // he comes for you
      const dx = c.pos[0] - n.pos[0], dz = c.pos[2] - n.pos[2], d = Math.hypot(dx, dz) || 1;
      const m = Math.min(d, 5.5 * dt); n.pos[0] += dx / d * m; n.pos[2] += dz / d * m; n.alpha = .95;
      if (d < .7) {
        removeNode(n); PRES.node = null; PRES.on = false; setQuietUi(false); resetQuietText();
        overlay('silas'); loseLife('visit');
        return false;
      }
      return true;
    });
  }, 4200);   // time enough to reach a hiding place
}
function resetQuietText() {
  const q = $('#quiet');
  if (q) { $('b', q).textContent = 'Something is calling your name'; $('span', q).textContent = 'Don’t move. Don’t answer.'; }
}

/* he is there at the far end of the room, and then he is not */
function glimpse() {
  const c = G.cam;
  for (const nx of [0, -.45, .45]) {
    const h = R3.pick(Rm.sc, c, nx, -.1);
    const dist = h ? h.t : 6;
    if (dist < 2.8) continue;
    const yaw = c.yaw + Math.atan(nx * Math.tan(.6)), d = Math.min(dist - .45, 4.5);
    const x = Math.max(-2.6, Math.min(2.6, c.pos[0] + Math.sin(yaw) * d)), z = Math.max(-2.6, Math.min(2.6, c.pos[2] - Math.cos(yaw) * d)); // stay inside the room
    const n = figure('silas', x, z); n.alpha = 0; PRES.node = n;
    let t = 0;
    fx.push(dt => {
      if (PRES.node !== n || !Rm) return false;
      t += dt; n.alpha = t < .15 ? t / .15 * .8 : t < .75 ? .8 : Math.max(0, .8 - (t - .75) * 4);
      if (t > 1) { removeNode(n); PRES.node = null; return false; }
      return true;
    });
    Snd.heartbeat(); setTimeout(() => Snd.heartbeat(), 420); vibe(30); addDread(6);
    setTimeout(() => say(pick(['Was that…?', 'Nothing there now.', 'You blink. Only the dark.']), 2600), 1300);
    return true;
  }
  return false;
}

/* something is moved while you are not looking */
function findNode(id) {
  const walk = n => { if (n.id === id) return n; for (const k of n.kids) { const r = walk(k); if (r) return r; } return null; };
  return Rm ? walk(Rm.sc.root) : null;
}
function moveBehind() {
  const id = MOVABLE[roomKey()], n = findNode(id); if (!n) return;
  const tk = G.token; let stage = 0;
  const seen = () => { const w = n.world, p = R3.project(G.cam, [w[12], w[13] + .4, w[14]]); return p && Math.abs(p.x) < .7 && Math.abs(p.y) < .9 && p.z < 6; };
  const iv = setInterval(() => {
    if (G.token !== tk || !Rm || G.over) { clearInterval(iv); return; }
    if (stage === 0 && !seen()) {
      stage = 1; G.f.movedDone = true;
      n.goal = { rot: [n.rot[0], n.rot[1] + (Math.random() < .5 ? -1 : 1) * (.7 + Math.random() * .5), n.rot[2]], k: 30 };
    } else if (stage === 1 && seen()) {
      clearInterval(iv); Snd.creak();
      say('The ' + (LABELS[id] || 'thing').toLowerCase() + ' has turned to face you. Nobody touched it.', 4200); addDread(5);
    }
  }, 300);
  setTimeout(() => clearInterval(iv), 120000);
}

/* ---------- hiding places: when he is coming, get out of sight ----------
   In every room one piece of furniture will hide you. Tap it while his footsteps are coming (or once he is in, if
   you are already next to it): you crouch out of sight and watch the door through a gap, and he does not see you. */
const HIDES = {
  foyer: { chair: { at: [-1.95, -1.55], label: 'cushion chair', hint: 'Get down behind the cushion chair', txt: 'You crouch down behind the cushion chair and make yourself small.' } },
  nursery: { wardrobe: { at: [-.7, 2.5], label: 'wardrobe', hint: 'Get into the wardrobe', txt: 'You squeeze into the wardrobe and pull the doors almost shut.' } },
  kitchen: { ktable: { at: [.1, .3], label: 'kitchen table', hint: 'Get under the kitchen table', txt: 'You crawl under the kitchen table, behind the long lace cloth.' } },
  cellar: { hidedrum: { at: [-2.45, -2.35], label: 'water drum', hint: 'Get into the blue water drum', txt: 'You climb into the water drum and pull the lid down.' } },
  study: { sdesk: { at: [0, -1.35], label: 'desk', hint: 'Get under Papa’s desk', txt: 'You fold yourself into the dark under Papa’s desk.' } },
  chapel: { pews: { near: [[-1.5, -.55], [-1.5, .8], [1.5, -.55], [1.5, .8]], label: 'bench', hint: 'Get under a bench', txt: 'You lie flat under the bench, your cheek on the cold floor.' } },
  attic: { sheet: { at: [1.75, 0], label: 'wardrobe', hint: 'Get into Papa’s wardrobe under the Ankara wrapper', txt: 'You slip behind the Ankara wrapper into Papa’s wardrobe. It smells of camphor.' } }
};
const hideFor = id => { const r = HIDES[roomKey()]; return r ? r[id] : null; };
function hideSpotPos(h) {
  if (h.at) return h.at;
  const c = G.cam.pos;
  return h.near.slice().sort((a, b) => Math.hypot(a[0] - c[0], a[1] - c[2]) - Math.hypot(b[0] - c[0], b[1] - c[2]))[0];
}
function nearestHide() {
  const r = HIDES[roomKey()]; if (!r || !G.cam) return null;
  let best = null;
  for (const id in r) { const h = r[id], p = hideSpotPos(h), d = Math.hypot(p[0] - G.cam.pos[0], p[1] - G.cam.pos[2]); if (!best || d < best.d) best = { id, h, d }; }
  return best;
}
function hideFromVisit(h) {
  if (CH.hidden) return;
  PRES.hid = true;
  const p = hideSpotPos(h);
  hideIn(p, h.label, { visit: true, txt: h.txt });
  G.cam.yaw = Math.atan2(-p[0], p[1]); G.cam.pitch = .05;   // look out toward the middle of the room
}
// tap() hands its taps here while a visit is on: a hiding place hides you, anything else gives you away
function visitTap(id) {
  const h = hideFor(id);
  if (CH.hidden && PRES.hid) { say('Not yet. He is still out there.', 1800); return; }
  if (h) { hideFromVisit(h); return; }
  PRES.tapped = true;
}
