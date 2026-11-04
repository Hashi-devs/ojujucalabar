/* ================= 3D ROOMS ================= */
const PI = Math.PI;
const ROOMS3D = {};
const clockTex = () => { const [h, m] = PZ().clock, n = 'clockFace' + h + '_' + m; if (!TP[n]) TP[n] = TP.clockFaceAt(h, m); return n; };
const WA = { t: 'woodA', s: 14 }, WB = { t: 'woodB', s: 10 }, BR = { c: '#b8923a', s: 40 }, IRON = { c: '#2a2c31', s: 30 };

function makeBuilder(sc) {
  const N = (p, o) => R3.add(p || sc.root, R3.node(o));
  const M = m => {
    if (m == null) return {};
    if (typeof m === 'string' || Array.isArray(m)) return { col: R3.parseCol(m) };
    const o = {};
    if (m.c !== undefined) o.col = R3.parseCol(m.c);
    if (m.t) o.tex = m.t;
    if (m.uv) o.uv = m.uv;
    if (m.s) o.shin = m.s;
    if (m.e !== undefined) o.em = R3.parseCol(m.e);
    if (m.a !== undefined) o.alpha = m.a;
    if (m.bl !== undefined) o.blend = m.bl;
    if (m.un) o.unlit = true;
    return o;
  };
  const B = { sc, N };
  sc.glints = [];
  B.grp = (p, x, y, z, ry = 0, id = null, rx = 0, rz = 0) => N(p, { pos: [x, y, z], rot: [rx, ry, rz], id });
  B.box = (p, x, y, z, w, h, d, m, ry = 0, rx = 0, rz = 0) => N(p, Object.assign({ geo: 'box', pos: [x, y, z], scl: [w, h, d], rot: [rx, ry, rz] }, M(m)));
  B.cyl = (p, x, y, z, r, h, m, rx = 0, rz = 0, ry = 0) => N(p, Object.assign({ geo: 'cyl', pos: [x, y, z], scl: [r * 2, h, r * 2], rot: [rx, ry, rz] }, M(m)));
  B.cone = (p, x, y, z, r, h, m, rx = 0, rz = 0) => N(p, Object.assign({ geo: 'cone', pos: [x, y, z], scl: [r * 2, h, r * 2], rot: [rx, 0, rz] }, M(m)));
  B.sph = (p, x, y, z, r, m, sy = 1, sz = 1) => N(p, Object.assign({ geo: 'sph', pos: [x, y, z], scl: [r * 2, r * 2 * sy, r * 2 * sz] }, M(m)));
  B.pln = (p, x, y, z, w, h, m, ry = 0, rx = 0, rz = 0) => N(p, Object.assign({ geo: 'plane', pos: [x, y, z], scl: [w, h, 1], rot: [rx, ry, rz] }, M(m)));
  B.hit = (p, x, y, z, w, h, d, id = null) => N(p, { geo: 'box', pos: [x, y, z], scl: [w, h, d], proxy: true, id });
  B.col = (x0, z0, x1, z1) => sc.colliders.push([x0, z0, x1, z1]);
  B.blob = (x, z, w, d, a = .6) => N(null, { geo: 'plane', tex: 'blob', alpha: a, blend: 1, unlit: true, col: [0, 0, 0], pos: [x, .014, z], rot: [-PI / 2, 0, 0], scl: [w, d, 1] });
  B.light = (x, y, z, c, k, r, fl = 0) => {
    const l = { p: [x, y, z], c, k, k0: k, r, fl, seed: Math.random() * 50 };
    sc.lights.push(l); return l;
  };
  B.glow = (p, x, y, z, s, col, a = .35) => N(p, { geo: 'plane', tex: 'glow', blend: 2, unlit: true, bb: true, col, alpha: a, pos: [x, y, z], scl: [s, s, 1], nopick: true });
  B.flame = (p, x, y, z, s = 1, glowCol = [1, .6, .2]) => {
    const g = N(p, { pos: [x, y, z] });
    const n = N(g, { geo: 'plane', tex: 'flame', blend: 2, unlit: true, bb: true, pos: [0, .03 * s, 0], scl: [.12 * s, .19 * s, 1] });
    const h = B.glow(g, 0, .03 * s, 0, .55 * s, glowCol, .28);
    const sd = Math.random() * 20;
    sc.anims.push(t => { n.scl[1] = .19 * s * (1 + .13 * Math.sin(t * 17 + sd) + .08 * Math.sin(t * 31 + sd * 2)); n.scl[0] = .12 * s * (1 + .07 * Math.sin(t * 23 + sd)); h.alpha = .26 + .05 * Math.sin(t * 9 + sd); });
    return g;
  };
  B.candle = (p, x, y, z, h, col, lit = true) => {
    const g = N(p, { pos: [x, y, z] });
    B.cyl(g, 0, h / 2, 0, .028, h, col);
    B.box(g, 0, h + .01, 0, .004, .02, .004, '#111');
    const fl = lit ? B.flame(g, 0, h + .03, 0, 1) : null;
    return { g, fl };
  };
  /* a bush lamp: the kerosene hurricane lantern found in every Nigerian house */
  B.bushlamp = (p, x, y, z, lit = true, paint = '#b0302a', s = 1) => {
    const g = N(p, { pos: [x, y, z], scl: [s, s, s] }), MET = { c: '#8d929a', s: 40 };
    B.cyl(g, 0, .04, 0, .078, .08, { c: paint, s: 30 }); B.cyl(g, 0, .088, 0, .082, .012, MET);
    B.cyl(g, 0, .1, 0, .05, .025, MET);
    const glass = B.sph(g, 0, .19, 0, .066, { c: [1, .93, .78], a: .38, bl: 1, s: 80 }, 1.4); glass.nopick = true;
    B.cyl(g, 0, .292, 0, .05, .014, MET); B.cone(g, 0, .33, 0, .058, .07, { c: paint, s: 30 }); B.cyl(g, 0, .375, 0, .018, .03, MET);
    [[.088, 0], [-.088, 0]].forEach(([dx]) => { B.cyl(g, dx, .2, 0, .006, .23, MET); });
    B.cyl(g, .052, .41, 0, .005, .12, MET, 0, -.9); B.cyl(g, -.052, .41, 0, .005, .12, MET, 0, .9); B.box(g, 0, .45, 0, .06, .008, .008, MET);
    B.cyl(g, .095, .05, 0, .012, .02, MET, 0, PI / 2);
    const fl = B.flame(g, 0, .16, 0, .75); fl.vis = !!lit;
    return { g, fl, glass };
  };
  B.glint = (x, y, z) => {
    const n = N(null, { geo: 'plane', tex: 'glint', blend: 2, unlit: true, bb: true, pos: [x, y, z], scl: [.2, .2, 1], nopick: true, alpha: .6 });
    const g = { n, p: [x, y, z], off: false };
    sc.glints.push(g); return g;
  };
  sc.anims.push(t => {
    for (const l of sc.lights) if (l.fl) l.k = l.k0 * (1 + l.fl * (.6 * Math.sin(t * 13 + l.seed) + .4 * Math.sin(t * 7.3 + l.seed * 2.1)));
    const cam = sc.cam; if (!cam) return;
    for (const g of sc.glints) {
      const d = Math.hypot(g.p[0] - cam.pos[0], g.p[2] - cam.pos[2]);
      const show = !g.off && d < 3.8;
      g.n.vis = show;
      if (show) g.n.alpha = .4 + .4 * Math.sin(t * 3.1 + g.p[0] * 5 + g.p[2] * 3);
    }
  });
  B.remove = n => { if (n.par) n.par.kids = n.par.kids.filter(k => k !== n); };

  B.shell = o => {
    const w = o.w || 6, d = o.d || 6, h = o.h || 3.2, hx = w / 2, hz = d / 2, tl = o.tile || 1.1, tr = o.trim || '#3a2a20';
    B.pln(null, 0, 0, 0, w, d, { t: o.floor, uv: [w / (o.floorTile || 1.4), d / (o.floorTile || 1.4)], s: o.floorS || 8 }, 0, -PI / 2);
    if (o.ceil) B.pln(null, 0, h, 0, w, d, { t: o.ceil, uv: [w / 1.6, d / 1.6] }, 0, PI / 2);
    const wm = { t: o.wall, uv: [w / tl, h / tl] }, wd = { t: o.wall, uv: [d / tl, h / tl] };
    B.pln(null, 0, h / 2, -hz, w, h, wm);
    B.pln(null, 0, h / 2, hz, w, h, wm, PI);
    B.pln(null, -hx, h / 2, 0, d, h, wd, PI / 2);
    B.pln(null, hx, h / 2, 0, d, h, wd, -PI / 2);
    if (o.dado) { // two-tone paint: a darker band along the bottom of every wall, with a thin line on top
      const dh = o.dado.h || 1.1, dm = { t: o.dado.t || o.wall, c: o.dado.c, uv: [w / tl, dh / tl] }, dmd = { t: o.dado.t || o.wall, c: o.dado.c, uv: [d / tl, dh / tl] }, e = .006;
      B.pln(null, 0, dh / 2, -hz + e, w, dh, dm); B.pln(null, 0, dh / 2, hz - e, w, dh, dm, PI);
      B.pln(null, -hx + e, dh / 2, 0, d, dh, dmd, PI / 2); B.pln(null, hx - e, dh / 2, 0, d, dh, dmd, -PI / 2);
      const lc = o.dado.line || '#2a2320';
      B.box(null, 0, dh, -hz + .01, w, .035, .02, lc); B.box(null, 0, dh, hz - .01, w, .035, .02, lc);
      B.box(null, -hx + .01, dh, 0, .02, .035, d, lc); B.box(null, hx - .01, dh, 0, .02, .035, d, lc);
    }
    if (!o.noTrim) {
      B.box(null, 0, .1, -hz + .03, w, .2, .06, tr); B.box(null, 0, .1, hz - .03, w, .2, .06, tr);
      B.box(null, -hx + .03, .1, 0, .06, .2, d, tr); B.box(null, hx - .03, .1, 0, .06, .2, d, tr);
    }
    sc.colliders.push([-20, -20, -hx, 20], [hx, -20, 20, 20], [-20, -20, 20, -hz], [-20, hz, 20, 20]);
  };
  sc.player = B.light(0, 1.6, 0, [1, .84, .56], .22, 5);
  sc.player.keep = true;
  return B;
}

/* ===================== 1. THE FOYER ===================== */
ROOMS3D.foyer = B => {
  const sc = B.sc;
  sc.amb = [.27, .3, .29]; sc.fog = [.02, .028, .026]; sc.fogD = .05;
  B.shell({ w: 6, d: 6, h: 3.2, floor: 'floorFoyer', wall: 'wallFoyer', ceil: 'ceilPOP', trim: '#2a3a30', dado: { t: 'dadoGreen', h: 1.05, line: '#1d2a22' } });
  B.pln(null, 0, .012, .2, 2.8, 3.4, { t: 'rug' }, 0, -PI / 2);
  // a ceiling fan, turning slowly with no light on
  const fan = B.grp(null, 0, 3.2, .3, 0, 'fan');
  B.cyl(fan, 0, -.15, 0, .015, .3, '#1c1a18'); B.cyl(fan, 0, -.34, 0, .09, .1, { c: '#d8d2c2', s: 40 }); B.cyl(fan, 0, -.4, 0, .05, .04, '#2a2622');
  const blades = B.grp(fan, 0, -.36, 0, 0);
  for (let i = 0; i < 3; i++) { const a = i * 2 * PI / 3; B.box(blades, Math.cos(a) * .42, 0, Math.sin(a) * .42, .7, .015, .13, { c: '#cfc8b4', s: 20 }, -a); }
  B.hit(fan, 0, -.36, 0, 1.6, .25, 1.6);
  let fanSpd = .9;
  sc.anims.push((t, dt) => { blades.rot[1] += (dt || .016) * fanSpd; });

  /* north: front door, coat stand, sconce */
  B.box(null, -.64, 1.2, -2.94, .14, 2.4, .14, WB); B.box(null, .64, 1.2, -2.94, .14, 2.4, .14, WB); B.box(null, 0, 2.42, -2.94, 1.42, .14, .14, WB);
  B.pln(null, 0, 1.15, -2.97, 1.14, 2.3, { t: 'moonWindow', c: [.4, .46, .62], un: true });
  const leaf = B.grp(null, -.57, 0, -2.88, 0, 'door');
  B.box(leaf, .57, 1.15, 0, 1.14, 2.3, .07, { t: 'woodA', uv: [1, 2], s: 12 });
  [[.3, 1.6], [.84, 1.6], [.3, .62], [.84, .62]].forEach(([x, y]) => B.box(leaf, x, y, .04, .4, .78, .02, WB));
  B.box(leaf, .57, .35, .045, 1.14, .07, .02, '#17171c'); B.box(leaf, .57, 1.95, .045, 1.14, .07, .02, '#17171c');
  B.box(leaf, .98, 1.12, .055, .15, .22, .03, BR); B.cyl(leaf, .98, 1.15, .075, .02, .02, '#080604', PI / 2); B.box(leaf, .98, 1.08, .075, .012, .06, .02, '#080604');
  B.glint(.43, 1.12, -2.78);

  // Papa's agbada on a stand, a fila cap on top
  const coat = B.grp(null, -2.1, 0, -2.45, .3, 'coat');
  B.cyl(coat, 0, .03, 0, .27, .05, '#1a120c'); B.cyl(coat, 0, .95, 0, .03, 1.9, '#2e1c10'); B.sph(coat, 0, 1.92, 0, .06, '#2e1c10');
  B.box(coat, 0, 1.25, .1, 1.05, 1.1, .12, { t: 'agbada', s: 6 }); B.box(coat, 0, 1.3, .03, .5, .95, .16, { c: '#cdc6b4', s: 4 });
  B.box(coat, -.56, 1.25, .1, .1, 1.0, .1, { c: '#c4bdab' }); B.box(coat, .56, 1.25, .1, .1, 1.0, .1, { c: '#c4bdab' });
  B.cyl(coat, 0, 2.02, 0, .12, .14, { c: '#6b1f2a', s: 8 }, 0, .2);
  B.hit(coat, 0, 1.1, .05, 1.2, 2.1, .8);
  B.blob(-2.1, -2.45, 1, 1, .5); B.col(-2.5, -2.75, -1.7, -2.15);
  const gCoat = B.glint(-2.1, 1.3, -2.2);

  // a bush lamp hanging on a nail by the door
  const sconce = B.grp(null, 1.85, 1.45, -2.9, 0, 'sconce');
  B.box(sconce, 0, .5, .0, .02, .02, .08, '#3a2e26'); B.cyl(sconce, 0, .47, .07, .004, .06, '#555');
  const lampS = B.bushlamp(sconce, 0, 0, .1, true, '#2a6a4a');
  B.hit(sconce, 0, .25, .1, .35, .65, .35);
  B.light(1.85, 1.75, -2.6, [1, .66, .3], 1.5, 6.5, .12);

  /* west: the television on its stand, Mama's portrait above it, window, cushion chair */
  B.box(null, -2.78, 1.6, 0, .44, 3.2, 2.3, { t: 'wallFoyer', uv: [1, 2.6] }); // a built-out wall piece
  B.box(null, -2.555, .52, 0, .01, 1.04, 2.3, { t: 'dadoGreen', uv: [1.6, .8] }); B.box(null, -2.555, 1.05, 0, .02, .035, 2.3, '#1d2a22');
  const tvs = B.grp(null, -2.3, 0, 0, PI / 2);
  B.box(tvs, 0, .32, 0, 1.5, .64, .44, { t: 'woodA', s: 18 }); B.box(tvs, -.38, .3, .225, .66, .5, .01, WB); B.box(tvs, .38, .3, .225, .66, .5, .01, WB);
  B.cyl(tvs, -.1, .32, .235, .015, .02, BR, PI / 2); B.cyl(tvs, .1, .32, .235, .015, .02, BR, PI / 2);
  const tv = B.grp(tvs, 0, .64, .0, 0, 'hearth');
  B.box(tv, 0, .3, -.02, .78, .6, .5, { c: '#3a2e24', s: 20 }); B.box(tv, 0, .3, .23, .8, .62, .02, { c: '#2a2420', s: 30 });
  const scr = B.pln(tv, -.08, .31, .245, .52, .42, { t: 'tvScreen', s: 70, un: true, c: [.55, .6, .58] });
  const scrFace = B.pln(tv, -.08, .31, .246, .52, .42, { t: 'tvFace', un: true, c: [.8, .85, .8] }); scrFace.vis = false;
  [.23, .29].forEach(y => B.cyl(tv, .3, y + .05, .25, .025, .02, '#888', PI / 2)); B.box(tv, .3, .2, .245, .08, .1, .01, '#151210');
  B.hit(tv, 0, .3, .1, .9, .7, .6);
  sc.anims.push(t => { scr.col = [.45 + .12 * Math.sin(t * 23), .5 + .12 * Math.sin(t * 23), .48 + .12 * Math.sin(t * 23)]; });
  const mant = B.grp(null, -2.3, 1.255, 0, 0, 'mantel');
  B.pln(mant, 0, .006, 0, .58, .9, { t: 'lace', bl: 1, s: 4 }, 0, -PI / 2);
  B.pln(mant, .245, -.045, 0, .9, .1, { t: 'lace', bl: 1, s: 4 }, PI / 2);
  B.cyl(mant, -.05, .1, -.18, .006, .22, '#aaa', 0, .4); B.cyl(mant, -.05, .1, .18, .006, .22, '#aaa', 0, -.4); // rabbit ears
  const noteMesh = B.pln(mant, .12, .012, .28, .2, .15, { t: 'paper' }, 0, -PI / 2, .3);
  B.bushlamp(null, -2.3, .64, -.56, true, '#b0302a', .9);
  B.cyl(null, -2.3, .79, .58, .06, .3, { c: '#c43a2a', s: 40 }); B.cyl(null, -2.3, .97, .58, .045, .06, '#e8e0cc'); // a flask
  B.hit(mant, 0, .1, 0, .7, .35, 1.3);
  B.light(-2.1, 1.05, -.56, [1, .7, .35], 1.1, 5, .12);
  const gNote = B.glint(-2.3, 1.38, .28);
  B.col(-3, -.8, -2.0, .8);

  const pv = B.grp(null, -2.54, 2.2, .46, PI / 2, 'portrait');
  B.box(pv, .45, 0, .035, .98, 1.28, .07, { c: '#a8873a', s: 40 });
  const canA = B.pln(pv, .45, 0, .075, .84, 1.12, { t: 'portraitA' });
  const canB = B.pln(pv, .45, 0, .075, .84, 1.12, { t: 'portraitB' });
  B.box(null, -2.555, 2.2, 0, .02, 1.14, .88, '#050403');
  const hk = B.grp(null, -2.52, 2.15, 0, 0, 'hollowkey');
  B.cyl(hk, 0, .14, 0, .07, .03, { c: '#a3a9b2', s: 30 }, 0, PI / 2); B.cyl(hk, 0, .14, 0, .035, .04, '#050403', 0, PI / 2);
  B.box(hk, 0, -.06, 0, .03, .3, .035, { c: '#a3a9b2', s: 30 }); B.box(hk, 0, -.14, .04, .03, .05, .06, { c: '#a3a9b2', s: 30 }); B.box(hk, 0, -.06, .04, .03, .05, .06, { c: '#a3a9b2', s: 30 });
  B.hit(hk, 0, 0, 0, .3, .5, .35);
  const gKey = B.glint(-2.4, 2.15, 0);

  const win = B.grp(null, -2.96, 1.7, 2.05, PI / 2, 'window1');
  B.pln(win, 0, 0, .01, .9, 1.4, { t: 'moonWindow', un: true, c: [.9, .95, 1] });
  for (let i = 0; i < 5; i++) B.box(win, -.36 + i * .18, 0, .035, .025, 1.4, .025, '#1b1410');
  B.box(win, 0, 0, .035, .96, .03, .03, '#1b1410'); B.box(win, 0, .72, .03, 1.0, .06, .06, WB); B.box(win, 0, -.72, .03, 1.0, .06, .06, WB);
  B.box(win, -.56, -.05, .1, .2, 1.8, .1, { t: 'ankara', uv: [.4, 1.6] }); B.box(win, .56, -.05, .1, .2, 1.8, .1, { t: 'ankara', uv: [.4, 1.6] });
  for (let i = 0; i < 4; i++) B.box(win, 0, -.54 + i * .36, .045, .96, .022, .022, '#1b1410');
  B.hit(win, 0, 0, .1, 1.3, 1.9, .4);
  B.light(-2.3, 1.8, 2.05, [.5, .66, 1], 1.0, 5.5);

  const arm = B.grp(null, -2.15, 0, -1.9, PI / 2, 'chair');
  const FAB = { t: 'fabric', s: 4 };
  B.box(arm, 0, .3, .02, .9, .24, .85, FAB); B.box(arm, 0, .72, -.36, .9, .8, .18, FAB);
  B.box(arm, -.5, .48, .02, .14, .5, .85, FAB); B.box(arm, .5, .48, .02, .14, .5, .85, FAB);
  B.box(arm, -.38, .09, .3, .07, .18, .07, '#1c0f0c'); B.box(arm, .38, .09, .3, .07, .18, .07, '#1c0f0c');
  B.box(arm, 0, .46, .06, .78, .1, .7, { t: 'ankara2', uv: [.6, .6] });
  B.pln(arm, 0, 1.0, -.26, .6, .36, { t: 'lace', bl: 1 }, 0, -.2); B.pln(arm, -.5, .74, .02, .5, .3, { t: 'lace', bl: 1 }, 0, -PI / 2); B.pln(arm, .5, .74, .02, .5, .3, { t: 'lace', bl: 1 }, 0, -PI / 2);
  B.hit(arm, 0, .55, 0, 1.1, 1.1, 1);
  B.blob(-2.15, -1.9, 1.2, 1.2, .5); B.col(-2.7, -2.4, -1.65, -1.4);

  /* east: clock, sideboard */
  const ck = B.grp(null, 2.72, 0, -1.6, -PI / 2, 'clock');
  B.box(ck, 0, .2, .02, .6, .4, .38, WB); B.box(ck, 0, 1.2, 0, .5, 1.6, .3, WB); B.box(ck, 0, 2.2, 0, .62, .6, .38, WB); B.box(ck, 0, 2.58, 0, .48, .12, .32, WB);
  B.pln(ck, 0, 2.2, .195, .42, .42, { t: clockTex(), s: 20 });   // the big clock shows this game's minute
  B.box(ck, 0, 1.2, .16, .3, .9, .02, { c: '#0a0806', s: 40 }); B.box(ck, 0, 1.32, .17, .008, .55, .01, BR); B.cyl(ck, 0, .86, .17, .07, .015, BR, PI / 2);
  B.hit(ck, 0, 1.3, .05, .7, 2.7, .5);
  B.blob(2.7, -1.6, 1, 1, .5); B.col(2.45, -1.85, 3, -1.35);

  const sb = B.grp(null, 2.7, 0, .95, -PI / 2);
  B.box(sb, 0, .45, 0, 1.9, .9, .6, WA);
  B.box(sb, -.6, .22, .31, .6, .3, .01, WB); B.box(sb, .6, .22, .31, .6, .3, .01, WB);
  const drw = B.grp(sb, 0, .66, .31, 0, 'drawer');
  B.box(drw, 0, 0, 0, 1.5, .28, .04, { t: 'woodB', s: 20 });
  B.box(drw, 0, -.01, -.25, 1.44, .22, .5, '#180e07');
  [-.32, 0, .32].forEach(x => B.cyl(drw, x, .0, .04, .05, .03, BR, PI / 2));
  [-.32, 0, .32].forEach(x => B.box(drw, x, .0, .062, .008, .05, .006, '#000'));
  const lk = B.grp(drw, .15, .17, -.1, 0, 'locket_hs');
  for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2; B.sph(lk, Math.cos(a) * .1, .0, Math.sin(a) * .06, .016, { c: '#c4322a', s: 50 }); }
  B.sph(lk, .12, .0, .0, .024, { c: '#c4322a', s: 50 });
  B.hit(lk, 0, 0, 0, .25, .2, .2);
  B.hit(drw, 0, 0, 0, 1.6, .4, .3);
  const gDrawer = B.glint(2.5, 1.0, .95);
  const gLocket = B.glint(2.45, 1.0, .85); gLocket.off = true;
  const ph = B.grp(sb, -.65, .98, 0, .2, 'photo');
  B.box(ph, 0, .12, 0, .26, .22, .03, '#5b4326'); B.pln(ph, 0, .12, .02, .2, .16, '#8f8a78');
  const vs = B.grp(sb, .65, .9, 0, 0, 'vase');
  B.cyl(vs, 0, .13, 0, .08, .26, { c: '#e8e2d2', s: 50 }); B.cyl(vs, 0, .3, 0, .04, .1, '#e8e2d2');
  [[-.04, .6, -.15], [.05, .66, .1], [.0, .72, .0]].forEach(([x, y, z]) => { B.cyl(vs, x * .5, y * .5 + .25, 0, .006, y * .6, '#2b3a2e', 0, z); B.sph(vs, x, y * .8 + .3, z * .3, .045, ['#e04a8a', '#f2c33d', '#e2532a'][Math.round((x + .04) * 25) % 3]); });
  B.hit(vs, 0, .35, 0, .3, .8, .3);
  B.blob(2.7, .95, 1, 2.1, .5); B.col(2.35, -.05, 3, 1.95);

  /* south: the showglass cabinet, dark stairs */
  const bk = B.grp(null, -1.2, 0, 2.78, PI, 'books');
  B.box(bk, 0, 1.1, 0, 1.7, 2.2, .4, WB); B.pln(bk, 0, 1.15, .205, 1.5, 1.85, { t: 'showglass' });
  B.pln(bk, 0, 1.15, .215, 1.5, 1.85, { c: [.7, .8, .85], a: .12, bl: 1, s: 90 });
  B.box(bk, 0, 1.15, .215, .03, 1.85, .02, WB); B.box(bk, 0, .12, .21, 1.7, .2, .02, WB);
  B.hit(bk, 0, 1.1, 0, 1.8, 2.3, .6); B.col(-2.1, 2.5, -.3, 3);
  // the bank calendar, still on October 1983
  B.pln(null, 2.965, 1.95, .95, .5, .75, { t: 'calendar' }, -PI / 2); B.cyl(null, 2.96, 2.35, .95, .012, .02, '#333', 0, PI / 2);
  B.hit(null, 2.9, 1.95, .95, .2, .85, .6, 'calendar');
  B.pln(null, 1.55, 1.1, 2.97, 1.3, 2.2, { c: '#010103', un: true }, PI);
  B.box(null, 1.55, .08, 2.76, 1.3, .16, .3, { c: '#241810' }); B.box(null, 1.55, .16, 2.9, 1.3, .32, .2, { c: '#241810' });
  B.box(null, .86, 1.12, 2.93, .1, 2.3, .1, WB); B.box(null, 2.24, 1.12, 2.93, .1, 2.3, .1, WB); B.box(null, 1.55, 2.3, 2.93, 1.5, .1, .1, WB);

  const lights = {};
  // oil painting: the family in 1972, the driver painted out
  const fp = B.grp(null, .22, 1.95, 2.92, PI, 'famPaint');   // clear of the showglass (to x -.35) and the doorway (from x .81)
  B.box(fp, 0, 0, 0, 1.12, .8, .06, { c: '#b8923a', s: 50 }); B.box(fp, 0, 0, .02, 1.0, .68, .04, '#1a1008');
  const fpA = B.pln(fp, 0, 0, .046, .98, .66, { t: 'paintFamA', s: 8 }), fpB = B.pln(fp, 0, 0, .047, .98, .66, { t: 'paintFamB', s: 8 }); fpB.vis = false;
  B.hit(fp, 0, 0, .05, 1.2, .9, .2);
  return {
    spawn: { x: 0, z: 2.0, yaw: 0 }, amb: .19, dark: false,
    apply(f) {
      fpA.vis = !f.gotIronKey; fpB.vis = !!f.gotIronKey;
      leaf.goal = { rot: [0, f.doorOpen ? 1.55 : 0, 0], k: 2.6 };
      drw.goal = { pos: [0, .66, f.drawerOpen ? .98 : .31], k: 4 };
      lk.vis = !!f.drawerOpen && !f.gotLocket; gLocket.off = !(f.drawerOpen && !f.gotLocket); gDrawer.off = !!f.drawerOpen;
      pv.goal = { rot: [0, PI / 2 + (f.portraitOpen ? -1.3 : 0), 0], k: 3 };
      canA.vis = !f.portraitOpen; canB.vis = !!f.portraitOpen;
      hk.vis = !!f.portraitOpen && !f.gotIronKey; gKey.off = !(f.portraitOpen && !f.gotIronKey);
      gNote.off = !!f.readNote; gCoat.off = !!f.gotMatches;
    },
    tvFace(on) { scrFace.vis = !!on; },
    fanSpeed(v) { fanSpd = v; }
  };
};

/* ===================== 2. THE NURSERY ===================== */
ROOMS3D.nursery = B => {
  const sc = B.sc;
  sc.amb = [.28, .24, .31]; sc.fog = [.03, .02, .04]; sc.fogD = .055;
  B.shell({ w: 6, d: 6, h: 3, floor: 'floorNursery', wall: 'wallNursery', ceil: 'ceilPOP', trim: '#3d5568', tile: 1.0, dado: { t: 'dadoBlue', h: 1.0, line: '#2a3a4a' } });
  B.pln(null, 0, .012, .1, 2.6, 2.6, { t: 'rugPink' }, 0, -PI / 2);

  /* north: small door, window, mobile */
  const PALE = { t: 'woodPale', c: [.78, .88, 1.05], s: 10 };
  B.box(null, -.54, 1.0, -2.94, .12, 2.0, .14, PALE); B.box(null, .54, 1.0, -2.94, .12, 2.0, .14, PALE); B.box(null, 0, 2.03, -2.94, 1.2, .12, .14, PALE);
  B.pln(null, 0, .95, -2.97, 1.0, 1.9, { c: '#020205', un: true });
  for (let i = 0; i < 4; i++) B.box(null, 0, .06 + i * .13, -2.78 + i * -.05, .9, .13, .2, '#16121a');
  const lf = B.grp(null, -.5, 0, -2.88, 0, 'ndoor');
  B.box(lf, .5, .95, 0, 1.0, 1.9, .06, { t: 'woodPale', c: [.62, .78, .98], s: 12 });
  B.box(lf, .5, 1.45, .035, .72, .5, .015, { c: [.5, .65, .85] }); B.box(lf, .5, .5, .035, .72, .6, .015, { c: [.5, .65, .85] });
  B.pln(lf, .5, 1.0, .045, .6, .3, { t: 'symPlate', s: 40 });
  B.cyl(lf, .88, .95, .05, .03, .03, BR, PI / 2);
  B.glint(0, 1.05, -2.8);

  const w2 = B.grp(null, -1.9, 1.5, -2.93, 0, 'window2');
  B.pln(w2, 0, 0, .01, .9, 1.3, { t: 'outsideSwing', un: true, c: [.9, .95, 1.05] });
  B.box(w2, 0, 0, .03, .04, 1.3, .03, '#7b6a73'); B.box(w2, 0, 0, .03, .9, .04, .03, '#7b6a73');
  B.box(w2, 0, .67, .03, 1.0, .07, .06, '#7b6a73'); B.box(w2, 0, -.67, .03, 1.0, .07, .06, '#7b6a73');
  B.box(w2, -.55, -.1, .1, .2, 1.7, .08, { t: 'ankara3', uv: [.4, 1.5] }); B.box(w2, .55, -.1, .1, .2, 1.7, .08, { t: 'ankara3', uv: [.4, 1.5] });
  B.hit(w2, 0, 0, .1, 1.3, 1.8, .4);
  B.light(-1.9, 1.7, -2.5, [.55, .5, 1], .85, 5);

  const mob = B.grp(null, 1.9, 3, -1.7, 0, 'mobile');
  B.cyl(mob, 0, -.35, 0, .008, .7, '#8d7a60');
  const arms = B.grp(mob, 0, -.7, 0);
  B.box(arms, 0, 0, 0, .9, .02, .02, '#8d7a60'); B.box(arms, 0, 0, 0, .02, .02, .9, '#8d7a60');
  [['symMoon', -.4, 0], ['symSun', 0, .4], ['symStar', .4, 0], ['symMoon', 0, -.4]].forEach(([t, x, z], i) => {
    B.cyl(mob, x * .9, -.84, z * .9, .004, .3, '#8d7a60');
    B.pln(arms, x, -.3, z, .22, .22, { t, c: [.9, .8, .5], un: true, a: .95 });
    B.pln(arms, x, -.3, z, .22, .22, { t, c: [.9, .8, .5], un: true, a: .95 }, PI / 2);
  });
  B.hit(mob, 0, -.65, 0, 1.1, .9, 1.1);
  sc.anims.push(t => { arms.rot[1] = t * .35; mob.rot[0] = Math.sin(t * .9) * .04; });

  /* west: toy shelf and chest */
  const ts = B.grp(null, -2.78, 0, .1, PI / 2);
  B.box(ts, 0, .8, -.15, 2.1, 1.6, .06, WB); B.box(ts, -1.03, .8, 0, .06, 1.6, .4, WB); B.box(ts, 1.03, .8, 0, .06, 1.6, .4, WB);
  [.04, .5, .95, 1.4, 1.6].forEach(y => B.box(ts, 0, y, 0, 2.1, .04, .4, WB));
  const toys = B.grp(ts, 0, 0, 0, 0, 'toys');
  B.cyl(toys, -.6, 1.52, .05, .14, .18, '#8c342e'); B.cyl(toys, -.6, 1.62, .05, .145, .02, '#d8c9a0');
  B.box(toys, -.15, 1.55, .05, .07, .26, .07, '#a8473a'); B.sph(toys, -.15, 1.7, .05, .05, '#d8bfa0'); B.box(toys, .02, 1.53, .05, .07, .22, .07, '#3f6a96'); B.sph(toys, .02, 1.66, .05, .05, '#d8bfa0');
  B.cyl(toys, -.4, 1.5, .02, .1, .02, '#555'); B.hit(toys, -.2, 1.55, .05, 1.1, .5, .4);
  const blocks = B.grp(ts, 0, 0, 0, 0, 'blocks');
  [['blockH', -.82], ['blockE', -.62], ['blockL', -.42], ['blockP', -.22]].forEach(([t, x], i) => B.box(blocks, x, 1.04, .08, .17, .17, .17, { t, uv: [1, 1] }, (i - 1.5) * .15));
  B.hit(blocks, -.52, 1.05, .08, .9, .3, .35);
  const teddy = B.grp(ts, .55, 1.0, .04, .25, 'teddy');
  const FUR = { c: '#8a6a45' };
  B.sph(teddy, 0, .17, 0, .13, FUR, 1.1); B.sph(teddy, 0, .38, .01, .1, FUR); B.sph(teddy, -.08, .47, 0, .035, '#7b5d3b'); B.sph(teddy, .08, .47, 0, .035, '#7b5d3b');
  B.sph(teddy, 0, .35, .09, .04, { c: '#b89468' }, .8, .8); B.sph(teddy, 0, .36, .12, .012, '#2a1a10');
  B.sph(teddy, -.14, .2, .03, .045, FUR, 1.4); B.sph(teddy, .14, .2, .03, .045, FUR, 1.4); B.sph(teddy, -.08, .04, .08, .05, FUR, .8); B.sph(teddy, .08, .04, .08, .05, FUR, .8);
  B.sph(teddy, .04, .41, .085, .018, { c: '#080808', s: 60 });
  const eye2 = B.sph(teddy, -.04, .41, .085, .018, { c: '#080808', s: 60 });
  const xMark = B.box(teddy, -.04, .41, .09, .045, .008, .008, '#2a1a10', 0, 0, .7); const xMark2 = B.box(teddy, -.04, .41, .09, .045, .008, .008, '#2a1a10', 0, 0, -.7);
  const seam = B.box(teddy, 0, .15, .125, .008, .13, .008, '#3a2a1a');
  B.hit(teddy, 0, .25, .02, .4, .6, .4);
  const tc = B.grp(null, -2.5, 0, 1.55, PI / 2, 'chest');
  B.box(tc, 0, .22, 0, 1.0, .44, .55, { t: 'woodA', c: [1, .65, .5], s: 10 }); B.box(tc, 0, .5, 0, 1.04, .1, .59, { t: 'woodB', c: [1, .75, .6] }); B.box(tc, 0, .38, .29, .14, .12, .03, BR);
  B.box(tc, -.3, .25, .3, .04, .46, .02, '#3a2412'); B.box(tc, .3, .25, .3, .04, .46, .02, '#3a2412');
  B.hit(tc, 0, .3, 0, 1.1, .7, .7);
  [[-2.1, 1.9, '#3f6a96'], [-1.8, 2.2, '#a8473a'], [-1.2, 1.6, '#4d8456'], [-2.2, -1.6, '#c9a23c']].forEach(([x, z, c]) => B.sph(null, x, .05, z, .05, { c, s: 70 }));
  B.blob(-2.75, .1, 1, 2.3, .5); B.col(-3, -1.1, -2.3, 1.3); B.col(-3, 1.2, -2.2, 1.95);

  /* east: rocking horse, dresser with music box, crib */
  const hz = B.grp(null, 2.2, 0, -1.2, -PI / 2, 'horse');
  [-.16, .16].forEach(x => { B.box(hz, x, .05, 0, .04, .06, 1.15, '#6b4a2a'); B.box(hz, x, .09, .62, .04, .06, .22, '#6b4a2a', 0, .5); B.box(hz, x, .09, -.62, .04, .06, .22, '#6b4a2a', 0, -.5); B.box(hz, x, .32, .3, .04, .5, .05, '#6b4a2a', 0, .15); B.box(hz, x, .32, -.3, .04, .5, .05, '#6b4a2a', 0, -.15); });
  B.box(hz, 0, .62, 0, .26, .3, .72, { c: '#9a989e' }); B.sph(hz, .1, .66, .1, .05, '#85838a'); B.sph(hz, -.1, .6, -.2, .04, '#85838a');
  B.box(hz, 0, .96, .44, .15, .42, .17, { c: '#9a989e' }, 0, .45); B.box(hz, 0, 1.12, .6, .13, .14, .22, { c: '#9a989e' }, 0, .2);
  B.box(hz, 0, .96, .34, .03, .3, .07, '#26232b', 0, .45); B.box(hz, 0, .56, -.4, .03, .3, .06, '#26232b', 0, -.2);
  B.box(hz, 0, .79, .02, .28, .04, .3, '#8c342e'); B.sph(hz, .08, 1.12, .66, .018, '#111');
  const btn = B.sph(hz, .075, .92, .4, .026, { c: '#1b1b1f', s: 60 });
  B.hit(hz, 0, .6, 0, .5, 1.2, 1.4);
  const gBtn = B.glint(2.1, .92, -1.0);
  sc.anims.push(t => { hz.rot[0] = Math.sin(t * 1.5) * .09 + Math.sin(t * .37) * .02; });
  B.blob(2.2, -1.2, 1.4, 1.6, .5); B.col(1.8, -2.0, 2.6, -.4);

  const dr = B.grp(null, 2.62, 0, .85, -PI / 2);
  B.box(dr, 0, .5, 0, 1.3, 1.0, .5, { t: 'woodPale', c: [.85, .75, .75], s: 8 });
  [.22, .5, .78].forEach(y => { B.box(dr, 0, y, .26, 1.2, .006, .01, '#2a2030'); B.cyl(dr, -.3, y + .1, .27, .02, .02, BR, PI / 2); B.cyl(dr, .3, y + .1, .27, .02, .02, BR, PI / 2); });
  const mb = B.grp(dr, 0, 1.0, 0, 0, 'musicbox');
  B.box(mb, 0, .09, 0, .4, .18, .3, { t: 'woodA', c: [1, .85, .7], s: 40 }); B.box(mb, 0, .27, -.12, .4, .02, .3, { t: 'woodA', c: [1, .85, .7] }, 0, -1.15);
  B.cyl(mb, .26, .1, 0, .015, .08, BR, 0, PI / 2); B.box(mb, .32, .1, 0, .003, .05, .005, BR);
  const syms = [['symStar', -.14], ['symMoon', 0], ['symSun', .14]].map(([t, x]) => B.pln(mb, x, .52, .12, .12, .12, { t, c: [1, .85, .4], un: true, a: .22, bl: 1 }));
  const mbLight = B.light(2.4, 1.6, .85, [1, .85, .45], 0, 4);
  B.hit(mb, 0, .25, 0, .55, .55, .5);
  const gMb = B.glint(2.45, 1.22, .85);
  B.light(2.45, 1.25, .5, [1, .72, .4], .5, 3.5, .06);
  B.col(2.3, .2, 3, 1.5);

  const crib = B.grp(null, 2.15, 0, 2.15, 0, 'crib');
  const CW = { t: 'woodB', c: [1.3, 1.2, 1.1], s: 14 };
  [[-.4, -.8], [.4, -.8], [-.4, .8], [.4, .8]].forEach(([x, z]) => B.box(crib, x, .6, z, .08, 1.2, .08, CW));
  B.box(crib, 0, .32, 0, .82, .06, 1.62, CW); B.box(crib, 0, .98, -.8, .82, .06, .06, CW); B.box(crib, 0, .98, .8, .82, .06, .06, CW);
  B.box(crib, -.4, .98, 0, .06, .06, 1.6, CW); B.box(crib, .4, .98, 0, .06, .06, 1.6, CW);
  for (let i = 0; i < 9; i++) { const z = -.64 + i * .16; B.box(crib, -.4, .66, z, .025, .6, .025, CW); B.box(crib, .4, .66, z, .025, .6, .025, CW); }
  for (let i = 0; i < 4; i++) { const x = -.24 + i * .16; B.box(crib, x, .66, -.8, .025, .6, .025, CW); B.box(crib, x, .66, .8, .025, .6, .025, CW); }
  B.box(crib, 0, .38, 0, .74, .1, 1.5, { c: '#b9b2c4' }); B.sph(crib, 0, .44, .1, .3, { c: '#000', a: .35, bl: 1 }, .1, 1.2);
  B.hit(crib, 0, .6, 0, 1, 1.3, 1.8);
  B.light(2.3, 1.0, 2.1, [.7, .6, 1], .5, 3.5);
  B.blob(2.15, 2.15, 1.3, 2, .5); B.col(1.7, 1.3, 2.6, 3);

  /* south: wardrobe with watching eyes */
  const wd = B.grp(null, -.7, 0, 2.7, PI, 'wardrobe');
  B.box(wd, 0, 1.15, 0, 1.5, 2.3, .6, { t: 'woodPale', c: [.55, .5, .5], s: 8 });
  B.box(wd, -.375, 1.1, .31, .7, 2.1, .02, { t: 'woodB', c: [1.1, 1, 1] }); B.box(wd, .375, 1.1, .31, .7, 2.1, .02, { t: 'woodB', c: [1.1, 1, 1] });
  B.box(wd, 0, 1.1, .315, .02, 2.12, .012, '#050304'); B.cyl(wd, -.06, 1.1, .33, .02, .02, BR, PI / 2); B.cyl(wd, .06, 1.1, .33, .02, .02, BR, PI / 2);
  B.box(wd, 0, 1.55, .32, .03, .35, .008, '#000');
  const eyes = [B.sph(wd, -.012, 1.55, .325, .008, { c: '#fff', un: true }), B.sph(wd, .012, 1.55, .325, .008, { c: '#fff', un: true })];
  eyes.forEach(e => { e.vis = false; });
  sc.anims.push(t => { const on = (Math.sin(t * .7) + Math.sin(t * 1.9 + 1)) > 1.55; eyes.forEach(e => { e.vis = on; }); });
  B.hit(wd, 0, 1.15, .1, 1.6, 2.4, .8);
  B.blob(-.7, 2.7, 1.8, 1, .5); B.col(-1.5, 2.35, .1, 3);

  // oil painting: Mama with small Tobi
  const tp = B.grp(null, -2.92, 2.2, -1.75, PI / 2, 'tobiPaint');
  B.box(tp, 0, 0, 0, .62, .76, .05, { c: '#b8923a', s: 50 });
  const tpA = B.pln(tp, 0, 0, .03, .52, .66, { t: 'paintTobiA', s: 8 }), tpB = B.pln(tp, 0, 0, .031, .52, .66, { t: 'paintTobiB', s: 8 }); tpB.vis = false;
  B.hit(tp, 0, 0, .05, .7, .85, .2);
  return {
    spawn: { x: 0, z: 2.0, yaw: 0 }, dark: false,
    mbLight(i, on) { syms[i].alpha = on ? 1 : .22; syms[i].em = on ? [.6, .45, 0] : [0, 0, 0]; mbLight.k0 = on ? 1.6 : 0; mbLight.k = mbLight.k0; mbLight.fl = on ? .1 : 0; },
    apply(f) {
      tpA.vis = !f.wd; tpB.vis = !!f.wd;
      lf.goal = { rot: [0, f.doorOpen ? 1.55 : 0, 0], k: 2.6 };
      btn.vis = !f.gotButton; gBtn.off = !!f.gotButton;
      eye2.vis = !!f.teddyFixed; xMark.vis = xMark2.vis = !f.teddyFixed; seam.vis = !f.teddyFixed;
      gMb.off = !!f.boxPlayed;
    }
  };
};

/* ===================== 3. THE CELLAR (dark) ===================== */
ROOMS3D.cellar = B => {
  const sc = B.sc;
  sc.amb = [.03, .035, .045]; sc.fog = [.008, .01, .014]; sc.fogD = .13;
  B.shell({ w: 6, d: 6, h: 2.8, floor: 'floorCellar', wall: 'wallCellar', ceil: 'ceilStone', trim: '#2a2b2d', tile: 1.3, floorTile: 1.6, floorS: 14 });
  // arch beams
  [-1.5, 1.5].forEach(z => B.box(null, 0, 2.66, z, 6, .24, .3, { t: 'woodB' }));
  // high barred window (moonlight)
  B.pln(null, 2.97, 2.25, -1.4, .7, .4, { t: 'moonWindow', un: true, c: [.5, .55, .7] }, -PI / 2);
  [0, 1, 2].forEach(i => B.box(null, 2.95, 2.25, -1.62 + i * .22, .02, .4, .03, '#111'));
  B.light(2.5, 2.25, -1.4, [.45, .58, .9], .5, 6);

  /* north: heavy door */
  B.box(null, -.82, 1.15, -2.93, .2, 2.3, .16, { t: 'woodB' }); B.box(null, .82, 1.15, -2.93, .2, 2.3, .16, { t: 'woodB' }); B.box(null, 0, 2.35, -2.93, 1.84, .2, .16, { t: 'woodB' });
  B.pln(null, 0, 1.15, -2.97, 1.44, 2.3, { c: '#030406', un: true });
  for (let i = 0; i < 6; i++) B.box(null, 0, .06 + i * .16, -2.7 - i * .09, 1.4, .16, .3, '#16171a');
  const hv = B.grp(null, -.7, 0, -2.86, 0, 'cdoor');
  [0, 1, 2, 3].forEach(i => B.box(hv, .175 + i * .35, 1.15, 0, .35, 2.3, .09, { t: 'woodB', c: [.8 + i * .05, .8, .8], s: 6 }));
  [.4, 1.05, 1.95].forEach(y => B.box(hv, .7, y, .06, 1.42, .12, .03, IRON));
  [.12, .38, .62, 1.0, 1.3].forEach(x => { B.cyl(hv, x + .08, .4, .08, .02, .02, IRON, PI / 2); B.cyl(hv, x + .08, 1.95, .08, .02, .02, IRON, PI / 2); });
  B.box(hv, .52, 1.12, .07, .34, .05, .02, IRON);
  const pl = B.grp(hv, .52, 1.1, .1, 0, 'padlock');
  B.box(pl, 0, -.05, 0, .13, .11, .05, { c: '#6b6f78', s: 50 }); B.box(pl, -.045, .04, 0, .018, .09, .018, { c: '#9aa0a8', s: 40 }); B.box(pl, .045, .04, 0, .018, .09, .018, { c: '#9aa0a8', s: 40 }); B.box(pl, 0, .085, 0, .108, .018, .018, { c: '#9aa0a8', s: 40 });
  B.hit(pl, 0, 0, 0, .3, .3, .25);
  const kh = B.grp(hv, 1.05, 1.1, .08, 0, 'keyhole');
  B.cyl(kh, 0, 0, 0, .1, .03, { c: '#26282c', s: 30 }, PI / 2); B.cyl(kh, 0, .02, .02, .016, .02, '#000', PI / 2); B.box(kh, 0, -.03, .02, .016, .06, .01, '#000');
  const bkey = B.grp(kh, 0, 0, .06, 0);
  B.cyl(bkey, 0, 0, .05, .012, .1, { c: '#d7a93f', s: 40 }, PI / 2); B.cyl(bkey, 0, 0, .1, .035, .01, { c: '#d7a93f', s: 40 }, PI / 2);
  B.hit(kh, 0, 0, 0, .3, .3, .25);
  B.glint(-.2, 1.1, -2.7); B.glint(.34, 1.1, -2.7);
  const lanG = B.grp(null, -1.75, 1.45, -2.9, 0, 'lantern');
  B.box(lanG, 0, .28, .0, .02, .02, .1, '#4a4036');
  B.bushlamp(lanG, 0, -.2, .1, false, '#3a6a8a', 1.1);
  B.hit(lanG, 0, 0, .1, .4, .7, .4);
  const gLan = B.glint(-1.75, 1.45, -2.7);
  B.col(-1.2, -3, 1.2, -2.75);

  /* west: workbench */
  const wb = B.grp(null, -2.62, 0, -.2, PI / 2);
  B.box(wb, 0, .9, 0, 2.0, .08, .72, WA);
  [[-.9, -.3], [.9, -.3], [-.9, .3], [.9, .3]].forEach(([x, z]) => B.box(wb, x, .45, z, .08, .9, .08, WB));
  B.box(wb, 0, .3, -.3, 1.9, .05, .1, WB); B.box(wb, 0, .22, 0, 1.9, .04, .6, WB);
  B.box(wb, .35, .95, -.28, .3, .12, .1, '#33343a'); B.cyl(wb, .35, 1.0, -.28, .05, .08, '#33343a');
  const tbx = B.grp(wb, -.5, .94, .03, 0, 'toolbox');
  B.box(tbx, 0, .08, 0, .5, .16, .26, { c: '#8a2f26', s: 30 }); B.box(tbx, 0, .045, .132, .06, .06, .01, '#d7a93f');
  const tlid = B.grp(tbx, 0, .16, -.13, 0);
  B.box(tlid, 0, .015, .13, .5, .03, .26, { c: '#7a2820', s: 30 });
  B.box(tlid, 0, .05, .13, .3, .025, .03, '#d7a93f');
  const crow = B.grp(tbx, 0, .16, 0, 0);
  B.cyl(crow, 0, .01, 0, .012, .44, { c: '#8a8f98', s: 40 }, 0, PI / 2); B.cyl(crow, -.23, .035, 0, .012, .1, { c: '#8a8f98', s: 40 }, 0, PI / 2 - .8);
  B.hit(tbx, 0, .1, 0, .6, .4, .35);
  const gTb = B.glint(-2.5, 1.2, .3);
  const cloth = B.grp(wb, .72, .94, .05, 0, 'cloth');
  const CL = { c: '#8a7d63' };
  B.box(cloth, 0, .05, 0, .5, .1, .4, CL, .1); B.box(cloth, -.05, .11, .02, .36, .08, .3, CL, -.15); const clTop = B.sph(cloth, .0, .13, .0, .16, CL, .6, 1.2);
  B.hit(cloth, 0, .1, 0, .6, .3, .5);
  const gCl = B.glint(-2.5, 1.15, -.92);
  // an old valve radio: the one thing down here that still talks
  const rg = B.grp(wb, .02, .94, -.12, 0, 'radio');
  B.box(rg, 0, .13, 0, .4, .26, .17, { t: 'woodB', c: [1.15, .9, .7], s: 20 });
  B.box(rg, -.08, .14, .086, .19, .17, .006, { c: '#3d2c1e' });
  for (let i = 0; i < 5; i++) B.box(rg, -.08, .07 + i * .035, .09, .19, .006, .004, '#6a5238');
  const rDial = B.box(rg, .1, .18, .087, .13, .05, .006, { c: '#5a4630', un: true });
  B.cyl(rg, .07, .07, .095, .028, .02, { c: '#1a1410', s: 40 }, PI / 2); B.cyl(rg, .14, .07, .095, .022, .02, { c: '#1a1410', s: 40 }, PI / 2);
  B.cyl(rg, -.16, .28, -.04, .004, .26, '#888', .3);
  B.hit(rg, 0, .13, .02, .5, .4, .35);
  const gRadio = B.glint(-2.45, 1.15, -.18);
  const sk = B.grp(wb, -.88, .94, -.2, .4, 'skull');
  B.sph(sk, 0, .09, 0, .09, '#cfc9b4', 1.05); B.box(sk, 0, .02, .04, .1, .05, .09, '#cfc9b4'); B.sph(sk, -.035, .1, .075, .022, '#000'); B.sph(sk, .035, .1, .075, .022, '#000');
  B.hit(sk, 0, .08, 0, .3, .3, .3);
  B.box(null, -2.94, 1.7, .3, .05, .9, 1.3, { t: 'woodB' });
  B.box(null, -2.9, 1.8, .0, .04, .5, .05, '#14151a'); B.box(null, -2.9, 1.75, .35, .04, .4, .12, '#14151a'); B.cyl(null, -2.9, 1.7, .7, .09, .03, '#14151a', 0, PI / 2);
  B.blob(-2.6, -.2, 1.2, 2.2, .5); B.col(-3, -1.3, -2.2, .9);

  /* east: coffin, wine rack */
  // a blue plastic water drum in the corner, empty, big enough to hide in
  const dr = B.grp(null, -2.45, 0, -2.35, 0, 'hidedrum'), drV = B.grp(dr, 0, 0, 0);
  B.cyl(drV, 0, .45, 0, .33, .9, { c: '#1f5fa8', s: 40 }); [.15, .45, .75].forEach(y => B.cyl(drV, 0, y, 0, .34, .04, { c: '#18508f', s: 40 }));
  B.cyl(drV, .05, .93, .05, .3, .05, { c: '#2a6ab8', s: 40 }, .12, 0); B.cyl(drV, 0, .91, 0, .27, .02, '#06080c');
  B.hit(dr, 0, .5, 0, .8, 1.1, .8); B.glint(-2.3, 1.0, -2.2); B.col(-2.85, -2.75, -2.05, -1.95);
  const cf = B.grp(null, 2.22, 0, .15, 0, 'coffin');
  [-.8, .8].forEach(z => { B.box(cf, 0, .35, z, .75, .08, .1, WB); B.box(cf, -.3, .17, z, .08, .34, .1, WB, 0, 0, .2); B.box(cf, .3, .17, z, .08, .34, .1, WB, 0, 0, -.2); });
  const CFW = { t: 'woodB', c: [.9, .85, .8], s: 8 };
  B.box(cf, 0, .72, 0, .8, .56, 2.0, CFW); B.box(cf, 0, .72, -.5, .84, .56, .8, CFW);
  B.box(cf, 0, .97, 0, .68, .06, 1.88, '#030202');
  const hand = B.grp(cf, 0, .97, .2, 0);
  B.box(hand, 0, .05, 0, .06, .05, .5, '#cfc9b4'); B.box(hand, 0, .06, .3, .1, .04, .1, '#cfc9b4');
  [-.04, -.013, .013, .04].forEach((x, i) => B.box(hand, x, .07, .4, .012, .02, .09 + (i === 1 || i === 2 ? .02 : 0), '#cfc9b4', (i - 1.5) * .08));
  const ckey = B.grp(hand, 0, .08, .42, 0);
  B.cyl(ckey, 0, 0, 0, .012, .12, { c: '#d7a93f', s: 40 }, PI / 2); B.cyl(ckey, 0, 0, .07, .03, .01, { c: '#d7a93f', s: 40 }, PI / 2);
  const lid = B.grp(cf, 0, 1.03, 0, 0);
  B.box(lid, 0, 0, 0, .86, .08, 2.08, { t: 'woodB', c: [1.1, 1, .95], s: 6 });
  B.box(lid, 0, .05, 0, .06, .02, .8, '#2c1d12'); B.box(lid, 0, .05, .2, .4, .02, .06, '#2c1d12');
  for (let i = 0; i < 6; i++) { B.cyl(lid, -.4, .05, -.9 + i * .36, .014, .02, '#14110e'); B.cyl(lid, .4, .05, -.9 + i * .36, .014, .02, '#14110e'); }
  B.hit(cf, 0, .7, 0, 1, 1.0, 2.3);
  const gCf = B.glint(2.1, 1.2, .15);
  const wr = B.grp(null, 2.82, 0, 2.15, -PI / 2, 'wine');
  B.box(wr, 0, .85, 0, 1.4, 1.7, .36, { t: 'woodB', c: [.8, .8, .8] });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { B.cyl(wr, -.5 + c * .33, .22 + r * .32, .2, .07, .3, { c: '#0f1a10', s: 60 }, PI / 2); B.cyl(wr, -.5 + c * .33, .22 + r * .32, .36, .03, .08, { c: '#0f1a10', s: 60 }, PI / 2); }
  B.hit(wr, 0, .85, .1, 1.5, 1.8, .6);
  const gWine = B.glint(2.6, 1.2, 2.15);
  B.blob(2.3, .15, 1.4, 2.4, .6); B.col(1.8, -.95, 3, 1.25); B.col(2.45, 1.4, 3, 2.9);

  /* south: barrels */
  const brl = B.grp(null, -1.4, 0, 2.5, 0, 'barrel');
  [[-.35, 0, .3], [.4, .1, .32], [.05, .6, .27]].forEach(([x, z, r], i) => { B.cyl(brl, x, .45, z, r, .9, { t: 'woodB', c: [1.1, 1, 1], s: 6 }); B.cyl(brl, x, .2, z, r + .01, .04, IRON); B.cyl(brl, x, .7, z, r + .01, .04, IRON); });
  B.hit(brl, 0, .5, .3, 1.5, 1.1, 1.2);
  B.blob(-1.4, 2.6, 1.8, 1.8, .6); B.col(-2.2, 1.9, -.4, 3);
  B.box(null, 1.3, .3, 2.5, .7, .6, .7, { t: 'woodA', c: [.8, .7, .6] }); B.box(null, 1.35, .9, 2.5, .6, .6, .6, { t: 'woodA', c: [.75, .65, .55] }); B.col(.9, 2.1, 1.75, 2.95);

  // held lantern (visible in your hand once lit)
  const held = B.grp(null, 0, 0, 0); held.hud = [.36, -.33, .95];
  { const MET = { c: '#8d929a', s: 40 }, PAINT = { c: '#3a6a8a', s: 30 };
    B.cyl(held, 0, -.13, 0, .075, .07, PAINT); B.cyl(held, 0, -.09, 0, .05, .02, MET);
    B.sph(held, 0, .0, 0, .062, { c: '#ffd9a0', un: true, a: .45, bl: 1 }, 1.4);
    B.cyl(held, 0, .1, 0, .048, .012, MET); B.cone(held, 0, .135, 0, .055, .06, PAINT); B.cyl(held, .085, -.01, 0, .005, .22, MET); B.cyl(held, -.085, -.01, 0, .005, .22, MET);
    B.box(held, 0, .22, 0, .14, .006, .006, MET); }
  const hf = B.N(held, { geo: 'plane', tex: 'flame', blend: 2, unlit: true, bb: true, pos: [0, -.03, 0], scl: [.07, .1, 1] });
  sc.anims.push(t => { hf.scl[1] = .1 * (1 + .12 * Math.sin(t * 17)); held.pos[1] = 0; held.vis = !!G.f.lanternLit && !held.hide; });
  held.vis = false;
  sc.held = held;

  return {
    spawn: { x: 0, z: 2.0, yaw: 0 }, dark: true,
    drumWalls(on) { drV.vis = on; },
    apply(f) {
      hv.goal = { rot: [0, (f.padOpen && f.keyUsed) ? 1.55 : 0, 0], k: 2.6 };
      pl.goal = { pos: [.52, (f.padOpen ? .94 : 1.1), .1], rot: [0, 0, f.padOpen ? .7 : 0], k: 5 };
      bkey.vis = !!f.keyUsed;
      lanG.vis = !f.lanternLit; gLan.off = !!f.lanternLit; held.vis = !!f.lanternLit;
      tlid.goal = { rot: [f.gotCrowbar ? -1.6 : 0, 0, 0], k: 5 }; crow.vis = !f.gotCrowbar; gTb.off = !!f.gotCrowbar;
      clTop.vis = !f.gotRag; gCl.off = !!f.gotRag;
      gRadio.off = !f.lanternLit || !!f.radioHeard; rDial.col = f.lanternLit ? [1, .78, .4] : [.35, .27, .19];
      gWine.off = !f.radioHeard || !!f.gotPadKey || !!f.padOpen;
      lid.goal = { pos: [.62, .78, .18], rot: [0, .35, -.6], k: 3 };
      if (!f.coffinOpen) lid.goal = { pos: [0, 1.03, 0], rot: [0, 0, 0], k: 6 };
      hand.vis = !!f.coffinOpen; ckey.vis = false; gCf.off = !!f.coffinOpen;
      sc.player.k0 = f.lanternLit ? 1.55 : .5; sc.player.r = f.lanternLit ? 7.5 : 2.4; sc.player.fl = f.lanternLit ? .1 : .04; sc.player.c = f.lanternLit ? [1, .78, .45] : [.95, .8, .6];
    }
  };
};

/* ===================== 4. THE ATTIC ===================== */
ROOMS3D.attic = B => {
  const sc = B.sc;
  sc.amb = [.2, .17, .2]; sc.fog = [.025, .02, .03]; sc.fogD = .065;
  const hx = 3, hz = 3, kh = 1.3, rh = 3.4, ang = Math.atan2(rh - kh, hx), L = Math.hypot(hx, rh - kh);
  B.pln(null, 0, 0, 0, 6, 6, { t: 'floorAttic', uv: [4, 4], s: 6 }, 0, -PI / 2);
  [-1, 1].forEach(s => {
    const rs = B.grp(null, s * hx / 2, (kh + rh) / 2, 0, 0, null, 0, -s * ang);
    B.pln(rs, 0, 0, 0, L, 6, { t: 'wallAttic', uv: [L / 1.2, 5], c: [.8, .8, .8] }, 0, PI / 2);
    for (let z = -2.6; z <= 2.6; z += 1.3) B.box(rs, 0, -.05, z, L, .14, .12, WB);
    B.box(rs, 0, -.04, 0, .12, .1, 6, WB);
    B.pln(null, s * hx, kh / 2, 0, 6, kh, { t: 'wallAttic', uv: [5, 1.2] }, -s * PI / 2);
  });
  [-1, 1].forEach(s => { B.pln(null, 0, rh / 2, s * hz, 6, rh, { t: 'wallAttic', uv: [5, 3] }, s > 0 ? PI : 0); });
  // tie beams
  [-1.5, 1.5].forEach(z => B.box(null, 0, 2.55, z, 5.2, .14, .14, WB));
  B.col(-20, -20, -2.5, 20); B.col(2.5, -20, 20, 20); B.col(-20, -20, 20, -2.8); B.col(-20, 2.8, 20, 20);
  B.box(null, 0, 3.35, 0, .16, .12, 6, WB);
  B.box(null, 0, .1, -hz + .03, 6, .2, .06, '#3a2a20'); B.box(null, 0, .1, hz - .03, 6, .2, .06, '#3a2a20');
  B.pln(null, 0, .012, .2, 2.6, 3.0, { t: 'rug', c: [.55, .5, .5] }, 0, -PI / 2);

  /* north: boarded window, candle table */
  const aw = B.grp(null, 0, 1.75, -2.93, 0, 'atticwin');
  B.box(aw, 0, 0, 0, 1.4, 1.8, .06, '#0a0706');
  const night = B.pln(aw, 0, 0, .04, 1.1, 1.5, { t: 'moonWindow', un: true });
  const dawn = B.pln(aw, 0, 0, .045, 1.1, 1.5, { t: 'dawn', un: true }); dawn.vis = false;
  B.box(aw, 0, 0, .05, .04, 1.5, .03, '#2c2019'); B.box(aw, 0, 0, .05, 1.1, .04, .03, '#2c2019');
  B.box(aw, 0, .8, .05, 1.3, .08, .08, WB); B.box(aw, 0, -.8, .05, 1.3, .08, .08, WB);
  const boards = [[0, .45, -.18], [.05, -.1, .14], [-.05, -.55, -.08]].map(([x, y, a], i) => {
    const bg = B.grp(aw, x, y, .12 + i * .01, 0, null, 0, a);
    B.box(bg, 0, 0, 0, 1.5, .2, .035, { t: 'woodB', c: [1.2, 1.1, 1], s: 4 });
    B.cyl(bg, -.6, 0, .02, .015, .02, '#222', PI / 2); B.cyl(bg, .6, 0, .02, .015, .02, '#222', PI / 2);
    return { bg, a, y, x };
  });
  const barP = B.grp(aw, -.6, 0, .09, 0);
  const bars = B.grp(barP, 0, 0, 0);
  for (let i = 0; i < 6; i++) B.box(bars, .1 + i * .2, 0, 0, .03, 1.5, .03, IRON);
  [-.55, 0, .55].forEach(y => B.box(bars, .6, y, 0, 1.15, .035, .03, IRON));
  B.box(bars, 1.05, -.05, .05, .14, .16, .07, { c: '#7a6a3a', s: 40 }); B.cyl(bars, 1.05, .05, .05, .045, .02, '#3a3d42', 0, PI / 2);
  bars.vis = false;
  B.hit(aw, 0, 0, .1, 1.5, 2, .4);
  B.light(0, 1.9, -2.4, [.5, .62, .95], .9, 7);
  const dawnLight = B.light(0, 1.6, -2.3, [1, .72, .5], 0, 7);

  const tb = B.grp(null, 0, 0, -2.5, 0);
  B.box(tb, 0, .8, 0, 2.2, .08, .5, WA); [[-1, -.2], [1, -.2], [-1, .2], [1, .2]].forEach(([x, z]) => B.box(tb, x, .4, z, .08, .8, .08, WB));
  B.box(tb, 0, .6, 0, 2.0, .04, .44, '#2a1a10'); B.box(tb, 0, .83, 0, 2.3, .01, .6, { c: '#b9b5a8' });
  const COL = [['white', 'cWhite', -.7, '#e8e2d2', [1, .9, .7]], ['red', 'cRed', -.23, '#9c2230', [1, .45, .35]], ['blue', 'cBlue', .23, '#2f5f9e', [.6, .7, 1]], ['green', 'cGreen', .7, '#3f7a4e', [.6, 1, .6]]];
  const cand = COL.map(([k, id, x, col, lc]) => {
    const g = B.grp(null, x, .84, -2.5, 0, id);
    B.cyl(g, 0, .02, 0, .06, .02, '#2a2418'); B.cyl(g, 0, .13, 0, .033, .22, col, 0, 0);
    B.hit(g, 0, .2, 0, .24, .5, .24);
    const fl = B.flame(g, 0, .27, 0, 1.1, lc); fl.vis = false;
    const li = B.light(x, 1.2, -2.35, lc, 0, 3.2, .15);
    const gg = B.glint(x, 1.1, -2.2);
    return { k, g, fl, li, gg };
  });
  B.blob(0, -2.5, 2.6, .8, .6); B.col(-1.2, -3, 1.2, -2.2);

  /* west: tall mirror, trunk */
  const mg = B.grp(null, -1.95, 0, -2.9, 0, 'mirror');
  B.box(mg, 0, .98, 0, 1.0, 1.96, .09, { c: '#5a4220', s: 30 }); B.box(mg, 0, 1.98, 0, .85, .08, .09, { c: '#5a4220', s: 30 });
  const gDust = B.pln(mg, 0, .98, .05, .82, 1.78, { t: 'mirrorDust', s: 20 });
  const gClean = B.pln(mg, 0, .98, .05, .82, 1.78, { t: 'mirrorClean', s: 60 }); gClean.vis = false;
  B.hit(mg, 0, 1, .1, 1.1, 2.1, .4);
  const gMir = B.glint(-1.95, 1.0, -2.75);
  const tr = B.grp(null, -2.0, 0, 1.9, PI / 2, 'trunk');
  B.box(tr, 0, .25, 0, 1.0, .5, .6, { t: 'trunkBox', s: 30 }); B.box(tr, 0, .55, 0, 1.04, .12, .64, { c: '#244e78', s: 30 });
  B.box(tr, -.3, .3, .31, .06, .6, .02, '#2c1d12'); B.box(tr, .3, .3, .31, .06, .6, .02, '#2c1d12'); B.box(tr, 0, .45, .32, .12, .16, .03, BR);
  B.hit(tr, 0, .35, 0, 1.1, .8, .7);
  B.blob(-2.0, 1.9, 1.2, 1.1, .6); B.col(-2.55, 1.3, -1.4, 2.5); B.col(1.55, 1.55, 2.3, 2.3);

  /* east: dust sheet, rocking chair */
  const sh = B.grp(null, 2.0, 0, .0, -PI / 2, 'sheet');
  B.box(sh, 0, .55, 0, .9, 1.1, .7, { t: 'ankara', uv: [1, 1.2] }); B.box(sh, -.1, 1.15, 0, .6, .4, .55, { t: 'ankara', uv: [.7, .5] }, .1); B.box(sh, .2, .9, .0, .3, .9, .65, { t: 'ankara', uv: [.4, 1] }, -.2);
  const torn = B.box(sh, .25, .1, .36, .3, .22, .02, { c: '#222', a: .5, bl: 1 }); torn.vis = false;
  [-.4, -.15, .15, .4].forEach(x => B.box(sh, x, .02, .36, .08, .08, .02, '#a09c8f'));
  B.hit(sh, 0, .7, 0, 1.1, 1.5, .9);
  const gSh = B.glint(1.8, .9, .35);
  B.blob(2.0, 0, 1.4, 1.2, .5); B.col(1.5, -.55, 2.5, .55);
  const rc = B.grp(null, 1.9, 0, 1.9, -2.2, 'rchair');
  const rcp = B.grp(rc, 0, 0, 0);
  B.box(rcp, 0, .45, 0, .5, .05, .5, WB); B.box(rcp, 0, .85, -.23, .5, .8, .05, WB); [-.2, .2].forEach(x => { B.box(rcp, x, .25, .2, .04, .45, .04, WB); B.box(rcp, x, .25, -.2, .04, .45, .04, WB); B.box(rcp, x, .08, 0, .04, .05, .8, WB); B.box(rcp, x, .6, 0, .04, .04, .45, WB); });
  B.hit(rc, 0, .5, 0, .7, 1.1, .8);
  sc.anims.push(t => { rcp.rot[0] = Math.sin(t * 1.1) * .06 * (Math.sin(t * .2) + 1.2); });

  /* south: doll shelf and pinned note */
  const ds = B.grp(null, 0, 0, 2.86, PI, 'dolls');
  B.box(ds, 0, 1.05, 0, 3.4, .06, .3, WB); B.box(ds, -1.6, .5, 0, .08, 1.0, .2, WB); B.box(ds, 1.6, .5, 0, .08, 1.0, .2, WB);
  const heads = [-1.3, -.65, 0, .65, 1.3].map((x, i) => {
    B.cone(ds, x, 1.3, 0, .1, .4, { c: ['#6a5a6e', '#5a6a6e', '#6e5a5a', '#5a5a6e', '#6e6a5a'][i] });
    B.sph(ds, x, 1.54, 0, .08, { c: '#e4dccf', s: 40 });
    const hd = B.grp(ds, x, 1.57, 0, 0); hd.base = [x, 1.57, 0];
    B.sph(hd, 0, .02, -.01, .088, '#2a1a12', 1.05); B.sph(hd, -.03, 0, .068, .014, '#0a0a0a'); B.sph(hd, .03, 0, .068, .014, '#0a0a0a');
    B.sph(hd, -.03, .0, .082, .005, '#fff'); B.sph(hd, .03, .0, .082, .005, '#fff');
    return hd;
  });
  B.hit(ds, 0, 1.3, 0, 3.4, .8, .6);
  B.pln(null, 0, 2.05, 2.96, .9, .9, { t: 'noteMirror' }, PI); B.cyl(null, 0, 2.48, 2.94, .02, .02, '#8c1824', PI / 2);
  B.hit(null, 0, 2.05, 2.92, 1.0, 1.0, .2, 'mirrornote');
  B.glint(0, 2.05, 2.8);
  B.col(-1.9, 2.55, 1.9, 3);
  B.light(0, 1.8, 2.2, [.55, .5, .8], .35, 5);
  sc.anims.push(() => {
    const cam = sc.cam; if (!cam) return;
    const fx = Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
    heads.forEach(hd => {
      const wx = -hd.base[0], wz = 2.86;                 // the shelf is turned half a circle
      const dx = wx - cam.pos[0], dz = wz - cam.pos[2], dl = Math.hypot(dx, dz) || 1;
      const seen = (dx * fx + dz * fz) / dl > .6;
      if (seen) hd.goal = null;                          // they hold still while you watch
      else hd.goal = { rot: [0, Math.atan2(cam.pos[0] - wx, cam.pos[2] - wz) - PI, 0], k: 5 };
    });
  });

  // ghost lady (shown during the ending)
  const lady = B.N(null, { geo: 'plane', tex: 'lady', blend: 1, unlit: true, bb: true, pos: [0, 1.15, -2.0], scl: [1.0, 1.6, 1], alpha: 0, nopick: true });
  lady.vis = false; sc.lady = lady;
  const ladyGlow = B.glow(null, 0, 1.2, -2.05, 2.8, [.6, .9, .85], .0); ladyGlow.vis = false; sc.ladyGlow = ladyGlow;

  // oil painting: the wedding, 1970
  const wp = B.grp(null, 1.0, 2.06, 2.94, PI, 'wedPaint');   // beside the pinned note, never over it
  B.box(wp, 0, 0, 0, .64, .78, .05, { c: '#b8923a', s: 50 });
  const wpA = B.pln(wp, 0, 0, .03, .54, .68, { t: 'paintWedA', s: 8 }), wpB = B.pln(wp, 0, 0, .031, .54, .68, { t: 'paintWedB', s: 8 }); wpB.vis = false;
  B.hit(wp, 0, 0, .05, .7, .85, .2);
  return {
    spawn: { x: 0, z: 1.9, yaw: 0 }, dark: false,
    apply(f) {
      wpA.vis = !f.readMirror; wpB.vis = !!f.readMirror;
      const lit = f.lit || [];
      cand.forEach(c => { const on = lit.includes(c.k); c.fl.vis = on; c.li.k0 = on ? .7 : 0; c.li.k = c.li.k0; c.gg.off = on || !has('matches'); });
      gDust.vis = !f.wiped; gClean.vis = !!f.wiped; gMir.off = !!f.wiped && !!f.readMirror;
      gSh.off = !!f.gotRag || has('rag') || !!f.wiped; torn.vis = !!f.gotRag;
      const open = !!f.windowOpen;
      night.vis = !open; dawn.vis = open;
      bars.vis = open; barP.goal = { rot: [0, f.barsOpen ? -1.7 : 0, 0], k: 2.4 };
      boards.forEach((b, i) => { b.bg.goal = open ? { pos: [b.x + (i - 1) * .3, b.y - 2.6, .5 + i * .2], rot: [-.6, 0, b.a + (i - 1) * 1.2], k: 2.2 + i * .4 } : { pos: [b.x, b.y, .12 + i * .01], rot: [0, 0, b.a], k: 6 }; });
      dawnLight.k0 = open ? 1.4 : 0; dawnLight.k = dawnLight.k0;
      if (open) sc.amb = [.3, .26, .26];
    }
  };
};

const LABELS = {
  door: 'Front door', coat: 'Papa’s agbada', sconce: 'Bush lamp', window1: 'Burglary-proof window', chair: 'Cushion chair', hearth: 'Television', mantel: 'TV stand', portrait: 'Oil painting of Mama', hollowkey: 'Iron key',
  clock: 'Standing clock', drawer: 'Drawer with three dials', locket_hs: 'Coral beads', vase: 'Plastic flowers', photo: 'Framed photograph', books: 'Showglass cabinet', fan: 'Ceiling fan', calendar: 'Calendar',
  ndoor: 'Little door', window2: 'Window', mobile: 'Mobile', toys: 'Toys', blocks: 'Alphabet blocks', chest: 'Toy box', teddy: 'Teddy bear', horse: 'Rocking horse', crib: 'Cot', musicbox: 'Music box', wardrobe: 'Wardrobe',
  range: 'Gas cooker', kettle: 'Kettle', pots: 'Enamel pots', ktable: 'Kitchen table', kchair: 'Pulled-out chair', recipe: 'Recipe card', pantry: 'Pantry door', ckey: 'Key on a nail', kdoor: 'Boys’ quarters door',
  jarFlour: 'Jar', jarSalt: 'Jar', jarSugar: 'Jar', jarTea: 'Jar', jarRice: 'Jar', kwindow: 'Burglary-proof window', scullery: 'Nailed back door', block: 'Chopping board', mortar: 'Mortar and pestle',
  lantern: 'Old bush lamp', padlock: 'Padlock', keyhole: 'Big keyhole', cdoor: 'Heavy door', radio: 'Old radio',
  cloth: 'Old wrapper', toolbox: 'Toolbox', skull: 'Carved Ekpo mask', wine: 'Schnapps bottles', coffin: 'Long crate', barrel: 'Kegs and a tin box',
  shelf: 'Bookcase', chdoor: 'Iron door', sfire: 'Old iron safe', sportrait: 'Oil painting of Papa', swindow: 'Curtained window', globe: 'Globe', gramo: 'Record player', sback: 'Stair door', sarm: 'Leather armchair',
  sdesk: 'Desk', sdrawer: 'Desk drawer', chkey: 'Black iron key', lamp: 'Hurricane lamp', diary: 'Papa’s diary', rosepic: 'Smashed photo',
  altar: 'Prayer table', acandle: 'Candle', inscr: 'Wall', organ: 'Harmonium', opanel: 'Little cupboard', rope: 'Bell rope', lectern: 'Bible stand', pews: 'Church benches', trap: 'Hatch in the ceiling', cbdoor: 'Door',
  mirror: 'Dusty mirror', trunk: 'Iron trunk box', sheet: 'Ankara wrapper', mirrornote: 'Pinned note', dolls: 'Wig stands', rchair: 'Rocking chair',
  famPaint: 'Oil painting: the family, 1972', tobiPaint: 'Oil painting: Mama and child', wedPaint: 'Oil painting: the wedding', tree: 'The chimney', roofhammer: 'Mason’s hammer', roofcloth: 'White bedsheet', hidedrum: 'Blue water drum', cowrie: 'Cowrie shell', cWhite: 'White candle', cRed: 'Red candle', cBlue: 'Blue candle', cGreen: 'Green candle', atticwin: 'Boarded window'
};

const ROOMS = [
  { key: 'foyer', name: 'The Living Room', dark: false, sub: 'Every clock in the house stopped at the same minute.', intro: 'Gold trim, lace on everything, a box television, oil paintings in heavy frames. Every door behind you has slammed. Every clock you can see says twenty past seven. All but one.' },
  { key: 'nursery', name: 'Tobi’s Room', dark: false, sub: 'You slept here once.', intro: 'Pale blue paint, a cot, a rocking horse. You have never seen this room in your life, and your hand still goes straight to the light switch.' },
  { key: 'kitchen', name: 'Mama’s Kitchen', dark: false, sub: 'Somebody is still waiting for food.', intro: 'Tiles, enamel pots, a gas cooker gone cold. The back door to the boys’ quarters is nailed shut. The kettle ticks as it cools, though nothing has been lit here in twenty-two years.' },
  { key: 'cellar', name: 'The Boys’ Quarters', dark: true, sub: 'He slept here. Bring a light.', intro: 'Effiong’s old room behind the house, turned into a store: cement bags gone hard as stone, Papa’s crates, and no light at all. Something drips. Feel along the walls for something to light.' },
  { key: 'study', name: 'Papa’s Office', dark: true, sub: 'He kept two of everything.', intro: 'The stair door locks itself behind you. Leather, kerosene, and one pale square of moonlight on the desk.' },
  { key: 'chapel', name: 'Mama’s Prayer Room', dark: true, sub: 'She prayed for a way out.', intro: 'Benches, an old harmonium, coloured glass. The kneeler is worn through at one end. High up, a square hatch is shut tight.' },
  { key: 'attic', name: 'The Master Bedroom', dark: false, sub: 'The window to the roof.', intro: 'Up the ladder, under the roof: the room your parents slept in. Camphor, old powder, a dusty mirror. Past the candles, a boarded window shows one thin line of grey.' },
  { key: 'roof', name: 'The Roof', dark: true, escape: true, sub: 'Give him back his name.', intro: 'Cold zinc underfoot, all of Oke-Ọla asleep below. At the far end of the roof, the brick chimney nobody ever lit. Behind you, the window you came out of.' }
];
