/* ================= PUZZLES THAT ARE NOT NUMBER LOCKS ================= */
/* The kitchen mortar (pound back a rhythm), the store-room radio (tune through static),
   Papa's smashed photograph (turn the pieces), and the record of three voices (who said what). */

/* ---------- the photograph: Olumide, Adaeze, and Effiong with small Tobi on his shoulders, hand-tinted, 1974 ---------- */
const FAMILY_PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
<defs>
<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c7a2"/><stop offset=".62" stop-color="#bba37a"/><stop offset="1" stop-color="#8d7650"/></linearGradient>
<radialGradient id="vg" cx=".5" cy=".46" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity=".55"/></radialGradient>
<pattern id="lace" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#fff" fill-opacity=".35"/></pattern>
<pattern id="wr" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#3f6a49"/><circle cx="5" cy="5" r="2.6" fill="#c9a24a" fill-opacity=".8"/><path d="M0 0L10 10" stroke="#24402c" stroke-width="1"/></pattern>
</defs>
<rect width="300" height="300" fill="url(#sk)"/>
<g opacity=".5" fill="#6d5636"><rect x="0" y="150" width="300" height="6"/><rect x="0" y="118" width="300" height="3"/>${[20, 70, 120, 170, 220, 270].map(x => `<rect x="${x}" y="118" width="5" height="40"/>`).join('')}</g>
<path d="M0 60C20 30 60 26 80 52C96 34 128 40 124 66C110 92 70 86 54 98C30 104 6 92 0 80Z" fill="#4b3a24" opacity=".75"/>
<rect x="44" y="90" width="9" height="70" fill="#3a2c1a" opacity=".8"/>
<rect x="0" y="232" width="300" height="68" fill="#7d6a48" opacity=".55"/>
<!-- Olumide: white agbada, blue fila, coral -->
<path d="M28 290L40 150Q70 128 100 150L114 290Z" fill="#ece4cf"/><path d="M28 290L40 150Q70 128 100 150L114 290Z" fill="url(#lace)"/>
<path d="M56 140Q70 162 84 140" fill="none" stroke="#b49a68" stroke-width="3"/>
${[0, 1, 2].map(i => `<path d="M${52 - i * 3} ${142 + i * 7}Q70 ${170 + i * 9} ${88 + i * 3} ${142 + i * 7}" fill="none" stroke="#b8442f" stroke-width="3.4" stroke-dasharray="3 1.6" stroke-linecap="round"/>`).join('')}
<rect x="62" y="118" width="16" height="16" fill="#3e2a1d"/>
<ellipse cx="70" cy="100" rx="16" ry="19" fill="#4a3223"/><ellipse cx="65" cy="96" rx="5" ry="6" fill="#5c4130" opacity=".7"/>
<path d="M52 92Q50 70 66 66L92 72Q90 84 86 92Q70 86 52 92Z" fill="#3a5a8a"/><path d="M52 92Q70 86 86 92" fill="none" stroke="#24385a" stroke-width="2"/>
<!-- Adaeze: green gele, lace buba, wrapper -->
<path d="M120 290L128 200L172 200L180 290Z" fill="url(#wr)"/>
<path d="M124 205L130 140Q150 128 170 140L176 205Z" fill="#e2d6b8"/><path d="M124 205L130 140Q150 128 170 140L176 205Z" fill="url(#lace)"/>
<rect x="143" y="122" width="14" height="14" fill="#432d20"/>
<ellipse cx="150" cy="108" rx="14" ry="17" fill="#4d3424"/><ellipse cx="146" cy="104" rx="4.5" ry="5.5" fill="#604232" opacity=".7"/>
<path d="M126 100Q120 64 150 60Q182 62 176 100Q164 88 150 92Q136 88 126 100Z" fill="#3f8150"/>
<path d="M118 84Q132 46 150 56Q170 44 184 82Q172 66 160 70Q152 54 140 70Q128 66 118 84Z" fill="#4d9660"/>
<path d="M132 66Q150 58 168 66M128 80Q150 70 172 80" fill="none" stroke="#2c5c38" stroke-width="2"/>
<!-- Effiong: driver's cap, short-sleeved shirt, small Tobi on his shoulders -->
<path d="M206 290L210 214L254 214L258 290Z" fill="#5b5048"/>
<path d="M204 216L208 150Q232 138 256 150L260 216Z" fill="#a9c0c8"/><path d="M206 160L196 196L206 200L212 168Z" fill="#a9c0c8"/><path d="M258 160L268 196L258 200L252 168Z" fill="#a9c0c8"/>
<path d="M226 150L232 164L238 150" fill="none" stroke="#7a8e96" stroke-width="2"/>
<rect x="226" y="130" width="12" height="13" fill="#3b281c"/>
<ellipse cx="232" cy="118" rx="13" ry="16" fill="#4a3122"/><ellipse cx="228" cy="114" rx="4" ry="5" fill="#5c3e2e" opacity=".7"/>
<path d="M218 108Q218 94 232 93Q246 94 246 108Z" fill="#2c2a30"/><path d="M216 108H252Q252 112 246 112H218Z" fill="#1a181c"/><rect x="226" y="98" width="12" height="3" fill="#c9a24a"/>
<!-- small Tobi on his shoulders -->
<path d="M220 100Q232 84 244 100L242 108L222 108Z" fill="#e8d26a"/><path d="M222 104L212 116M242 104L252 116" stroke="#e8d26a" stroke-width="6" stroke-linecap="round"/>
<circle cx="232" cy="78" r="10" fill="#4d3424"/><circle cx="229" cy="75" r="3" fill="#604232" opacity=".7"/>
<path d="M222 70Q232 60 242 70" fill="none" stroke="#2a1c14" stroke-width="4"/>
<rect width="300" height="300" fill="url(#vg)"/>
<rect width="300" height="300" fill="#704a1c" opacity=".08"/>
</svg>`;
const PHOTO_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FAMILY_PHOTO);
/* who is where in the photo, as fractions of its width */
const PHOTO_PEOPLE = [{ id: 'olumide', x: .233 }, { id: 'adaeze', x: .5 }, { id: 'effiong', x: .773 }];

function photoPuzzle(o) {
  const rots = (G.f.photoRot && G.f.photoRot.length === 9) ? G.f.photoRot : (G.f.photoRot = Array.from({ length: 9 }, (_, i) => [90, 180, 270, 0, 90, 270, 180, 90, 270][(i * 4 + G.room) % 9]));
  if (rots.every(r => r % 360 === 0)) rots[4] = 90;
  const tile = i => `<button class="ptile" data-i="${i}" aria-label="Piece ${i + 1}" style="background-position:${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%;transform:rotate(${rots[i]}deg)"></button>`;
  openModal(`<div class="lock skin-frame">
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face"><div class="frame"><div class="pgrid">${rots.map((_, i) => tile(i)).join('')}</div><i class="cracks"></i></div></div>
      <p class="msg" id="lockMsg" aria-live="polite"></p>
      <div class="lrow"><button class="lbtn back" data-x>Leave it</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel);
  $$('.ptile', panel).forEach(t => { t.style.backgroundImage = 'url("' + PHOTO_URI + '")'; });
  panel.onclick = e => {
    const b = e.target.closest('.ptile');
    if (b && !lockEl.classList.contains('solved')) {
      const i = +b.dataset.i; rots[i] += 90; b.style.transform = `rotate(${rots[i]}deg)`;
      Snd.click(); vibe(8); queueSave();
      if (rots.every(r => r % 360 === 0)) {
        lockEl.classList.add('solved'); Snd.chime(); vibe([20, 40, 60]);
        $('#lockMsg', panel).textContent = o.done || '';
        setTimeout(() => { if (lockEl.isConnected) closeModal(); o.onOk(); }, 1500);
      }
    } else if (e.target.closest('[data-x]')) closeModal();
  };
}

/* ---------- the record: three voices, three people in the photograph ---------- */
const VOICES_REC = [
  { who: 'effiong', pitch: 150, line: 'Ah, my small driver! Hold my head well o, make you no fall!' },
  { who: 'olumide', pitch: 92, line: 'What is mine stays mine. Nobody leaves this house.' },
  { who: 'adaeze', pitch: 215, line: 'Kpakpando, ọnwa, anyanwụ… sleep now, nwa m.' }
];
function voicePuzzle(o) {
  const put = {}; // person -> voice index
  let sel = -1;
  openModal(`<div class="lock skin-record">
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face">
        <div class="vphoto"><img src="${PHOTO_URI}" alt="The mended photograph: a man in a fila, a woman in a gele, a young man in a driver’s cap with a small boy on his shoulders">
          ${PHOTO_PEOPLE.map(p => `<button class="vwho" data-p="${p.id}" style="left:${p.x * 100}%" aria-label="Person"><b class="vtag"></b></button>`).join('')}</div>
        <div class="vcards">${VOICES_REC.map((v, i) => `<button class="vcard" data-v="${i}"><span class="vnum">${i + 1}</span><span class="vline">“${v.line}”</span></button>`).join('')}</div>
      </div>
      <p class="msg" id="lockMsg" aria-live="polite">Tap a voice to play it, then tap who said it.</p>
      <div class="lrow"><button class="lbtn back" data-x>Leave it</button><button class="lbtn go" data-ok disabled>Play it through</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel), msg = $('#lockMsg', panel), ok = $('[data-ok]', panel);
  const render = () => {
    $$('.vcard', panel).forEach(c => { const i = +c.dataset.v; c.classList.toggle('sel', i === sel); c.classList.toggle('used', Object.values(put).includes(i)); });
    $$('.vwho', panel).forEach(w => { const v = put[w.dataset.p]; $('.vtag', w).textContent = v === undefined ? '' : v + 1; w.classList.toggle('f', v !== undefined); w.classList.toggle('ready', sel >= 0); });
    ok.disabled = Object.keys(put).length < 3;
  };
  panel.onclick = e => {
    const c = e.target.closest('.vcard'), w = e.target.closest('.vwho');
    if (c) { sel = +c.dataset.v === sel ? -1 : +c.dataset.v; if (sel >= 0) { Snd.murmur(VOICES_REC[sel].pitch); msg.textContent = 'Now tap the person who said it.'; } render(); }
    else if (w) {
      const p = w.dataset.p;
      if (sel >= 0) { for (const k in put) if (put[k] === sel) delete put[k]; put[p] = sel; sel = -1; Snd.tick(); msg.textContent = Object.keys(put).length < 3 ? 'Tap a voice to play it, then tap who said it.' : 'Play the record through when you are sure.'; }
      else if (put[p] !== undefined) { delete put[p]; Snd.tick(); }
      render();
    } else if (e.target.closest('[data-ok]') && !ok.disabled) {
      const right = PHOTO_PEOPLE.every(p => VOICES_REC[put[p.id]].who === p.id);
      if (right) {
        lockEl.classList.add('solved'); Snd.unlock(); vibe([20, 40, 60]); panel.onclick = null;
        msg.textContent = o.done || '';
        setTimeout(() => { if (lockEl.isConnected) closeModal(); o.onOk(); }, 1400);
      } else {
        o.wrong = (o.wrong || 0) + 1;
        msg.textContent = o.wrong > 1 ? 'The needle skips. Think about who each of them was: the man who owned everything, the mother who sang, the driver who carried the boy.' : 'The needle skips. A young man’s voice, very close: “No be so. Remember me well.”';
        lockEl.classList.remove('shake'); void lockEl.offsetWidth; lockEl.classList.add('shake');
        Snd.wrong(); vibe([40, 30, 40]); addDread(5);
        for (const k in put) delete put[k]; render();
      }
    } else if (e.target.closest('[data-x]')) closeModal();
  };
  render();
}

/* ---------- the radio: tune through the static until a voice comes through ---------- */
/* Effiong's radio: tap to jump from station to station. Each one is a moment of something (highlife, news, a
   choir, static). On his station the whole message appears at once, the clue counts straight away, and the dial
   locks so it can't be lost by tapping on. */
const RADIO_STATIONS = [
  { f: 88.9, clear: 0, txt: 'Only static.' },
  { f: 91.5, clear: .55, txt: '♪ Highlife guitar, far away, wobbling.' },
  { f: 94.1, clear: .45, txt: '“…the price of cement in Lagos…” The voice breaks up.' },
  { f: 96.7, clear: .5, txt: '♪ A church choir, slow and sad.' },
  { f: 99.3, clear: 0, txt: 'Hiss and crackle.' },
  { f: 101.9, clear: .5, txt: 'A talking drum, then nothing.' },
  { f: 104.5, clear: .55, txt: '♪ Juju music, very faint.' },
  { f: 107.1, clear: 0, txt: 'Only static.' }
];
function radioPuzzle(o) {
  const N = RADIO_STATIONS.length;
  if (G.f.radioSt == null) G.f.radioSt = 1 + Math.floor(Math.random() * (N - 1));   // never the station it starts on
  const target = G.f.radioSt;
  G.f.radioF = RADIO_STATIONS[target].f;
  let at = Number.isInteger(G.f.radioAt) ? G.f.radioAt % N : 0, locked = false, live = true;
  if (at === target) at = 0;
  const R = Snd.radio();
  const scale = [88, 92, 96, 100, 104, 108].map(v => `<span style="left:${(v - 88) / 20 * 100}%">${v}</span>`).join('');
  openModal(`<div class="lock skin-radio">
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face">
        <div class="grille"><i class="eye"></i></div>
        <div class="dialwin" aria-label="Tuning dial"><div class="scale">${scale}</div><i class="needle"></i></div>
        <div class="tuner"><button class="fine" data-d="-1" aria-label="Previous station">${chev('up').replace('M6 15l6-6 6 6', 'M15 6l-6 6 6 6')}</button><button class="knob2" data-d="1" aria-label="Next station"><i></i></button><button class="fine" data-d="1" aria-label="Next station">${chev('up').replace('M6 15l6-6 6 6', 'M9 6l6 6-6 6')}</button></div>
        <div class="bcast" aria-live="polite"></div>
      </div>
      <p class="msg" id="lockMsg" aria-live="polite">Tap the arrows or the knob to change station. Listen for a voice.</p>
      <div class="lrow"><button class="lbtn back" data-x>Turn it off</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel), needle = $('.needle', panel), eye = $('.eye', panel), knob = $('.knob2 i', panel), bc = $('.bcast', panel);
  const show = () => {
    const st = RADIO_STATIONS[at], clear = locked ? 1 : st.clear;
    needle.style.left = `calc(14px + (100% - 28px) * ${((st.f - 88) / 20).toFixed(4)})`; knob.style.transform = `rotate(${at * 45}deg)`;
    eye.style.setProperty('--e', (locked ? 1 : clear * .6).toFixed(2)); R.set(clear, clear ? 0 : 2);
    if (!locked) bc.innerHTML = `<p class="bl ann">${st.f.toFixed(1)}: ${esc(st.txt)}</p>`;
  };
  function broadcast() {
    locked = true; show(); Snd.click(); vibe([20, 30, 20]);
    lockEl.classList.add('solved', 'onair'); $('#lockMsg', panel).textContent = '';
    $$('.tuner button', panel).forEach(b => { b.disabled = true; });
    bc.innerHTML = o.broadcast.map(([who, text], i) => `<p class="bl ${who}${i === (o.keyLine || 1) ? ' hot' : ''}">${esc(text)}</p>`).join('');
    const k = $('.bl.hot', bc); if (k) k.scrollIntoView({ block: 'nearest' });
    Snd.murmur(140, 8);
    o.onOk();   // the clue counts the moment it is on screen
  }
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) { live = false; R.stop(); closeModal(); return; }
    const b = e.target.closest('.tuner [data-d]');
    if (!b || locked) return;
    at = (at + +b.dataset.d + N) % N; G.f.radioAt = at; Snd.tick();
    show();
    if (at === target) setTimeout(() => { if (live && lockEl.isConnected && !locked) broadcast(); }, 250);
  };
  const iv = setInterval(() => { if (!live || !lockEl.isConnected) { live = false; R.stop(); clearInterval(iv); } }, 300);
  show();
}

/* ---------- the mortar: pound it back the way she did ---------- */
function mortarPuzzle(o) {
  const want = o.pattern; // groups, e.g. [2, 1, 3]
  let beats = [], evalT = 0, busy = false;
  openModal(`<div class="lock skin-mortar">
      <div class="plate"><h2>${o.title}</h2><p>${o.sub}</p></div>
      <div class="face">
        <button class="mortar" aria-label="Pound the yam"><svg viewBox="0 0 200 200" aria-hidden="true">
          <ellipse cx="100" cy="186" rx="70" ry="9" fill="#000" opacity=".35"/>
          <g class="pestle"><rect x="92" y="8" width="16" height="84" rx="8" fill="#b88a5e"/><rect x="92" y="8" width="6" height="84" rx="3" fill="#cfa274"/></g>
          <path d="M44 92h112l-14 44q-6 14 -16 18l6 28h-64l6-28q-10-4 -16-18z" fill="#7a5032"/>
          <path d="M44 92h112l-3 8H47z" fill="#9a6a44"/><ellipse cx="100" cy="92" rx="56" ry="11" fill="#5a381f"/><ellipse cx="100" cy="93" rx="46" ry="8" fill="#efe6cf"/><path d="M92 93a8 3 0 0 0 16 0" fill="#b88a5e" opacity=".9"/>
          <path d="M58 112q42 10 84 0M64 132q36 8 72 0" fill="none" stroke="#5a381f" stroke-width="3"/>
        </svg></button>
        <div class="beats" aria-live="polite"></div>
      </div>
      <p class="msg" id="lockMsg" aria-live="polite">Tap the mortar to pound. Leave a breath between the groups.</p>
      <div class="lrow"><button class="lbtn back" data-x>Leave it</button><button class="lbtn back" data-listen>Listen</button></div>
    </div>`, { cls: 'lockpanel' });
  const lockEl = $('.lock', panel), pestle = $('.pestle', panel), beatsEl = $('.beats', panel), msg = $('#lockMsg', panel);
  const hit = (ghost) => {
    pestle.classList.remove('down'); void pestle.getBoundingClientRect(); pestle.classList.add('down');
    Snd.pound(ghost ? .7 : 1); if (!ghost) vibe(18);
  };
  // a "breath" is any gap clearly longer than the quick ones, so fast and slow thumbs both work
  const groups = () => {
    if (!beats.length) return [];
    const gaps = beats.slice(1).map((t, i) => t - beats[i]);
    const lo = Math.min(...gaps), hi = Math.max(...gaps);
    const thr = gaps.length && hi > Math.max(lo * 1.45, lo + 180) ? (lo + hi) / 2 : Infinity;
    const g = [1]; gaps.forEach(d => { if (d > thr) g.push(1); else g[g.length - 1]++; });
    return g;
  };
  const draw = () => { beatsEl.innerHTML = groups().map(n => `<span class="bg">${'<i></i>'.repeat(n)}</span>`).join(''); };
  const check = () => {
    if (!lockEl.isConnected) return;
    const g = groups();
    if (g.join() === want.join()) {
      busy = true; lockEl.classList.add('solved'); Snd.unlock(); vibe([20, 40, 60]); msg.textContent = o.done || '';
      setTimeout(() => { if (lockEl.isConnected) closeModal(); o.onOk(); }, 1500);
    } else {
      lockEl.classList.remove('shake'); void lockEl.offsetWidth; lockEl.classList.add('shake');
      Snd.wrong(); addDread(3);
      msg.textContent = o.fail || 'The pestle drags in your hands. Not like that.';
      beats = []; setTimeout(draw, 500);
    }
  };
  $('.mortar', panel).addEventListener('pointerdown', e => {
    e.preventDefault(); if (busy) return;
    beats.push(performance.now()); hit(false); draw();
    clearTimeout(evalT); evalT = setTimeout(check, 1700);
  });
  panel.onclick = e => {
    if (e.target.closest('[data-listen]') && !busy) {
      busy = true; beats = []; draw(); clearTimeout(evalT); msg.textContent = 'From the dark beside you, someone else is pounding…';
      let t = 300;
      want.forEach(n => { for (let k = 0; k < n; k++) { setTimeout(() => modalOpen() && hit(true), t); t += 300; } t += 700; });
      setTimeout(() => { busy = false; if (modalOpen()) msg.textContent = 'Your turn. Tap the mortar.'; }, t);
    } else if (e.target.closest('[data-x]')) { clearTimeout(evalT); closeModal(); }
  };
}
