/* ================= PROCEDURAL TEXTURES (all painted on canvases) ================= */
const TP = {};
(() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  const wrapBlob = (g, size, x, y, rad, col) => {
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, size, size);
    }
  };
  const grime = (g, size, r, n, a) => { for (let k = 0; k < n; k++) wrapBlob(g, size, r() * size, r() * size, 28 + r() * 70, `rgba(0,0,0,${a})`); };
  const noise = (g, w, h, r, n, a) => { for (let i = 0; i < n; i++) { const v = r() < .5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${r() * a})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } };
  const clampTex = c => { c.clampWrap = true; return c; };

  function planks(size, base, count, seed, vertical, gap) {
    const [c, g] = mk(size, size), r = rng(seed), w = size / count;
    for (let i = 0; i < count; i++) {
      g.fillStyle = shade(base, .78 + r() * .44);
      if (vertical) g.fillRect(i * w, 0, w, size); else g.fillRect(0, i * w, size, w);
      for (let j = 0; j < 22; j++) {
        g.strokeStyle = `rgba(0,0,0,${.05 + r() * .12})`; g.lineWidth = 1; g.beginPath();
        const o = r() * w;
        if (vertical) { g.moveTo(i * w + o, 0); g.lineTo(i * w + o + (r() - .5) * 3, size); } else { g.moveTo(0, i * w + o); g.lineTo(size, i * w + o + (r() - .5) * 3); }
        g.stroke();
      }
      g.fillStyle = gap;
      if (vertical) { g.fillRect(i * w, 0, 1.6, size); g.fillRect(i * w, r() * size, w, 1.6); } else { g.fillRect(0, i * w, size, 1.6); g.fillRect(r() * size, i * w, 1.6, w); }
    }
    grime(g, size, r, 6, .16); noise(g, size, size, r, 160, .09);
    return c;
  }
  TP.floorFoyer = () => planks(256, '#4a3322', 8, 11, true, '#150d08');
  TP.floorNursery = () => planks(256, '#5a4638', 8, 12, true, '#1c1210');
  TP.floorAttic = () => planks(256, '#3a2a1f', 6, 13, false, '#100a07');
  TP.wallAttic = () => planks(256, '#5a4638', 6, 14, true, '#120c09');
  TP.woodA = () => planks(128, '#6d4a2d', 4, 21, false, '#2a1a0e');
  TP.woodB = () => planks(128, '#43291a', 4, 22, false, '#1a0f08');
  TP.woodPale = () => planks(128, '#8a7a68', 4, 23, false, '#3a3026');

  function lattice(size, bg, line, seed, motif) {
    const [c, g] = mk(size, size), r = rng(seed), h = size / 2;
    g.fillStyle = bg; g.fillRect(0, 0, size, size);
    for (let i = 0; i < size; i += 4) { g.fillStyle = 'rgba(255,255,255,.015)'; g.fillRect(i, 0, 2, size); }
    g.strokeStyle = line; g.lineWidth = 2;
    if (motif === 'diamond') {
      g.beginPath(); g.moveTo(0, h); g.lineTo(h, 0); g.lineTo(size, h); g.lineTo(h, size); g.closePath(); g.stroke();
      g.fillStyle = line; g.beginPath(); g.arc(h, h, 4, 0, 7); g.fill();
    } else {
      g.fillStyle = line;
      const star = (x, y, rr) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, d = k % 2 ? rr * .45 : rr; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath(); g.fill(); };
      star(h * .5, h * .5, 12); star(h * 1.5, h * 1.5, 12);
      g.beginPath(); g.arc(h * 1.5, h * .5, 3, 0, 7); g.arc(h * .5, h * 1.5, 3, 0, 7); g.fill();
    }
    for (let k = 0; k < 7; k++) { const x = r() * size; const gr = g.createLinearGradient(x, 0, x, size); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, 'rgba(10,8,4,.22)'); gr.addColorStop(1, 'rgba(0,0,0,.05)'); g.fillStyle = gr; g.fillRect(x, 0, 6 + r() * 14, size); }
    grime(g, size, r, 5, .18); noise(g, size, size, r, 220, .08);
    return c;
  }
  TP.wallFoyer = () => lattice(256, '#2e4136', '#4d6356', 31, 'diamond');
  TP.wallNursery = () => lattice(256, '#4a3a4d', '#7a6585', 32, 'star');

  function bricks(size, base, mortar, seed, rows, cols) {
    const [c, g] = mk(size, size), r = rng(seed), bh = size / rows, bw = size / cols;
    g.fillStyle = mortar; g.fillRect(0, 0, size, size);
    for (let y = 0; y < rows; y++) for (let x = -1; x < cols; x++) {
      const off = (y % 2) * bw / 2;
      g.fillStyle = shade(base, .72 + r() * .5);
      g.fillRect(x * bw + off + 1.5, y * bh + 1.5, bw - 3, bh - 3);
      for (let k = 0; k < 5; k++) { g.fillStyle = `rgba(0,0,0,${r() * .18})`; g.fillRect(x * bw + off + 2 + r() * (bw - 6), y * bh + 2 + r() * (bh - 6), 2 + r() * 10, 1 + r() * 3); }
    }
    for (let k = 0; k < 4; k++) wrapBlob(g, size, r() * size, r() * size, 30 + r() * 40, 'rgba(40,64,34,.28)');
    grime(g, size, r, 5, .18); noise(g, size, size, r, 200, .08);
    return c;
  }
  TP.wallCellar = () => bricks(256, '#4a4d52', '#17181a', 41, 6, 3);
  TP.chimney = () => bricks(256, '#4d4741', '#1d1a17', 42, 8, 4);
  TP.floorCellar = () => {
    const [c, g] = mk(256, 256), r = rng(43);
    g.fillStyle = '#121211'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = shade('#33312e', .7 + r() * .5); g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(0,0,0,${r() * .2})`; g.fillRect(x * 64 + r() * 56, y * 64 + r() * 56, 4 + r() * 16, 2 + r() * 6); } }
    wrapBlob(g, 256, 90, 60, 60, 'rgba(10,30,40,.5)'); wrapBlob(g, 256, 190, 190, 50, 'rgba(10,30,40,.5)');
    grime(g, 256, r, 5, .2);
    return c;
  };
  TP.ceil = () => { const [c, g] = mk(128, 128), r = rng(51); g.fillStyle = '#1a1620'; g.fillRect(0, 0, 128, 128); noise(g, 128, 128, r, 380, .12); grime(g, 128, r, 4, .3); return c; };
  TP.ceilStone = () => bricks(128, '#303236', '#0f1011', 52, 3, 2);

  TP.fabric = () => {
    const [c, g] = mk(128, 128), r = rng(61);
    g.fillStyle = '#5b2b26'; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 2) { g.fillStyle = `rgba(0,0,0,${.05 + r() * .08})`; g.fillRect(0, y, 128, 1); }
    noise(g, 128, 128, r, 600, .12); grime(g, 128, r, 3, .22);
    return c;
  };
  TP.rug = () => {
    const [c, g] = mk(256, 256), r = rng(62);
    g.fillStyle = '#4a1f24'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#c9a23c'; g.lineWidth = 3; g.strokeRect(12, 12, 232, 232);
    g.strokeStyle = '#1f2f48'; g.lineWidth = 12; g.strokeRect(26, 26, 204, 204);
    g.fillStyle = '#1f2f48'; g.beginPath(); g.moveTo(128, 60); g.lineTo(196, 128); g.lineTo(128, 196); g.lineTo(60, 128); g.closePath(); g.fill();
    g.fillStyle = '#c9a23c'; g.beginPath(); g.moveTo(128, 92); g.lineTo(164, 128); g.lineTo(128, 164); g.lineTo(92, 128); g.closePath(); g.fill();
    g.fillStyle = '#4a1f24'; g.beginPath(); g.arc(128, 128, 14, 0, 7); g.fill();
    grime(g, 256, r, 6, .2); noise(g, 256, 256, r, 800, .14);
    return c;
  };
  TP.rugPink = () => {
    const [c, g] = mk(256, 256), r = rng(63);
    g.fillStyle = '#6a5a78'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5; i++) { g.strokeStyle = ['#b08d9a', '#8d9ab0', '#a8b08d'][i % 3]; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 20 + i * 22, 0, 7); g.stroke(); }
    grime(g, 256, r, 6, .2); noise(g, 256, 256, r, 800, .14);
    return c;
  };

  TP.flame = () => {
    const [c, g] = mk(64, 64), gr = g.createRadialGradient(32, 38, 1, 32, 36, 28);
    gr.addColorStop(0, 'rgba(255,250,200,1)'); gr.addColorStop(.25, 'rgba(255,190,80,.95)'); gr.addColorStop(.6, 'rgba(255,110,30,.35)'); gr.addColorStop(1, 'rgba(255,80,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.globalCompositeOperation = 'destination-in';
    const m = g.createLinearGradient(0, 0, 0, 64); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.35, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = m; g.fillRect(0, 0, 64, 64);
    return clampTex(c);
  };
  TP.glow = () => { const [c, g] = mk(64, 64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return clampTex(c); };
  TP.blob = () => { const [c, g] = mk(64, 64), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return clampTex(c); };
  TP.glint = () => {
    const [c, g] = mk(64, 64);
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,240,190,1)'); gr.addColorStop(.18, 'rgba(255,225,150,.7)'); gr.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(255,245,210,.95)'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 6); g.lineTo(32, 58); g.moveTo(6, 32); g.lineTo(58, 32); g.stroke();
    return clampTex(c);
  };
  TP.paper = () => {
    const [c, g] = mk(128, 128), r = rng(71);
    g.fillStyle = '#d9cdb0'; g.fillRect(0, 0, 128, 128); noise(g, 128, 128, r, 500, .14);
    wrapBlob(g, 128, 20, 100, 40, 'rgba(110,80,30,.3)'); wrapBlob(g, 128, 100, 30, 36, 'rgba(110,80,30,.25)');
    return clampTex(c);
  };
  const paperText = (lines, opts = {}) => () => {
    const [c, g] = mk(256, 256), r = rng(72);
    g.fillStyle = opts.bg || '#d9cdb0'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, r, 800, .14);
    wrapBlob(g, 256, 30, 220, 70, 'rgba(110,80,30,.3)');
    g.fillStyle = opts.ink || '#2a2118'; g.font = `800 ${opts.size || 24}px "Bricolage Grotesque", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); if (opts.mirror) { g.translate(256, 0); g.scale(-1, 1); }
    lines.forEach((l, i) => g.fillText(l, 128, 128 + (i - (lines.length - 1) / 2) * (opts.lh || 38)));
    g.restore();
    return clampTex(c);
  };
  TP.noteMirror = paperText(['FIRST THE BONE', 'THEN THE BLOOD', 'THEN THE SEA', 'LAST THE GRAVE'], { mirror: true, size: 21, lh: 40 });
  TP.noteScrap = paperText(['THE DEAD READ', 'LEFT TO RIGHT.'], { size: 24, lh: 44, ink: '#4a3a1a' });
  TP.noteClock = paperText(['The clock stopped', 'when she fell.', 'The drawer', 'remembers the hour.'], { size: 20, lh: 36, ink: '#4a3a1a' });

  TP.mirrorDust = () => {
    const [c, g] = mk(256, 512), r = rng(81);
    g.fillStyle = '#8f8b7c'; g.fillRect(0, 0, 256, 512); noise(g, 256, 512, r, 3000, .15);
    for (let k = 0; k < 14; k++) wrapBlob(g, 512, r() * 256, r() * 512, 30 + r() * 60, 'rgba(60,56,46,.38)');
    g.strokeStyle = 'rgba(190,186,170,.45)'; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(60, 340); g.quadraticCurveTo(120, 290, 196, 330); g.moveTo(80, 220); g.quadraticCurveTo(140, 190, 210, 232); g.stroke();
    return clampTex(c);
  };
  TP.mirrorClean = () => {
    const [c, g] = mk(256, 512), r = rng(82);
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2a3a3c'); gr.addColorStop(1, '#0f1a1c'); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
    g.fillStyle = 'rgba(180,210,205,.06)'; g.beginPath(); g.ellipse(128, 330, 52, 96, 0, 0, 7); g.fill(); g.beginPath(); g.arc(128, 210, 26, 0, 7); g.fill();
    g.fillStyle = 'rgba(120,150,150,.1)'; g.fillRect(0, 440, 256, 72); noise(g, 256, 512, r, 800, .06);
    // reflected note, readable
    g.save(); g.translate(128, 120); g.fillStyle = '#d9cdb0'; g.fillRect(-92, -64, 184, 128);
    g.fillStyle = '#2a2118'; g.font = '800 17px "Bricolage Grotesque", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['FIRST THE BONE', 'THEN THE BLOOD', 'THEN THE SEA', 'LAST THE GRAVE'].forEach((l, i) => g.fillText(l, 0, (i - 1.5) * 28));
    g.restore();
    return clampTex(c);
  };

  const digit = (d, seed) => () => {
    const [c, g] = mk(128, 128), r = rng(seed);
    g.fillStyle = '#8c1824'; g.strokeStyle = '#5a0d16'; g.lineWidth = 3; g.font = '900 104px "Bricolage Grotesque", Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeText(d, 64, 56); g.fillText(d, 64, 56);
    for (let k = 0; k < 4; k++) { const x = 34 + r() * 60, y = 96 + r() * 6, l = 8 + r() * 22; g.fillStyle = '#8c1824'; g.fillRect(x, y - 30, 4, l + 30); g.beginPath(); g.arc(x + 2, y + l, 3, 0, 7); g.fill(); }
    return clampTex(c);
  };
  TP.digit5 = digit('5', 91); TP.digit2 = digit('2', 92); TP.digit9 = digit('9', 93);

  // not a texture itself: it makes the painter for one clock time (hidden from the texture preloader)
  Object.defineProperty(TP, 'clockFaceAt', { enumerable: false, value: (hh, mm) => () => {
    const [c, g] = mk(256, 256);
    g.fillStyle = '#d8d0b8'; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill();
    g.strokeStyle = '#2a1b0c'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#2a1b0c'; g.font = '700 24px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    R.forEach((t, i) => { const a = i * Math.PI / 6 - Math.PI / 2; g.fillText(t, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); });
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; g.lineWidth = i % 5 ? 1.5 : 3; g.beginPath(); g.moveTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); g.lineTo(128 + Math.cos(a) * 118, 128 + Math.sin(a) * 118); g.stroke(); }
    const hand = (deg, len, w) => { const a = (deg - 90) * Math.PI / 180; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * len, 128 + Math.sin(a) * len); g.stroke(); };
    hand((hh % 12) * 30 + mm * .5, 58, 9); hand(mm * 6, 88, 5);
    g.fillStyle = '#1b1208'; g.beginPath(); g.arc(128, 128, 8, 0, 7); g.fill();
    return clampTex(c);
  } });
  TP.clockFace = TP.clockFaceAt(7, 20);

  const portrait = open => () => {
    const [c, g] = mk(256, 320);
    const bg = g.createRadialGradient(128, 120, 10, 128, 140, 200); bg.addColorStop(0, '#2a3a34'); bg.addColorStop(1, '#0b0f0e'); g.fillStyle = bg; g.fillRect(0, 0, 256, 320);
    g.fillStyle = '#0a090b'; g.beginPath(); g.moveTo(70, 320); g.quadraticCurveTo(54, 200, 74, 120); g.lineTo(182, 120); g.quadraticCurveTo(202, 200, 186, 320); g.fill();
    g.fillStyle = '#183128'; g.beginPath(); g.moveTo(40, 320); g.lineTo(58, 238); g.quadraticCurveTo(128, 210, 198, 238); g.lineTo(216, 320); g.fill();
    g.fillStyle = '#c9d1c7'; g.beginPath(); g.moveTo(100, 232); g.quadraticCurveTo(128, 262, 156, 232); g.lineTo(150, 214); g.lineTo(106, 214); g.fill();
    g.fillStyle = '#d4dad0'; g.beginPath(); g.ellipse(128, 142, 40, 52, 0, 0, 7); g.fill();
    g.fillStyle = '#0a090b'; g.beginPath(); g.moveTo(84, 140); g.quadraticCurveTo(84, 82, 128, 82); g.quadraticCurveTo(172, 82, 172, 140); g.quadraticCurveTo(160, 110, 128, 110); g.quadraticCurveTo(96, 110, 84, 140); g.fill();
    g.fillStyle = '#151515';
    if (open) { g.strokeStyle = '#151515'; g.lineWidth = 3; g.beginPath(); g.arc(112, 142, 7, .2, Math.PI - .2); g.arc(144, 142, 7, .2, Math.PI - .2); g.stroke(); }
    else { g.beginPath(); g.ellipse(112, 140, 9, 5, 0, 0, 7); g.ellipse(144, 140, 9, 5, 0, 0, 7); g.fill(); g.fillStyle = '#cfe9e1'; g.beginPath(); g.arc(112, 140, 2.4, 0, 7); g.arc(144, 140, 2.4, 0, 7); g.fill(); }
    g.strokeStyle = '#6d2f3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(118, 176); g.quadraticCurveTo(128, 182, 138, 176); g.stroke();
    g.strokeStyle = '#b9962f'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(98, 222); g.quadraticCurveTo(128, 262, 158, 222); g.stroke();
    if (open) { g.fillStyle = '#c9a94a'; g.beginPath(); g.ellipse(128, 252, 8, 11, 0, 0, 7); g.fill(); }
    else { g.strokeStyle = '#b9962f'; g.strokeRect(121, 246, 14, 11); }
    return clampTex(c);
  };
  TP.portraitA = portrait(false); TP.portraitB = portrait(true);

  TP.symPlate = () => {
    const [c, g] = mk(256, 128);
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#c4a04a'); gr.addColorStop(1, '#8a6c24'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#3a2a0c'; g.lineWidth = 4; g.strokeRect(6, 6, 244, 116);
    g.fillStyle = '#2a1c06';
    const star = (x, y, r) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, d = k % 2 ? r * .42 : r; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath(); g.fill(); };
    star(44, 64, 28);
    g.beginPath(); g.arc(128, 64, 26, 0, 7); g.fill(); g.fillStyle = '#a07d2e'; g.beginPath(); g.arc(140, 58, 22, 0, 7); g.fill();
    g.fillStyle = '#2a1c06'; g.beginPath(); g.arc(212, 64, 14, 0, 7); g.fill(); g.strokeStyle = '#2a1c06'; g.lineWidth = 5; g.lineCap = 'round';
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(212 + Math.cos(a) * 20, 64 + Math.sin(a) * 20); g.lineTo(212 + Math.cos(a) * 30, 64 + Math.sin(a) * 30); g.stroke(); }
    return clampTex(c);
  };
  const sym = kind => () => {
    const [c, g] = mk(64, 64);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round';
    if (kind === 'star') { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, d = k % 2 ? 11 : 27; g.lineTo(32 + Math.cos(a) * d, 33 + Math.sin(a) * d); } g.closePath(); g.fill(); }
    else if (kind === 'moon') { g.beginPath(); g.arc(32, 32, 24, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(42, 26, 21, 0, 7); g.fill(); }
    else { g.beginPath(); g.arc(32, 32, 11, 0, 7); g.fill(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(32 + Math.cos(a) * 17, 32 + Math.sin(a) * 17); g.lineTo(32 + Math.cos(a) * 27, 32 + Math.sin(a) * 27); g.stroke(); } }
    return clampTex(c);
  };
  TP.symStar = sym('star'); TP.symMoon = sym('moon'); TP.symSun = sym('sun');

  const block = (ch, col) => () => { const [c, g] = mk(64, 64); g.fillStyle = col; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(2, 2, 60, 60); g.fillStyle = '#f2e8d0'; g.font = '800 42px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 32, 36); return clampTex(c); };
  TP.blockH = block('H', '#a8473a'); TP.blockE = block('E', '#3f6a96'); TP.blockL = block('L', '#c9a23c'); TP.blockP = block('P', '#4d8456');

  TP.books = () => {
    const [c, g] = mk(128, 64), r = rng(95);
    g.fillStyle = '#120d09'; g.fillRect(0, 0, 128, 64);
    let x = 2; while (x < 126) { const w = 5 + r() * 9, h = 40 + r() * 20; g.fillStyle = shade(['#5a2a22', '#2a3d52', '#3d5a34', '#6a5230', '#40304e'][Math.floor(r() * 5)], .6 + r() * .4); g.fillRect(x, 64 - h, w, h); g.fillStyle = 'rgba(210,190,120,.45)'; g.fillRect(x + 1, 64 - h + 5, w - 2, 1.5); x += w + .5; }
    return clampTex(c);
  };
  TP.outsideSwing = () => {
    const [c, g] = mk(128, 256);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#2c3d5a'); gr.addColorStop(1, '#0c1018'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#dfe8f2'; g.beginPath(); g.arc(88, 50, 14, 0, 7); g.fill();
    g.strokeStyle = '#05070a'; g.lineWidth = 5; g.beginPath(); g.moveTo(24, 256); g.lineTo(40, 70); g.lineTo(104, 70); g.lineTo(120, 256); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(58, 70); g.lineTo(52, 170); g.moveTo(86, 70); g.lineTo(80, 170); g.stroke(); g.fillRect(48, 168, 36, 6);
    g.fillStyle = '#080a10'; g.fillRect(0, 214, 128, 42);
    return clampTex(c);
  };
  TP.moonWindow = () => {
    const [c, g] = mk(128, 256);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#6f8fb4'); gr.addColorStop(1, '#2c4262'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#dfe9f4'; g.beginPath(); g.arc(78, 62, 18, 0, 7); g.fill();
    g.fillStyle = 'rgba(8,10,16,.8)'; g.beginPath(); g.moveTo(0, 256); g.lineTo(0, 190); for (let x = 0; x <= 128; x += 16) g.lineTo(x, 190 - 18 * Math.abs(Math.sin(x * .13))); g.lineTo(128, 256); g.fill();
    return clampTex(c);
  };
  TP.dawn = () => {
    const [c, g] = mk(128, 256);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#5a6a9a'); gr.addColorStop(.55, '#e59a86'); gr.addColorStop(1, '#ffd9a0'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    g.fillStyle = 'rgba(40,40,70,.9)'; g.fillRect(0, 226, 128, 30);
    return clampTex(c);
  };
  TP.deskGrain = TP.woodA;
  TP._h = { mk, rng, shade, wrapBlob, grime, noise, clampTex, planks, bricks, lattice, paperText };
})();
