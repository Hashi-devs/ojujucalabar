/* ================= PROCEDURAL TEXTURES, part three: the Nigerian house ================= */
/* Terrazzo, two-tone plaster, Ankara wax prints, lace covers, the showglass, an old TV, a bank calendar,
   the agbada, painted iron trunk boxes, and new portraits of Mma Eno and Chief Okon Ekpo. */
(() => {
  const { mk, rng, shade, wrapBlob, grime, noise, clampTex } = TP._h;
  const SERIF = '"Ojuju", Georgia, "Times New Roman", serif';

  const terrazzo = (base, seed) => () => {
    const [c, g] = mk(256, 256), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    const chips = ['#3a3532', '#8a3b28', '#e8e1d0', '#5c6660', '#b38a52', '#1b1918', '#9a9286'];
    for (let i = 0; i < 1400; i++) {
      const x = r() * 256, y = r() * 256, s = 1 + r() * r() * 7;
      g.fillStyle = chips[Math.floor(r() * chips.length)];
      g.beginPath(); g.moveTo(x, y); for (let k = 1; k < 5; k++) { const a = k * 1.5 + r(); g.lineTo(x + Math.cos(a) * s * (.6 + r() * .6), y + Math.sin(a) * s * (.6 + r() * .6)); } g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(150,120,70,.9)'; g.fillRect(0, 0, 256, 2); g.fillRect(0, 0, 2, 256);
    grime(g, 256, r, 7, .12); noise(g, 256, 256, r, 600, .08);
    return c;
  };
  const plaster = (base, seed, stains = .14) => () => {
    const [c, g] = mk(256, 256), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) wrapBlob(g, 256, r() * 256, r() * 256, 20 + r() * 60, `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${.03 + r() * .04})`);
    for (let i = 0; i < 9; i++) { // rain-water streaks under old paint
      const x = r() * 256, w = 3 + r() * 10, gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, `rgba(60,45,30,${stains})`); gr.addColorStop(1, 'rgba(60,45,30,0)');
      g.fillStyle = gr; g.fillRect(x, 0, w, 120 + r() * 136);
    }
    for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(0,0,0,${.08 + r() * .1})`; g.lineWidth = 1; g.beginPath(); let x = r() * 256, y = r() * 256; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 30; y += r() * 20; g.lineTo(x, y); } g.stroke(); }
    noise(g, 256, 256, r, 900, .07); grime(g, 256, r, 4, .1);
    return c;
  };
  TP.floorFoyer = terrazzo('#cbbfa6', 301);
  TP.floorTerrazzoDark = terrazzo('#7c7468', 302);
  TP.wallFoyer = plaster('#d6cdb2', 303);
  TP.dadoGreen = plaster('#3d6a50', 304, .08);
  TP.wallNursery = plaster('#a8c0cf', 305, .1);
  TP.dadoBlue = plaster('#5a7a94', 306, .08);
  TP.wallUpstairs = plaster('#b9ab8e', 307, .2);
  TP.zinc = () => { // corrugated roofing sheets, rusting at the overlaps
    const [c, g] = mk(128, 128), r = rng(309);
    for (let x = 0; x < 128; x++) { const v = .5 + .5 * Math.sin(x / 128 * Math.PI * 16); g.fillStyle = `rgb(${Math.round(70 + v * 70)},${Math.round(74 + v * 70)},${Math.round(80 + v * 70)})`; g.fillRect(x, 0, 1, 128); }
    for (let i = 0; i < 22; i++) wrapBlob(g, 128, r() * 128, r() * 128, 6 + r() * 22, `rgba(${120 + r() * 40},${50 + r() * 20},20,${.25 + r() * .3})`);
    g.fillStyle = 'rgba(60,30,10,.5)'; g.fillRect(0, 124, 128, 4);
    noise(g, 128, 128, r, 400, .1);
    return c;
  };
  TP.nightSky = () => { // stars, a moon, and the lights of Calabar along the river
    const [c, g] = mk(512, 256), r = rng(310);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#05060f'); gr.addColorStop(.42, '#0d1430'); gr.addColorStop(.5, '#1e2340'); gr.addColorStop(.52, '#0a0c14'); gr.addColorStop(1, '#030305');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 420; i++) { const y = r() * 118; g.fillStyle = `rgba(255,255,255,${r() * r() * .9})`; g.fillRect(r() * 512, y, r() < .1 ? 2 : 1, 1); }
    g.fillStyle = '#e8eef4'; g.beginPath(); g.arc(380, 52, 9, 0, 7); g.fill();
    const mg = g.createRadialGradient(380, 52, 6, 380, 52, 40); mg.addColorStop(0, 'rgba(220,230,255,.35)'); mg.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = mg; g.fillRect(330, 0, 100, 110);
    for (let i = 0; i < 260; i++) { const x = r() * 512, y = 124 + r() * 6; g.fillStyle = r() < .7 ? `rgba(255,${180 + r() * 60},${90 + r() * 60},${.4 + r() * .6})` : `rgba(200,220,255,${.3 + r() * .5})`; g.fillRect(x, y, 1, 1); }
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,200,120,${r() * .25})`; g.fillRect(r() * 512, 132 + r() * 10, 3 + r() * 10, 1); } // the river catching the lights
    return clampTex(c);
  };
  TP.ceilPOP = () => { // a POP ceiling: pale plaster panels, water stains
    const [c, g] = mk(128, 128), r = rng(308);
    g.fillStyle = '#cfc8b6'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126); g.strokeStyle = 'rgba(255,255,255,.3)'; g.strokeRect(8, 8, 112, 112);
    for (let i = 0; i < 3; i++) wrapBlob(g, 128, r() * 128, r() * 128, 14 + r() * 26, 'rgba(110,80,40,.25)');
    noise(g, 128, 128, r, 400, .08);
    return c;
  };

  /* Ankara: wax-print repeats in strong colours */
  const ankara = (bg, a, b, d, e, seed) => () => {
    const [c, g] = mk(256, 256), r = rng(seed);
    g.fillStyle = bg; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
      const x = col * 64 + (row % 2) * 32, y = row * 64 + 32;
      [[26, a], [19, b], [12, d], [6, e]].forEach(([rad, cl]) => { g.fillStyle = cl; g.beginPath(); g.arc(x % 256, y, rad, 0, 7); g.fill(); if (x + rad > 256) { g.beginPath(); g.arc(x - 256, y, rad, 0, 7); g.fill(); } });
      g.strokeStyle = e; g.lineWidth = 2; for (let k = 0; k < 12; k++) { const t = k * Math.PI / 6; g.beginPath(); g.moveTo((x % 256) + Math.cos(t) * 28, y + Math.sin(t) * 28); g.lineTo((x % 256) + Math.cos(t) * 31, y + Math.sin(t) * 31); g.stroke(); }
    }
    g.fillStyle = d;
    for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) { const x = col * 32 + 16 + (row % 2 ? 0 : 16), y = row * 64; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 7, y); g.lineTo(x, y + 7); g.lineTo(x - 7, y); g.closePath(); g.fill(); }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${r() * .08})`; g.fillRect(r() * 256, r() * 256, 2 + r() * 6, 1); } // the "crackle" of real wax print
    grime(g, 256, r, 3, .14);
    return c;
  };
  TP.ankara = ankara('#1d3a6b', '#e2832a', '#f2c33d', '#127a72', '#7a1f2b', 311);
  TP.ankara2 = ankara('#6b1f2a', '#2b8a6a', '#f0e2c0', '#e2a92a', '#1d2a4a', 312);
  TP.ankara3 = ankara('#2a5a2e', '#f2c33d', '#b23a26', '#f0e8d8', '#1a1a2a', 313);

  TP.lace = () => {
    const [c, g] = mk(128, 128);
    g.fillStyle = 'rgba(244,240,230,.95)'; g.fillRect(0, 0, 128, 128);
    g.globalCompositeOperation = 'destination-out';
    for (let y = 8; y < 128; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < 128; x += 16) { g.beginPath(); g.arc(x, y, 4.2, 0, 7); g.fill(); }
    for (let k = 0; k < 16; k++) { g.beginPath(); g.arc(k * 8 + 4, 128, 5, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(210,200,180,.9)'; g.lineWidth = 1.4;
    for (let y = 8; y < 128; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < 128; x += 16) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.stroke(); }
    return c;
  };

  TP.showglass = () => {
    const [c, g] = mk(256, 256), r = rng(321);
    g.fillStyle = '#1a100a'; g.fillRect(0, 0, 256, 256);
    [64, 128, 192].forEach(y => { g.fillStyle = '#4a3020'; g.fillRect(0, y, 256, 6); });
    const plate = (x, y, rad, rim) => { g.fillStyle = '#ece6da'; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); g.arc(x, y, rad - 4, 0, 7); g.stroke(); g.fillStyle = rim; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.arc(x + Math.cos(a) * (rad - 9), y + Math.sin(a) * (rad - 9), 2.2, 0, 7); g.fill(); } g.beginPath(); g.arc(x, y, rad * .28, 0, 7); g.fill(); };
    plate(40, 34, 26, '#2a5aa0'); plate(100, 36, 24, '#a02a3a'); plate(160, 34, 26, '#2a5aa0'); plate(220, 36, 24, '#1f7a4a');
    for (let i = 0; i < 7; i++) { const x = 18 + i * 34; g.fillStyle = 'rgba(200,220,230,.32)'; g.fillRect(x, 92, 18, 34); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + 3, 94, 3, 28); }
    g.fillStyle = '#c9a23c'; g.fillRect(150, 140, 60, 46); g.fillStyle = '#e9e2cc'; g.fillRect(155, 145, 50, 36); g.fillStyle = '#3a2a1a'; g.font = `700 8px ${SERIF}`; g.textAlign = 'center'; g.fillText('CERTIFICATE', 180, 158); g.fillRect(162, 166, 36, 2); g.fillRect(166, 172, 28, 2);
    for (let i = 0; i < 4; i++) { g.fillStyle = ['#c46a2a', '#e8e1d0', '#7a2a2a', '#d0b04a'][i]; g.beginPath(); g.ellipse(26 + i * 30, 172, 11, 14, 0, 0, 7); g.fill(); g.fillRect(20 + i * 30, 150, 12, 10); }
    for (let i = 0; i < 9; i++) { g.fillStyle = shade(['#5a2a22', '#2a3d52', '#3d5a34', '#6a5230'][i % 4], .7 + r() * .3); g.fillRect(14 + i * 26, 212, 20, 40); }
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) { const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.48 + k * .1, 'rgba(255,255,255,.1)'); gr.addColorStop(.52 + k * .1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
    g.globalCompositeOperation = 'source-over';
    return clampTex(c);
  };

  TP.tvScreen = () => {
    const [c, g] = mk(128, 96), r = rng(331);
    const gr = g.createRadialGradient(64, 48, 4, 64, 48, 70); gr.addColorStop(0, '#5b6a66'); gr.addColorStop(1, '#141a19'); g.fillStyle = gr; g.fillRect(0, 0, 128, 96);
    for (let y = 0; y < 96; y += 2) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, 128, 1); }
    noise(g, 128, 96, r, 1600, .35);
    return clampTex(c);
  };
  TP.tvFace = () => { // a pale face in the static, with two great eyes
    const c = TP.tvScreen(), g = c.getContext('2d');
    g.fillStyle = 'rgba(220,226,214,.5)'; g.beginPath(); g.ellipse(64, 46, 22, 32, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.85)'; g.beginPath(); g.arc(55, 42, 7, 0, 7); g.arc(73, 42, 7, 0, 7); g.fill();
    g.fillStyle = '#e0443f'; g.beginPath(); g.arc(55, 43, 1.8, 0, 7); g.arc(73, 43, 1.8, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.8)'; g.fillRect(52, 62, 24, 6);
    return clampTex(c);
  };

  TP.calendar = () => {
    const [c, g] = mk(128, 192), r = rng(341);
    g.fillStyle = '#ece6d6'; g.fillRect(0, 0, 128, 192);
    const sky = g.createLinearGradient(0, 0, 0, 70); sky.addColorStop(0, '#d98a3a'); sky.addColorStop(1, '#2a5a7a'); g.fillStyle = sky; g.fillRect(6, 6, 116, 64);
    g.fillStyle = '#163040'; g.fillRect(6, 52, 116, 18); g.fillStyle = '#1d1a14'; g.beginPath(); g.moveTo(14, 52); g.lineTo(30, 30); g.lineTo(34, 52); g.fill(); g.fillRect(70, 40, 4, 14); g.beginPath(); g.ellipse(72, 38, 12, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#1d3a6b'; g.font = `700 9px ${SERIF}`; g.textAlign = 'center'; g.fillText('CALABAR TRADERS BANK', 64, 82);
    g.fillStyle = '#8a1c1c'; g.font = `700 13px ${SERIF}`; g.fillText('OCTOBER 1983', 64, 98);
    g.fillStyle = '#2a2118'; g.font = '700 9px Arial, sans-serif';
    let d = 1;
    for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) { const idx = row * 7 + col - 6; if (idx >= 0 && d <= 31) { const x = 14 + col * 17, y = 116 + row * 15; g.fillText(String(d), x, y); if (d === 14) { g.strokeStyle = '#c0201a'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(x, y - 3, 9, 7, .2, 0, 7); g.stroke(); g.beginPath(); g.ellipse(x + 1, y - 3, 8, 7.5, -.3, 0, 7); g.stroke(); } d++; } }
    grime(g, 128, r, 3, .14); noise(g, 128, 192, r, 300, .1);
    return clampTex(c);
  };

  TP.agbada = () => {
    const [c, g] = mk(128, 256), r = rng(351);
    g.fillStyle = '#d9d3c3'; g.fillRect(0, 0, 128, 256);
    for (let y = 0; y < 256; y += 3) { g.fillStyle = `rgba(0,0,0,${.02 + r() * .04})`; g.fillRect(0, y, 128, 1); }
    g.strokeStyle = '#b08a3a'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(40, 0); g.quadraticCurveTo(64, 40, 88, 0); g.stroke();
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(44 - k * 3, 30 + k * 18); g.lineTo(64, 44 + k * 22); g.lineTo(84 + k * 3, 30 + k * 18); g.stroke(); }
    g.strokeStyle = '#2a4a7a'; g.lineWidth = 1.6; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(64, 130 + k * 4, 14 - k * 2, 0, 7); g.stroke(); }
    grime(g, 128, r, 4, .14);
    return clampTex(c);
  };

  TP.trunkBox = () => {
    const [c, g] = mk(256, 128), r = rng(361);
    g.fillStyle = '#2a5a8a'; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#d8c070'; g.lineWidth = 4; g.strokeRect(8, 8, 240, 112);
    const flower = (x, y, col) => { g.fillStyle = col; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.beginPath(); g.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, 4, a, 0, 7); g.fill(); } g.fillStyle = '#f2d24a'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); };
    flower(60, 64, '#d03a3a'); flower(128, 64, '#f0e8d8'); flower(196, 64, '#d03a3a');
    g.strokeStyle = '#3f8a4a'; g.lineWidth = 3; g.beginPath(); g.moveTo(74, 64); g.quadraticCurveTo(100, 40, 114, 64); g.moveTo(142, 64); g.quadraticCurveTo(160, 88, 182, 64); g.stroke();
    g.fillStyle = '#9a9ea6'; for (let x = 16; x < 256; x += 30) { g.beginPath(); g.arc(x, 16, 2.5, 0, 7); g.arc(x, 112, 2.5, 0, 7); g.fill(); }
    for (let i = 0; i < 26; i++) wrapBlob(g, 256, r() * 256, r() * 128, 6 + r() * 14, 'rgba(120,60,20,.35)'); // rust
    noise(g, 256, 128, r, 600, .1);
    return c;
  };

  /* Mma Eno: green gele, coral beads. The beads are missing until you return them. */
  const mama = open => () => {
    const [c, g] = mk(256, 320);
    const bg = g.createRadialGradient(128, 120, 10, 128, 140, 200); bg.addColorStop(0, '#3a3a2a'); bg.addColorStop(1, '#100e0a'); g.fillStyle = bg; g.fillRect(0, 0, 256, 320);
    g.fillStyle = '#2f7a4c'; g.beginPath(); g.moveTo(40, 320); g.lineTo(58, 236); g.quadraticCurveTo(128, 206, 198, 236); g.lineTo(216, 320); g.fill(); // buba
    g.fillStyle = 'rgba(240,226,180,.35)'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(60 + k * 18, 270 + (k % 2) * 16, 5, 0, 7); g.fill(); }
    g.fillStyle = '#4a2e20'; g.beginPath(); g.moveTo(104, 236); g.quadraticCurveTo(128, 250, 152, 236); g.lineTo(148, 196); g.lineTo(108, 196); g.fill(); // neck
    g.fillStyle = '#5a3828'; g.beginPath(); g.ellipse(128, 146, 40, 52, 0, 0, 7); g.fill(); // face
    g.fillStyle = 'rgba(255,220,180,.12)'; g.beginPath(); g.ellipse(118, 128, 16, 24, -.2, 0, 7); g.fill();
    // gele: a tall, folded head-tie
    g.fillStyle = '#3c8a58'; g.beginPath(); g.moveTo(80, 128); g.quadraticCurveTo(66, 70, 96, 40); g.quadraticCurveTo(128, 14, 170, 34); g.quadraticCurveTo(200, 60, 178, 128); g.quadraticCurveTo(128, 100, 80, 128); g.fill();
    g.strokeStyle = '#225a38'; g.lineWidth = 3; [[90, 112, 120, 46], [110, 104, 150, 38], [134, 102, 176, 60], [150, 108, 186, 92]].forEach(([a, b, cc, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + cc) / 2 - 10, (b + d) / 2, cc, d); g.stroke(); });
    g.fillStyle = '#2a1810';
    if (open) { g.strokeStyle = '#1e120c'; g.lineWidth = 3; g.beginPath(); g.arc(112, 148, 7, .2, Math.PI - .2); g.stroke(); g.beginPath(); g.arc(144, 148, 7, .2, Math.PI - .2); g.stroke(); }
    else { g.fillStyle = '#efe6d6'; g.beginPath(); g.ellipse(112, 146, 9, 5, 0, 0, 7); g.ellipse(144, 146, 9, 5, 0, 0, 7); g.fill(); g.fillStyle = '#120a06'; g.beginPath(); g.arc(112, 146, 3.4, 0, 7); g.arc(144, 146, 3.4, 0, 7); g.fill(); }
    g.strokeStyle = '#3a1c18'; g.lineWidth = 4; g.beginPath(); g.moveTo(116, 178); g.quadraticCurveTo(128, 186, 140, 178); g.stroke();
    if (open) { g.fillStyle = '#c4322a'; for (let k = 0; k < 13; k++) { const t = k / 12, x = 100 + t * 56, y = 222 + Math.sin(t * Math.PI) * 22; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,200,180,.45)'; for (let k = 0; k < 13; k++) { const t = k / 12; g.fillRect(98 + t * 56, 219 + Math.sin(t * Math.PI) * 22, 2, 2); } }
    else { g.strokeStyle = 'rgba(200,180,140,.5)'; g.setLineDash([3, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(100, 222); g.quadraticCurveTo(128, 262, 156, 222); g.stroke(); g.setLineDash([]); }
    return clampTex(c);
  };
  TP.portraitA = mama(false); TP.portraitB = mama(true);

  /* Chief Okon Ekpo: red cap, white shirt, a heavy string of coral beads. B has the red eyes. */
  const chief = red => () => {
    const [c, g] = mk(256, 320);
    const bg = g.createRadialGradient(128, 120, 10, 128, 140, 200); bg.addColorStop(0, '#3a2626'); bg.addColorStop(1, '#0d0808'); g.fillStyle = bg; g.fillRect(0, 0, 256, 320);
    g.fillStyle = '#e4ded0'; g.beginPath(); g.moveTo(26, 320); g.lineTo(46, 230); g.quadraticCurveTo(128, 196, 210, 230); g.lineTo(230, 320); g.fill();
    g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(100, 236); g.lineTo(104, 190); g.lineTo(152, 190); g.lineTo(156, 236); g.fill();
    g.fillStyle = '#4a2c1e'; g.beginPath(); g.ellipse(128, 142, 46, 56, 0, 0, 7); g.fill();
    g.fillStyle = '#9a1c1c'; g.beginPath(); g.moveTo(80, 104); g.quadraticCurveTo(84, 52, 128, 50); g.quadraticCurveTo(172, 52, 176, 104); g.quadraticCurveTo(128, 92, 80, 104); g.fill(); // red cap
    g.fillStyle = '#e8c04a'; g.fillRect(84, 98, 88, 5);
    g.strokeStyle = '#1e120c'; g.lineWidth = 5; g.beginPath(); g.moveTo(98, 124); g.lineTo(120, 130); g.moveTo(158, 124); g.lineTo(136, 130); g.stroke(); // brows
    g.fillStyle = red ? '#2a0000' : '#efe6d6'; g.beginPath(); g.ellipse(110, 140, 9, 5.5, 0, 0, 7); g.ellipse(146, 140, 9, 5.5, 0, 0, 7); g.fill();
    g.fillStyle = red ? '#ff3a2a' : '#140a06'; g.beginPath(); g.arc(110, 140, red ? 3.2 : 3.6, 0, 7); g.arc(146, 140, red ? 3.2 : 3.6, 0, 7); g.fill();
    g.fillStyle = '#2a1810'; g.beginPath(); g.ellipse(128, 186, 22, 6, 0, 0, 7); g.fill(); // moustache
    g.strokeStyle = '#1e0e0a'; g.lineWidth = 3; g.beginPath(); g.moveTo(112, 198); g.lineTo(144, 198); g.stroke();
    g.fillStyle = '#c4322a'; for (let row = 0; row < 3; row++) for (let k = 0; k < 15; k++) { const t = k / 14, x = 82 + t * 92, y = 232 + row * 12 + Math.sin(t * Math.PI) * (26 - row * 4); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    if (red) { g.fillStyle = 'rgba(160,0,0,.5)'; g.fillRect(105, 146, 3, 30); g.fillRect(146, 146, 3, 22); }
    return clampTex(c);
  };
  TP.portraitSilas = chief(false); TP.portraitSilasB = chief(true);
})();
