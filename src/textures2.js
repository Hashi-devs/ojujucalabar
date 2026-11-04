/* ================= PROCEDURAL TEXTURES, part two: kitchen, study, chapel ================= */
(() => {
  const { mk, rng, shade, wrapBlob, grime, noise, clampTex, planks, bricks, lattice } = TP._h;
  const SERIF = '"Ojuju", Georgia, "Times New Roman", serif';

  /* ---------- kitchen ---------- */
  TP.floorKitchen = () => {
    const [c, g] = mk(256, 256), r = rng(101), n = 4, s = 256 / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = shade((x + y) % 2 ? '#6a5545' : '#2c2521', .8 + r() * .4);
      g.fillRect(x * s, y * s, s, s);
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x * s, y * s, s, 2); g.fillRect(x * s, y * s, 2, s);
      for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(0,0,0,${r() * .2})`; g.fillRect(x * s + r() * (s - 8), y * s + r() * (s - 8), 3 + r() * 14, 1 + r() * 3); }
    }
    wrapBlob(g, 256, 70, 190, 56, 'rgba(24,18,10,.55)');
    grime(g, 256, r, 6, .2); noise(g, 256, 256, r, 300, .08);
    return c;
  };
  TP.wallKitchen = () => {
    const [c, g] = mk(256, 256), r = rng(102);
    g.fillStyle = '#6f7466'; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 3) { g.fillStyle = `rgba(0,0,0,${r() * .05})`; g.fillRect(x, 0, 2, 256); }
    for (let k = 0; k < 6; k++) wrapBlob(g, 256, r() * 256, r() * 256, 40 + r() * 70, 'rgba(34,40,28,.4)');
    g.strokeStyle = 'rgba(20,18,14,.4)'; g.lineWidth = 1.2; g.beginPath(); let px = 60 + r() * 120, py = 0; g.moveTo(px, py);
    while (py < 256) { px += (r() - .5) * 18; py += 14 + r() * 12; g.lineTo(px, py); } g.stroke();
    grime(g, 256, r, 5, .22); noise(g, 256, 256, r, 500, .1);
    return c;
  };
  TP.tileSplash = () => {
    const [c, g] = mk(256, 256), r = rng(103), n = 8, s = 256 / n;
    g.fillStyle = '#2a2b27'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = shade('#a9ada0', .62 + r() * .3); g.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x * s + 3, y * s + 3, s - 8, 3);
    }
    wrapBlob(g, 256, 128, 40, 100, 'rgba(0,0,0,.55)'); grime(g, 256, r, 4, .2);
    return c;
  };
  const jarLabel = (text, seed) => () => {
    const [c, g] = mk(128, 128), r = rng(seed);
    g.fillStyle = '#d9cfb0'; g.fillRect(0, 0, 128, 128); noise(g, 128, 128, r, 160, .15);
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 3; g.strokeRect(6, 6, 116, 116);
    if (text) {
      g.fillStyle = '#2a1c10'; g.textAlign = 'center'; g.textBaseline = 'middle';
      let size = 34; g.font = `700 ${size}px ${SERIF}`;
      while (g.measureText(text).width > 100 && size > 14) { size -= 2; g.font = `700 ${size}px ${SERIF}`; }
      g.fillText(text, 64, 66);
      g.fillRect(24, 94, 80, 2);
    } else {
      g.fillStyle = 'rgba(90,60,30,.25)'; g.fillRect(24, 60, 80, 4); g.fillRect(34, 76, 60, 3);
    }
    return clampTex(c);
  };
  TP.labelBlank = jarLabel('', 111); TP.labelFlour = jarLabel('FLOUR', 112); TP.labelSalt = jarLabel('SALT', 113);
  TP.labelSugar = jarLabel('SUGAR', 114); TP.labelTea = jarLabel('GARRI', 115); TP.labelRice = jarLabel('ELUBO', 116);
  TP.recipeCard = () => {
    const [c, g] = mk(256, 256), r = rng(117);
    g.fillStyle = '#d9cdb0'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, r, 800, .14);
    wrapBlob(g, 256, 30, 230, 70, 'rgba(110,80,30,.32)'); wrapBlob(g, 256, 230, 20, 50, 'rgba(110,80,30,.22)');
    g.fillStyle = '#2a2118'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 24px ${SERIF}`; g.fillText('Sunday Pounded Yam', 128, 30);
    g.font = `italic 19px ${SERIF}`;
    ['Pound it the way', 'Madam taught you,', 'or Oga will know.'].forEach((l, i) => g.fillText(l, 128, 68 + i * 27));
    g.fillStyle = '#5a1a12'; [[0, 0], [1, 0], [3, 0], [5, 0], [6, 0], [7, 0]].forEach(([k]) => { g.beginPath(); g.arc(46 + k * 23, 168, 7, 0, 7); g.fill(); });
    g.fillStyle = '#2a2118'; g.font = `italic 17px ${SERIF}`; g.fillText('kpam-kpam · kpam · kpam-kpam-kpam', 128, 204);
    g.font = `italic 16px ${SERIF}`; g.fillText('(never too fast, never lumpy)', 128, 232);
    g.strokeStyle = 'rgba(40,30,20,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(54, 46); g.lineTo(202, 46); g.stroke();
    return clampTex(c);
  };

  /* ---------- study ---------- */
  TP.wallStudy = () => lattice(256, '#3b2226', '#60403f', 33, 'diamond');
  TP.floorStudy = () => planks(256, '#3b2818', 10, 15, true, '#0d0804');
  TP.leather = () => {
    const [c, g] = mk(128, 128), r = rng(121);
    g.fillStyle = '#3d2217'; g.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 90; k++) { g.strokeStyle = `rgba(0,0,0,${.06 + r() * .12})`; g.lineWidth = 1; g.beginPath(); const x = r() * 128, y = r() * 128; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 26, y + (r() - .5) * 26); g.stroke(); }
    g.strokeStyle = '#a8873a'; g.lineWidth = 3; g.strokeRect(8, 8, 112, 112); g.lineWidth = 1; g.strokeRect(13, 13, 102, 102);
    noise(g, 128, 128, r, 300, .1); wrapBlob(g, 128, 30, 90, 40, 'rgba(0,0,0,.35)');
    return c;
  };
  TP.booksStudy = () => {
    const [c, g] = mk(128, 64), r = rng(122);
    g.fillStyle = '#0d0907'; g.fillRect(0, 0, 128, 64);
    let x = 1; while (x < 127) {
      const w = 4 + r() * 8, h = 42 + r() * 20;
      g.fillStyle = shade(['#4a1c1c', '#1f2f3c', '#2b3a22', '#5a4224', '#33283f', '#3b2a20'][Math.floor(r() * 6)], .55 + r() * .4);
      g.fillRect(x, 64 - h, w, h);
      g.fillStyle = 'rgba(214,184,100,.5)'; g.fillRect(x + 1, 64 - h + 6, w - 2, 1.5); g.fillRect(x + 1, 64 - h + 12, w - 2, 1);
      x += w + .4;
    }
    return clampTex(c);
  };
  TP.plateRose = () => {
    const [c, g] = mk(256, 128), r = rng(123);
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#caa650'); gr.addColorStop(1, '#8a6c26'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#3a2a0c'; g.lineWidth = 4; g.strokeRect(6, 6, 244, 116); noise(g, 256, 128, r, 300, .1);
    g.fillStyle = '#2a1c06'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 29px ${SERIF}`; g.fillText('OUR LITTLE ROSE', 128, 50);
    g.font = `italic 19px ${SERIF}`; g.fillText('2 March 1890', 128, 90);
    return clampTex(c);
  };
  const silasPortrait = glow => () => {
    const [c, g] = mk(256, 320);
    const bg = g.createRadialGradient(128, 130, 10, 128, 150, 210); bg.addColorStop(0, '#3a2c24'); bg.addColorStop(1, '#0b0807'); g.fillStyle = bg; g.fillRect(0, 0, 256, 320);
    g.fillStyle = '#08070a'; g.beginPath(); g.moveTo(30, 320); g.lineTo(54, 236); g.quadraticCurveTo(128, 206, 202, 236); g.lineTo(226, 320); g.fill();
    g.fillStyle = '#d9d5c8'; g.beginPath(); g.moveTo(98, 232); g.lineTo(128, 262); g.lineTo(158, 232); g.lineTo(150, 208); g.lineTo(106, 208); g.fill();
    g.fillStyle = '#101010'; g.beginPath(); g.moveTo(116, 238); g.lineTo(128, 262); g.lineTo(140, 238); g.fill();
    g.fillStyle = '#c9bca8'; g.beginPath(); g.ellipse(128, 142, 42, 56, 0, 0, 7); g.fill();
    g.fillStyle = '#1a1512'; g.beginPath(); g.moveTo(86, 138); g.quadraticCurveTo(84, 80, 128, 80); g.quadraticCurveTo(172, 80, 170, 138); g.quadraticCurveTo(160, 102, 128, 102); g.quadraticCurveTo(96, 102, 86, 138); g.fill();
    g.beginPath(); g.moveTo(86, 140); g.lineTo(90, 184); g.lineTo(100, 168); g.fill(); g.beginPath(); g.moveTo(170, 140); g.lineTo(166, 184); g.lineTo(156, 168); g.fill();
    g.strokeStyle = '#1a1512'; g.lineWidth = 4; g.beginPath(); g.moveTo(98, 126); g.lineTo(120, 130); g.moveTo(158, 126); g.lineTo(136, 130); g.stroke();
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(112, 140, 9, 6, 0, 0, 7); g.ellipse(144, 140, 9, 6, 0, 0, 7); g.fill();
    if (glow) {
      g.fillStyle = '#ff3b30'; g.shadowColor = '#ff3b30'; g.shadowBlur = 14; g.beginPath(); g.arc(112, 140, 4.2, 0, 7); g.arc(144, 140, 4.2, 0, 7); g.fill(); g.shadowBlur = 0;
    } else { g.fillStyle = '#cfe0d6'; g.beginPath(); g.arc(112, 140, 2, 0, 7); g.arc(144, 140, 2, 0, 7); g.fill(); }
    g.strokeStyle = '#3a1f1f'; g.lineWidth = 3; g.beginPath(); g.moveTo(112, 184); g.quadraticCurveTo(128, 178, 144, 184); g.stroke();
    return clampTex(c);
  };
  TP.portraitSilas = silasPortrait(false); TP.portraitSilasB = silasPortrait(true);
  TP.globeTex = () => {
    const [c, g] = mk(256, 128), r = rng(124);
    g.fillStyle = '#2b4660'; g.fillRect(0, 0, 256, 128);
    for (let k = 0; k < 9; k++) { g.fillStyle = shade('#8a7a52', .7 + r() * .4); g.beginPath(); const x = r() * 256, y = 20 + r() * 88; g.ellipse(x, y, 14 + r() * 26, 8 + r() * 16, r() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 5; g.lineCap = 'round';
    for (let k = 0; k < 11; k++) { const x = 14 + r() * 228, y = 14 + r() * 100; g.beginPath(); g.moveTo(x - 10, y - 10); g.lineTo(x + 10, y + 10); g.moveTo(x + 10, y - 10); g.lineTo(x - 10, y + 10); g.stroke(); }
    g.strokeStyle = 'rgba(220,210,170,.25)'; g.lineWidth = 1; for (let x = 0; x < 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); } for (let y = 16; y < 128; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    g.fillStyle = '#e9e1c8'; g.fillRect(212, 66, 4, 4);
    return c;
  };

  /* ---------- chapel ---------- */
  TP.floorChapel = () => {
    const [c, g] = mk(256, 256), r = rng(131), n = 4, s = 64;
    g.fillStyle = '#0f0e0e'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = shade('#4a4944', .7 + r() * .5); g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
      for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(0,0,0,${r() * .22})`; g.fillRect(x * s + r() * 54, y * s + r() * 54, 3 + r() * 16, 1 + r() * 5); }
    }
    wrapBlob(g, 256, 60, 170, 52, 'rgba(12,26,36,.5)'); grime(g, 256, r, 5, .2);
    return c;
  };
  TP.wallChapel = () => bricks(256, '#7a766c', '#26241f', 45, 4, 2);
  TP.stainedGlass = () => {
    const [c, g] = mk(256, 512), r = rng(132);
    g.fillStyle = '#0a0a0d'; g.fillRect(0, 0, 256, 512);
    const pal = ['#9c2a34', '#2c4f9c', '#c79a2e', '#2f7a4e', '#6a3a8c'];
    const cw = 256 / 5, ch = 512 / 9;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 5; x++) {
      const cx = x * cw + cw / 2, cy = y * ch + ch / 2, dist = Math.hypot(cx - 128, cy - 256);
      g.fillStyle = shade(pal[(x * 2 + y * 3 + Math.floor(r() * 2)) % 5], .75 + r() * .35); g.fillRect(x * cw + 3, y * ch + 3, cw - 6, ch - 6);
      if (dist < 100) { g.fillStyle = 'rgba(255,240,200,.18)'; g.fillRect(x * cw + 3, y * ch + 3, cw - 6, ch - 6); }
    }
    g.fillStyle = '#e9efff'; g.beginPath(); g.arc(128, 150, 36, 0, 7); g.fill(); g.fillStyle = '#2c3a66'; g.beginPath(); g.arc(144, 140, 32, 0, 7); g.fill();
    g.fillStyle = '#d9c070'; g.beginPath(); g.arc(128, 330, 22, 0, 7); g.fill();
    g.strokeStyle = '#08080a'; g.lineWidth = 6; for (let x = 0; x <= 5; x++) { g.beginPath(); g.moveTo(x * cw, 0); g.lineTo(x * cw, 512); g.stroke(); } for (let y = 0; y <= 9; y++) { g.beginPath(); g.moveTo(0, y * ch); g.lineTo(256, y * ch); g.stroke(); }
    g.fillStyle = '#0a0a0d'; g.beginPath(); g.moveTo(0, 0); g.lineTo(256, 0); g.lineTo(256, 130); g.quadraticCurveTo(190, 46, 128, 0); g.quadraticCurveTo(66, 46, 0, 130); g.fill();
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, 0, 256, 512);
    return clampTex(c);
  };
  TP.altarCloth = () => {
    const [c, g] = mk(128, 128), r = rng(133);
    g.fillStyle = '#b9b5a8'; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 3) { g.fillStyle = `rgba(0,0,0,${.03 + r() * .04})`; g.fillRect(0, y, 128, 1); }
    g.fillStyle = '#6a1f26'; g.fillRect(60, 24, 8, 80); g.fillRect(36, 46, 56, 8);
    wrapBlob(g, 128, 100, 100, 40, 'rgba(70,50,20,.4)'); noise(g, 128, 128, r, 250, .1);
    return c;
  };
  TP.inscrWall = () => {
    const [c, g] = mk(256, 128), r = rng(134);
    g.fillStyle = '#8c1e24'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 52px ${SERIF}`;
    g.fillText('SING IT', 128, 40); g.fillText('BACK', 128, 92);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .5})`; g.fillRect(r() * 256, r() * 128, 1 + r() * 7, 1 + r() * 3); }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = '#8c1e24'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { const x = 40 + r() * 170; g.beginPath(); g.moveTo(x, 70); g.lineTo(x + (r() - .5) * 3, 118 + r() * 8); g.stroke(); }
    return clampTex(c);
  };
  TP.organPipes = () => {
    const [c, g] = mk(128, 256);
    g.fillStyle = '#0b0a0a'; g.fillRect(0, 0, 128, 256);
    const n = 6, w = 128 / n;
    for (let i = 0; i < n; i++) {
      const gr = g.createLinearGradient(i * w, 0, (i + 1) * w, 0); gr.addColorStop(0, '#4a4640'); gr.addColorStop(.35, '#bdb6a2'); gr.addColorStop(.7, '#6d6759'); gr.addColorStop(1, '#2a2723');
      g.fillStyle = gr; g.fillRect(i * w + 2, 0, w - 4, 256);
      g.fillStyle = '#090808'; g.fillRect(i * w + 4, 196 - (i % 3) * 14, w - 8, 12);
    }
    return c;
  };
})();
