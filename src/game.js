/* ================= GAME ================= */
const ITEMS = {
  matches: { name: 'Matchbox', desc: 'A small matchbox. Damp, but a few sticks still strike.' },
  locket: { name: 'Coral beads', desc: 'A string of red coral beads, cold as river water.' },
  ironkey: { name: 'Iron key', desc: 'Heavy and rusted. It fits something big.' },
  button: { name: 'Black button', desc: 'Four holes, with a little thread still on it.' },
  windkey: { name: 'Wind-up key', desc: 'Small and brass, shaped like a butterfly.' },
  rag: { name: 'Strip of wrapper', desc: 'A strip of old Ankara cloth. Good for wiping.' },
  crowbar: { name: 'Crowbar', desc: 'Cold iron with a claw for nails.' },
  brasskey: { name: 'Brass key', desc: 'Warm to the touch. Too warm.' },
  hammer: { name: 'Mason’s hammer', desc: 'A bricklayer’s hammer, crusted with old cement. Twenty-two years old cement.' },
  whitecloth: { name: 'White cloth', desc: 'Mama’s altar cloth, clean and folded. It still smells faintly of her.' },
  cellarkey: { name: 'Boys’ quarters key', desc: 'Iron, cold, and smaller than you expected.' },
  chapelkey: { name: 'Black key', desc: 'Blackened iron. Two letters are scratched into the bow: A. A.' },
  rope: { name: 'Bell rope', desc: 'Coarse and heavy. One end is frayed where it was cut.' },
  padkey: { name: 'Small key', desc: 'A little padlock key, sticky with old schnapps.' }
};

const SAVE_KEY = 'oc1_save';

/* ---------- puzzle answers: new every game ----------
   The story's own facts never change (every clock stopped at 7:20, the window code is 14 October).
   What changes: the minute the big standing clock stopped (it ran on until Mama slammed the door), the order the
   music box plays (and so the harmonium), the mortar rhythm on the recipe card, and the candle order in the mirror. */
const PUZ_CLASSIC = { clock: [7, 34], box: ['star', 'moon', 'sun'], beat: [2, 1, 3], candles: ['white', 'red', 'blue', 'green'] };
function rollPuzzles() {
  const r = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const h = 7 + r(2), m = h === 7 ? 21 + r(39) : r(60);
  let beat; do { beat = [1 + r(3), 1 + r(3), 1 + r(3)]; } while (beat[0] === beat[1] && beat[1] === beat[2]);
  return { clock: [h, m], box: shuffle(['star', 'moon', 'sun']), beat, candles: shuffle(['white', 'red', 'blue', 'green']) };
}
const PZ = () => G.puz || PUZ_CLASSIC;
const clockWords = () => { const [h, m] = PZ().clock; return h + ':' + String(m).padStart(2, '0'); };
const clockCode = () => clockWords().replace(':', '');
const listWords = a => a.slice(0, -1).join(', ') + ', ' + a.at(-1);
const BEAT_WORD = { 1: 'one pound', 2: 'two quick pounds', 3: 'three quick pounds' };
const beatWords = () => { const b = PZ().beat; return BEAT_WORD[b[0]][0].toUpperCase() + BEAT_WORD[b[0]].slice(1) + ', a breath, ' + BEAT_WORD[b[1]] + ', a breath, then ' + BEAT_WORD[b[2]] + '.'; };
const CANDLE_WORD = { white: 'BONE', red: 'BLOOD', blue: 'SEA', green: 'GRAVE' };

const G = {
  started: false, over: false, paused: false, busy: false, ending: false,
  room: 0, f: {}, inv: [], sel: null, journal: [], pages: [],
  dread: 0, thr: {}, mode: store.get('hm3_mode') === 'gentle' ? 'gentle' : 'haunted', lang: store.get('oc_lang') === 'pcm' ? 'pcm' : 'en',
  hints: 0, scares: 0, t0: Date.now(), hintLv: {}, snap: null, lastBig: 0, token: 0, lives: 5, chap: null,
  cam: { pos: [0, 1.6, 2], yaw: 0, pitch: 0 }
};
let Rm = null;   // the room on screen: { sc: scene, api: room controller }
const stage = $('#stage'), glEl = $('#gl'), capEl = $('#caption'), modalEl = $('#modal'), panel = $('#panel');
const has = id => G.inv.includes(id);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* run something a little later, but only if we are still in the same room and nothing has gone wrong */
function after(ms, fn) {
  const tk = G.token;
  setTimeout(() => { if (G.token === tk && G.started && !G.over) fn(); }, ms);
}

/* ---------- captions ---------- */
let capT = 0;
function say(text, ms = 5200, whisper = false) {
  capEl.textContent = text;
  capEl.classList.toggle('whisper', whisper);
  capEl.classList.add('show');
  clearTimeout(capT);
  capT = setTimeout(() => capEl.classList.remove('show'), ms);
}

/* a ghost speaks: the words appear in the dark, letter by letter, at the speed of the voice, and the recording
   (if there is one) plays with that ghost's effects. Ojuju is big and shaking, Mama (a memory) soft and swaying, small Tobi quick, Tobi himself plain and close. */
const voiceEl = $('#voice');
let voT = 0;
async function speak(id, o = {}) {
  const L = LINES[id]; if (!L) return;
  const who = L.who, words = tr(L.t), vid = VOICES[id] ? id : L.v;
  let dur = 0;
  if (vid && VOICES[vid]) dur = await Snd.voice(VOICES[vid], who === 'tobi' ? 'plain' : who);
  if (!dur && !(who === 'ojuju' && /^tobi/i.test(L.t) && Snd.callTobi())) Snd.whisper();   // Amuro's recorded "Tobiii" when he calls the name
  const per = dur ? Math.max(.03, Math.min(.12, dur * .85 / words.length)) : (who === 'ojuju' ? .09 : who === 'kid' ? .045 : .07);
  const side = o.side != null ? o.side : (Math.random() - .5) * 2;
  voiceEl.className = 'v-' + who;
  voiceEl.style.setProperty('--vx', (side * 18).toFixed(1) + '%');
  voiceEl.style.setProperty('--vy', (who === 'kid' ? 14 : who === 'mama' ? -4 : who === 'tobi' ? 24 : 0) + Math.round(Math.random() * 10) + '%');
  voiceEl.innerHTML = [...words].map((ch, i) => ch === ' ' ? ' ' : `<span style="animation-delay:${(i * per).toFixed(2)}s;--r:${(Math.random() * 2 - 1).toFixed(2)}">${esc(ch)}</span>`).join('');
  void voiceEl.offsetWidth; voiceEl.classList.add('show');
  clearTimeout(voT);
  voT = setTimeout(() => voiceEl.classList.remove('show'), Math.max(2600, (dur || words.length * per) * 1000 + 1800));
}

/* ---------- modals ---------- */
function openModal(html, opts = {}) {
  if (typeof joyReset === 'function') joyReset();   // a pop-up opening under a thumb must not leave the stick held
  panel.className = 'panel ' + (opts.cls || '');
  panel.innerHTML = html;
  panel.onclick = panel.onpointerdown = panel.onpointermove = panel.onpointerup = panel.onpointercancel = null;
  panel.scrollTop = 0;
  modalEl.classList.add('open');
  modalEl._dismiss = opts.dismiss !== false;
  modalEl._openedAt = performance.now(); modalEl._onX = opts.onX || null;
  modalX.hidden = !modalEl._dismiss; // a close button on everything you are allowed to close
  return panel;
}
function closeModal() { if (typeof joyReset === 'function') joyReset(); modalEl.classList.remove('open'); panel.innerHTML = ''; panel.onclick = panel.onpointerdown = panel.onpointermove = panel.onpointerup = panel.onpointercancel = null; }
const modalX = document.getElementById('modalX');
modalX.addEventListener('click', e => { e.stopPropagation(); if (!modalEl._dismiss) return; Snd.tap && Snd.tap(); const f = modalEl._onX; closeModal(); if (f) f(); });
const modalOpen = () => modalEl.classList.contains('open');
/* Nothing closes by tapping the dark around it: only the ✕ or a button inside.
   And for half a second after anything opens, every tap is swallowed, so the tap (or double tap)
   that opened it can never press a button in it by accident. */
const MODAL_GUARD = 500;
['pointerdown', 'pointerup', 'click'].forEach(type => modalEl.addEventListener(type, e => {
  if (performance.now() - (modalEl._openedAt || 0) < MODAL_GUARD) { e.stopPropagation(); e.preventDefault(); }
}, true));

/* ---------- inventory ---------- */
function renderBag() {
  const bag = $('#bag');
  let html = '';
  G.inv.forEach(id => {
    html += `<button class="slot${G.sel === id ? ' sel' : ''}" data-item="${id}" aria-label="${ITEMS[id].name}" aria-pressed="${G.sel === id}">${itemIcon(id)}</button>`;
  });
  for (let i = G.inv.length; i < 6; i++) html += '<div class="slot empty" aria-hidden="true"></div>';
  bag.innerHTML = html;
}
$('#bag').addEventListener('click', e => {
  const b = e.target.closest('.slot[data-item]');
  if (!b || G.busy || G.over) return;
  Snd.init();
  const id = b.dataset.item;
  if (G.sel === id) { G.sel = null; say('You put the ' + ITEMS[id].name.toLowerCase() + ' away.', 1800); }
  else { G.sel = id; Snd.select(); say(ITEMS[id].name + '. ' + ITEMS[id].desc + ' Tap something to use it.', 4200); }
  renderBag();
});
function give(id) { if (!has(id)) G.inv.push(id); renderBag(); popSlot(id); }
function take(id) { G.inv = G.inv.filter(i => i !== id); if (G.sel === id) G.sel = null; renderBag(); }
function popSlot(id) { const s = $(`.slot[data-item="${id}"]`); if (s) { s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } }
function pickup(id, msg) { give(id); Snd.pickup(); say(msg); addDread(-6); }

/* ---------- journal and memory pages ---------- */
function addJournal(key, title, text, scrawl) {
  const e = G.journal.find(j => j.key === key);
  if (e) { e.text = text; e.title = title; } else G.journal.push({ key, title, text, scrawl: !!scrawl });
}
const roomNameOf = key => (ROOMS.find(r => r.key === key) || {}).name || '';
const pageHtml = (p, n) => `<div class="paper memory"><div class="pk">${n ? 'Memory page · ' + n + ' of ' + PAGES.length : esc(roomNameOf(p.room))}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`;
function openJournal() {
  const got = G.pages.length;
  let html = `<div class="bk-cover"><b>EXERCISE BOOK</b><span>40 LEAVES · RULED</span><div class="bk-row"><i>NAME:</i><u>Tobenna Adeleke</u></div><div class="bk-row"><i>SUBJECT:</i><u>Adeleke House, Oke-Ọla</u></div></div><div class="bk-page">`;
  html += G.journal.length
    ? G.journal.map(j => `<div class="bk-entry${j.scrawl ? ' scrawl' : ''}"><h3>${esc(j.title)}</h3><p>${esc(j.text)}</p></div>`).join('')
    : '<p class="bk-empty">Nothing yet. Notes and clues you find are written in here.</p>';
  html += `<div class="jsec">Cowries <small>${G.cowries.length} of 7</small></div><div class="cowrow">${Array.from({ length: 7 }, (_, i) => `<i class="${i < G.cowries.length ? 'f' : ''}"></i>`).join('')}</div><p class="hint-note">One small cowrie shell is hidden in every room. Mama said they bring you home.</p>`;
  html += `<div class="jsec">Memory pages <small>${got} of ${PAGES.length}</small></div><div class="pgbar">${PAGES.map(p => `<i class="${G.pages.includes(p.id) ? 'f' : ''}"></i>`).join('')}</div>`;
  html += got
    ? G.pages.map(id => PAGES.find(p => p.id === id)).filter(Boolean).map(p => pageHtml(p)).join('')
    : '<p class="hint-note">Pieces of the family’s story are hidden around the house. Look closely at things. Find them all for the true ending.</p>';
  html += '</div><div class="col"><button class="btn" data-x>Close the book</button></div>';
  openModal(html, { cls: 'book' });
  panel.onclick = e => { if (e.target.closest('[data-x]')) closeModal(); };
}
function note(key, title, text, scrawl) {
  addJournal(key, title, text, scrawl);
  Snd.tick();
  openModal(`<div class="paper${scrawl ? ' scrawl' : ''}"><h3>${esc(title)}</h3><p>${esc(text)}</p></div><div class="col"><button class="btn primary" data-x>Close</button></div>`);
  panel.onclick = e => { if (e.target.closest('[data-x]')) closeModal(); };
  addDread(-3);
}
/* a memory page: the pieces of the family story. Returns true when the page was new. */
function page(id) {
  const p = PAGES.find(x => x.id === id);
  if (!p) return false;
  if (G.pages.includes(id)) { say('You have read this already: “' + p.title + '”. It is in your journal.', 3800); return false; }
  G.pages.push(id); addEver('oc_pageset', id); Snd.page(); Snd.note(784); Snd.note(1175, .12); addDread(-5);
  const n = G.pages.length, all = n === PAGES.length;
  const allDone = () => { say('That is all of it. Every page. Now get out, and tell her you know.', 6500); speak('m_getout'); };
  openModal(pageHtml(p, n) + `<div class="col"><button class="btn primary" data-x>${all ? 'I remember everything' : 'Close'}</button></div>`, all ? { onX: allDone } : {});
  panel.onclick = e => { if (e.target.closest('[data-x]')) { closeModal(); if (all) { say('That is all of it. Every page. Now get out, and tell her you know.', 6500); speak('m_getout'); } } };
  queueSave();
  return true;
}
/* tap an object that holds a page. The caption is shown under a new page, or on its own for a re-read. */
function readPage(id, msg) {
  if (msg) say(msg, 3800);
  if (!G.pages.includes(id)) page(id);
}
const pagesIn = key => PAGES.filter(p => p.room === key);
const missingPages = key => pagesIn(key || ROOMS[G.room].key).filter(p => !G.pages.includes(p.id));

/* ---------- locks: each one looks and feels like the thing you are touching ---------- */
/* Rolling brass drums you can flick up and down (or tap the top or bottom half), a handle to pull,
   and a small reward when it gives: the drawer slides, the shackle jumps, the keys glow. */
const chev = d => `<svg viewBox="0 0 24 24"><path d="${d === 'up' ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}"/></svg>`;
const LOCKS = {
  drawer: { ok: 'Pull the drawer', fail: 'Nothing. The dials just click.', screws: true },
  padlock: { ok: 'Pull the shackle', fail: 'The padlock does not move. Rust grinds in it.', screws: false },
  desk: { ok: 'Open the drawer', fail: 'Nothing. The wheels just click.', screws: true }
};
function wheelLock(o, alpha, target) {
  const skin = o.skin || 'drawer', L = LOCKS[skin] || LOCKS.drawer, n = target.length, v = Array(n).fill(0), N = alpha.length;
  const cell = k => alpha[((k % N) + N) % N];
  const strip = i => [-2, -1, 0, 1, 2].map(d => `<span class="${d ? '' : 'cur'}">${cell(v[i] + d)}</span>`).join('');
  openModal(`<div class="lock skin-${skin}">${L.screws ? '' : '<i class="shackle"></i>'}
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face">
        ${L.screws ? '<i class="screw a"></i><i class="screw b"></i><i class="screw c"></i><i class="screw d"></i>' : ''}
        <div class="drums${alpha === LETTERS ? ' letters' : ''}">${v.map((_, i) => `<div class="drum" data-i="${i}" role="spinbutton" aria-label="Wheel ${i + 1}" aria-valuetext="${cell(v[i])}"><div class="strip">${strip(i)}</div><i class="glass"></i><b class="cu">${chev('up')}</b><b class="cd">${chev('dn')}</b></div>`).join('')}</div>
        ${skin === 'padlock' ? '<i class="kh"></i>' : '<i class="pull"></i>'}
      </div>
      <p class="msg" id="lockMsg" aria-live="polite"></p>
      <div class="lrow"><button class="lbtn back" data-x>Leave it</button><button class="lbtn go" data-ok>${L.ok}</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel);
  const roll = (i, dir) => {
    v[i] = (v[i] + dir + N) % N;
    const d = $(`.drum[data-i="${i}"]`, panel), st = $('.strip', d);
    st.innerHTML = strip(i); d.setAttribute('aria-valuetext', cell(v[i]));
    st.style.transition = 'none'; st.style.transform = `translateY(${dir * 20}%)`;
    void st.offsetWidth; st.style.transition = ''; st.style.transform = '';
    Snd.tick(); vibe(8);
  };
  let drag = null;
  panel.onpointerdown = e => {
    const d = e.target.closest('.drum'); if (!d) return;
    const r = d.getBoundingClientRect();
    drag = { i: +d.dataset.i, y: e.clientY, acc: 0, moved: false, top: e.clientY < r.top + r.height / 2 };
    try { d.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    e.preventDefault();
  };
  panel.onpointermove = e => {
    if (!drag) return;
    const dy = e.clientY - drag.y; drag.y = e.clientY; drag.acc += dy;
    while (Math.abs(drag.acc) > 26) { const dir = drag.acc > 0 ? -1 : 1; drag.acc += dir * 26; drag.moved = true; roll(drag.i, dir); }
  };
  panel.onpointerup = e => { if (!drag) return; if (!drag.moved) roll(drag.i, drag.top ? 1 : -1); drag = null; };
  panel.onpointercancel = () => { drag = null; };
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) { panel.onpointerdown = panel.onpointermove = panel.onpointerup = null; closeModal(); }
    else if (e.target.closest('[data-ok]')) {
      if (v.map(k => alpha[k]).join('') === target) {
        lockEl.classList.add('solved'); Snd.unlock(); vibe([20, 40, 60]);
        panel.onclick = null;
        setTimeout(() => { if (lockEl.isConnected) { panel.onpointerdown = panel.onpointermove = panel.onpointerup = null; closeModal(); } o.onOk(); }, 650);
      } else {
        o.fails = (o.fails || 0) + 1;
        $('#lockMsg', panel).textContent = o.failMsg ? o.failMsg(o.fails) : L.fail;
        lockEl.classList.remove('shake'); void lockEl.offsetWidth; lockEl.classList.add('shake');
        Snd.wrong(); vibe([40, 30, 40]); addDread(5);
      }
    }
  };
}
const DIGITS = '0123456789'.split(''), LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function codeLock(o) { wheelLock(o, DIGITS, o.code); }
function wordLock(o) { wheelLock(Object.assign({ skin: 'desk' }, o), LETTERS, o.word); }

/* symbols: carved knobs on the nursery's little door, or painted ivory keys on the organ */
function symbolLock(o) {
  const seq = [], skin = o.skin || 'door', order = ['moon', 'sun', 'star'];
  const notes = { star: 659.25, moon: 523.25, sun: 392 };
  const render = () => $$('.sslot', panel).forEach((s, i) => { s.innerHTML = seq[i] ? symIcon(seq[i], 30) : ''; s.classList.toggle('f', !!seq[i]); });
  const keys = skin === 'organ'
    ? `<div class="keys">${['', ...order, ''].map((s, i) => s ? `<button class="key sym" data-s="${s}" aria-label="${s}">${symIcon(s, 30)}</button>` : `<i class="key blank"></i>`).join('')}<i class="black b1"></i><i class="black b2"></i><i class="black b3"></i><i class="black b4"></i></div>`
    : `<div class="knobs">${order.map(s => `<button class="knob sym" data-s="${s}" aria-label="${s}">${symIcon(s, 34)}</button>`).join('')}</div>`;
  openModal(`<div class="lock skin-${skin}">
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face">
        <div class="slots">${[0, 1, 2].map(() => '<span class="sslot"></span>').join('')}</div>
        ${keys}
      </div>
      <p class="msg" id="lockMsg" aria-live="polite"></p>
      <div class="lrow"><button class="lbtn back" data-x>Leave it</button><button class="lbtn back" data-clr>Start again</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel);
  panel.onclick = e => {
    const b = e.target.closest('.sym');
    if (b && seq.length < 3) {
      seq.push(b.dataset.s); Snd.note(notes[b.dataset.s]); vibe(10); render();
      b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
      if (seq.length === 3) {
        if (seq.join() === o.seq.join()) { lockEl.classList.add('solved'); Snd.unlock(); panel.onclick = null; setTimeout(() => { if (lockEl.isConnected) closeModal(); o.onOk(); }, 650); }
        else {
          $('#lockMsg', panel).textContent = o.fail || 'The lock stays shut. A small voice giggles.';
          lockEl.classList.remove('shake'); void lockEl.offsetWidth; lockEl.classList.add('shake');
          Snd.wrong(); vibe([40, 30, 40]); addDread(5);
          setTimeout(() => { seq.length = 0; if (modalOpen()) render(); }, 700);
        }
      }
    } else if (e.target.closest('[data-clr]')) { seq.length = 0; render(); }
    else if (e.target.closest('[data-x]')) closeModal();
  };
}

/* ---------- dread ---------- */
function updDread() {
  $('#dreadFill').style.width = clamp(G.dread, 0, 100) + '%';
  $('#dread').classList.toggle('hot', G.dread > 72);
}
function addDread(n) {
  if (G.mode === 'gentle' || G.over) return;
  G.dread = clamp(G.dread + n, 0, 100);
  updDread();
  if (G.dread >= 100) caught();
}
function caught() {
  if (G.over) return;
  G.over = true;
  scare('jump', { face: faceFor() });
  setTimeout(() => loseLife('fear'), 900);
}
/* full: throw away this room's progress and start it over; otherwise keep it and just wake at the door */
function restoreRoom(full) {
  if (full) G.dropped = null;
  if (full && G.snap) { G.inv = G.snap.inv.slice(); G.journal = G.snap.journal.map(j => ({ ...j })); G.pages = G.snap.pages.slice(); }
  G.over = false; G.busy = false;
  enterRoom(G.room, { restore: true, keep: !full });
}

/* ---------- hints ---------- */
const STEPS = {
  foyer: [
    { done: f => f.readNote, h: ['There is a scrap of paper on top of the television, on the lace cover.', 'The TV stands against the left wall. Walk up and tap the top of it.', 'Tap the paper on the TV. It points at the clock.'] },
    { done: f => f.drawerOpen, get h() { return ['The note links the big clock and the drawer. The big clock kept going a little after the others stopped.', 'Read the standing clock on the wall opposite the TV. Where did its hands stop?', 'It stopped at ' + clockWords() + '. Set the three dials on the sideboard drawer to ' + clockCode().split('').join(' ') + '.']; } },
    { done: f => f.gotLocket || has('locket') || f.portraitOpen, h: ['Something red is in the open drawer.', 'Tap the coral beads inside the drawer.'] },
    { done: f => f.portraitOpen, h: ['Mama’s oil painting above the TV is missing something at her throat.', 'Select the coral beads in your tray, then tap the painting.'] },
    { done: f => f.gotIronKey || has('ironkey') || f.doorOpen, h: ['Something is hidden behind the painting.', 'Tap the key in the open compartment.'] },
    { done: f => has('matches') || f.gotMatches, h: ['You will want fire later. Search Papa’s agbada on the stand by the door.', 'Tap the agbada.'] },
    { done: f => f.doorOpen, h: ['You have the key. Where does it fit?', 'Select the iron key, then tap the hall door.'] }
  ],
  nursery: [
    { done: f => f.gotButton || has('button') || f.teddyFixed, h: ['The rocking horse moves by itself. Walk up to it and look closely.', 'Tap the horse by the right-hand wall. Something is caught in its mane.'] },
    { done: f => f.teddyFixed, h: ['The teddy bear on the toy shelf is missing an eye.', 'Select the button, then tap the teddy.'] },
    { done: f => f.boxPlayed, get h() { return ['The music box on the dresser needs winding.', 'Select the wind-up key, then tap the music box.', 'Watch the symbols light up: ' + listWords(PZ().box) + '.']; } },
    { done: f => f.doorOpen, get h() { const b = PZ().box; return ['The little door on the far wall takes three symbols in order.', 'Tap the door and enter what the music box played.', b[0][0].toUpperCase() + b[0].slice(1) + ', then ' + b[1] + ', then ' + b[2] + '.']; } }
  ],
  kitchen: [
    { done: f => f.readRecipe || f.pantryOpen, h: ['There is a card pinned to the wall beside the low door on the right.', 'Walk up and tap the card. It is a recipe, and the rhythm matters.'] },
    { done: f => f.pantryOpen, get h() { return ['The mortar and pestle stand by the barred window. Someone is waiting for food.', 'Tap the mortar and pound the yam the way the card says. Press Listen to hear it first.', beatWords()]; } },
    { done: f => f.gotCKey || has('cellarkey') || f.doorOpen, h: ['The pantry door by the cooker is open. Look inside.', 'Tap the key hanging on the nail.'] },
    { done: f => f.doorOpen, h: ['The key fits the low wooden door in the right-hand wall.', 'Select the boys’ quarters key, then tap that door.'] }
  ],
  cellar: [
    { done: f => f.lanternLit, h: ['It is too dark to do much. Look for a bush lamp on a nail beside the heavy door.', 'Select the matches, then tap the bush lamp. Then you can carry the light.'] },
    { done: f => f.gotCrowbar || f.coffinOpen, h: ['Search the workbench along the left wall.', 'Tap the red toolbox. Keep what is in it: you will need the hammer much later.'] },
    { done: f => f.coffinOpen, h: ['The long crate on the right is nailed shut.', 'Select the crowbar, then tap the crate.'] },
    { done: f => f.keyUsed, h: ['The brass key fits the big keyhole in the door.', 'Select the brass key, then tap the keyhole.'] },
    { done: f => f.radioHeard || f.padOpen, h: ['The padlock on the door has only a tiny keyhole. Something on the workbench might know where the key is.', 'Tap the old radio on the workbench and change stations with the arrows or the knob.', 'Keep changing station until a man’s voice comes through. His message plays by itself.'] },
    { done: f => f.gotPadKey || f.padOpen, h: ['The voice said: in the bottles Papa poured for the dead, and never drank.', 'Tap the schnapps bottles on the rack by the right-hand wall.'] },
    { done: f => f.padOpen, h: ['Select the small key, then tap the padlock on the door.'] },
    { done: f => f.padOpen && f.keyUsed, h: ['Both locks are done. Tap the door.'] }
  ],
  study: [
    { done: f => f.lampLit, h: ['It is very dark in here. A hurricane lamp stands on the desk.', 'Select the matches, then tap the lamp.'] },
    { done: f => f.photoFixed || f.drawerOpen, h: ['A small framed photo stands on the desk. Its glass is smashed.', 'Tap the photo, then tap each piece to turn it until the picture is the right way up.', 'Look for the faces and the ground. Every face should sit above its body, and the ground at the bottom.'] },
    { done: f => f.drawerOpen, h: ['Now the record player in the corner might make sense.', 'Tap the record player. Match each voice to the person in the photo who said it.', 'Papa in the blue fila: “What is mine stays mine.” Mama in the green gele sang the lullaby. Effiong, with small Tobi on his shoulders, called him “my small driver”.'] },
    { done: f => f.gotChKey || has('chapelkey') || f.doorOpen, h: ['The drawer is open. Something dark lies inside.', 'Tap the black key.'] },
    { done: f => f.doorOpen, h: ['An iron-banded door stands in the north wall, to the right of the bookcase.', 'Select the black key, then tap that door.'] }
  ],
  chapel: [
    { done: f => f.candlesLit || f.panelOpen, h: ['It is dim. Two candles stand on the prayer table.', 'Select the matches, then tap a candle.'] },
    { done: f => f.readInscr || f.panelOpen, h: ['Something was once written under the Sacred Heart picture. The candlelight might bring it out.', 'Walk up to the wall and tap the red letters. They say SING IT BACK.'] },
    { done: f => f.panelOpen, get h() { const b = PZ().box; return ['The harmonium on the east wall takes three symbols, like the little door in Tobi’s room.', 'Think of the music box: ' + listWords(b) + '. The wall said to sing it back.', 'Backwards: ' + listWords(b.slice().reverse()) + '.']; } },
    { done: f => f.gotRope || has('rope') || f.trapOpen, h: ['Something clicked open on the east wall, nearer the door. A small cupboard.', 'Tap the rope inside the cupboard.'] },
    { done: f => f.trapOpen, h: ['There is a hatch in the ceiling. Look up. An iron ring hangs from it, out of reach.', 'Select the rope, then tap the hatch.'] },
    { done: f => f.gotCloth || has('whitecloth'), h: ['Before you go up: Mama’s white cloth on the prayer table. Somebody will need covering tonight.', 'Tap the prayer table until you take the white cloth.'] },
    { done: () => false, h: ['A ladder hangs open. Tap the hatch to climb.'] }
  ],
  attic: [
    { done: f => f.wiped || has('rag'), h: ['The tall mirror is caked in dust. You need cloth.', 'Tap the Ankara wrapper on the right-hand side to tear off a strip.'] },
    { done: f => f.wiped, h: ['Select the strip of wrapper, then tap the mirror.'] },
    { done: f => f.readMirror, h: ['Tap the clean mirror and read what it shows.'] },
    { done: f => f.banished, get h() { return ['Light the four candles on the table under the window with the matches, in the order the mirror gives.', 'Bone is white, blood is red, the sea is blue, the grave is green.', 'The order is ' + listWords(PZ().candles) + '.']; } },
    { done: f => f.windowOpen, h: ['Wait a moment while the boards fall away.'] },
    { done: f => f.barsOpen, h: ['Behind the boards there are burglary-proof bars, with a four-number padlock: the night she ran, day and month.', 'You have seen that night twice: circled on the calendar in the Living Room, and on the last page of Papa’s diary.', '14 October: 1 4 1 0.'] },
    { done: () => false, h: ['Tap the window to climb out onto the roof.'] }
  ],
  roof: [
    { done: f => f.atChimney, h: ['Run to the chimney at the far end of the roof. Do not stop, and do not let him reach you.', 'Go round the black water tank and the loose zinc sheet. Walk straight up to the bricks.'] },
    { done: f => f.bricksOut, h: ['The bricks at the bottom of the chimney are newer than the rest.', 'Select the mason’s hammer, then tap the chimney. Keep tapping.'] },
    { done: f => f.covered, h: ['He deserves to be covered with something clean.', 'Select Mama’s white cloth, then tap the opening in the chimney.'] },
    { done: () => false, h: ['Give him back his name. It was on the card in the boys’ quarters.', 'Tap the chimney and say his name: Effiong Etim.'] }
  ]
};
/* Hints: the first note in every room is free. After that the next one comes back to you after a short wait,
   or straight away if you choose to watch a short ad (only where ads can actually play). */
const HINT_WAIT = 45;
let hintGateT = 0;
function openHint() {
  const read = G.f.hintsRead || 0, left = Math.ceil(HINT_WAIT - (Date.now() - (G.hintAt || 0)) / 1000);
  if (read === 0 || left <= 0) return showHint();
  const canAd = adsCanReward();
  openModal(`<div class="fold hintgate"><div class="fold-k">Mama’s voice, in your head</div>
      <p>The next note is still coming back to you.</p><div class="hwait"><b id="hwT">0:${String(left).padStart(2, '0')}</b><small>until you remember it</small></div></div>
      <div class="row">${canAd ? `<button class="btn" data-ad>${AD_ICON} Watch a short ad to read it now</button>` : ''}<button class="btn" data-x>Keep looking</button></div>
      <p class="msg" id="hwMsg" aria-live="polite"></p>`, { cls: 'note' });
  clearInterval(hintGateT);
  hintGateT = setInterval(() => {
    const el = $('#hwT'); if (!el) { clearInterval(hintGateT); return; }
    const l = Math.ceil(HINT_WAIT - (Date.now() - (G.hintAt || 0)) / 1000);
    if (l <= 0) { clearInterval(hintGateT); closeModal(); showHint(); return; }
    el.textContent = '0:' + String(l).padStart(2, '0');
  }, 250);
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) { clearInterval(hintGateT); closeModal(); }
    else if (e.target.closest('[data-ad]')) {
      const b = e.target.closest('[data-ad]'); b.disabled = true;
      rewardedAd(() => { clearInterval(hintGateT); closeModal(); G.hintAt = 0; Snd.chime(); showHint(); },
        () => { b.remove(); const m = $('#hwMsg'); if (m) m.textContent = 'No ad is available right now. The note will come back to you soon.'; });
    }
  };
}
function showHint() {
  G.f.hintsRead = (G.f.hintsRead || 0) + 1; G.hintAt = Date.now(); queueSave();
  const key = ROOMS[G.room].key, list = STEPS[key] || [];
  let idx = list.findIndex(s => !s.done(G.f));
  const miss = missingPages(key);
  let s, hkey;
  if ((idx < 0 || idx === list.length - 1) && miss.length) {
    s = { h: [`${miss.length === 1 ? 'A memory page is' : miss.length + ' memory pages are'} still hidden in this room. Not every thing in the house is only scenery.`, `Look closely at ${miss[0].where}.`] };
    hkey = key + ':pg' + miss[0].id;
  } else {
    if (idx < 0) idx = list.length - 1;
    s = list[idx]; hkey = key + ':' + idx;
  }
  const lv = G.hintLv[hkey] || 0;
  const text = s.h[Math.min(lv, s.h.length - 1)];
  G.hintLv[hkey] = Math.min(lv + 1, s.h.length);
  if (lv === 0 || lv < s.h.length) G.hints++;
  const more = lv + 1 < s.h.length;
  openModal(`<div class="fold"><div class="fold-k">Mama’s voice, in your head</div><p>${text}</p><div class="sig">— Mama</div></div>
    <div class="row"><button class="btn" data-x>Fold it away</button>${more ? '<button class="btn primary" data-more>Read further</button>' : ''}</div>`, { cls: 'note' });
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) closeModal();
    else if (e.target.closest('[data-more]')) { closeModal(); openHint(); }
  };
}

/* ---------- 3D view, movement and touch controls ---------- */
const REACH = 3.4;
let glOK = false;
const redraw = () => { if (Rm) Rm.api.apply(G.f); };
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys = {}, joy = { x: 0, y: 0 };
const canAct = () => G.started && !G.paused && !G.busy && !G.over && !modalOpen();

let lastTs = 0, stepAcc = 0, bobPh = 0, aimT = 0;
function move(dt) {
  const cam = G.cam;
  let jx = joy.x, jy = joy.y;
  if (keys.KeyW || keys.ArrowUp) jy += 1;
  if (keys.KeyS || keys.ArrowDown) jy -= 1;
  if (keys.KeyD) jx += 1;
  if (keys.KeyA) jx -= 1;
  if (keys.ArrowLeft) cam.yaw -= 1.8 * dt;
  if (keys.ArrowRight) cam.yaw += 1.8 * dt;
  const shook = shaken();
  if (shook && !reduceMotion) { const tt = performance.now() / 1000; cam.yaw += Math.sin(tt * 1.7) * .12 * dt; cam.pitch += Math.sin(tt * 2.3) * .06 * dt; }
  const eye = CH.hidden ? .8 : 1.6;
  if (frozen()) { cam.pos[1] += (eye - cam.pos[1]) * Math.min(1, dt * 8); return; }
  const m = Math.hypot(jx, jy);
  if (m < .06) { cam.pos[1] += (eye - cam.pos[1]) * Math.min(1, dt * 8); return; }
  const k = Math.min(1, m);
  jx /= m; jy /= m;
  const sp = 2.0 * k * dt * (shook ? .45 : 1), s = Math.sin(cam.yaw), c = Math.cos(cam.yaw);
  const dx = (s * jy + c * jx) * sp, dz = (-c * jy + s * jx) * sp;
  R3.collide(cam.pos, dx, dz, .3, Rm.sc);
  const d = Math.hypot(dx, dz);
  stepAcc += d; bobPh += d;
  if (stepAcc > .62) { stepAcc = 0; Snd.step(); }
  cam.pos[1] = 1.6 + (reduceMotion ? 0 : Math.sin(bobPh * 7) * .012);
}

let manualClock = false; // debug: the trailer recorder steps the game one exact frame at a time
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (ts - lastTs) / 1000 || .016);
  lastTs = ts;
  if (manualClock) return;
  frameStep(dt);
}
function frameStep(dt) {
  if (!glOK || !Rm || document.hidden || R3.lost || !G.started) return;
  for (let i = fx.length - 1; i >= 0; i--) if (fx[i](dt) === false) fx.splice(i, 1);
  const cam = G.cam, sc = Rm.sc;
  if (canAct()) { move(dt); checkZones(); checkExitWalk(); watchPerf(dt); checkTree(); }
  const pp = sc.player.p || (sc.player.p = [0, 0, 0]); pp[0] = cam.pos[0] + Math.sin(cam.yaw) * .25; pp[1] = 1.5; pp[2] = cam.pos[2] - Math.cos(cam.yaw) * .25;
  R3.update(sc, cam, dt);
  R3.render(sc, cam);
  aimT += dt;
  if (aimT > .14) { aimT = 0; updateAim(); }
}

function updateAim() {
  const aim = $('#aim'), ret = $('#reticle');
  let label = '';
  if (canAct()) {
    const h = R3.pick(Rm.sc, G.cam, 0, 0);
    if (h && h.t <= REACH && LABELS[h.id]) {
      label = LABELS[h.id];
      const t = TAPS[h.id];
      if (G.sel && t && t.use && t.use[G.sel]) label = G.lang === 'pcm' ? 'Use ' + ITEMS[G.sel].name.toLowerCase() + ' for ' + tr(label).toLowerCase() : 'Use ' + ITEMS[G.sel].name.toLowerCase() + ' on ' + label.toLowerCase();
    }
  }
  if (aim.textContent !== label) aim.textContent = label;
  aim.classList.toggle('on', !!label);
  ret.classList.toggle('hot', !!label);
  useBtn.classList.toggle('hot', !!label);
}

function tapAt(cx, cy) {
  if (!Rm || !canAct()) return;
  const r = glEl.getBoundingClientRect();
  const fxEl = document.createElement('div');
  fxEl.className = 'tapfx'; fxEl.style.left = (cx - r.left) + 'px'; fxEl.style.top = (cy - r.top) + 'px';
  stage.appendChild(fxEl); setTimeout(() => fxEl.remove(), 480);
  const hit = R3.pick(Rm.sc, G.cam, (cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
  if (!hit) return;
  if (hit.t > REACH) { say('Too far away. Walk closer.', 1800); return; }
  tap(hit.id);
}

/* ---- look and tap: one finger on the view ---- */
const look = { id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0, moved: false };
glEl.addEventListener('pointerdown', e => {
  if (look.id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
  Snd.init();
  look.id = e.pointerId; look.x = look.sx = e.clientX; look.y = look.sy = e.clientY; look.t = performance.now(); look.moved = false;
  try { glEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
});
glEl.addEventListener('pointermove', e => {
  if (e.pointerId !== look.id) return;
  const dx = e.clientX - look.x, dy = e.clientY - look.y;
  look.x = e.clientX; look.y = e.clientY;
  if (!look.moved && Math.hypot(e.clientX - look.sx, e.clientY - look.sy) > 7) look.moved = true;
  if (look.moved && canAct()) {
    const k = LOOK_SPD[G.look] || 1;
    G.cam.yaw += dx * .0062 * k;
    G.cam.pitch = clamp(G.cam.pitch - dy * .005 * k, -1.15, 1.15);
  }
});
const endLook = e => {
  if (e.pointerId !== look.id) return;
  const wasTap = !look.moved && e.type === 'pointerup' && performance.now() - look.t < 520;
  look.id = null;
  if (wasTap) tapAt(e.clientX, e.clientY);
};
glEl.addEventListener('pointerup', endLook);
glEl.addEventListener('pointercancel', endLook);
glEl.addEventListener('contextmenu', e => e.preventDefault());

/* ---- walk stick: fixed in the bottom-left corner. Only a thumb on the stick walks; a tap there does nothing else ---- */
const joyEl = $('#joy'), knob = $('#joyKnob'), joyZone = $('#joyZone');
let joyId = null, joyCx = 0, joyCy = 0;
const JOY_R = () => joyEl.offsetWidth / 2 - 6;
function joyMove(e) {
  const R = JOY_R();
  let dx = e.clientX - joyCx, dy = e.clientY - joyCy;
  const l = Math.hypot(dx, dy);
  if (l > R) { dx *= R / l; dy *= R / l; }
  const m = Math.min(1, Math.hypot(dx, dy) / R), dead = .12, k = m < dead ? 0 : (m - dead) / (1 - dead);
  const a = Math.atan2(dy, dx);
  joy.x = Math.cos(a) * k; joy.y = -Math.sin(a) * k;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}
function joyReset() { try { joyId = null; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('live'); } catch (e) { /* not built yet */ } }
joyZone.addEventListener('pointerdown', e => {
  // a new thumb on the stick always takes it over: if a finger's lift was ever lost (a pop-up opening under it,
  // a call coming in), the stick must never stay "held" by a finger that is no longer there
  if (joyId !== null && joyId !== e.pointerId) joyReset();
  joyId = e.pointerId; Snd.init();
  const r = joyEl.getBoundingClientRect(); joyCx = r.left + r.width / 2; joyCy = r.top + r.height / 2;
  joyEl.classList.add('live');
  try { joyZone.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  joyMove(e); e.preventDefault();
});
joyZone.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyMove(e); });
const joyEnd = e => {
  if (e.pointerId !== joyId) return;
  joyId = null; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('live');
  e.preventDefault();
};
joyZone.addEventListener('pointerup', joyEnd);
joyZone.addEventListener('pointercancel', joyEnd);
joyZone.addEventListener('lostpointercapture', joyEnd);
window.addEventListener('pointerup', e => { if (e.pointerId === joyId) joyReset(); }, true);
document.addEventListener('visibilitychange', joyReset);
joyZone.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });

/* ---- the Use button: acts on whatever is under the dot ---- */
const useBtn = $('#useBtn');
useBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Snd.init(); useBtn.classList.remove('press'); void useBtn.offsetWidth; useBtn.classList.add('press'); });
useBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
useBtn.addEventListener('pointerup', e => {
  e.preventDefault(); e.stopPropagation();
  if (!Rm || !canAct()) return;
  const h = R3.pick(Rm.sc, G.cam, 0, 0);
  if (!h || !LABELS[h.id]) { say('Nothing there. Turn until the dot glows on something.', 2200); return; }
  if (h.t > REACH) { say('Too far away. Walk closer.', 1800); return; }
  tap(h.id);
});

/* ---- either way up works; sideways is suggested ---- */
const LOOK_SPD = { slow: .65, normal: 1, fast: 1.45 };
/* graphics: Auto starts on High and drops to Low by itself if the phone struggles */
G.gfx = store.get('oc_gfx') || 'auto';
// on Auto, phones with little memory or few cores start on Low straight away instead of stuttering first
G.autoLow = ((navigator.deviceMemory || 8) <= 3 || (navigator.hardwareConcurrency || 8) <= 4) && isTouchNow();
function isTouchNow() { return !!(window.matchMedia && matchMedia('(pointer: coarse)').matches); }
const applyGfx = () => R3.setQuality(G.gfx === 'low' || (G.gfx === 'auto' && G.autoLow) ? 'low' : 'high');
let perfT = 0, perfN = 0, perfSum = 0;
function watchPerf(dt) {
  if (G.gfx !== 'auto' || G.autoLow) return;
  perfT += dt; perfN++; perfSum += dt;
  if (perfT > 4) {
    if (perfSum / perfN > .045) { G.autoLow = true; applyGfx(); say('Your phone was struggling, so the graphics are now set to Low. You can change this in the menu.', 5200); }
    perfT = perfN = perfSum = 0;
  }
}
G.look = store.get('oc_look') || 'normal';
const isTouch = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
let rotShown = false;
function checkOrient() { // landscape is suggested once per session, never forced
  const portrait = isTouch() && window.innerHeight > window.innerWidth;
  document.body.classList.toggle('portrait', portrait);
  if (!portrait) { hideRot(); return; }
  if (!rotShown && G.started && store.get('oc_upright') !== '1') { rotShown = true; document.body.classList.add('needrot'); joy.x = joy.y = 0; }
}
function hideRot() { document.body.classList.remove('needrot'); }
$('#rotSide').addEventListener('click', () => { goLandscape(true); hideRot(); });
$('#rotUp').addEventListener('click', () => { hideRot(); });
$('#rotAlways').addEventListener('click', () => { store.set('oc_upright', '1'); hideRot(); });
window.addEventListener('resize', checkOrient);
window.addEventListener('orientationchange', () => setTimeout(checkOrient, 120));
function goLandscape(lockIt = false) { // only works from a tap; quietly does nothing where it isn't allowed
  if (!isTouch()) return;
  try {
    const el = document.documentElement, lock = () => { try { const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed */ } };
    if (!document.fullscreenElement && el.requestFullscreen) { const p = el.requestFullscreen({ navigationUI: 'hide' }); if (p && p.then) p.then(lockIt ? lock : () => {}, () => {}); } else if (lockIt) lock();
  } catch (e) { /* not allowed */ }
}

/* ---- keyboard (desktop) ---- */
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if ((e.code === 'KeyE' || e.code === 'Space') && Rm && canAct()) {
    const r = glEl.getBoundingClientRect(); tapAt(r.left + r.width / 2, r.top + r.height / 2); e.preventDefault();
  }
  if (e.code.startsWith('Arrow') && G.started) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; joy.x = joy.y = 0; });

/* ---------- interactions ---------- */
function tap(id) {
  if (PRES.on) { visitTap(id); return; }
  if (CH.hidden) { if (CH.on || chasePending()) say('Not yet. It is still out there.', 1800); else unhide(); return; }   // inside a hiding place, any tap is “climb out” once it is safe
  if (!G.started || G.busy || G.over || modalOpen()) return;
  Snd.init();
  const h = TAPS[id];
  if (!h) return;
  Snd.tap();
  const s = G.sel;
  if (s && h.use && h.use[s]) h.use[s]();
  else if (h.tap) h.tap();
  queueSave();
}

/* leaving a room is one-way, so warn when memory pages are still lying about */
/* go through the door a moment from now, but only from this same room: a second tap on the open
   door must never let the old timer push you through the next room's door as well */
function leaveSoon(ms) { const r = G.room, tk = G.token; setTimeout(() => { if (G.room === r && G.token === tk) goNext(); }, ms); }
/* things a later room needs: the door will not let you through without them, so nobody reaches the roof empty-handed */
const NEEDED = {
  cellar: [{ id: 'hammer', where: 'It is in the red toolbox on the workbench.' }],
  chapel: [{ id: 'whitecloth', where: 'It is on Mama’s prayer table. Tap the table again.' }]
};
function missingItems() {
  return (NEEDED[ROOMS[G.room].key] || []).filter(n => !has(n.id) && G.dropped !== n.id);
}
/* an exit you've already opened: walk up to it and you go through (the usual "pages left" and "you'll need this" checks still ask first) */
const EXIT_OPEN = { door: f => f.doorOpen, ndoor: f => f.doorOpen, kdoor: f => f.doorOpen, cdoor: f => f.padOpen && f.keyUsed, chdoor: f => f.doorOpen, trap: f => f.trapOpen, atticwin: f => f.windowOpen && f.barsOpen };
let exitAt = null;   // { room, id, x, z } of this room's open exit
let exitAskedAt = 0;
function checkExitWalk() {
  if (!Rm || G.f.left || G.f.asking || G.ending) return;
  const now = performance.now();
  if (!exitAt || exitAt.room !== G.token || (!exitAt.id && now - exitAt.at > 1000)) {   // look again now and then: some exits only appear later
    exitAt = { room: G.token, id: null, at: now };
    const ns = Rm.sc.pick.filter(n => EXIT_OPEN[n._hid]);   // a door's parts take their name from the door they belong to
    if (ns.length) { const id = ns[0]._hid, mine = ns.filter(n => n._hid === id); Object.assign(exitAt, { id, x: mine.reduce((a, n) => a + n.world[12], 0) / mine.length, z: mine.reduce((a, n) => a + n.world[14], 0) / mine.length }); }
  }
  if (!exitAt.id || !EXIT_OPEN[exitAt.id](G.f)) return;
  const p = G.cam.pos, d = Math.hypot(p[0] - exitAt.x, p[2] - exitAt.z);
  const closer = exitAt.pd != null && d < exitAt.pd - .0005; exitAt.pd = d;
  // walking toward an exit you have opened takes you through; after a "Before you go" it waits until you step back or a few seconds pass
  if (d > 1.5 || now - (exitAskedAt) > 3500) G.f.exitArmed = true;
  if (d < 1.2 && closer && G.f.exitArmed && !modalOpen()) { G.f.exitArmed = false; exitAskedAt = now; goNext(); }
}
function goNext() {
  if (G.f.left || G.f.asking || G.over) return;
  const need = missingItems();
  if (need.length) {
    const n = need[0];
    Snd.wrong();
    openModal(`<h2>Not yet</h2><p class="lead">Something in this room still has to come with you: the ${ITEMS[n.id].name.toLowerCase()}. You will need it later, and you cannot come back once you go through.</p><p>${n.where}</p>`, { dismiss: true });
    return;
  }
  const miss = missingPages();
  if (miss.length && !G.f.leaveOK) {
    G.f.asking = true;
    openModal(`<h2>Before you go</h2><p class="lead">${miss.length === 1 ? 'There is 1 memory page' : 'There are ' + miss.length + ' memory pages'} you have not found in this room. You cannot come back once you go through.</p>
      <div class="col"><button class="btn primary" data-stay>Keep looking</button><button class="btn" data-go>Leave anyway</button></div>`, { dismiss: false });
    panel.onclick = e => {
      if (e.target.closest('[data-stay]')) { closeModal(); G.f.asking = false; }
      else if (e.target.closest('[data-go]')) { closeModal(); G.f.asking = false; G.f.leaveOK = true; goNext(); }
    };
    return;
  }
  G.f.left = true;
  if (G.room >= ROOMS.length - 1) return finale();
  enterRoom(G.room + 1);
}
const SYM_NOTE = { star: 659.25, moon: 523.25, sun: 392 }, SYM_AT = { star: 0, moon: 1, sun: 2 };
function playBox(first) {
  const order = PZ().box;
  G.busy = true;
  say(first ? 'A lullaby begins. Three symbols light up in turn.' : 'The box plays its three notes again.', 4200);
  [0, 1, 2].forEach(i => {
    const sym = order[i];
    setTimeout(() => { Snd.note(SYM_NOTE[sym]); if (Rm && Rm.api.mbLight) Rm.api.mbLight(SYM_AT[sym], true); }, 300 + i * 800);
    setTimeout(() => { if (Rm && Rm.api.mbLight) Rm.api.mbLight(SYM_AT[sym], false); }, 300 + i * 800 + 700);
  });
  setTimeout(() => {
    G.busy = false;
    addJournal('lullaby', 'The music box', 'It played three symbols in order:\n' + listWords(order) + '.');
    if (first) { say('A ' + order[0] + ', a ' + order[1] + ', a ' + order[2] + '. You write it down.', 4200); addDread(-14); }
  }, 300 + 3 * 800 + 300);
}
function checkCellarDoor() {
  if (G.f.padOpen && G.f.keyUsed && G.f.coffinOpen && !G.f.chaseDone) { if (!CH.on) cellarChase(); return; }   // he comes before you can leave
  if (G.f.padOpen && G.f.keyUsed) {
    Snd.open(); addDread(-25); redraw();
    say('Both locks give. The door opens onto the yard, and the back stair of the main house, climbing toward lamp oil and leather.');
    leaveSoon(2300);
  }
}
function lightCandle(c) {
  const SEQ = PZ().candles;
  const lit = G.f.lit = G.f.lit || [];
  if (lit.includes(c)) return say('The ' + c + ' candle is already burning.');
  if (c === SEQ[lit.length]) {
    lit.push(c); Snd.flame(); redraw(); addDread(-6);
    if (lit.length === SEQ.length) banish();
    else say('The ' + c + ' candle catches. The air gets colder.');
  } else {
    G.f.lit = []; Snd.snuff(); redraw();
    say('The flames gutter and die at once. A cold breath on your neck.'); speak('m_candles');
    addDread(12); scare('shade');
  }
}
function candleHandler(c) {
  return {
    tap() { say((G.f.lit || []).includes(c) ? 'The ' + c + ' candle burns steady.' : 'A ' + c + ' candle, unlit. You need a flame.'); },
    use: { matches() { lightCandle(c); } }
  };
}
function banish() {
  G.f.banished = true; G.busy = true; G.dread = 0; updDread();
  Snd.whisper();
  say('All four flames stand straight, then lean toward the window. For a moment Mama is there, young, in her green gele, the way she was the night she ran. She looks at the window, not at you, and fades. Only a memory. The house keeps those too.', 8000);
  const sc = Rm.sc, lady = sc.lady, glow = sc.ladyGlow;
  lady.vis = glow.vis = true; let t = 0;
  fx.push(dt => {
    t += dt;
    const a = t < .8 ? t / .8 : t > 3.4 ? Math.max(0, 1 - (t - 3.4) / .9) : 1;
    lady.alpha = .92 * a; glow.alpha = .38 * a; lady.pos[1] = 1.15 + Math.sin(t * 1.2) * .04;
    if (t > 4.3) { lady.vis = glow.vis = false; return false; }
    return true;
  });
  after(4400, () => {
    G.busy = false; G.f.windowOpen = true; Snd.open(); redraw();
    say('The boards fall away on their own. Cold air, and the smell of rain. Behind them, burglary-proof bars, and a padlock.', 6000);
  });
}

/* the kitchen jars: flour, salt, sugar, in that order */
function jar(id, name) {
  return {
    tap() {
      if (!G.f.rangeLit) return say('A glass jar. The label is too faded to make out in this light.');
      say(name === 'garri' ? 'Garri.' : { flour: 'Flour, gone grey and solid.', salt: 'Salt, wept into one damp lump.', sugar: 'Sugar. Ants got into it decades ago and never left.', tea: 'Lipton tea, the yellow label faded white.', rice: 'Rice, crawling with weevils so old they are dust.' }[name] || 'A jar.');
    }
  };
}

const TAPS = {
  dropped: { tap() { pickDropped(); } },
  hidedrum: { tap() { if (CH.hidden) { if (CH.on || chasePending()) say('Not yet. It is still out there.', 1800); else unhide(); } else hideIn([-2.45, -2.35], 'water drum'); } },
  tree: {
    tap() {
      if (!G.f.atChimney) return say('The chimney. Get closer.');
      if (!G.f.bricksOut) return say(has('hammer') ? 'The new bricks at the bottom. Select the mason’s hammer, then tap the chimney.' : 'The new bricks at the bottom. You need something heavy.');
      if (!G.f.covered) return say(has('whitecloth') ? 'He deserves to be covered with something clean. Select Mama’s white cloth.' : 'He deserves to be covered with something clean.');
      nameHim();
    },
    use: { hammer() { hitChimney(); }, whitecloth() { coverHim(); } }
  },
  famPaint: {
    tap() {
      say(G.f.gotIronKey
        ? 'The family, 1972, in oils. The black paint over the driver’s face has flaked away. Effiong is smiling at the baby, not at the painter. You were the baby.'
        : 'The family, 1972, in oils: Papa standing, proud; Mama seated with a baby in her lap; and at the very edge, a young man in a driver’s cap. Someone has painted over his face in thick black, many times.', 6500);
    }
  },
  tobiPaint: { tap() { say(G.f.wd ? 'Mama and a small boy, in oils. She is weeping now, and looking straight at you. The paint of her tears is wet.' : 'Mama and a small boy in a yellow shirt, in oils. He is laughing. She is looking at him the way nobody has looked at you since.', 6000); } },
  wedPaint: { tap() { say(G.f.readMirror ? 'The wedding, 1970. They have turned away from each other, and someone has scratched at his face until the canvas shows through.' : 'A wedding in oils, 1970: a young man in a borrowed suit, a young woman in white, laughing at each other so hard the painter must have laughed too.', 6000); } },
  roofhammer: { tap() { pickup('hammer', 'A mason’s hammer by the window, left on the roof twenty-two years ago. Old cement on the head.'); redraw(); } },
  roofcloth: { tap() { pickup('whitecloth', 'A white bedsheet blown up from somebody’s line, caught on a nail. Clean enough.'); redraw(); } },
  cowrie: { tap() { takeCowrie(); } },
  /* ---- Foyer ---- */
  coat: {
    tap() {
      if (!G.f.gotMatches && !has('matches')) { G.f.gotMatches = true; pickup('matches', 'Heavy white cloth, stiff with embroidery. In the deep pocket: a matchbox from a Lagos hotel. The tailor’s tag inside the neck says: CHIEF O. ADELEKE.'); }
      else say('Lint, an old one-naira note from 1975, and cold air. Nothing else in the pockets.');
    }
  },
  sconce: { tap() { say('A bush lamp hanging on a nail. The glass is warm, but there is no kerosene in it at all.'); } },
  fan: { tap() { say('The ceiling fan turns and turns. You only switched on the breaker an hour ago. It was turning before that.'); if (Rm.api.fanSpeed) { Rm.api.fanSpeed(4); Snd.whisper(); setTimeout(() => Rm.api.fanSpeed && Rm.api.fanSpeed(.9), 2500); } } },
  calendar: {
    tap() {
      addJournal('calendar', 'The calendar in the Living Room', 'October 1975. The 14th is circled so hard the biro went through the paper. Beside it, in Papa’s hand: 7:20.\n\nDay 14, month 10. Tonight is the 14th as well.');
      Snd.tick();
      // October 1975 began on a Wednesday
      const cells = Array(3).fill('<i></i>').concat(Array.from({ length: 31 }, (_, d) => `<span class="${d === 13 ? 'ring' : ''}">${d + 1}${d === 13 ? '<em>7:20</em>' : ''}</span>`));
      openModal(`<div class="calpage"><div class="calbank">UNION BANK OF NIGERIA · IBADAN</div><h3>OCTOBER <small>1975</small></h3>
        <div class="calgrid">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<b>${d}</b>`).join('')}${cells.join('')}</div>
        <p class="calnote">The 14th is circled so hard the biro went through the paper.</p></div>
        <div class="col"><button class="btn primary" data-x>Close</button></div>`, { cls: 'note' });
      panel.onclick = e => { if (e.target.closest('[data-x]')) { closeModal(); say('The fourteenth of October, 1975. The night Mama ran. Twenty-two years ago tonight, to the minute. You will not forget the date.', 5200); } };
    }
  },
  door: {
    tap() {
      if (G.f.doorOpen) return goNext();
      Snd.wrong(); say('The door to the hall. Locked, and the keyhole is old iron. Somewhere behind it, slippers are shuffling in circles.');
    },
    use: {
      ironkey() {
        take('ironkey'); G.f.doorOpen = true; Snd.unlock(); redraw(); addDread(-20);
        say('The key grinds in the lock. The hall door yawns open on cold air and a smell of baby powder.');
        leaveSoon(2300);
      }
    }
  },
  window1: { tap() { say('Burglary-proof bars, rusted solid. Down the hill, the lights of Oke-Ọla. For a moment a long grey hand presses flat against the glass. Then nothing.'); if (!G.f.w1) { G.f.w1 = true; scare('shade'); } } },
  chair: { tap() { say('A cushion chair under lace covers. The cushion is dented. It is still warm.'); } },
  hearth: { tap() { say('A big box television with a lace cover. It is not plugged in, but the screen is full of snow. For one moment there is a face in it, wearing a driver’s cap.'); if (Rm.api.tvFace) { Rm.api.tvFace(true); Snd.heartbeat(); setTimeout(() => Rm.api.tvFace && Rm.api.tvFace(false), 600); } } },
  mantel: {
    tap() {
      G.f.readNote = true;
      note('mantel', 'Paper under the lace', 'Every clock stopped the moment it came for him.\nAll but the big one. It ran on until I slammed the door behind us.\nThe drawer remembers that minute.\nSo do I.', true);
    }
  },
  portrait: {
    tap() {
      if (G.f.portraitOpen) return say('The painted eyes are closed now. She looks almost peaceful, the way she never did in this house.');
      say('An oil painting of Mama at twenty-five, in a green gele. She is smiling, but the painter caught something tired in her eyes. Her throat is bare: a dotted line where her coral beads should be.');
    },
    use: {
      locket() {
        take('locket'); G.f.portraitOpen = true; Snd.unlock(); redraw(); addDread(-18);
        say('You lay the beads against the painting and they stay there, as if they were painted on. In the oil, her eyes close. The frame swings out on a hidden hinge.');
      }
    }
  },
  hollowkey: { tap() { G.f.gotIronKey = true; pickup('ironkey', 'A rusted iron key. Heavier than it should be.'); redraw(); } },
  clock: { tap() { G.f.sawClock = true; say('The big standing clock stopped at ' + clockWords() + '. Every other clock in the house says twenty past seven; this one ran on a little longer. The pendulum hangs dead still.'); } },
  drawer: {
    tap() {
      if (G.f.drawerOpen) return say('The drawer is open and the three dials sit slack.');
      codeLock({
        title: 'The drawer', sub: 'Three brass dials. Flick each one to a number.', digits: 3, code: clockCode(), skin: 'drawer',
        onOk() { G.f.drawerOpen = true; Snd.unlock(); redraw(); addDread(-18); say('The dials click. The drawer slides out on its own. Mama’s coral beads lie inside, the ones she wore to every wedding.'); after(3200, () => { scare('flicker'); flashback('F1'); }); }
      });
    }
  },
  locket_hs: { tap() { G.f.gotLocket = true; pickup('locket', 'Mama’s red coral beads, the big kind for occasions. Cold as river water.'); redraw(); } },
  vase: { tap() { say('Plastic flowers, faded to the colour of old teeth. One of them is real, and dead. Someone put it there recently.'); } },
  photo: { tap() { readPage('photo', 'A family photograph, Christmas 1972. Someone has scratched one face away.'); } },
  books: { tap() { readPage('notebook', 'Wedding plates nobody was allowed to eat from, glasses for visitors who never came. Behind them, something papery.'); } },

  /* ---- Nursery ---- */
  ndoor: {
    tap() {
      if (G.f.doorOpen) return goNext();
      symbolLock({
        title: 'The little door', sub: 'Three symbols, in the right order.', seq: PZ().box,
        onOk() { G.f.doorOpen = true; Snd.unlock(); redraw(); addDread(-20); say('The lock clicks. Behind the door a narrow back stair winds down toward the kitchen, and the smell of old palm oil.'); leaveSoon(2400); }
      });
    }
  },
  window2: { tap() { say('Outside, a tyre swing turns slowly on its rope. There is no wind. You remember being pushed on it.'); } },
  mobile: { tap() { say('Moon, sun, star, cut from tin. They turn slowly, and keep turning when you stop looking.'); } },
  toys: { tap() { say('A tin soldier salutes. Its painted face is wet. Beside it, a small wooden car, hand-carved, its wheels worn smooth.'); } },
  blocks: { tap() { say('The blocks spell T O B I. You nudge one and it straightens itself.'); } },
  chest: { tap() { say('The latch is rusted shut. From inside comes a small, patient knock.'); if (!G.f.chest) { G.f.chest = true; Snd.knock(3); } } },
  teddy: {
    tap() { say(G.f.teddyFixed ? 'The bear has both eyes now. Both of them look at you.' : 'One glass eye is missing. The other one watches you.'); },
    use: {
      button() {
        take('button'); G.f.teddyFixed = true; Snd.unlock(); give('windkey'); redraw(); addDread(-16);
        say('You sew the button on. The seam in its belly splits, and a small brass key clinks onto the shelf. You take it.');
      }
    }
  },
  horse: {
    tap() {
      if (!G.f.gotButton) { G.f.gotButton = true; pickup('button', 'It rocks by itself, the way it did when you were four. Something dark glints in its mane: a black button.'); redraw(); }
      else say('It rocks a little faster when you look away.');
    }
  },
  crib: { tap() { readPage('lullaby', 'Your cot. The mattress is dented, as if someone small was just lying here. It is colder than it should be.'); } },
  musicbox: {
    tap() {
      if (G.f.boxPlayed) return playBox(false);
      say('The box is wound down. There is a keyhole in its back.');
    },
    use: { windkey() { G.f.boxPlayed = true; Snd.unlock(); playBox(true); } }
  },
  wardrobe: {
    tap() {
      if (G.pages.includes('gown')) return say('Old newspaper and camphor balls. Nothing scratches now.');
      if (G.f.wd) return readPage('gown', 'The scratching has stopped. Under the old newspaper, something small is folded.');
      G.f.wd = true; Snd.knock(2);
      say('From inside, a soft scratching, and a small boy giggling. You open it anyway.');
      after(900, () => { scare('jump', { face: 'child' }); after(1500, () => { page('gown'); flashback('F2'); }); });
    }
  },

  /* ---- Kitchen ---- */
  range: {
    tap() {
      if (!G.f.rangeLit) return say(has('matches') ? 'An old gas cooker. When you turn a knob, a cylinder that should be empty hisses. A match might wake it.' : 'An old gas cooker, crusted with twenty-two years of soup.');
      readPage('burnt', 'The blue flame throws a low, steady light across the room.');
    },
    use: {
      matches() {
        if (G.f.rangeLit) return readPage('burnt', 'The cooker is already burning.');
        G.f.rangeLit = true; Snd.flame(); redraw(); addDread(-8);
        say('The burner catches with a soft whump and a ring of blue flame. Across the room, the jar labels come out of the dark.', 6000);
        after(1300, () => { Snd.kettle(); say('The kettle begins to scream.', 3200); });
        after(3000, () => scare('stander', { kind: 'kid', dist: 3.4, hold: 1.5 }));
        after(5200, () => { if (!modalOpen()) page('burnt'); });
      }
    }
  },
  kettle: { tap() { say(G.f.rangeLit ? 'It shrieks and shrieks. The lid is rusted shut, and nothing comes out of the spout.' : 'Cold, and heavier than it should be. Something sloshes inside.'); } },
  pots: { tap() { Snd.drop(); say('An enamel pot swings on its hook with a clang. Inside the biggest one, a crust of ofe onugbu, Mama’s bitter-leaf soup, twenty-two years old. The others sway, as if someone just brushed past.'); } },
  ktable: { tap() { readPage('household', 'The long table is laid for four: Papa, Mama, a high chair, and one plate set apart at the end, for the driver. Beside it, the kitchen book lies open.'); } },
  kchair: { tap() { say('The chair at the head of the table was pushed in. Now it isn’t.'); } },
  recipe: {
    tap() {
      G.f.readRecipe = true; redraw();
      const b = PZ().beat;
      note('recipe', 'Card by the back door', 'Sunday Pounded Yam\n\nPound it the way Madam taught you, or Oga will know.\n\n' + b.map(n => '●'.repeat(n)).join(' · ') + '\n' + b.map(n => Array(n).fill('kpam').join('-')).join(', ') + '\n\n(Never too fast. Never lumpy.)');
    }
  },
  jarFlour: jar('jarFlour', 'flour'), jarSalt: jar('jarSalt', 'salt'), jarSugar: jar('jarSugar', 'sugar'), jarTea: jar('jarTea', 'tea'), jarRice: jar('jarRice', 'rice'),
  pantry: { tap() { if (G.f.pantryOpen) say('The pantry stands open. A shelf of dead jars, and one hook.'); else { Snd.wrong(); say('The pantry door is latched from the inside, which should not be possible. Somewhere close, someone is waiting for food.'); } } },
  ckey: {
    tap() {
      G.f.gotCKey = true; pickup('cellarkey', 'The key to the boys’ quarters, on a nail. It is warm, as if someone has only just let go of it.'); redraw();
      after(900, () => scare('blackout', { kind: 'silas' }));
    }
  },
  kdoor: {
    tap() {
      if (G.f.doorOpen) return goNext();
      Snd.wrong(); say('The low door to the yard and the boys’ quarters. The keyhole is small and clean, as if it had been waiting.');
    },
    use: {
      cellarkey() {
        take('cellarkey'); G.f.doorOpen = true; Snd.unlock(); redraw(); addDread(-20);
        say('The key turns. Beyond the door, a few steps across the dark yard to the boys’ quarters, where Effiong used to sleep.');
        leaveSoon(2400);
      }
    }
  },
  kwindow: { tap() { say('Burglary-proof bars. In the compound, a tall bald figure in a raffia fringe stands under the mango tree, looking in. When you blink, it is only the clothes line.'); } },
  scullery: { tap() { say('The back door, nailed shut, board over board. The nails are twenty-two years old. Someone was very sure.'); } },
  block: { tap() { say('A cutlass rests on the chopping board, its edge bright. Someone still keeps it sharp.'); } },
  mortar: {
    tap() {
      if (G.f.pantryOpen) return say('The yam in the mortar is smooth now. Nobody is pounding any more.');
      mortarPuzzle({
        title: 'The mortar', sub: 'Cold yam in the bowl. The pestle is wet, as if someone just put it down.', pattern: PZ().beat,
        done: 'Smooth, not lumpy. Behind you, a latch lifts.',
        onOk() {
          G.f.pantryOpen = true; Snd.open(); redraw(); addDread(-12);
          say('You pound it the way Mama did, the way your hands somehow remember. Across the kitchen, the pantry latch lifts, and the door swings open by itself, as if the food has finally come.', 7000);
          after(3000, () => { scare('blackout', { kind: 'silas' }); flashback('F3'); });
        }
      });
    }
  },

  /* ---- Cellar ---- */
  lantern: {
    tap() { say('An old bush lamp on a nail. There is still kerosene sloshing in the tank. You need a flame.'); },
    use: {
      matches() {
        G.f.lanternLit = true; Snd.flame(); redraw(); addDread(-10);
        say('The wick catches behind the glass. The dark pulls back, but not far. You lift the bush lamp off its nail and carry it with you.', 7000);
      }
    }
  },
  padlock: {
    tap() {
      if (G.f.padOpen) return say('The padlock hangs open.');
      say(G.f.radioHeard ? 'A small padlock with a tiny keyhole. The voice said the key is where Papa never looked.' : 'A small padlock on the chain, with a tiny keyhole. No numbers, no dials. Just a keyhole.');
    },
    use: { padkey() { take('padkey'); G.f.padOpen = true; Snd.unlock(); redraw(); say('The little key turns. The padlock drops open on its chain.'); addDread(-10); checkCellarDoor(); } }
  },
  radio: {
    tap() {
      if (!G.f.lanternLit) return say('Something boxy on the bench, with a glass face. It is too dark to make out.');
      if (G.f.radioHeard) return say('Only static now. Whoever was speaking has gone.');
      radioPuzzle({
        title: 'The radio', sub: 'Effiong’s old Grundig valve radio. When you touch the knob, the valves begin to glow.',
        broadcast: [['ann', '“…Radio Nigeria, Ibadan. Police are still asking for news of Mr Effiong Etim, driver, of Oke-Ọla…”'],
          ['eff', '“Small driver. It’s me. The key to the padlock: I hid it where your father never looked, inside the bottles he poured for the dead and never drank.”'],
          ['eff', '“And when the box opens, don’t run. Hide.”']],
        keyLine: 1,
        onOk() {
          G.f.radioHeard = true; redraw(); addDread(-8);
          addJournal('radio', 'The voice on the radio', 'A young man’s voice, from Calabar. He called me “small driver”.\nThe padlock key: in the bottles Papa poured for the dead, and never drank.\nWhen the box opens, do not run. Hide.');
          queueSave();
        }
      });
    }
  },
  keyhole: {
    tap() { say(G.f.keyUsed ? 'The brass key sits in the lock.' : 'A keyhole as big as your thumb.'); },
    use: { brasskey() { take('brasskey'); G.f.keyUsed = true; Snd.unlock(); redraw(); say('The brass key turns with a groan.'); addDread(-10); checkCellarDoor(); } }
  },
  cdoor: {
    tap() {
      if (G.f.padOpen && G.f.keyUsed && !G.f.chaseDone) { if (!CH.on && !CH.hidden) cellarChase(); else say('Not now. Hide.', 1800); return; }
      if (G.f.padOpen && G.f.keyUsed) return goNext();
      say(G.f.padOpen ? 'One lock left: the big keyhole.' : G.f.keyUsed ? 'One lock left: the padlock.' : 'Two locks hold it shut: a padlock and a big keyhole.');
    }
  },
  cloth: {
    tap() {
      if (!G.f.gotRag) { G.f.gotRag = true; pickup('rag', 'Under the old wrapper: a strip torn from it, stiff with kerosene. You take it.'); redraw(); }
      else say('Just an old wrapper now.');
    }
  },
  toolbox: {
    tap() {
      if (!G.f.gotCrowbar) { G.f.gotCrowbar = true; give('hammer'); pickup('crowbar', 'The lid shrieks open. A crowbar, and under it a mason’s hammer crusted with old cement. You take both.'); redraw(); }
      else say('An empty toolbox. Its lid is still creaking.');
    }
  },
  skull: { tap() { say('A carved wooden mask, dark with age, its mouth open on small teeth, a fringe of dry raffia at the chin. An Ekpo mask, from Ikot Ekpene. It is facing the door. You are sure it was facing the wall.'); if (!G.f.mask) { G.f.mask = true; Snd.whisper(); } } },
  wine: {
    tap() {
      if (G.f.gotPadKey || G.f.padOpen) return say('Schnapps bottles for pouring libation, every one full. Papa poured for the dead, and never drank.');
      if (!G.f.lanternLit) return say('Rows of bottles. It is too dark to see more.');
      if (!G.f.radioHeard) return say('Schnapps bottles for pouring libation, dozens of them, every one still full. Something small rattles in one of them, but you cannot tell which. Effiong’s old radio on the workbench might know.');
      G.f.gotPadKey = true; pickup('padkey', 'One bottle rattles. You tip it, and a small key slides out into your palm on a trickle of old schnapps.'); redraw();
    }
  },
  coffin: {
    tap() {
      if (G.f.coffinOpen) return readPage('plate', 'The crate lies open. A driver’s cap, folded, and under it a card.');
      say('A long wooden crate, nailed shut and stencilled ADELEKE HOLDINGS: PERSONAL. Something inside shifts when you touch the lid.');
      if (!G.f.cf) { G.f.cf = true; Snd.thump(); scare('shade'); }
    },
    use: {
      crowbar() {
        G.f.coffinOpen = true; Snd.open(); give('brasskey'); redraw(); addDread(-14);
        say('The nails shriek out of the wood. Effiong’s things: his cap, his good shirt, a brass key on a string. Papa packed away a whole man.', 7000);
        scare('jump', { face: 'hands' }); after(1700, () => page('plate')); after(9000, cellarChase);
      }
    }
  },
  barrel: { tap() { readPage('letters', 'Palm wine kegs, dry as bone. Behind them, a rusty tin box.'); } },

  /* ---- Study ---- */
  lamp: {
    tap() { say(G.f.lampLit ? 'The hurricane lamp throws a pool of light across the desk.' : 'A hurricane lamp. The wick is dry, but the tank still smells of kerosene. You need a flame.'); },
    use: {
      matches() {
        if (G.f.lampLit) return say('The lamp is already burning.');
        G.f.lampLit = true; Snd.flame(); redraw(); addDread(-10);
        say('The lamp catches. Somewhere in the room a record player crackles to life and starts a Victor Olaiya highlife tune, far too slow.', 6500);
        Snd.gramo();
      }
    }
  },
  rosepic: {
    tap() {
      if (!G.f.lampLit) return say('A small framed photo. In this dark it is only a pale shape.');
      if (G.f.photoFixed) return say('The mended photograph: Papa in his blue fila, Mama in her green gele, and Effiong holding you on his shoulders. On the back: GARDEN, 1974. O., A., E. AND TOBI.');
      G.f.readRose = true;
      photoPuzzle({
        title: 'The smashed photograph', sub: 'Someone threw this at the wall. Turn the pieces back the right way up.',
        done: 'GARDEN, 1974. O., A., E. AND TOBI.',
        onOk() {
          G.f.photoFixed = true; redraw(); addDread(-10);
          addJournal('famphoto', 'The mended photograph', 'Garden, 1974. Papa in a white agbada and a blue fila. Mama in a green gele. Effiong in his driver’s cap, with small Tobi on his shoulders.\n\nOn the back: O., A., E. AND TOBI.');
          say('The last piece turns. A garden, 1974: Papa in his blue fila, Mama in her green gele, and Effiong with you on his shoulders. You are laughing. Behind you, the record player’s needle lifts by itself.', 7500);
          after(1200, () => Snd.gramo());
        }
      });
    }
  },
  sdrawer: {
    tap() {
      if (G.f.drawerOpen) return say('The drawer lies open.');
      if (!G.f.lampLit) return say('There is something brass on the front of the drawer. It is too dark to see what.');
      say('Locked. There is no keyhole and no dial, only a brass plate: FOR THOSE WHO REMEMBER WHO SAID WHAT.');
    }
  },
  chkey: {
    tap() {
      G.f.gotChKey = true; pickup('chapelkey', 'A black iron key, heavier than it looks. Two letters are scratched into the bow: A. A. Mama’s key.'); redraw();
      after(900, () => scare('blackout', { kind: 'silas' }));
    }
  },
  chdoor: {
    tap() {
      if (G.f.doorOpen) return goNext();
      Snd.wrong(); say('An iron-banded door, shorter than a man: the way to Mama’s prayer room. Cold air breathes through its keyhole.');
    },
    use: {
      chapelkey() {
        take('chapelkey'); G.f.doorOpen = true; Snd.unlock(); redraw(); addDread(-20);
        say('The key turns for the first time in twenty-two years. Beyond the door: candle smoke, and a long cold hush.');
        leaveSoon(2500);
      }
    }
  },
  diary: { tap() { readPage('diary', 'Papa’s handwriting, tight and furious. The last entry is blotted.'); after(600, () => speak('T03')); } },
  globe: { tap() { readPage('globe', 'The globe turns slowly under your hand, though you have not touched it. Something is folded inside the stand.'); } },
  sportrait: {
    tap() {
      say('Chief Olumide Adeleke in oils, in agbada and fila, one hand on a globe, the other on a stack of papers. The painter made him proud. The eyes follow you around the room, and they are wetter than paint.'); if (!G.f.helloPapa) { G.f.helloPapa = true; after(1400, () => speak('T07')); after(2600, () => flashback('F4')); }
      if (Rm.api.eyes) { Rm.api.eyes(true); Snd.heartbeat(); setTimeout(() => Rm.api.eyes && Rm.api.eyes(false), 1300); }
    }
  },
  shelf: { tap() { say('Leather spines, none lettered. Every other book is a ledger, and they come in pairs: one for the government, one for Papa.'); } },
  sfire: { tap() { say('A heavy iron safe. The dial is warm. From inside, very faint, something is knocking to be let out.'); Snd.knock(2); } },
  swindow: { tap() { say('The curtains are drawn almost shut. Down the hill, the hill road your father took from other people. Then one branch of the mango tree moves.'); } },
  gramo: {
    tap() {
      if (G.f.drawerOpen) { Snd.gramo(); return say('The record has run out. The needle hisses in the last groove.'); }
      if (!G.f.photoFixed) { Snd.gramo(); return say('A highlife record turns. Under the music, people are talking at a party, but the voices are too muddy to make out. Three notes of a lullaby you know, and then the needle skips.'); }
      voicePuzzle({
        title: 'The record player', sub: 'A party, recorded in this house. Three voices come up out of the crackle. Who said what?',
        done: 'The needle reaches the last groove. In the desk, a drawer slides open.',
        onOk() {
          G.f.drawerOpen = true; Snd.open(); redraw(); addDread(-14);
          say('The record plays through, every voice in its place. In the desk, the drawer slides out by itself. Something black lies inside.', 6500); scare('flicker'); after(4200, () => flashback('F4'));
        }
      });
    }
  },
  sback: { tap() { Snd.wrong(); say('The stair door locked itself behind you. There is no handle on this side.'); } },
  sarm: { tap() { say('Papa’s chair. The leather is warm. Someone has only just stood up.'); } },
  sdesk: { tap() { say('A heavy desk. Contracts squared into neat piles: CEMENT, 20,000 TONNES. Nothing on it is dusty.'); } },

  /* ---- Chapel ---- */
  acandle: {
    tap() { say(G.f.candlesLit ? 'The candles burn straight and steady.' : 'Two candles, unlit.'); },
    use: {
      matches() {
        if (G.f.candlesLit) return say('Both candles are already burning.');
        G.f.candlesLit = true; Snd.flame(); redraw(); addDread(-8);
        say('Both candles catch. Under the Sacred Heart picture, faint red letters bleed up through the whitewash.', 6000);
      }
    }
  },
  inscr: {
    tap() {
      if (!G.f.candlesLit) return say('Whitewash, scrubbed pale under the Sacred Heart picture, as if something was written here once and washed away.');
      G.f.readInscr = true;
      note('inscr', 'Under the Sacred Heart', 'SING IT BACK.', true);
    }
  },
  altar: {
    tap() {
      if (!G.pages.includes('prayer')) return readPage('prayer', 'Mama’s prayer table under a white cloth, a rosary, a Sacred Heart picture. The kneeler in front of it is worn through at one end.');
      if (!G.f.gotCloth && !has('whitecloth')) { G.f.gotCloth = true; pickup('whitecloth', 'You fold Mama’s white altar cloth and take it. Somebody in this house deserves to be covered with something clean.'); redraw(); }
      else say('Mama’s prayer table, bare now. The rosary is still warm.');
    }
  },
  lectern: { tap() { readPage('register', 'A Bible stand. The Bible is open at Psalm 91, and the margins are full.'); } },
  pews: { tap() { say('Two benches for family prayers. They all face the prayer table. You are sure they were facing you a moment ago.'); } },
  organ: {
    tap() {
      if (G.f.panelOpen) return say('The harmonium’s bellows tremble faintly, as if still holding a breath.');
      symbolLock({
        title: 'The harmonium', sub: 'Three keys are marked with symbols. Play a tune.', seq: PZ().box.slice().reverse(), skin: 'organ',
        fail: 'The harmonium coughs. Dust sifts out of the bellows.',
        onOk() {
          G.f.panelOpen = true; Snd.organ(); redraw(); addDread(-10);
          if (Rm.api.organGlow) { Rm.api.organGlow(true); setTimeout(() => Rm.api.organGlow && Rm.api.organGlow(false), 3800); }
          say('Mama’s lullaby, played backwards, louder than a harmonium should be. Across the room a small door clicks open.', 7000);
          after(2200, () => scare('eyes')); after(4200, () => flashback('F6'));
        }
      });
    }
  },
  opanel: { tap() { if (G.f.panelOpen) say('The cupboard stands open.'); else { Snd.wrong(); say('A little cupboard door beside the harmonium. It will not budge.'); } } },
  rope: {
    tap() {
      G.f.gotRope = true; pickup('rope', 'A coil of rope, thick as your wrist. Mama’s rope for the roof hatch, the way up to their bedroom.'); redraw();
      after(800, () => scare('runner'));
    }
  },
  trap: {
    tap() {
      if (G.f.trapOpen) return goNext();
      say(has('rope') ? 'An iron ring hangs from the hatch, far above your reach. The rope is long enough.' : 'A square hatch in the ceiling. An iron ring hangs from it, just out of reach.');
    },
    use: {
      rope() {
        take('rope'); G.f.trapOpen = true; Snd.open(); redraw(); addDread(-15);
        say('You loop the rope through the ring and pull. The hatch drops open, and a ladder unfolds to the floor. Up there is the room your parents slept in.', 6500);
      }
    }
  },
  cbdoor: { tap() { Snd.wrong(); say('The door you came in by. There is no handle on this side.'); } },

  /* ---- Attic ---- */
  mirror: {
    tap() {
      if (!G.f.wiped) return say('Mama’s dressing mirror, thick with dust. Your reflection is a smudge. There is another smudge behind it.');
      G.f.readMirror = true;
      const cw = PZ().candles.map(c => CANDLE_WORD[c]);
      note('mirror', 'In the mirror', 'FIRST THE ' + cw[0] + '.\nTHEN THE ' + cw[1] + '.\nTHEN THE ' + cw[2] + '.\nLAST THE ' + cw[3] + '.', true);
      flashback('F7');
    },
    use: {
      rag() {
        take('rag'); G.f.wiped = true; Snd.tap(); redraw(); addDread(-5);
        say('You wipe the glass in wide arcs. In the clean mirror, a note on the opposite wall reads clearly.');
      }
    }
  },
  trunk: { tap() { readPage('photo2', 'Mama’s iron trunk box, painted blue with red flowers. She left in too much of a hurry to take it.'); } },
  sheet: {
    tap() {
      if (!has('rag') && !G.f.wiped && !G.f.gotRag) { G.f.gotRag = true; pickup('rag', 'You tear a strip from the old Ankara wrapper. Something under it breathes out. It is only the draft.'); redraw(); }
      else say('An old Ankara wrapper thrown over something tall. Papa’s wardrobe, maybe. You decide not to lift it.');
    }
  },
  mirrornote: { tap() { say('The writing is backwards. You would need a mirror to read it.'); } },
  dolls: { tap() { say('Mama’s wig stands, with no wigs on them. Their painted faces all point at you. A moment ago, they didn’t.'); if (!G.f.dl) { G.f.dl = true; scare('shade'); } } },
  rchair: { tap() { readPage('shawl', 'Mama’s rocking chair. It rocks by itself, just a little, like someone just got up.'); } },
  cWhite: candleHandler('white'),
  cRed: candleHandler('red'),
  cBlue: candleHandler('blue'),
  cGreen: candleHandler('green'),
  atticwin: {
    tap() {
      if (G.f.windowOpen && G.f.barsOpen) return goNext();
      if (G.f.windowOpen) {
        return codeLock({
          title: 'Burglary-proof bars', sub: 'Scratched into the metal: THE NIGHT SHE RAN. Day, then month: _ _ / _ _', digits: 4, code: '1410', skin: 'padlock',
          failMsg: n => n === 1 ? 'Rust grinds. Not that night. The night she ran was circled in red, a long way downstairs.' : n === 2 ? 'The calendar in the Living Room, and the last page of Papa’s diary. Check your journal.' : 'The calendar said the 14th, of the 10th month. Day first, then month.',
          onOk() { G.f.barsOpen = true; Snd.open(); redraw(); addDread(-15); say('The padlock drops. The bars swing out over the dark. Below the window: the long zinc roof, and in the middle of it, the chimney.', 6500); }
        });
      }
      say(G.f.banished ? 'The boards are loosening.' : 'The window to the roof, nailed shut with crooked boards. The candles below it feel like part of the lock.');
    }
  }
};

/* ---------- cowries: one hidden in every room ---------- */
const COWRIES = { foyer: [-1.75, -1.15], nursery: [-2.0, 1.62], kitchen: [-1.75, 1.6], cellar: [1.55, -2.4], study: [1.4, -1.2], chapel: [-2.6, .15], attic: [1.15, 2.35] };
G.cowries = [];
function addCowrie(key, B) {
  const p = COWRIES[key]; if (!p || G.cowries.includes(key)) return;
  const g = B.grp(null, p[0], .03, p[1], Math.random() * 6, 'cowrie');
  B.sph(g, 0, .02, 0, .045, { c: '#efe8da', s: 70 }, .55, 1.4); B.box(g, 0, .045, 0, .008, .004, .1, '#5a4a3a');
  B.sph(g, 0, .03, -.05, .018, { c: '#d9c9a8', s: 40 });
  B.hit(g, 0, .1, 0, .45, .35, .45);
  Rm.cowrie = g; Rm.cowrieGlint = B.glint(p[0], .25, p[1]);
}
function takeCowrie() {
  const key = ROOMS[G.room].key;
  if (G.cowries.includes(key) || !Rm.cowrie) return;
  G.cowries.push(key); addEver('oc_cowset', key); removeNode(Rm.cowrie); Rm.cowrie = null; if (Rm.cowrieGlint) Rm.cowrieGlint.off = true;
  const n = G.cowries.length;
  Snd.cowrie(); Snd.chime(); vibe(20);
  const relit = relightLantern();
  say((n === 7 ? 'The seventh cowrie. All of them. Effiong’s people say cowries bring the lost home.' : 'A small cowrie shell, smooth and white. ' + n + ' of 7.') + (relit ? ' One of your lanterns flickers back to life.' : ''), 4600);
  if (n > (+store.get('oc_cowries') || 0)) store.set('oc_cowries', n);
  queueSave();
}

/* ---------- rooms and flow ---------- */
function buildRoom(i, sv) {
  resetScares();
  const sc = R3.newScene(), B = makeBuilder(sc), api = ROOMS3D[ROOMS[i].key](B);
  sc.cam = G.cam;
  Rm = { sc, api };
  const sp = api.spawn;
  G.cam.pos = [sp.x, 1.6, sp.z]; G.cam.yaw = sp.yaw; G.cam.pitch = 0;
  api.apply(G.f);
  addCowrie(ROOMS[i].key, B);
  if (sv && sv.cam && ROOMS[i].key !== 'roof') { G.cam.pos = [clamp(sv.cam.x, -2.7, 2.7), 1.6, clamp(sv.cam.z, -2.7, 2.7)]; G.cam.yaw = sv.cam.yaw || 0; G.cam.pitch = sv.cam.pitch || 0; }
  if (sv || G.f.zn || Object.keys(G.f).length) R3.update(sc, G.cam, 2.5);   // let doors and lids jump straight to where they were
}
function enterRoom(i, o = {}) {
  G.room = i; G.sel = null; G.thr = {}; G.over = false; G.token++;
  lbCheckpoint(i);
  const sv = o.resume && !o.resume.fresh ? o.resume : null;
  if (sv) G.f = sv.f || {}; else if (!o.keep) G.f = {};
  if (sv && G.f.banished && !G.f.windowOpen) G.f.windowOpen = true; // the boards fall away on their own, even if you quit mid-vision
  const key = ROOMS[i].key;
  if (key === 'kitchen' && !has('matches') && !sv && !o.keep) { give('matches'); G.f.matchGift = true; }
  // saves from before the hammer and the white cloth existed: hand them over so the roof can still be finished
  if (i > 3 && i < ROOMS.length - 1 && !has('hammer') && G.dropped !== 'hammer') G.inv.push('hammer');
  if (key === 'attic' && !has('whitecloth') && G.dropped !== 'whitecloth') G.inv.push('whitecloth');
  if (!o.restore && !sv) G.snap = { inv: G.inv.slice(), journal: G.journal.map(j => ({ ...j })), pages: G.pages.slice() };
  if (!o.restore && !sv && CHAPTERS.some(c => c.start === i)) G.chap = { room: i, inv: G.inv.slice(), journal: G.journal.map(j => ({ ...j })), pages: G.pages.slice(), cowries: G.cowries.slice() };
  if (G.lives == null || G.lives <= 0) G.lives = LIVES_MAX;
  renderLives();
  G.dread = sv ? (sv.dread || 10) : o.restore ? 35 : 10;
  if (G.mode === 'gentle') G.dread = 0;
  $('#roomName').textContent = ROOMS[i].name;
  updDread(); renderBag();
  if (glOK) buildRoom(i, sv);
  lastSig = '';
  save(false);
  if (sv || o.restore) {
    G.busy = false; G.paused = false;
    say(sv ? 'You are back where you left off.' : 'You wake at the door of the room, cold to the bone.', 4600);
    if (G.mode !== 'gentle' && !sv) G.dread = 35;
    onRoomStart();
    return;
  }
  showCard(i, () => {
    onRoomStart();
    say(ROOMS[i].intro + (G.f.matchGift ? ' A matchbox lies on the tiles. You take it.' : ''), 8000);
    if (G.pendingHow) { G.pendingHow = false; howTo(); }
  });
}
function showCard(i, then) {
  const R = ROOMS[i], c = $('#card');
  c.innerHTML = `<div class="k">${R.escape ? 'The way out' : 'Room ' + (i + 1) + ' of 7'}</div><h2>${R.name}</h2><p>${R.sub}</p><p class="ep">${EPIGRAPHS[R.key] || ''}</p>`;
  c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
  G.paused = true; G.busy = true;
  // a tap anywhere goes straight into the room (after a beat, so the tap that opened the door can't skip it by accident)
  let done = false;
  const t0 = performance.now();
  const finish = () => {
    if (done) return; done = true;
    clearTimeout(timer); document.removeEventListener('pointerdown', skip, true);
    c.classList.remove('on'); G.paused = false; G.busy = false; if (then) then();
  };
  const skip = e => { if (performance.now() - t0 < 450 || !c.classList.contains('on')) return; e.preventDefault(); e.stopPropagation(); finish(); };
  const timer = setTimeout(finish, 2800);
  document.addEventListener('pointerdown', skip, true);
}

/* ---------- saving (also mid-room) ---------- */
let svT = 0, lastSig = '';
function queueSave() { clearTimeout(svT); svT = setTimeout(() => save(true), 700); }
function cleanFlags(f) {
  const o = {};
  for (const k in f) if (k[0] !== '_' && k !== 'left' && k !== 'asking' && k !== 'leaveOK') o[k] = f[k];
  return o;
}
function snapshot() {
  return {
    v: 2, room: G.room, key: ROOMS[G.room].key, f: cleanFlags(G.f), inv: G.dropped ? G.inv.concat([G.dropped]) : G.inv.slice(), journal: G.journal, pages: G.pages.slice(),
    cam: { x: +G.cam.pos[0].toFixed(2), z: +G.cam.pos[2].toFixed(2), yaw: +G.cam.yaw.toFixed(3), pitch: +G.cam.pitch.toFixed(3) },
    cowries: G.cowries.slice(), lives: G.lives, chap: G.chap, flash: (G.flash || []).slice(), dread: Math.round(G.dread), elapsed: Date.now() - G.t0, run: G.run || null, puz: G.puz || null, chapterRun: G.chapterRun == null ? null : G.chapterRun, hints: G.hints, scares: G.scares, hintLv: G.hintLv, snap: G.snap, at: Date.now()
  };
}
function save(show) {
  if (!G.started || G.ending || G.over || !Rm || G.f.left) return;
  const snap = snapshot(), sig = JSON.stringify([snap.room, snap.f, snap.inv, snap.pages, snap.journal.length]);
  store.set(SAVE_KEY, snap);
  if (show && sig !== lastSig) flashSaved();
  lastSig = sig;
}
function flashSaved() { const el = $('#saved'); el.classList.add('on'); clearTimeout(flashSaved.t); flashSaved.t = setTimeout(() => el.classList.remove('on'), 1600); }
function readSave() {
  const sv = store.get(SAVE_KEY);
  if (!sv || typeof sv.room !== 'number') return null;
  if (!sv.v) {   // a save from the older four-room game
    const idx = ROOMS.findIndex(r => r.key === ['foyer', 'nursery', 'cellar', 'attic'][sv.room]);
    if (idx < 0) return null;
    return { v: 2, room: idx, fresh: true, f: {}, inv: sv.inv || [], journal: sv.journal || [], pages: [], elapsed: sv.elapsed || 0, hints: sv.hints || 0, scares: sv.scares || 0, hintLv: {} };
  }
  if (!ROOMS[sv.room] || ROOMS[sv.room].key !== sv.key) {
    const idx = ROOMS.findIndex(r => r.key === sv.key);
    if (idx < 0) return null;
    sv.room = idx;
  }
  return sv;
}
setInterval(() => { if (G.started && !G.paused && !G.busy && !modalOpen()) save(false); }, 6000);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(false); });
window.addEventListener('pagehide', () => save(false));

function howTo() {
  openModal(`<h2>How to escape</h2>
    <ul>${(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) ? '<li>W A S D or the arrow keys: walk.</li><li>Click the view, then move the mouse to look around. Esc frees the mouse.</li><li>Turn until the dot glows on something, then click (or press E). Walk close first.</li><li>1 to 6 hold an item from your tray, Q puts it away. J opens the journal, H gives a hint, M opens the menu.</li>' : '<li>Best played sideways, but upright works too.</li><li>Left thumb: the stick in the bottom-left corner walks.</li><li>Right thumb: drag anywhere else to look around.</li><li>Turn until the dot glows on something, then press the hand button (or just tap the thing). Walk close first.</li><li>Tap an item in your tray to hold it, then tap what you want to use it on.</li>'}<li>Pages of a family’s story are hidden in every room. Find them all for the true ending.</li><li>The game saves as you go, even in the middle of a room.</li><li>Jump scares hurt. You stumble, drop what you hold, and your fear rises. Ojuju Calabar puts out your light. If your fear fills up, the house takes you back to the door.</li><li>You carry five lanterns. Each time Ojuju Calabar catches you or his face jumps at you, one goes out. Cowries relight them. Lose them all and you go back to the start of the chapter.</li><li>If he walks into the room, keep still and touch nothing until he leaves.</li><li>Stuck? The lightbulb gives hints.</li></ul>
    <div class="col"><button class="btn primary" data-x>Start looking</button></div>`);
  panel.onclick = e => { if (e.target.closest('[data-x]')) closeModal(); };
}
function fmtTime(ms) { const s = Math.round(ms / 1000), m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); }

/* ---------- cutscenes ---------- */
const cutEl = $('#cut'), ckEl = $('.ck', cutEl), ctEl = $('.ct', cutEl);
function cutscene(slides, done, onSlide) {
  let i = 0, spans = [], rev = 0, tm = 0, full = false;
  G.busy = true;
  cutEl.classList.add('on');
  const finish = () => { clearTimeout(tm); cutEl.classList.remove('on', 'show', 'done', 'scrawl'); cutEl.onclick = null; $('.cskip', cutEl).onclick = null; G.busy = false; if (done) done(); };
  const revealAll = () => { clearTimeout(tm); spans.forEach(s => s.classList.add('v')); full = true; cutEl.classList.add('done'); };
  const show = () => {
    const s = slides[i];
    full = false; rev = 0;
    cutEl.classList.remove('show', 'done'); cutEl.classList.toggle('scrawl', !!s.scrawl);
    ckEl.textContent = tr(s.k) || '';
    ctEl.innerHTML = String(tr(s.t)).split(/(\s+)/).map(w => /^\s*$/.test(w) ? w : `<span>${esc(w)}</span>`).join('');
    ctEl.scrollTop = 0;
    spans = $$('span', ctEl);
    $('.cgo', cutEl).textContent = s.end ? 'Tap to close' : 'Tap to continue';
    void cutEl.offsetWidth; cutEl.classList.add('show');
    if (onSlide) onSlide(i, s);
    const gap = clamp(6500 / Math.max(1, spans.length), 28, 120);
    const step = () => {
      if (rev < spans.length) { spans[rev++].classList.add('v'); tm = setTimeout(step, gap); } else revealAll();
    };
    tm = setTimeout(step, 650);
  };
  cutEl.onclick = e => {
    if (e.target.closest('.cskip')) return;
    if (!full) return revealAll();
    i++;
    if (i >= slides.length) return finish();
    show();
  };
  $('.cskip', cutEl).onclick = e => { e.stopPropagation(); finish(); };
  show();
}

/* ---------- endings ---------- */
function finale() {
  if (G.ending) return;
  G.over = true; G.ending = true; adsGameplay(false);
  G.finalMs = Date.now() - G.t0;   // the clock stops at the chimney, before the ending comics
  const all = G.pages.length === PAGES.length || (G.chapterRun != null && allPagesEver());   // a chapter run counts every page found in any run
  store.del(SAVE_KEY);
  store.set(all ? 'hm3_true' : 'hm3_done', true);
  Snd.chime();
  // the release at the chimney, the morning in Oke-Ọla, then the call to London (true ending) or the house keeping its secrets
  playComic('release', () => playComic(all ? 'trueEnd' : 'plainEnd', () => rollCredits(() => results(all))));
}
/* ---------- share your escape: a picture for WhatsApp and Instagram stories ---------- */
const FEEDBACK = { email: 'munachiochem143@gmail.com', whatsapp: '' }; // fill these in: an email address, and a WhatsApp number in international form (2348012345678)
function svgImg(svg) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); }); }
async function shareCard(all) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(W / 2, 420, 60, W / 2, 520, 900); bg.addColorStop(0, '#3a1018'); bg.addColorStop(.55, '#140a10'); bg.addColorStop(1, '#060407'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // an Ankara band across the top and bottom
  const band = y => { const cols = ['#127a72', '#e2832a', '#1d3a6b', '#7a1f2b']; for (let x = 0; x < W; x += 80) cols.forEach((cl, i) => { g.fillStyle = cl; g.fillRect(x + i * 20, y, 20, 26); }); g.fillStyle = '#f2c33d'; for (let x = 10; x < W; x += 20) { g.beginPath(); g.arc(x, y + 13, 5, 0, 7); g.fill(); } };
  band(0); band(H - 26);
  const face = await svgImg(FACE_SILAS);
  if (face) { g.globalAlpha = .9; g.drawImage(face, W / 2 - 300, 120, 600, 780); g.globalAlpha = 1; }
  const fade = g.createLinearGradient(0, 640, 0, 980); fade.addColorStop(0, 'rgba(6,4,7,0)'); fade.addColorStop(1, 'rgba(6,4,7,1)'); g.fillStyle = fade; g.fillRect(0, 640, W, 360); g.fillStyle = '#060407'; g.fillRect(0, 980, W, H - 1006);
  g.textAlign = 'center'; g.fillStyle = '#f3e6c8';
  g.font = '800 120px Ojuju, sans-serif'; g.fillText('OJUJU CALABAR', W / 2, 900);
  g.font = '700 46px Ojuju, sans-serif'; g.fillStyle = '#eb9440'; g.fillText(all ? 'I found the whole story.' : 'I gave him back his name.', W / 2, 980);
  g.font = '600 38px "Bricolage Grotesque", sans-serif'; g.fillStyle = '#e8dcc4';
  const rows = [['Time', fmtRun(runMs())], ['Memory pages', G.pages.length + ' of 14'], ['Cowries', G.cowries.length + ' of 7'], ['Scares survived', String(G.scares)]];
  rows.forEach(([k, v], i) => { const y = 1070 + i * 52; g.textAlign = 'right'; g.fillStyle = '#b0a591'; g.fillText(k, W / 2 - 20, y); g.textAlign = 'left'; g.fillStyle = '#f3e6c8'; g.fillText(v, W / 2 + 20, y); });
  g.textAlign = 'center'; g.font = '700 30px Ojuju, sans-serif'; g.fillStyle = '#8f8573'; g.fillText('A MUNIAC STUDIOS GAME · CAN YOU ESCAPE?', W / 2, H - 56);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = blob && new File([blob], 'ojuju-calabar.png', { type: 'image/png' });
  const text = all ? 'I found the whole story in Ojuju Calabar. Can you?' : 'I survived Adeleke House in Ojuju Calabar. Can you?';
  try { if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  // no share sheet: show the picture so it can be saved with a long-press or a screenshot
  openModal(`<h2>Your escape</h2><p>Long-press the picture to save it, or take a screenshot.</p><img class="sharecard" src="${c.toDataURL('image/png')}" alt="Ojuju Calabar result card"><div class="col"><button class="btn" data-x>Close</button></div>`, { onX: () => results(all) });
  panel.onclick = e => { if (e.target.closest('[data-x]')) { closeModal(); results(all); } };
}
function openFeedback() {
  const msg = 'Ojuju Calabar feedback (' + ROOMS[G.room].name + '): ';
  if (FEEDBACK.whatsapp) window.open('https://wa.me/' + FEEDBACK.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
  else window.open('mailto:' + (FEEDBACK.email || '') + '?subject=' + encodeURIComponent('Ojuju Calabar feedback') + '&body=' + encodeURIComponent(msg), '_blank');
}

function results(all) {
  const left = ROOMS.map(r => [r, missingPages(r.key).length]).filter(x => x[1]);
  // the leaderboard box comes first: on a sideways phone anything lower is off the bottom of the screen
  openModal(`<h2>${all ? 'The whole story' : 'He is free'}</h2>
    ${lbResultsHtml()}
    <p class="lead">${all ? 'You found every page. You know what your father did, who Effiong Etim was, and why Mama ran.' : 'Effiong Etim has his name back. But the house kept some of its story.'}</p>
    <p class="runstats">Time ${fmtRun(runMs())} · Pages ${G.pages.length}/${PAGES.length} · Cowries ${G.cowries.length}/7 · Hints ${G.hints} · Scares survived ${G.scares}</p>
    ${all ? '' : `<p class="hint-note">The true ending needs every page. Still missing: ${left.map(([r, n]) => r.name.replace('The ', '') + ' (' + n + ')').join(', ')}.</p>`}
    <div class="col"><button class="btn primary" data-share>Share your escape</button><button class="btn" data-again>${all ? 'Play again' : 'Go back in'}</button></div>`, { dismiss: false });
  panel.scrollTop = 0;
  panel.onclick = e => {
    const lb = e.target.closest('[data-lb]');
    if (lb) { if (lb.dataset.lb === 'post') lbPost(all); else openLeaderboard(() => results(all)); return; }
    if (e.target.closest('[data-share]')) shareCard(all); else if (e.target.closest('[data-again]')) { closeModal(); showTitle(); }
  };
  const ni = $('#lbName'); if (ni) ni.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); lbPost(all); } });
}

/* ---------- title screen, menu ---------- */
function titleArt() {
  return `<svg viewBox="0 0 360 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
  <defs><radialGradient id="tMoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#dfe8f2" stop-opacity=".5"/><stop offset="1" stop-color="#dfe8f2" stop-opacity="0"/></radialGradient>
  <linearGradient id="tFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d86a8" stop-opacity="0"/><stop offset="1" stop-color="#8d86a8" stop-opacity=".35"/></linearGradient></defs>
  <circle cx="272" cy="64" r="60" fill="url(#tMoon)"/><circle cx="272" cy="64" r="22" fill="#e8eef4"/><circle cx="264" cy="58" r="5" fill="#cfd8e2"/><circle cx="281" cy="72" r="3.4" fill="#cfd8e2"/>
  <path d="M0 240Q60 214 120 232T250 226T360 236V260H0Z" fill="#0b0810"/>
  <g fill="#07050a"><rect x="86" y="132" width="188" height="108"/><path d="M76 134L180 70L284 134Z"/><rect x="104" y="84" width="14" height="44"/><rect x="246" y="92" width="14" height="38"/>
  <rect x="150" y="96" width="60" height="44"/><path d="M146 98L180 52L214 98Z"/></g>
  <g fill="#201830"><rect x="100" y="156" width="16" height="26"/><rect x="132" y="156" width="16" height="26"/><rect x="212" y="156" width="16" height="26"/><rect x="244" y="156" width="16" height="26"/><rect x="164" y="112" width="32" height="26"/></g>
  <rect class="eyewin" x="172" y="198" width="18" height="30" fill="#ffb255"/><rect class="eyewin" x="133" y="157" width="14" height="24" fill="#ffd27a"/>
  <rect x="172" y="198" width="18" height="30" fill="none" stroke="#07050a" stroke-width="2"/><path d="M181 198V228M172 213H190" stroke="#07050a" stroke-width="2"/>
  <path d="M34 240Q42 194.0 46.8 148" stroke="#06040a" stroke-width="6" fill="none"/><path d="M46.8 148Q23.999999999999996 128 8.799999999999997 152" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q28.799999999999997 142 16.799999999999997 166" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q38.4 148 32.8 172" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q55.199999999999996 148 60.8 172" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q64.8 140 76.8 164" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q70.8 130 86.8 154" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46.8 148Q46.8 124 46.8 148" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M326 240Q316 201.0 310.0 162" stroke="#06040a" stroke-width="6" fill="none"/><path d="M310.0 162Q287.2 142 272.0 166" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q292.0 156 280.0 180" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q301.6 162 296.0 186" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q318.4 162 324.0 186" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q328.0 154 340.0 178" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q334.0 144 350.0 168" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M310.0 162Q310.0 138 310.0 162" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M300 240Q296 213.0 293.6 186" stroke="#06040a" stroke-width="6" fill="none"/><path d="M293.6 186Q270.8 166 255.60000000000002 190" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q275.6 180 263.6 204" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q285.20000000000005 186 279.6 210" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q302.0 186 307.6 210" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q311.6 178 323.6 202" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q317.6 168 333.6 192" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M293.6 186Q293.6 162 293.6 186" stroke="#06040a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect y="170" width="360" height="90" fill="url(#tFog)"/></svg>`;
}
function showTitle() {
  if (Snd.music) Snd.music(true);
  if (Snd.ambience) Snd.ambience('title');
  G.started = false; G.over = false; G.busy = false; G.paused = false; G.ending = false;
  closeModal(); cutEl.classList.remove('on');
  document.body.classList.remove('lbtitle');
  const sv = readSave();
  const t = $('#title'); t.classList.remove('off', 'hasimg', 'v2', 'menuopen'); t.classList.add('v3');
  // the picture fills the screen; the buttons sit on a soft blur over it (no box)
  t.innerHTML = `<div class="bg">${TITLE_IMG ? `<img src="${TITLE_IMG}" alt="">` : titleArt()}</div><div class="mveil"></div><div class="menu">
    <h1>Ojuju <br>Calabar</h1>
    ${glOK ? '' : '<p class="nogl">This browser cannot run 3D graphics, so the game cannot start here. Try Chrome or Safari on a recent phone.</p>'}
    <p class="tag">Seven rooms. One name to give back.</p>
    ${store.get('hm3_true') ? '<div class="star">★ You found the whole story</div>' : ''}${store.get('oc_cowries') ? `<div class="star">Cowries found: ${store.get('oc_cowries')} of 7</div>` : ''}
    ${sv ? `<button class="btn primary" id="tCont">Continue in ${ROOMS[sv.room].name}</button><button class="btn" id="tNew">New game</button>` : '<button class="btn primary" id="tNew">Enter the house</button>'}
    ${chapterOpen() ? '<button class="btn" id="tChap">Chapter select</button>' : ''}
    <div class="btnrow"><button class="btn" id="tBoard">Leaderboard</button><button class="btn" id="tGal">Gallery</button><button class="btn" id="tCred">Credits</button></div>
    <div class="lbl">Language</div>
    <div class="seg" id="tLang"><button data-lang="en" class="${G.lang === 'en' ? 'on' : ''}">English</button><button data-lang="pcm" class="${G.lang === 'pcm' ? 'on' : ''}">Pidgin</button></div>
    <div class="lbl lblq">Scare level <button class="qhelp" id="tModeQ" aria-label="What does scare level do?" aria-expanded="false">?</button></div>
    <div class="qtip" id="tModeTip" hidden><b>Haunted</b>: the full game, with jump scares and the dread meter. Only Haunted runs go on the leaderboard.<br><b>Gentle</b>: no jump scares and no dread meter.<br>Headphones make it worse.</div>
    <div class="seg" id="tMode"><button data-m="haunted" class="${G.mode === 'haunted' ? 'on' : ''}">Haunted</button><button data-m="gentle" class="${G.mode === 'gentle' ? 'on' : ''}">Gentle</button></div>
    <p class="ver">Version ${VERSION_TAG}</p></div>`;
  // with no Tap to enter on the loading screen, the first touch anywhere here wakes the sound and the music
  t.addEventListener('pointerdown', () => { Snd.init(); Snd.music(true); }, { once: true });
  $('#tLang').onclick = e => { const b = e.target.closest('[data-lang]'); if (b && b.dataset.lang !== G.lang) { setLang(b.dataset.lang); showTitle(); } };
  // the ? beside Scare level opens a short explanation; tapping it again, or anywhere else, closes it
  const q = $('#tModeQ'), tip = $('#tModeTip');
  const showTip = on => { tip.hidden = !on; q.setAttribute('aria-expanded', on); q.classList.toggle('on', on); };
  q.onclick = e => { e.stopPropagation(); showTip(tip.hidden); };
  t.addEventListener('pointerdown', e => { if (!tip.hidden && !e.target.closest('#tModeQ, #tModeTip')) showTip(false); });
  $('#tMode').onclick = e => { const b = e.target.closest('[data-m]'); if (b) { setMode(b.dataset.m); $$('#tMode button').forEach(x => x.classList.toggle('on', x === b)); } };
  let armed = false;
  $('#tNew').onclick = ev => {
    if (!glOK) return;
    if (sv && !armed) { armed = true; ev.currentTarget.textContent = 'Tap again to erase your save'; ev.currentTarget.classList.add('danger'); return; }
    Snd.init(); goLandscape(); newGame();
  };
  $('#tBoard').onclick = () => openLeaderboard();
  $('#tCred').onclick = () => rollCredits();
  $('#tGal').onclick = () => { document.body.classList.add('lbtitle'); openGallery(() => { document.body.classList.remove('lbtitle'); }); };
  const tc = $('#tChap'); if (tc) tc.onclick = () => { document.body.classList.add('lbtitle'); openChapters(); };
  const c = $('#tCont'); if (c) c.onclick = () => { if (!glOK) return; Snd.init(); goLandscape(); continueGame(sv); };
}
function setMode(m) {
  G.mode = m; store.set('hm3_mode', m); lbModeChanged(m);
  document.body.classList.toggle('gentle', m === 'gentle');
  if (m === 'gentle') { G.dread = 0; updDread(); }
}
function startPlay() { Snd.music(false); $('#title').classList.add('off'); G.started = true; G.t0 = G.t0 || Date.now(); scheduleEvent(); checkOrient(); adsGameplay(true); }
function newGame() {
  store.del(SAVE_KEY); lastSig = '';
  G.inv = []; G.journal = []; G.pages = []; G.cowries = []; G.hints = 0; G.scares = 0; G.hintLv = {}; G.t0 = Date.now(); G.f = {}; G.snap = null; G.ending = false; G.lives = LIVES_MAX; G.chap = null; G.flash = []; G.puz = rollPuzzles(); G.chapterRun = null;
  lbNewRun();
  G.pendingHow = !store.get('hm3_seen'); store.set('hm3_seen', true);
  $('#title').classList.add('off');
  Snd.creak();
  playComic('opening', () => withLoading(() => { startPlay(); enterRoom(0); }, 900));
}
function continueGame(sv) {
  G.inv = sv.inv || []; G.journal = sv.journal || []; G.pages = sv.pages || []; G.cowries = sv.cowries || []; G.hints = sv.hints || 0; G.scares = sv.scares || 0; G.hintLv = sv.hintLv || {};
  G.t0 = Date.now() - (sv.elapsed || 0); G.ending = false;
  G.lives = sv.lives == null ? LIVES_MAX : Math.max(1, sv.lives); G.chap = sv.chap || null; G.flash = sv.flash || []; G.run = sv.run || null; G.finalMs = 0; G.puz = sv.puz || null;   // an older save keeps the classic answers
  G.chapterRun = sv.chapterRun == null ? null : sv.chapterRun;
  G.snap = sv.snap || { inv: G.inv.slice(), journal: G.journal.map(j => ({ ...j })), pages: G.pages.slice() };
  $('#title').classList.add('off');
  withLoading(() => { startPlay(); enterRoom(sv.room, { resume: sv }); }, 1100);
}
function openMenu() {
  openModal(`<div class="rd-top"><div class="grille"></div><div class="dial"><b>PAUSED</b><i class="needle" style="left:${12 + (G.room / 7) * 76}%"></i><small><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></small></div></div>
    <p class="rd-note">${G.pages.length} of ${PAGES.length} memory pages · ${G.cowries.length} of 7 cowries. Progress saves on its own, even in the middle of a room.</p>
    <div class="col">
      <button class="btn primary" data-a="resume">Back to the house</button>
      <div class="lbl" style="color:var(--bone-dim);font-size:13px">Scare level</div>
      <div class="seg" id="mMode"><button data-m="haunted" class="${G.mode === 'haunted' ? 'on' : ''}">Haunted</button><button data-m="gentle" class="${G.mode === 'gentle' ? 'on' : ''}">Gentle</button></div>
      <div class="lbl" style="color:var(--bone-dim);font-size:13px">Language</div>
      <div class="seg" id="mLang"><button data-lang="en" class="${G.lang === 'en' ? 'on' : ''}">English</button><button data-lang="pcm" class="${G.lang === 'pcm' ? 'on' : ''}">Pidgin</button></div>
      <div class="lbl" style="color:var(--bone-dim);font-size:13px">Graphics</div>
      <div class="seg" id="mGfx">${[['auto', 'Auto'], ['high', 'High'], ['low', 'Low (smoother)']].map(([k, n]) => `<button data-g="${k}" class="${G.gfx === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="lbl" style="color:var(--bone-dim);font-size:13px">Look speed</div>
      <div class="seg" id="mLook">${['slow', 'normal', 'fast'].map(k => `<button data-l="${k}" class="${G.look === k ? 'on' : ''}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
      <div class="lbl" style="color:var(--bone-dim);font-size:13px">Speedrun timer</div>
      <div class="seg" id="mTimer"><button data-t="1" class="${store.get('oc_timer') ? 'on' : ''}">Show</button><button data-t="0" class="${store.get('oc_timer') ? '' : 'on'}">Hide</button></div>
      <div class="mfoot">
        <div class="btnrow b3"><button class="btn" data-a="board">Leaderboard</button><button class="btn" data-a="gallery">Gallery</button><button class="btn" data-a="restart">Restart room</button></div>
        <div class="btnrow"><button class="btn" data-a="feedback">Send feedback</button><button class="btn" data-a="title">Save and go to title</button></div>
        <p class="ver">Version ${VERSION_TAG}</p>
      </div>
    </div>
    <p class="rd-note mcredit"><a href="privacy.html" target="_blank" rel="noopener" style="color:#f0c98a">Privacy</a> · A Muniac Studios game</p>`, { cls: 'radio' });
  let armed = false;
  panel.onclick = e => {
    const m = e.target.closest('[data-m]');
    if (m) {
      if (m.dataset.m === G.mode) return;   // already on it: nothing changes
      if (m.dataset.m === 'gentle' && G.run && G.run.ranked && !m.dataset.sure) {   // a stray tap must not cost a leaderboard run
        m.dataset.sure = '1'; m.textContent = 'Tap again: this run leaves the leaderboard'; m.classList.add('danger'); return;
      }
      setMode(m.dataset.m); $$('#mMode button').forEach(x => { x.classList.toggle('on', x === m); x.classList.remove('danger'); delete x.dataset.sure; x.textContent = x.dataset.m === 'gentle' ? 'Gentle' : 'Haunted'; });
      return;
    }
    const lg = e.target.closest('[data-lang]');
    if (lg) { if (lg.dataset.lang !== G.lang) { setLang(lg.dataset.lang); closeModal(); openMenu(); } return; }
    const gq = e.target.closest('[data-g]');
    if (gq) { G.gfx = gq.dataset.g; G.autoLow = false; store.set('oc_gfx', G.gfx); applyGfx(); $$('#mGfx button').forEach(x => x.classList.toggle('on', x === gq)); return; }
    const tm = e.target.closest('[data-t]');
    if (tm) { store.set('oc_timer', tm.dataset.t === '1'); $$('#mTimer button').forEach(x => x.classList.toggle('on', x === tm)); return; }
    const l = e.target.closest('[data-l]');
    if (l) { G.look = l.dataset.l; store.set('oc_look', G.look); $$('#mLook button').forEach(x => x.classList.toggle('on', x === l)); return; }
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'resume') closeModal();
    else if (a === 'restart') {
      if (!armed) { armed = true; b.textContent = 'Tap again to restart'; b.classList.add('danger'); }
      else { closeModal(); restoreRoom(true); }
    } else if (a === 'title') { save(false); showTitle(); }
    else if (a === 'feedback') openFeedback();
    else if (a === 'board') openLeaderboard(() => openMenu());
    else if (a === 'gallery') openGallery(() => openMenu());
  };
}

/* ---------- HUD ---------- */
function syncSound() {
  const m = Snd.muted;
  $('#bSound').classList.toggle('muted', m);
  $('#sndWaves').style.display = m ? 'none' : '';
  $('#bSound').setAttribute('aria-label', m ? 'Turn sound on' : 'Turn sound off');
}
$('#bSound').addEventListener('click', () => { Snd.init(); Snd.setMuted(!Snd.muted); syncSound(); });
$('#bJournal').addEventListener('click', () => { if (G.started && !G.busy && !G.over) openJournal(); });
$('#bHint').addEventListener('click', () => { if (G.started && !G.busy && !G.over) openHint(); });
$('#bMenu').addEventListener('click', () => { if (G.started && !G.busy && !G.over) openMenu(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) Snd.suspend(); else Snd.resume(); });
document.addEventListener('pointerdown', () => Snd.init(), { once: true });

/* ---------- loading screen ---------- */
const loadEl = $('#loading');
let loadQT = 0;
function loadQuote() { $('.lq', loadEl).textContent = pick(LOAD_QUOTES); }
function showLoading() {
  clearInterval(loadQT);
  loadEl.classList.remove('gone', 'off', 'ready');
  loadQuote(); loadQT = setInterval(loadQuote, 2600);
}
function hideLoading() {
  loadEl.classList.add('off');
  setTimeout(() => { loadEl.classList.add('gone'); clearInterval(loadQT); }, 700);
}
/* put the loading screen up, do heavy work behind it, then take it down */
function withLoading(fn, minMs = 1000) {
  showLoading();
  const bar = $('.lbar i', loadEl); bar.style.transition = 'none'; bar.style.width = '12%'; void bar.offsetWidth; bar.style.transition = '';
  const t0 = Date.now();
  setTimeout(() => {
    bar.style.width = '60%';
    try { fn(); } catch (e) { console.error(e); }
    bar.style.width = '100%';
    setTimeout(hideLoading, Math.max(0, minMs - (Date.now() - t0)));
  }, 120);
}
function preloadTextures(onProgress) {
  const names = Object.keys(TP).filter(k => k[0] !== '_');
  let i = 0;
  return new Promise(res => {
    const step = () => {
      const t0 = performance.now();
      while (i < names.length && performance.now() - t0 < 26) {
        try { R3.tex(names[i]); } catch (e) { console.warn('texture failed', names[i], e); }
        i++;
      }
      onProgress(i / names.length);
      if (i < names.length) setTimeout(step, 0); else res();
    };
    step();
  });
}
/* web builds: sounds and pictures are separate files; fetch them quietly in the background once the game is open (comic first, it comes next) */
function prefetchAssets() {
  const urls = [], add = v => (Array.isArray(v) ? v : [v]).forEach(u => { if (typeof u === 'string' && !u.startsWith('data:')) urls.push(u); });
  [COMIC_IMG, SFX, VOICES, GALLERY_IMG].forEach(d => d && Object.values(d).forEach(add));
  if (!urls.length || !window.fetch) return;
  let i = 0;
  const next = () => { if (i >= urls.length) return; const u = urls[i++]; fetch(u).catch(() => 0).then(() => setTimeout(next, 30)); };
  for (let n = 0; n < 3; n++) next();
}
function bootLoading() {
  const art = $('.lart', loadEl);
  art.innerHTML = LOAD_IMG ? `<img src="${LOAD_IMG}" alt="">` : titleArt();
  if (LOAD_IMG) $('.lname', loadEl).style.display = 'none';
  showLoading();
  const bar = $('.lbar i', loadEl), btn = $('.btn', loadEl);
  // the opening: "Muniac Studios" alone on black for three seconds, then the picture; Tap to enter comes two seconds after that
  const sp = $('#splash'), SPLASH_MS = 3200, AFTER_MS = 2000;
  const began = window.__splashAt || Date.now(), shownAt = began + (sp ? SPLASH_MS : 0);   // the page started the opening itself, as soon as it arrived
  if (sp && !sp.classList.contains('play')) {   // split the name into letters, each flickering on at its own moment
    const nm = $('.sp', sp);
    if (nm && !nm.dataset.split) { nm.dataset.split = '1'; nm.innerHTML = [...nm.textContent].map((ch, k) => ch === ' ' ? ' ' : `<span style="--d:${(.35 + Math.random() * .9 + k * .015).toFixed(2)}s">${ch}</span>`).join(''); }
    sp.classList.add('play');
  }
  if (sp) setTimeout(() => { sp.classList.add('off'); setTimeout(() => sp.classList.add('gone'), 650); }, Math.max(0, shownAt - Date.now()));
  const ready = () => { bar.style.width = '100%'; setTimeout(prefetchAssets, 300); setTimeout(() => hideLoading(), Math.max(400, shownAt + AFTER_MS - Date.now())); };   // no Tap to enter here: the home screen has Start
  btn.onclick = () => { Snd.init(); goLandscape(); hideLoading(); if (!G.started) Snd.music(true); };
  if (!glOK) { ready(); return; }
  const t0 = Date.now(), wait = ms => new Promise(r => setTimeout(r, ms));
  const fonts = Promise.race([
    Promise.all([document.fonts.load('800 24px "Bricolage Grotesque"'), document.fonts.load('700 20px "Ojuju"'), document.fonts.load('400 20px "Ojuju"')]).catch(() => 0),
    wait(1800)
  ]);
  bar.style.width = '8%';
  // textures keep warming up in the background; a slow phone is not held on this screen for them (any not ready yet are drawn when first needed)
  const warm = fonts.then(() => preloadTextures(p => { bar.style.width = (10 + p * 86) + '%'; }));
  Promise.race([warm, wait(Math.max(0, shownAt + AFTER_MS + 1200 - Date.now()))]).then(() => wait(Math.max(0, 1800 - (Date.now() - t0)))).then(ready);
}

/* ---------- boot ---------- */
document.body.classList.toggle('gentle', G.mode === 'gentle');
glOK = R3.init(glEl);
if (glOK) {
  R3.svgTex('lady', LADY_SVG, 256, 512); R3.svgTex('shade', SHADE_SVG, 128, 256);
  R3.svgTex('silas', SILAS_SVG, 128, 256); R3.svgTex('kid', KID_SVG, 64, 128); R3.svgTex('eyes', EYES_SVG, 128, 64);
}
syncSound(); renderBag(); updDread(); renderLives(); checkOrient(); if (glOK) applyGfx();
if (G.lang === 'pcm') setLang('pcm');
showTitle();
adsInit();
bootLoading();
requestAnimationFrame(frame);
if (location.hash === '#debug') window.__hm = { G, TP, results, QUIET, playComic, flashback, STRIPS, ADS, rewardedAd, openJournal, loseLife, restartChapter, visit, glimpse, footstepsPass, moveBehind, PRES, mortarPuzzle, radioPuzzle, photoPuzzle, voicePuzzle, renderLives, ROOMS, TAPS, PAGES, tap, enterRoom, redraw, say, give, scare, goNext, finale, page, save, readSave, snapshot, startPlay, newGame, continueGame, openHint, openMenu, showTitle, lightCandle, ZONES, checkZones, get Rm() { return Rm; }, R3, fx, tapAt, hideLoading, cutscene, speak, Snd, CH, figure, removeNode, hurt, manual(on) { manualClock = !!on; }, step: dt => frameStep(dt), callName, startChase, hideIn, takeCowrie, COWRIES };
