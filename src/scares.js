/* ================= SCARES: art, 3D events, tripwires, the director ================= */
/* All artwork here is original and drawn in code. Overlays are full-screen jump scares. Sprites live in the room. */
/* Mama as the house remembers her, 1975: green gele, ashen face, coral at her throat */
const GHOST_FACE = `<svg viewBox="0 0 200 260" aria-hidden="true"><path d="M100 30C46 30 26 80 32 146C36 204 22 238 8 260H192C178 238 164 204 168 146C174 80 154 30 100 30Z" fill="#050407"/><path d="M46 112C36 58 70 10 112 14C160 18 178 66 156 112Q100 88 46 112Z" fill="#2a6a46"/><path d="M58 100Q74 50 112 28M84 96Q108 52 150 44M120 94Q150 70 164 92" stroke="#174a30" stroke-width="5" fill="none"/><ellipse cx="100" cy="140" rx="46" ry="56" fill="#4e3a30"/><ellipse cx="88" cy="124" rx="18" ry="22" fill="#6a5248" opacity=".5"/><ellipse cx="79" cy="136" rx="13" ry="16" fill="#000"/><ellipse cx="121" cy="136" rx="13" ry="16" fill="#000"/><circle cx="80" cy="139" r="2.6" fill="#f2efe4"/><circle cx="120" cy="139" r="2.6" fill="#f2efe4"/><path d="M75 154Q71 176 77 200M125 154Q129 176 123 200" stroke="#2a1c16" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path d="M64 170Q100 216 136 170Q100 188 64 170Z" fill="#000"/><path d="M78 178V184M88 182V189M98 184V191M108 184V191M118 182V189M128 178V184" stroke="#e8e2d4" stroke-width="1.8"/><g fill="#c4322a">${[0,1,2,3,4,5,6,7,8,9,10].map(i => `<circle cx="${62 + i * 7.6}" cy="${214 + Math.sin(i / 10 * Math.PI) * 14}" r="4.4"/>`).join('')}</g></svg>`;
/* small Tobi, 1975: an echo the house keeps */
const FACE_CHILD = `<svg viewBox="0 0 200 260" aria-hidden="true"><path d="M100 40C58 40 34 76 38 130C40 176 30 222 16 260H184C170 222 160 176 162 130C166 76 142 40 100 40Z" fill="#050407"/><g stroke="#050407" stroke-width="7" stroke-linecap="round">${[-56,-34,-12,10,32,54].map((x, i) => `<path d="M${100 + x * .8} 92L${100 + x * 1.3} ${30 + (i % 2) * 10}"/>`).join('')}</g><g stroke="#e8e2d4" stroke-width="2">${[-56,-34,-12,10,32,54].map((x, i) => `<path d="M${100 + x * 1.05 - 3} ${62 + (i % 2) * 5}H${100 + x * 1.05 + 3}M${100 + x * 1.15 - 3} ${50 + (i % 2) * 5}H${100 + x * 1.15 + 3}"/>`).join('')}</g><g transform="rotate(-7 100 146)"><ellipse cx="100" cy="146" rx="50" ry="58" fill="#4a3226"/><path d="M52 132Q56 84 100 80Q144 84 148 132Q128 104 100 104Q72 104 52 132Z" fill="#050407"/><ellipse cx="78" cy="148" rx="15" ry="21" fill="#000"/><ellipse cx="124" cy="146" rx="15" ry="21" fill="#000"/><circle cx="80" cy="154" r="2.6" fill="#f2efe4"/><circle cx="126" cy="152" r="2.6" fill="#f2efe4"/><path d="M66 188Q100 220 136 184" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M76 196V204M86 204V213M98 208V217M110 207V216M122 202V210" stroke="#e8e2d4" stroke-width="2.4"/></g></svg>`;
/* Ojuju Calabar: Effiong come back as Ekpo, the way his forefathers' spirits return. Dark carved face, chalk marks, great white eyes, a raffia fringe, long fingers */
const FACE_SILAS = (() => {
  let raffia = '';
  for (let i = 0; i < 46; i++) { const t = i / 45, x0 = 46 + t * 108, x1 = -30 + t * 260, col = ['#8a6a2c', '#6b5020', '#a9853c', '#5a421a'][i % 4]; raffia += `<path d="M${x0} 168Q${(x0 + x1) / 2 + (i % 3 - 1) * 8} 214 ${x1} 262" stroke="${col}" stroke-width="5" fill="none"/>`; }
  const finger = (x, y, a, l) => `<path d="M${x} ${y}l${Math.sin(a) * l} ${-Math.cos(a) * l}" stroke="#241d1a" stroke-width="7" stroke-linecap="round"/><circle cx="${x + Math.sin(a) * l}" cy="${y - Math.cos(a) * l}" r="3" fill="#d9d3c4"/>`;
  let hands = '';
  [[18, 262, 1], [182, 262, -1]].forEach(([x, y, d]) => { hands += `<path d="M${x} ${y}L${x + d * 10} 214" stroke="#241d1a" stroke-width="16" stroke-linecap="round"/>`; [-.5, -.2, .1, .4].forEach((a, k) => { hands += finger(x + d * 10, 214, d * a, 62 + (k % 2) * 16); }); });
  return `<svg viewBox="0 0 200 260" aria-hidden="true">${raffia}<path d="M100 6C64 6 46 44 48 96C50 140 66 170 100 176C134 170 150 140 152 96C154 44 136 6 100 6Z" fill="#2b2420"/><ellipse cx="88" cy="38" rx="26" ry="18" fill="#3e342e"/><path d="M76 22h48M70 32h60M80 44h40" stroke="#e8e2d4" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M60 110l8 30M140 110l-8 30M64 104l6 30M136 104l-6 30" stroke="#e8e2d4" stroke-width="2.4" opacity=".7"/><circle cx="78" cy="86" r="21" fill="#f2efe6"/><circle cx="122" cy="86" r="21" fill="#f2efe6"/><circle cx="78" cy="88" r="7" fill="#000"/><circle cx="122" cy="88" r="7" fill="#000"/><circle cx="78" cy="88" r="3.2" fill="#e0302a"/><circle cx="122" cy="88" r="3.2" fill="#e0302a"/><path d="M60 136Q100 128 140 136Q134 170 100 172Q66 170 60 136Z" fill="#000"/><path d="M64 137L70 150L76 138L82 151L88 139L94 152L100 139L106 152L112 139L118 151L124 138L130 150L136 137Z" fill="#e8e2d4"/><path d="M70 166L76 156L82 166L88 157L94 167L100 158L106 167L112 157L118 166L124 156L130 166Z" fill="#e8e2d4"/>${hands}</svg>`;
})();
const HANDS_SVG = (() => {
  const hand = (cx, flip) => `<g transform="translate(${cx} 0) scale(${flip} 1)" stroke="#dfe6e0" stroke-linecap="round" fill="none"><path d="M0 310L2 240" stroke-width="30"/><path d="M-20 244L-46 128" stroke-width="13"/><path d="M-6 238L-20 104" stroke-width="13"/><path d="M10 238L12 96" stroke-width="13"/><path d="M26 244L42 116" stroke-width="12"/><path d="M-26 256L-62 206" stroke-width="12"/><path d="M-30 252Q2 292 34 250L30 226Q0 240 -26 230Z" fill="#dfe6e0" stroke-width="2"/></g>`;
  return `<svg viewBox="0 0 300 300" aria-hidden="true">${hand(86, 1)}${hand(214, -1)}</svg>`;
})();
const EYES_WALL = (() => {
  let g = '';
  [[40, 60], [110, 40], [200, 70], [255, 120], [60, 140], [150, 150], [225, 205], [80, 220], [165, 245], [30, 270]].forEach(([x, y], i) => {
    const s = .8 + (i % 3) * .25;
    g += `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-14" cy="0" rx="9" ry="6" fill="#e9f6f0"/><ellipse cx="14" cy="0" rx="9" ry="6" fill="#e9f6f0"/><ellipse cx="-13" cy="0" rx="2.6" ry="5.4" fill="#000"/><ellipse cx="15" cy="0" rx="2.6" ry="5.4" fill="#000"/></g>`;
  });
  return `<svg viewBox="0 0 300 300" aria-hidden="true">${g}</svg>`;
})();
/* a bald shadow with fingers that hang too low */
const SHADE_SVG = `<svg viewBox="0 0 100 220" aria-hidden="true"><ellipse cx="50" cy="30" rx="15" ry="21" fill="#040307"/><path d="M42 48C26 60 20 86 18 120L16 214H84L82 120C80 86 74 60 58 48Z" fill="#040307"/><path d="M22 70L8 150M78 70L92 150" stroke="#040307" stroke-width="7" stroke-linecap="round"/><path d="M8 150l-4 26M8 150l1 28M8 150l6 26M92 150l4 26M92 150l-1 28M92 150l-6 26" stroke="#040307" stroke-width="2.6" stroke-linecap="round"/><circle cx="43" cy="30" r="3" fill="#e9f2ec"/><circle cx="57" cy="30" r="3" fill="#e9f2ec"/></svg>`;
/* Mama (a memory): gele, buba and wrapper, coral beads */
const LADY_SVG = `<svg viewBox="0 0 200 320" aria-hidden="true"><path d="M100 30C66 30 56 62 58 96C60 126 52 170 44 230L156 230C148 170 140 126 142 96C144 62 134 30 100 30Z" fill="#0b0a0d" opacity=".85"/><path d="M66 150L56 310H144L134 150Q100 136 66 150Z" fill="#dfe9e4" opacity=".9"/><path d="M60 236H140L144 310H56Z" fill="#2a6a46" opacity=".9"/><path d="M58 254H142M58 276H143M57 296H144" stroke="#e2b23a" stroke-width="3" opacity=".8"/><ellipse cx="100" cy="94" rx="24" ry="30" fill="#4e3a30"/><path d="M70 82C62 46 84 18 108 20C140 22 146 54 132 82Q100 66 70 82Z" fill="#2f7a4c"/><path d="M78 74Q90 40 112 30M96 70Q114 42 136 44" stroke="#1c5232" stroke-width="3" fill="none"/><path d="M88 98Q92 102 96 98M104 98Q108 102 112 98" stroke="#1e120c" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M93 114Q100 118 107 114" stroke="#2a1810" stroke-width="2" fill="none"/><g fill="#c4322a">${[0,1,2,3,4,5,6,7,8].map(i => `<circle cx="${82 + i * 4.5}" cy="${132 + Math.sin(i / 8 * Math.PI) * 9}" r="2.6"/>`).join('')}</g></svg>`;
/* Ojuju Calabar in the room: a tall raffia figure, bald head, great eyes, arms past its knees */
const SILAS_SVG = (() => {
  let st = '';
  for (let i = 0; i < 26; i++) { const t = i / 25, x0 = 32 + t * 36, x1 = 4 + t * 92; st += `<path d="M${x0} 60L${x1} 198" stroke="${['#7d6430', '#5a4520', '#9a7c3a'][i % 3]}" stroke-width="2.6"/>`; }
  return `<svg viewBox="0 0 100 200" aria-hidden="true"><path d="M30 58L68 58L96 198H4Z" fill="#3e3016"/>${st}<path d="M30 62L16 150M70 62L84 150" stroke="#1d1816" stroke-width="5" stroke-linecap="round"/><path d="M16 150l-6 30M16 150l-1 32M16 150l4 30M84 150l6 30M84 150l1 32M84 150l-4 30" stroke="#1d1816" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="50" cy="32" rx="15" ry="22" fill="#1d1816"/><path d="M42 16h16M40 22h20" stroke="#d9d3c4" stroke-width="1.6" opacity=".7"/><circle cx="44" cy="32" r="5" fill="#efece2"/><circle cx="56" cy="32" r="5" fill="#efece2"/><circle cx="44" cy="33" r="1.8" fill="#d0302a"/><circle cx="56" cy="33" r="1.8" fill="#d0302a"/><path d="M42 44Q50 48 58 44" stroke="#efece2" stroke-width="1.6" fill="none"/></svg>`;
})();
/* small Tobi in the room */
const KID_SVG = `<svg viewBox="0 0 64 128" aria-hidden="true"><g stroke="#040307" stroke-width="3" stroke-linecap="round"><path d="M22 18L16 4M28 14L26 0M36 14L38 0M42 18L48 4"/></g><circle cx="32" cy="30" r="19" fill="#040307"/><path d="M14 52C8 74 10 104 7 126H57C54 104 56 74 50 52Z" fill="#040307"/><circle cx="25" cy="30" r="3.4" fill="#f2efe4"/><circle cx="39" cy="30" r="3.4" fill="#f2efe4"/></svg>`;
const EYES_SVG = `<svg viewBox="0 0 128 64" aria-hidden="true"><ellipse cx="38" cy="32" rx="15" ry="10" fill="#e9f6f0"/><ellipse cx="90" cy="32" rx="15" ry="10" fill="#e9f6f0"/><ellipse cx="40" cy="32" rx="3.6" ry="9" fill="#000"/><ellipse cx="92" cy="32" rx="3.6" ry="9" fill="#000"/></svg>`;
const FACES = { lady: GHOST_FACE, child: FACE_CHILD, silas: FACE_SILAS, hands: HANDS_SVG, eyes: EYES_WALL };

/* ---------- helpers ---------- */
const fx = [];   // timed effects: each returns false when finished
const removeNode = n => { if (n && n.par) n.par.kids = n.par.kids.filter(k => k !== n); };
const roomKey = () => ROOMS[G.room].key;
const roomLim = () => roomKey() === 'attic' ? [2.0, 2.55] : [2.6, 2.6];
function vibe(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } }
function spot(dist, off = 0) {   // a floor point in front of (or around) the player, kept inside the room
  const c = G.cam, a = c.yaw + off, [lx, lz] = roomLim();
  return [clamp(c.pos[0] + Math.sin(a) * dist, -lx, lx), clamp(c.pos[2] - Math.cos(a) * dist, -lz, lz)];
}
function sprite(tex, x, y, z, w, h, o = {}) {
  return R3.add(Rm.sc.root, R3.node(Object.assign({ geo: 'plane', tex, blend: 1, unlit: true, bb: true, pos: [x, y, z], scl: [w, h, 1], alpha: 0, nopick: true }, o)));
}
const SPR = { shade: [.95, 2.05, 1.0], silas: [1.05, 2.1, 1.05], kid: [.55, 1.1, .55] };
function figure(kind, x, z) { const s = SPR[kind] || SPR.shade; return sprite(kind, x, s[2], z, s[0], s[1]); }
function bigScare() { G.lastBig = Date.now(); G.scares++; }

/* a figure that fades in, holds, and fades out */
function stander(kind = 'shade', o = {}) {
  if (!Rm) return;
  const [x, z] = o.at || spot(o.dist || 2.6, o.off || 0), n = figure(kind, x, z), hold = o.hold || 1.5;
  let t = 0;
  fx.push(dt => {
    t += dt;
    n.alpha = t < .25 ? t / .25 * .93 : t < .25 + hold ? .93 : Math.max(0, .93 - (t - .25 - hold) * 3);
    if (o.creep) { n.pos[0] += (G.cam.pos[0] - n.pos[0]) * dt * o.creep; n.pos[2] += (G.cam.pos[2] - n.pos[2]) * dt * o.creep; }
    if (t > .25 + hold + .4) { removeNode(n); return false; }
    return true;
  });
  return n;
}
/* a shade streaks across the view */
function runner() {
  if (!Rm) return;
  const left = Math.random() < .5 ? -1 : 1, d = 3.0;
  const n = figure('shade', 0, 0); n.alpha = .9;
  let t = 0;
  Snd.thump(); setTimeout(() => Snd.thump(), 260);
  fx.push(dt => {
    t += dt;
    const k = Math.min(1, t / .95), a = G.cam.yaw + left * (.75 - 1.5 * k);
    n.pos[0] = clamp(G.cam.pos[0] + Math.sin(a) * d, -2.7, 2.7); n.pos[2] = clamp(G.cam.pos[2] - Math.cos(a) * d, -2.7, 2.7);
    n.alpha = k > .8 ? Math.max(0, .9 * (1 - (k - .8) / .2)) : .9;
    if (t > 1) { removeNode(n); return false; }
    return true;
  });
}
/* something stands behind you. Turn around and it is already looking at you. */
let behindOn = false;
function resetScares() {
  fx.length = 0; behindOn = false;
  chaseReset(); clearTimeout(callT);
  HURT.shakenUntil = HURT.frozenUntil = 0; HURT.mark = 0; setHurtFx(0);
  if (G.dropped) { const id = G.dropped; G.dropped = null; give(id); } // a dropped item is never lost between rooms
  dropNode = null;
}
function behind(face = 'silas', kind = 'silas') {
  if (!Rm || behindOn) return;
  behindOn = true;
  const [x, z] = spot(1.9, Math.PI + rnd(-.25, .25)), n = figure(kind, x, z);
  let t = 0, seen = 0;
  Snd.creak();
  fx.push(dt => {
    t += dt;
    n.alpha = Math.min(.9, t * 1.4);
    const c = G.cam, dx = n.pos[0] - c.pos[0], dz = n.pos[2] - c.pos[2], dl = Math.hypot(dx, dz) || 1;
    const dot = (dx * Math.sin(c.yaw) + dz * -Math.cos(c.yaw)) / dl;
    if (dot > .78 && t > 1) { seen += dt; } else seen = 0;
    if (seen > .12) { removeNode(n); behindOn = false; overlay(face); return false; }
    if (t > 16) { n.alpha = 0; removeNode(n); behindOn = false; return false; }
    return true;
  });
}
function eyes3d() {
  if (!Rm) return;
  const [x, z] = spot(rnd(3.4, 4.6), rnd(-.45, .45)), n = sprite('eyes', x, rnd(1.35, 1.7), z, .6, .3);
  let t = 0;
  Snd.heartbeat();
  fx.push(dt => {
    t += dt;
    n.alpha = t < .3 ? t / .3 : t < 1.5 ? 1 : 0;
    if (t > 1.2 && t < 1.32) n.alpha = 0;
    if (t > 1.7) { removeNode(n); return false; }
    return true;
  });
}
function blackout(then, ms = 1300) {
  if (!Rm) return;
  const sc = Rm.sc; let t = 0;
  Snd.drop();
  fx.push(dt => {
    t += dt;
    const v = t < .12 ? 1 - t / .12 : 0;
    sc.dim = sc.pdim = Math.max(.015, v);
    if (t > ms / 1000) { sc.dim = sc.pdim = 1; if (then) then(); return false; }
    return true;
  });
}
function overlay(face) {
  const sc = $('#scare'), fl = $('#flash');
  sc.className = ''; sc.innerHTML = FACES[face] || GHOST_FACE; void sc.offsetWidth; sc.classList.add('on', 'f-' + face);
  fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
  stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
  if (face === 'child') { Snd.giggle(); Snd.drop(); } else if (face === 'hands') { Snd.slam(); Snd.shriek(); } else if (face === 'silas') { Snd.shriek(); Snd.drop(); } else if (face === 'eyes') { Snd.heartbeat(); Snd.drop(); } else Snd.scare();
  vibe([60, 40, 140]); bigScare();
  setTimeout(() => hurt(face), 520);
  setTimeout(() => { sc.classList.remove('on'); sc.className = ''; sc.innerHTML = ''; stage.classList.remove('shake'); }, 900);
}
function spawnShade() { stander('shade', { dist: rnd(2.8, 4), off: rnd(-.35, .35), hold: 1.3, creep: .12 }); }

/* ---------- what a scare does to you ---------- */
/* Every jump scare lands: you stumble back, let go of what you were holding, and stay shaken for a while
   (slow, unsteady, heart pounding). Fear jumps. And each of them does something of their own:
   Ojuju Calabar breathes out your light, the memory of Mama drags you back to the door, small Tobi snatches something and
   drops it across the room, the hands hold your ankles, the eyes close the dark in around you. */
const HURT = { shakenUntil: 0, frozenUntil: 0, mark: 0 };
let dropNode = null, hbT = 0;
const hurtEl = $('#hurt');
function setHurtFx(level) { if (!hurtEl) return; hurtEl.className = level ? 'on' + (level > 1 ? ' deep' : '') : ''; }
const shaken = () => performance.now() < HURT.shakenUntil;
const frozen = () => performance.now() < HURT.frozenUntil;
function shake(ms, level = 1) {
  HURT.shakenUntil = Math.max(HURT.shakenUntil, performance.now() + ms);
  setHurtFx(level);
  clearInterval(hbT);
  hbT = setInterval(() => {
    if (!shaken() || G.over) { clearInterval(hbT); setHurtFx(0); return; }
    Snd.heartbeat();
  }, 850);
}
function stumble(dist) {
  const c = G.cam, bx = -Math.sin(c.yaw), bz = Math.cos(c.yaw);
  let t = 0, moved = 0, kick = 0;
  fx.push(dt => {
    t += dt;
    const step = Math.min(dist - moved, dt * dist * 4);
    if (step > 0 && Rm) { R3.collide(c.pos, bx * step, bz * step, .3, Rm.sc); moved += step; }
    const want = t < .1 ? .28 : Math.max(0, .28 - (t - .1) * .7), d = want - kick; kick = want;
    c.pitch = clamp(c.pitch + d, -1.3, 1.3);
    c.yaw += Math.sin(t * 40) * .01 * Math.max(0, 1 - t * 2);
    return t < .5;
  });
}
function freeSpot(dist) { // a floor point the player can actually reach
  for (let k = 0; k < 24; k++) {
    const [x, z] = spot(dist + rnd(-.4, .6), rnd(-Math.PI, Math.PI));
    if (!Rm.sc.colliders.some(c => x > c[0] - .35 && x < c[2] + .35 && z > c[1] - .35 && z < c[3] + .35)) return [x, z];
  }
  return [G.cam.pos[0], G.cam.pos[2]];
}
function dropItem(id) {
  if (!Rm || !id || G.dropped) return false;
  take(id); G.dropped = id;
  const [x, z] = freeSpot(1.8);
  const g = R3.add(Rm.sc.root, R3.node({ pos: [x, 0, z], id: 'dropped' }));
  R3.add(g, R3.node({ geo: 'box', pos: [0, .05, 0], scl: [.16, .1, .16], col: R3.parseCol('#c9a94a'), shin: 40 }));
  R3.add(g, R3.node({ geo: 'plane', tex: 'glint', blend: 2, unlit: true, bb: true, pos: [0, .3, 0], scl: [.35, .35, 1], nopick: true, alpha: .9 }));
  R3.add(g, R3.node({ geo: 'box', pos: [0, .25, 0], scl: [.7, .6, .7], proxy: true }));
  dropNode = g;
  LABELS.dropped = 'Your ' + ITEMS[id].name.toLowerCase();
  return true;
}
function pickDropped() {
  if (!G.dropped) return;
  const id = G.dropped; G.dropped = null;
  if (dropNode) { removeNode(dropNode); dropNode = null; }
  pickup(id, 'You snatch back your ' + ITEMS[id].name.toLowerCase() + '. Something small giggles and runs.');
  queueSave();
}
function stealLight() {
  const f = G.f, k = roomKey();
  const lights = { cellar: 'lanternLit', study: 'lampLit', chapel: 'candlesLit' };
  const fl = lights[k];
  if (!fl || !f[fl]) return false;
  f[fl] = false; Snd.snuff(); redraw(); queueSave();
  say(k === 'cellar' ? 'Its breath hits your face like smoke, and your bush lamp goes out. It hangs back on its nail, cold. Light it again.' : k === 'study' ? 'Its breath snuffs the hurricane lamp. Total dark. Light it again.' : 'Its breath puts out both candles at once. Light them again.', 7000);
  return true;
}
function dragToDoor() {
  const c = G.cam, sp = Rm && Rm.api.spawn; if (!sp) return;
  const x0 = c.pos[0], z0 = c.pos[2]; let t = 0;
  HURT.frozenUntil = performance.now() + 1100;
  fx.push(dt => {
    t += dt; const k = Math.min(1, t / 1);
    const e = k * k * (3 - 2 * k);
    c.pos[0] = x0 + (sp.x - x0) * e; c.pos[2] = z0 + (sp.z - z0) * e;
    return k < 1;
  });
}
function hurt(face) {
  if (!Rm || G.over || !G.started) return;
  const gentle = G.mode === 'gentle';
  const held = G.sel;
  stumble(gentle ? .3 : .7);
  if (held) { G.sel = null; renderBag(); }
  if (gentle) { shake(2200, 1); return; }
  const dmg = { silas: 16, lady: 8, child: 10, hands: 12, eyes: 10 }[face] || 10;
  let msg = '';
  if (face === 'silas') {
    shake(9000, 2);
    if (!stealLight()) msg = 'You stagger back. Your legs will not hold still, and your heart will not slow down.';
    addDread(dmg); if (msg) say(msg, 6500);
    burnLantern();
    return;
  } else if (face === 'lady') {
    shake(5000, 1); dragToDoor();
    msg = 'Cold hands, a woman’s, drag you back across the floor to the door. The house remembers Mama pulling a child away.'; after(900, () => speak('m_notyet'));
  } else if (face === 'child') {
    shake(5000, 1);
    const pool = G.inv.filter(i => i !== 'matches');
    const id = held && held !== 'matches' ? held : pick(pool.length ? pool : [null]);
    if (id && dropItem(id)) msg = 'Small hands snatch your ' + ITEMS[id].name.toLowerCase() + ' and fling it across the room. A little boy laughs. You know that laugh. Go and get it.';
    else msg = 'Small hands pull at your clothes, then let go. A little boy’s giggle runs away from you. Your giggle.';
  } else if (face === 'hands') {
    shake(6000, 2); HURT.frozenUntil = performance.now() + 2600;
    msg = 'Hands come up through the floor and hold your ankles. You cannot move.';
  } else {
    shake(6000, 2); msg = 'The dark closes in around you.';
  }
  if (msg) say(msg, 6500);
  addDread(dmg);
}

/* ---------- the one entry point ---------- */
function scare(kind, o = {}) {
  if (G.mode === 'gentle') {
    if (kind === 'slam') { Snd.thump(); return; }
    if (kind === 'blackout') kind = 'flicker';
    else if (!['flicker', 'shade'].includes(kind)) kind = 'shade';
  }
  if (kind === 'flicker') {
    Snd.creak(); let t = 0; const pat = [1, .12, 1, .04, .7, .1, 1];
    fx.push(dt => {
      t += dt;
      const i = Math.min(pat.length - 1, Math.floor(t / .13));
      if (Rm) Rm.sc.dim = pat[i];
      if (t > pat.length * .13) { if (Rm) Rm.sc.dim = 1; return false; }
      return true;
    });
  }
  else if (kind === 'shade') { G.scares++; spawnShade(); Snd.thump(); }
  else if (kind === 'jump') overlay(o.face || faceFor());
  else if (kind === 'runner') { G.scares++; runner(); }
  else if (kind === 'behind') { G.scares++; behind(o.face, o.kind); }
  else if (kind === 'eyes') { G.scares++; eyes3d(); }
  else if (kind === 'stander') { G.scares++; Snd.thump(); stander(o.kind || 'silas', o); }
  else if (kind === 'blackout') { G.scares++; blackout(() => { if (o.then) o.then(); else stander(o.kind || 'silas', { dist: 2.2, hold: 1.1 }); Snd.thump(); }); }
  else if (kind === 'slam') { G.scares++; Snd.slam(); stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); vibe([80]); setTimeout(() => stage.classList.remove('shake'), 500); }
}
function faceFor() {
  const k = roomKey();
  if (k === 'nursery') return 'child';
  if (k === 'cellar' || k === 'study' || k === 'chapel') return 'silas';
  return pick(['silas', 'silas', 'child', 'lady']);
}

/* ---------- dread and ambience ---------- */
function checkThresholds() {
  if (G.dread < 35) G.thr = {};
  const steps = [[50, () => { scare('shade'); Snd.creak(); }], [66, () => scare('runner')], [76, () => { scare('flicker'); speak('m_getout'); }], [88, () => scare(Math.random() < .5 ? 'behind' : 'jump')]];
  for (const [t, fn] of steps) if (G.dread >= t && !G.thr[t]) { G.thr[t] = true; fn(); break; }
}
let evT = 0;
function ambientEvent() {
  if (G.noAmbient) return;
  if (CH.on || CH.hidden || QUIET.on) return;
  const r = Math.random(), calm = Date.now() - (G.lastBig || 0) > 55000, d = G.dread;
  if (r < .22) {
    const ev = pick(['creak', 'creak', 'mosquito', 'generator', 'ekpe', 'choir', 'pound']);
    if (ev === 'mosquito') { Snd.mosquito(); say('A mosquito whines past your ear, and away.', 3000); }
    else if (ev === 'generator') { Snd.generator(); say('Somewhere outside, a generator coughs, roars for a moment, and dies.', 4200); }
    else if (ev === 'ekpe') { Snd.ekpe(); say('Far below in Oke-Ọla, a talking drum, and a small bell. Then nothing at all.', 4200); }
    else if (ev === 'choir') { Snd.choir(); say('Faint singing drifts from a church down the road. It stops in the middle of a word.', 4600); }
    else if (ev === 'pound') { Snd.knock(4); say('Somewhere in the house, someone is pounding yam. Thump. Thump. Thump.', 3600); }
    else { Snd.creak(); say(pick(['Somewhere above you, a floorboard creaks.', 'A door closes, far away.', 'Something is dragged across the floor overhead.', 'Bathroom slippers shuffle across the floor upstairs.']), 3600); }
  }
  else if (r < .38) scare('flicker');
  else if (r < .54) speak(pick(AMBIENT_LINES));
  else if (calm && d > 28 && r < .66) scare('behind');
  else if (calm && d > 18 && r < .78) scare('runner');
  else if (calm && d > 40 && r < .88) scare('eyes');
  else if (calm && d > 55 && r < .94) scare('jump');
  else scare('shade');
}
function scheduleEvent() {
  clearTimeout(evT);
  evT = setTimeout(() => {
    if (G.started && !G.paused && !G.over && !G.busy && !modalOpen() && !document.hidden) ambientEvent();
    scheduleEvent();
  }, rnd(16000, 34000));
}
setInterval(() => {
  if (!G.started || G.paused || G.over || G.busy || modalOpen() || document.hidden || G.mode === 'gentle') return;
  addDread((ROOMS[G.room].dark ? 0.40 : 0.30) * 0.25);
  if (!G.over) checkThresholds();
}, 250);

/* ---------- tripwires: stepping on a spot, once ---------- */
const ZONES = {};   // filled in by each room below
function checkZones() {
  const zs = ZONES[roomKey()]; if (!zs) return;
  const z = G.f.zn = G.f.zn || {}, p = G.cam.pos;
  for (const w of zs) {
    if (z[w.id]) continue;
    if (p[0] < w.b[0] || p[0] > w.b[2] || p[2] < w.b[1] || p[2] > w.b[3]) continue;
    if (w.when && !w.when(G.f)) continue;
    z[w.id] = 1; w.fn();
  }
}

Object.assign(ZONES, {
  foyer: [
    { id: 'knock', b: [-1.2, -.6, 1.2, 1.0], fn() { Snd.knock(3); say('Three slow knocks on the door you came in by. From the outside. Then a voice, very close.', 5600); after(1200, () => speak('o_who')); scare('flicker'); } },
    { id: 'clock', b: [1.5, -2.4, 2.65, -.8], fn() { Snd.bell(); say('The clock does not strike. Something inside it clears its throat.', 5000); } }
  ],
  nursery: [
    { id: 'giggle', b: [.9, 1.0, 2.7, 2.9], fn() { Snd.giggle(); say('A small giggle, from the cot. Then a whisper: vroom, vroom.', 4500); scare('stander', { kind: 'kid', dist: 2.6, hold: 1.5 }); } },
    { id: 'horse', b: [-.5, -2.6, 1.4, -1.2], fn() { scare('runner'); } }
  ],
  kitchen: [
    { id: 'table', b: [-1.2, -.9, 1.5, 1.4], fn() { G.f.chairOut = true; if (Rm.api.chairPull) Rm.api.chairPull(); Snd.creak(); say('Behind you, wood scrapes on tile. Oga’s chair at the head of the table has been pulled out.', 5500); } }
  ],
  cellar: [
    { id: 'eyes', b: [.6, -1.3, 2.0, 1.5], fn() { scare('eyes'); } }
  ],
  study: [
    { id: 'desk', b: [-1.3, -.3, 1.3, .7], fn() { Snd.heartbeat(); if (Rm.api.eyes) { Rm.api.eyes(true); setTimeout(() => Rm.api.eyes && Rm.api.eyes(false), 1500); } say('In the oil painting, Papa’s eyes have turned to follow you.', 4200, true); flashback('F4'); } }
  ],
  chapel: [
    { id: 'nave', b: [-.7, -.2, .7, 1.2], fn() { scare('behind', { face: 'silas', kind: 'silas' }); } }
  ],
  attic: [
    { id: 'dolls', b: [-1.7, 1.55, 1.7, 2.6], fn() { Snd.giggle(); scare('flicker'); } },
    { id: 'mirror', b: [-2.4, -2.5, -1.2, -1.2], when: f => f.wiped, fn() { scare('jump', { face: 'silas' }); } }
  ]
});
