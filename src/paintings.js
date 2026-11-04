/* ================= OIL PAINTINGS, WITH MOODS ================= */
/* Every painting in the house is oil on canvas: brush strokes that follow the forms, the weave of the canvas,
   yellowed varnish and fine cracks. Each has two moods, and the house switches them as the night goes on:
   Mama (tired smile → eyes closed), Papa (proud → terrified), the family in 1972 (the driver painted out →
   the driver back), Mama and small Tobi (tender → weeping), the wedding (laughing → turned away). */
(() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const clampTex = c => { c.clampWrap = true; return c; };

  /* turn a flat drawing into oil paint */
  function oil(c, seed) {
    const g = c.getContext('2d'), w = c.width, h = c.height, r = rng(seed);
    const d = g.getImageData(0, 0, w, h).data;
    g.lineCap = 'round';
    for (let i = 0; i < w * h / 26; i++) {                       // brush strokes that follow a gentle flow
      const x = r() * w | 0, y = r() * h | 0, k = (y * w + x) * 4;
      const a = Math.sin(x * .045) * 1.3 + Math.cos(y * .035) * 1.1 + (r() - .5) * .8, len = 3 + r() * 8;
      g.strokeStyle = `rgba(${d[k]},${d[k + 1]},${d[k + 2]},${.45 + r() * .3})`; g.lineWidth = 1.6 + r() * 3.2;
      g.beginPath(); g.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2); g.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2); g.stroke();
    }
    for (let i = 0; i < w * h / 260; i++) {                      // a few thick lit ridges of paint
      const x = r() * w, y = r() * h;
      g.strokeStyle = `rgba(255,248,230,${.05 + r() * .06})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3 + r() * 5, y + (r() - .5) * 3); g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,.035)';                           // the canvas weave
    for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
    g.globalCompositeOperation = 'multiply';                   // old varnish
    g.fillStyle = 'rgba(214,170,96,.55)'; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(30,16,4,.22)'; g.lineWidth = .7;      // craquelure
    for (let i = 0; i < 46; i++) {
      let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 6; j++) { x += (r() - .5) * 22; y += (r() - .5) * 22; g.lineTo(x, y); }
      g.stroke();
    }
    const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,4,0,.6)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    return clampTex(c);
  }

  /* ---- drawing helpers ---- */
  const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
  const path = (g, col, pts, close = true) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); if (close) g.closePath(); g.fill(); };
  const line = (g, col, wd, ...p) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 4) g.quadraticCurveTo(p[i], p[i + 1], p[i + 2], p[i + 3]); g.stroke(); };
  /* a face: x,y centre, s scale, mood: smile tired closed proud terror weep laugh away blank */
  function face(g, x, y, s, skin, mood) {
    ell(g, x, y, 40 * s, 52 * s, skin);
    ell(g, x - 10 * s, y - 16 * s, 16 * s, 22 * s, 'rgba(255,220,180,.12)', -.2);
    const ink = '#1e120c', ey = y - 4 * s, ex = 16 * s;
    if (mood === 'closed' || mood === 'laugh') { line(g, ink, 3 * s, x - ex - 7 * s, ey, x - ex, ey + 6 * s, x - ex + 7 * s, ey); line(g, ink, 3 * s, x + ex - 7 * s, ey, x + ex, ey + 6 * s, x + ex + 7 * s, ey); }
    else if (mood !== 'away') {
      const wide = mood === 'terror';
      ell(g, x - ex, ey, (wide ? 11 : 9) * s, (wide ? 9 : 5) * s, '#efe6d6'); ell(g, x + ex, ey, (wide ? 11 : 9) * s, (wide ? 9 : 5) * s, '#efe6d6');
      ell(g, x - ex, ey, (wide ? 2.4 : 3.6) * s, (wide ? 2.4 : 3.6) * s, '#140a06'); ell(g, x + ex, ey, (wide ? 2.4 : 3.6) * s, (wide ? 2.4 : 3.6) * s, '#140a06');
      if (mood === 'tired' || mood === 'weep') { line(g, 'rgba(30,14,8,.6)', 2 * s, x - ex - 9 * s, ey + 6 * s, x - ex, ey + 10 * s, x - ex + 8 * s, ey + 6 * s); line(g, 'rgba(30,14,8,.6)', 2 * s, x + ex - 8 * s, ey + 6 * s, x + ex, ey + 10 * s, x + ex + 9 * s, ey + 6 * s); }
      const brow = mood === 'proud' ? -3 : mood === 'terror' ? -9 : mood === 'weep' ? 4 : 0;
      line(g, ink, 4 * s, x - ex - 10 * s, ey - 11 * s + brow * s, x - ex, ey - 14 * s + (mood === 'weep' ? 6 : brow) * s, x - ex + 9 * s, ey - 10 * s + (mood === 'weep' ? -4 : 0) * s);
      line(g, ink, 4 * s, x + ex - 9 * s, ey - 10 * s + (mood === 'weep' ? -4 : 0) * s, x + ex, ey - 14 * s + (mood === 'weep' ? 6 : brow) * s, x + ex + 10 * s, ey - 11 * s + brow * s);
    }
    if (mood === 'away') { ell(g, x, y - 4 * s, 41 * s, 50 * s, '#1a120c'); return; }   // turned away: only the back of the head
    const my = y + 30 * s;
    if (mood === 'smile' || mood === 'proud') line(g, '#3a1c18', 4 * s, x - 13 * s, my - 2 * s, x, my + 7 * s, x + 13 * s, my - 2 * s);
    else if (mood === 'laugh') { ell(g, x, my + 2 * s, 12 * s, 7 * s, '#2a0e0a'); ell(g, x, my - 1 * s, 10 * s, 2.4 * s, '#efe6d6'); }
    else if (mood === 'terror') { ell(g, x, my + 4 * s, 9 * s, 13 * s, '#160604'); }
    else if (mood === 'weep') { line(g, '#3a1c18', 4 * s, x - 12 * s, my + 5 * s, x, my - 3 * s, x + 12 * s, my + 5 * s); }
    else if (mood !== 'away') line(g, '#3a1c18', 3.4 * s, x - 11 * s, my, x, my + 2 * s, x + 11 * s, my);
    if (mood === 'weep' || mood === 'tired') { g.fillStyle = mood === 'weep' ? 'rgba(220,240,255,.55)' : 'rgba(220,240,255,.18)'; g.fillRect(x - ex - 2 * s, ey + 8 * s, 3 * s, (mood === 'weep' ? 34 : 10) * s); if (mood === 'weep') g.fillRect(x + ex, ey + 8 * s, 3 * s, 28 * s); }
    if (mood === 'terror') { g.fillStyle = 'rgba(150,0,0,.55)'; g.fillRect(x - ex - 1 * s, ey + 9 * s, 3 * s, 26 * s); g.fillRect(x + ex - 1 * s, ey + 9 * s, 3 * s, 20 * s); }
  }
  const gele = (g, x, y, s, col, dark) => {
    path(g, col, [x - 48 * s, y - 18 * s, x - 62 * s, y - 70 * s, x - 30 * s, y - 104 * s, x + 8 * s, y - 116 * s, x + 46 * s, y - 100 * s, x + 66 * s, y - 64 * s, x + 50 * s, y - 18 * s, x, y - 42 * s]);
    [[-40, -30, -14, -96], [-18, -34, 20, -104], [6, -36, 46, -80], [24, -32, 58, -50]].forEach(([a, b, c2, d2]) => line(g, dark, 3 * s, x + a * s, y + b * s, x + (a + c2) / 2 * s - 8 * s, y + (b + d2) / 2 * s, x + c2 * s, y + d2 * s));
  };
  const fila = (g, x, y, s, col) => { path(g, col, [x - 44 * s, y - 34 * s, x - 40 * s, y - 70 * s, x + 4 * s, y - 80 * s, x + 54 * s, y - 60 * s, x + 44 * s, y - 34 * s]); line(g, 'rgba(0,0,0,.35)', 3 * s, x - 44 * s, y - 34 * s, x, y - 40 * s, x + 44 * s, y - 34 * s); };
  const driverCap = (g, x, y, s) => { path(g, '#26242a', [x - 40 * s, y - 34 * s, x - 36 * s, y - 62 * s, x + 36 * s, y - 62 * s, x + 40 * s, y - 34 * s]); path(g, '#121014', [x - 46 * s, y - 34 * s, x + 46 * s, y - 34 * s, x + 40 * s, y - 26 * s, x - 40 * s, y - 26 * s]); g.fillStyle = '#c9a24a'; g.fillRect(x - 10 * s, y - 52 * s, 20 * s, 5 * s); };
  const coral = (g, x, y, s, rows = 2) => { for (let row = 0; row < rows; row++) for (let k = 0; k < 13; k++) { const t = k / 12; ell(g, x - 46 * s + t * 92 * s, y + row * 11 * s + Math.sin(t * Math.PI) * (24 - row * 4) * s, 5 * s, 5 * s, '#c4322a'); } };
  const bgWarm = (g, w, h, a, b) => { const bg = g.createRadialGradient(w / 2, h * .38, 10, w / 2, h * .45, Math.max(w, h) * .7); bg.addColorStop(0, a); bg.addColorStop(1, b); g.fillStyle = bg; g.fillRect(0, 0, w, h); };

  /* Mama at twenty-five: a tired smile; then, with her coral back, eyes closed at last */
  const mama = shut => () => {
    const [c, g] = mk(256, 320);
    bgWarm(g, 256, 320, '#4a4630', '#141008');
    path(g, '#2f7a4c', [40, 320, 58, 236, 128, 210, 198, 236, 216, 320]);
    g.fillStyle = 'rgba(240,226,180,.3)'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(60 + k * 18, 272 + (k % 2) * 16, 5, 0, 7); g.fill(); }
    path(g, '#4a2e20', [104, 238, 108, 196, 148, 196, 152, 238]);
    face(g, 128, 150, 1, '#5a3828', shut ? 'closed' : 'tired');
    gele(g, 128, 130, 1, '#3c8a58', '#225a38');
    if (shut) coral(g, 128, 220, .62, 1); else { g.strokeStyle = 'rgba(200,180,140,.5)'; g.setLineDash([3, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(100, 222); g.quadraticCurveTo(128, 262, 156, 222); g.stroke(); g.setLineDash([]); }
    return oil(c, shut ? 71 : 72);
  };
  TP.portraitA = mama(false); TP.portraitB = mama(true);

  /* Papa: Chief Olumide Adeleke, proud; and the same canvas, terrified */
  const papa = fear => () => {
    const [c, g] = mk(256, 320);
    bgWarm(g, 256, 320, fear ? '#3a1414' : '#3a2e20', '#0d0806');
    path(g, '#e8e2d2', [18, 320, 40, 228, 128, 196, 216, 228, 238, 320]);
    line(g, '#b08a3a', 3, 98, 214, 128, 260, 158, 214); line(g, '#b08a3a', 2, 92, 230, 128, 284, 164, 230);
    path(g, '#3a2418', [102, 236, 104, 190, 152, 190, 154, 236]);
    face(g, 128, 144, 1.08, '#4a2c1e', fear ? 'terror' : 'proud');
    fila(g, 128, 130, 1.05, '#2a4a7a');
    coral(g, 128, 228, .95, 2);
    if (!fear) { path(g, '#6a4a2a', [196, 320, 200, 268, 244, 268, 248, 320]); ell(g, 222, 262, 22, 22, '#4a6a8a'); }   // a hand on the globe
    return oil(c, fear ? 81 : 82);
  };
  TP.portraitSilas = papa(false); TP.portraitSilasB = papa(true);

  /* The family, 1972: Papa, Mama with the baby, and at the very edge the driver, painted out in black; later, back */
  const family = back => () => {
    const [c, g] = mk(384, 256);
    const sky = g.createLinearGradient(0, 0, 0, 256); sky.addColorStop(0, '#6a7a8a'); sky.addColorStop(1, '#c8a878'); g.fillStyle = sky; g.fillRect(0, 0, 384, 256);
    g.fillStyle = '#e8dcc0'; g.fillRect(0, 70, 384, 120); g.fillStyle = '#8a6a48'; for (let x = 10; x < 384; x += 46) g.fillRect(x, 70, 12, 120);
    g.fillStyle = '#6a5a3a'; g.fillRect(0, 190, 384, 66);
    // Papa, standing
    path(g, '#ece4cf', [62, 256, 74, 128, 130, 116, 186, 128, 196, 256]); face(g, 128, 92, .62, '#4a2c1e', 'proud'); fila(g, 128, 84, .64, '#2a4a7a'); coral(g, 128, 140, .55, 1);
    // Mama, seated, the baby in her lap
    path(g, '#2f7a4c', [186, 256, 196, 150, 236, 138, 278, 150, 288, 256]); face(g, 236, 112, .56, '#5a3828', 'smile'); gele(g, 236, 100, .56, '#3c8a58', '#225a38');
    ell(g, 236, 180, 22, 16, '#f4eee0'); ell(g, 230, 170, 9, 9, '#4d3424');
    // the driver at the edge, half out of the picture
    path(g, '#a9c0c8', [318, 256, 326, 150, 362, 140, 384, 150, 384, 256]); face(g, 350, 114, .5, '#4a3122', 'smile'); driverCap(g, 350, 110, .5);
    if (!back) { g.fillStyle = '#0a0806'; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, rr = 30 + (k % 3) * 6; k ? g.lineTo(350 + Math.cos(a) * rr, 108 + Math.sin(a) * rr * 1.1) : g.moveTo(350 + rr, 108); } g.fill(); line(g, '#0a0806', 7, 330, 150, 350, 160, 372, 146); }
    return oil(c, back ? 91 : 92);
  };
  TP.paintFamA = family(false); TP.paintFamB = family(true);

  /* Mama and small Tobi: tender; then weeping, looking straight at you */
  const mamaTobi = weep => () => {
    const [c, g] = mk(256, 320);
    bgWarm(g, 256, 320, '#5a6a7a', '#1a1a22');
    path(g, '#2f7a4c', [30, 320, 50, 220, 128, 200, 206, 220, 226, 320]);
    face(g, 150, 136, .9, '#5a3828', weep ? 'weep' : 'smile'); gele(g, 150, 120, .9, '#3c8a58', '#225a38');
    path(g, '#e8d26a', [70, 320, 74, 250, 120, 240, 150, 260, 150, 320]); face(g, 108, 214, .55, '#4d3424', weep ? 'closed' : 'laugh');
    line(g, '#2a1c14', 4, 88, 186, 108, 176, 128, 186);
    return oil(c, weep ? 101 : 102);
  };
  TP.paintTobiA = mamaTobi(false); TP.paintTobiB = mamaTobi(true);

  /* The wedding, 1970: laughing at each other; then turned away, his face scratched */
  const wedding = apart => () => {
    const [c, g] = mk(256, 320);
    bgWarm(g, 256, 320, '#8a8270', '#2a241c');
    path(g, '#1e1e24', [20, 320, 34, 210, 92, 196, 136, 214, 140, 320]);              // his borrowed suit
    path(g, '#f2ece0', [126, 320, 136, 210, 182, 196, 228, 214, 240, 320]);           // her white dress
    face(g, 84, 150, .78, '#4a2c1e', apart ? 'away' : 'laugh');
    face(g, 178, 146, .74, '#5a3828', apart ? 'away' : 'laugh');
    path(g, '#1a120c', [50, 116, 56, 98, 84, 90, 112, 98, 118, 116, 84, 108]);
    path(g, '#f8f4ea', [146, 110, 140, 70, 178, 58, 214, 72, 210, 110, 178, 96]);    // veil
    if (apart) { g.strokeStyle = 'rgba(240,230,210,.8)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(58 + k * 6, 120); g.lineTo(70 + k * 5, 190); g.stroke(); } }
    return oil(c, apart ? 111 : 112);
  };
  TP.paintWedA = wedding(false); TP.paintWedB = wedding(true);
})();
