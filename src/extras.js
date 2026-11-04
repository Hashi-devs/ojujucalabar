/* ================= EXTRAS: chapter select and the cowrie gallery ================= */
/* Chapter select opens after the first finish. A chapter run starts at that chapter's first room with what you
   would be carrying by then, new puzzle answers, and no leaderboard. Pages and cowries found in ANY run are kept in
   a lasting collection on this phone: a chapter run ends in the true ending once every page has been found at least
   once, so players can go back for the pages they missed.
   The gallery has seven pictures, one more for every cowrie ever found. Amuro's art replaces the placeholders:
   save it as assets/gallery/<id>.png (or .jpg / .webp), e.g. assets/gallery/g1.png, and rebuild. */
function everSet(k) { try { const v = store.get(k); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function addEver(k, id) { const s = everSet(k); if (!s.includes(id)) { s.push(id); store.set(k, s); } }
function pagesEver() { return everSet('oc_pageset'); }
function cowriesEver() { return Math.max(everSet('oc_cowset').length, +store.get('oc_cowries') || 0); }
function allPagesEver() { return PAGES.every(p => pagesEver().includes(p.id) || G.pages.includes(p.id)); }
// function declarations, not consts: the title screen asks for these while the game is still loading
function chapterOpen() { return !!(store.get('hm3_done') || store.get('hm3_true')); }

/* ---- chapter select ---- */
const CHAPTER_START = [
  { room: 0, name: 'Chapter 1 · Downstairs', rooms: 'Living Room, Tobi’s Room, Mama’s Kitchen', inv: [] },
  { room: 3, name: 'Chapter 2', rooms: 'The Boys’ Quarters, Papa’s Office', inv: ['matches'] },
  { room: 5, name: 'Chapter 3 · Upstairs', rooms: 'Mama’s Prayer Room, the Master Bedroom, the Roof', inv: ['matches', 'hammer'] }
];
function openChapters() {
  const sv = readSave(), seen = pagesEver().length;
  openModal(`<h2>Chapter select</h2>
    <p class="lead">Go back in for the pages you missed. Pages found in any run count toward the whole story: ${seen} of ${PAGES.length} so far.</p>
    <div class="chlist">${CHAPTER_START.map((c, i) => `<button class="chbtn" data-ch="${i}"><b>${c.name}</b><span>${c.rooms}</span></button>`).join('')}</div>
    <p class="hint-note">Chapter runs have new puzzle answers and do not count for the leaderboard.${sv ? ' Starting one replaces your saved game.' : ''}</p>
    <div class="col"><button class="btn" data-x>Close</button></div>`, { onX: () => showTitle() });
  let armed = -1;
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) { closeModal(); showTitle(); return; }
    const b = e.target.closest('[data-ch]'); if (!b) return;
    const i = +b.dataset.ch;
    if (sv && armed !== i) { armed = i; $$('.chbtn', panel).forEach(x => x.classList.remove('danger')); b.classList.add('danger'); $('span', b).textContent = 'Tap again to replace your save'; return; }
    closeModal(); Snd.init(); goLandscape(); startChapter(i);
  };
}
function startChapter(i) {
  const c = CHAPTER_START[i];
  store.del(SAVE_KEY); lastSig = '';
  G.inv = c.inv.slice(); G.journal = []; G.pages = []; G.cowries = []; G.hints = 0; G.scares = 0; G.hintLv = {};
  G.t0 = Date.now(); G.f = {}; G.snap = null; G.ending = false; G.lives = LIVES_MAX; G.chap = null; G.flash = [];
  G.puz = rollPuzzles(); G.run = null; G.finalMs = 0; G.chapterRun = i;
  $('#title').classList.add('off'); document.body.classList.remove('lbtitle');
  withLoading(() => { startPlay(); enterRoom(c.room); }, 900);
}

/* ---- the gallery ---- */
const MASK_SVG = `<svg viewBox="0 0 200 260" aria-hidden="true"><rect width="200" height="260" fill="#120c0a"/><path d="M100 26C58 26 40 64 44 116C47 160 66 196 100 206C134 196 153 160 156 116C160 64 142 26 100 26Z" fill="#2b1d16" stroke="#5c3d26" stroke-width="3"/><path d="M60 92Q80 80 92 96M140 92Q120 80 108 96" stroke="#d9cfb8" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="108" rx="13" ry="9" fill="#0b0705"/><ellipse cx="122" cy="108" rx="13" ry="9" fill="#0b0705"/><path d="M100 112V146" stroke="#4a3220" stroke-width="6"/><path d="M74 166Q100 186 126 166" stroke="#0b0705" stroke-width="10" fill="none"/><path d="M80 168l6 8l6-8l6 8l6-8l6 8l6-8" stroke="#d9cfb8" stroke-width="3" fill="none"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${46 + i * 3.6} 200Q${40 + i * 4} 232 ${30 + i * 4.6} 260" stroke="${['#8a6a2c', '#a9853c', '#6b5020'][i % 3]}" stroke-width="3" fill="none"/>`).join('')}</svg>`;
const STUDIO_SVG = `<svg viewBox="0 0 200 260" aria-hidden="true"><rect width="200" height="260" fill="#0c0a11"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${k * 40}" y="0" width="20" height="14" fill="#127a72"/><rect x="${k * 40 + 20}" y="0" width="20" height="14" fill="#e2832a"/><rect x="${k * 40}" y="246" width="20" height="14" fill="#1d3a6b"/><rect x="${k * 40 + 20}" y="246" width="20" height="14" fill="#7a1f2b"/>`).join('')}<text x="100" y="118" text-anchor="middle" fill="#ece3d2" font-size="26" font-weight="800" font-family="Ojuju, sans-serif">MUNIAC</text><text x="100" y="146" text-anchor="middle" fill="#eb9440" font-size="16" font-weight="700" font-family="Ojuju, sans-serif">STUDIOS</text></svg>`;
const GALLERY = [
  { id: 'g1', title: 'Adeleke House', art: () => titleArt(), text: 'Built in 1972 at the very top of the hill above Oke-Ọla, with a chimney nobody in Nigeria needed. Every clock in it stopped at 7:20 on 14 October 1975.' },
  { id: 'g2', title: 'Ojuju Calabar', art: () => FACE_SILAS, text: 'What the hill children called the thing that walked the house. Tall, long-fingered, in raffia to the ground, with a dark carved face. Not evil for its own sake: it wanted its name back, and a burial.' },
  { id: 'g3', title: 'Adaeze Adeleke, Mama', art: () => GHOST_FACE, text: 'A teacher from Enugu. She knew something was wrong long before she could prove it, and on the worst night of her life she took her son and ran down the hill in the rain.' },
  { id: 'g4', title: 'Small Tobi', art: () => FACE_CHILD, text: 'Tobenna Oluwaseun Adeleke at four: two names, because he had two peoples. Effiong called him “my small driver”.' },
  { id: 'g5', title: 'The garden, 1974', art: () => FAMILY_PHOTO, text: 'Papa in his blue fila, Mama in her green gele, and Effiong Etim with small Tobi on his shoulders. The photograph Papa smashed.' },
  { id: 'g6', title: 'Ekpo', art: () => MASK_SVG, text: 'Ekpo is a masquerade society of the Ibibio and Annang peoples, around Ikot Ekpene in today’s Akwa Ibom State. Its masqueraders wear dark carved wooden masks and raffia, and are said to carry the spirits of the ancestors. Ojuju Calabar is a ghost story inspired by that tradition, not a picture of it.' },
  { id: 'g7', title: 'From Muniac Studios', art: () => STUDIO_SVG, text: 'Thank you for going back into the house. Ojuju Calabar is made in Nigeria by Muniac Studios. Story and art by Amuro.' }
];
const galleryArt = g => (typeof GALLERY_IMG !== 'undefined' && GALLERY_IMG[g.id]) ? `<img src="${GALLERY_IMG[g.id]}" alt="">` : g.art();
function openGallery(back) {
  const have = cowriesEver();
  openModal(`<h2>Gallery</h2>
    <p class="lead">One picture for every cowrie you have ever found: ${Math.min(have, 7)} of 7.</p>
    <div class="gal">${GALLERY.map((g, i) => i < have
      ? `<button class="gtile" data-g="${i}"><span class="gart">${galleryArt(g)}</span><b>${esc(g.title)}</b></button>`
      : `<div class="gtile locked" aria-label="Locked"><span class="gart"><svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="22" rx="10" ry="13" fill="none" stroke="#6b6355" stroke-width="2"/><path d="M20 12V32" stroke="#6b6355" stroke-width="2"/></svg></span><b>Find ${i + 1} cowrie${i ? 's' : ''}</b></div>`).join('')}</div>
    <div class="col"><button class="btn" data-x>Close</button></div>`, { onX: () => { if (back) back(); } });
  panel.onclick = e => {
    if (e.target.closest('[data-x]')) { closeModal(); if (back) back(); return; }
    const t = e.target.closest('[data-g]'); if (t) viewGallery(+t.dataset.g, back);
  };
}
function viewGallery(i, back) {
  const have = Math.min(cowriesEver(), GALLERY.length), g = GALLERY[i];
  openModal(`<div class="gview"><div class="gbig">${galleryArt(g)}</div><h2>${esc(g.title)}</h2><p>${esc(g.text)}</p></div>
    <div class="row">${i > 0 ? '<button class="btn" data-prev>Previous</button>' : ''}${i < have - 1 ? '<button class="btn" data-next>Next</button>' : ''}<button class="btn primary" data-x>Back</button></div>`, { onX: () => openGallery(back) });
  panel.onclick = e => {
    if (e.target.closest('[data-prev]')) viewGallery(i - 1, back);
    else if (e.target.closest('[data-next]')) viewGallery(i + 1, back);
    else if (e.target.closest('[data-x]')) openGallery(back);
  };
}
/* ---- end credits ---- */
/* Each line is [role, name]. Leave the role empty for a line on its own. Amuro sends the final list. */
const CREDITS = [
  ['', 'OJUJU CALABAR'],
  ['A game by', 'Muniac Studios'],
  ['Game developer', 'Muniac'],
  ['Story and comic panel designer', 'Amuro'],
  // voice actors go here when Amuro sends the names, e.g. ['Tobi', 'Name'],
  ['Sound effects', 'Kenney (kenney.nl) and Mixkit (mixkit.co)'],
  ['', 'Made in Nigeria.'],
  ['', 'Thank you for going back into the house.']
];
function rollCredits(done) {
  const el = document.createElement('div'); el.id = 'credits';
  el.innerHTML = `<button class="btn skip" type="button">Skip</button><div class="croll">${CREDITS.map(([r, n], i) =>
    i === 0 ? `<h1>${esc(n)}</h1>` : `<p>${r ? `<span>${esc(r)}</span>` : ''}<b>${esc(n)}</b></p>`).join('')}</div>`;
  document.body.appendChild(el);
  const roll = $('.croll', el);
  roll.style.setProperty('--dur', Math.max(18, CREDITS.length * 3.2) + 's');
  let over = false;
  const end = () => { if (over) return; over = true; el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 600); };
  roll.addEventListener('animationend', () => setTimeout(end, 1200));
  $('.skip', el).onclick = e => { e.stopPropagation(); end(); };
  try { Snd.init(); Snd.music(true); } catch (e) { /* no music */ }
}
if (window.__hm) Object.assign(window.__hm, { rollCredits, CREDITS, openChapters, startChapter, openGallery, GALLERY, pagesEver, cowriesEver, allPagesEver });
