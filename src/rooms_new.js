/* ================= 3D ROOMS, part two: the kitchen, the study and the chapel ================= */

const chairMesh = (B, p, x, z, ry, id) => {
  const g = B.grp(p, x, 0, z, ry, id);
  B.box(g, 0, .45, 0, .42, .05, .42, WB); B.box(g, 0, .82, -.2, .42, .72, .04, WB); B.box(g, 0, .96, -.2, .3, .08, .05, WA);
  [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([a, b]) => B.box(g, a, .22, b, .04, .44, .04, WB));
  return g;
};

/* ===================== 3. THE KITCHEN ===================== */
ROOMS3D.kitchen = B => {
  const sc = B.sc;
  sc.amb = [.17, .18, .22]; sc.fog = [.012, .014, .02]; sc.fogD = .07;
  sc.player.k0 = sc.player.k = .32;
  B.shell({ w: 6, d: 6, h: 3.1, floor: 'floorKitchen', wall: 'wallKitchen', ceil: 'ceil', trim: '#2d2a25', tile: 1.3, floorTile: 1.5 });
  [-1.6, 0, 1.6].forEach(x => B.box(null, x, 2.98, 0, .22, .2, 6, WB));
  B.pln(null, -1.3, 1.25, -2.985, 2.8, 2.5, { t: 'tileSplash', uv: [2, 1.8] });

  /* north-west: the range, kettle, pot rack */
  const rg = B.grp(null, -1.3, 0, -2.5, 0, 'range');
  const BLK = { c: '#1b1c1f', s: 40 };
  B.box(rg, 0, .45, 0, 1.7, .9, .8, BLK); B.box(rg, 0, .93, 0, 1.76, .06, .84, { c: '#222428', s: 50 });
  [-.45, .1].forEach(x => { B.cyl(rg, x, .96, .02, .14, .02, { c: '#0c0c0e', s: 30 }); });
  B.box(rg, -.4, .42, .405, .62, .5, .02, { c: '#121316', s: 30 }); B.box(rg, .36, .3, .405, .56, .34, .02, { c: '#121316', s: 30 });
  B.cyl(rg, -.4, .7, .43, .018, .5, BR, 0, PI / 2); B.cyl(rg, -.1, .42, .43, .02, .03, BR, PI / 2);
  const fireGlow = B.pln(rg, .36, .3, .418, .46, .22, { c: [1, .45, .12], un: true, bl: 2, a: 0 });
  B.box(rg, 0, 2.2, -.1, 1.9, .8, .62, { c: '#17181b', s: 20 }); B.box(rg, 0, 2.85, -.14, .62, .6, .5, { c: '#17181b', s: 20 });
  const rFlame = B.flame(rg, .36, .22, .44, 1.8); rFlame.vis = false;
  B.hit(rg, 0, .45, .02, 1.9, .95, 1); B.hit(rg, 0, 2.2, -.1, 2, .9, .8);
  B.blob(-1.3, -2.4, 2.1, 1.4, .55); B.col(-2.25, -3, -0.35, -2.05);
  const gRange = B.glint(-1.3, .75, -2.05);
  const kt = B.grp(null, -1.0, .96, -2.5, .6, 'kettle');
  B.sph(kt, 0, .13, 0, .15, { c: '#6c6f74', s: 50 }, .8); B.cyl(kt, 0, .27, 0, .06, .05, { c: '#6c6f74', s: 50 }); B.sph(kt, 0, .31, 0, .025, '#222');
  B.cyl(kt, .17, .2, 0, .02, .16, { c: '#6c6f74', s: 50 }, 0, -.9); B.box(kt, -.02, .33, 0, .3, .02, .03, '#222');
  const steam = B.glow(kt, .2, .5, 0, .6, [.8, .85, .9], 0); steam.vis = false;
  B.hit(kt, 0, .27, 0, .45, .4, .45);
  const pk = B.grp(null, -1.3, 0, -2.0, 0, 'pots');
  B.box(pk, 0, 2.1, 0, 1.7, .03, .03, '#222'); B.cyl(pk, -.78, 2.55, -.16, .01, .9, '#222', 0, 0.15); B.cyl(pk, .78, 2.55, -.16, .01, .9, '#222', 0, -0.15);
  const potsArr = [-.6, -.2, .2, .6].map((x, i) => {
    const pg = B.grp(pk, x, 2.05, 0, 0); pg.rot[0] = 0;
    B.cyl(pg, 0, -.18, 0, .1 + (i % 2) * .03, .2 + (i % 3) * .05, { c: ['#e8e4da', '#d8e2e8', '#e8e4da', '#3a6a9a'][i], s: 70 }); B.cyl(pg, 0, -.07 + (i % 3) * .025, 0, .105 + (i % 2) * .03, .015, { c: '#b02a2a', s: 40 }); B.box(pg, 0, -.02, 0, .01, .1, .01, '#222');
    return pg;
  });
  B.hit(pk, 0, 1.8, 0, 1.8, .8, .5);
  sc.anims.push(t => { potsArr.forEach((p, i) => { p.rot[2] = Math.sin(t * .9 + i * 1.7) * .035; }); });

  /* north-east: the pantry cupboard */
  [[.93, 0], [2.07, 0]].forEach(([x]) => B.box(null, x, 1.1, -2.7, .07, 2.2, .6, WB));
  B.box(null, 1.5, 2.2, -2.7, 1.2, .07, .6, WB); B.box(null, 1.5, .03, -2.7, 1.14, .06, .6, WB);
  B.pln(null, 1.5, 1.1, -2.985, 1.14, 2.2, { c: '#0b0806' });
  [.55, 1.05, 1.6].forEach(y => B.box(null, 1.5, y, -2.7, 1.14, .04, .55, WB));
  [[1.15, 1.08], [1.9, 1.08], [1.28, 1.63], [1.75, .58]].forEach(([x, y]) => { B.cyl(null, x, y + .1, -2.72, .075, .2, { c: '#6f7f76', a: .6, bl: 1 }); B.cyl(null, x, y + .22, -2.72, .08, .03, '#3a3a3a'); });
  const pantry = B.grp(null, .93, 0, -2.4, 0, 'pantry');
  B.box(pantry, .6, 1.1, 0, 1.2, 2.2, .06, { t: 'woodPale', c: [.55, .62, .6], s: 8 });
  B.box(pantry, .6, 1.62, .04, .9, .6, .015, { c: [.4, .5, .5] }); B.box(pantry, .6, .6, .04, .9, .8, .015, { c: [.4, .5, .5] });
  B.cyl(pantry, 1.05, 1.1, .07, .025, .03, BR, PI / 2);
  B.hit(pantry, .6, 1.1, 0, 1.3, 2.3, .3);
  const ckey = B.grp(null, 1.5, 1.25, -2.9, 0, 'ckey');
  B.cyl(ckey, 0, .1, 0, .06, .025, { c: '#8a8f98', s: 40 }, PI / 2); B.cyl(ckey, 0, .1, 0, .03, .03, '#050403', PI / 2);
  B.box(ckey, 0, -.06, 0, .03, .3, .03, { c: '#8a8f98', s: 40 }); B.box(ckey, .04, -.15, 0, .07, .03, .03, { c: '#8a8f98', s: 40 }); B.box(ckey, .04, -.08, 0, .06, .03, .03, { c: '#8a8f98', s: 40 });
  B.hit(ckey, 0, -.02, .05, .3, .5, .35);
  const gKey = B.glint(1.5, 1.2, -2.6);
  B.col(.9, -3, 2.1, -2.4);

  /* east: the cellar door, recipe card */
  B.pln(null, 2.975, 1.05, .45, 1.1, 2.1, { c: '#020203', un: true }, -PI / 2);
  B.box(null, 2.93, 1.1, -.17, .12, 2.2, .1, WB); B.box(null, 2.93, 1.1, 1.07, .12, 2.2, .1, WB); B.box(null, 2.93, 2.17, .45, .12, .1, 1.3, WB);
  const kd = B.grp(null, 2.9, 0, -.1, -PI / 2, 'kdoor');
  [0, 1, 2].forEach(i => B.box(kd, .19 + i * .37, 1.05, 0, .37, 2.1, .08, { t: 'woodB', c: [.9 + i * .05, .85, .85], s: 6 }));
  [.35, 1.0, 1.75].forEach(y => B.box(kd, .55, y, .06, 1.1, .1, .03, IRON));
  B.cyl(kd, 1.0, 1.1, .08, .06, .02, { c: '#26282c', s: 30 }, PI / 2); B.cyl(kd, 1.0, 1.12, .1, .012, .02, '#000', PI / 2); B.box(kd, 1.0, 1.07, .1, .012, .05, .01, '#000');
  B.hit(kd, .55, 1.05, 0, 1.2, 2.2, .3);
  const gKd = B.glint(2.6, 1.1, .85);
  const rc = B.grp(null, 2.97, 1.55, -1.7, -PI / 2, 'recipe');
  B.box(rc, 0, 0, 0, .56, .56, .03, WB); B.pln(rc, 0, 0, .02, .5, .5, { t: 'recipeCard' }, 0, 0, .04); B.cyl(rc, 0, .22, .04, .014, .02, '#8c1824', PI / 2);
  B.hit(rc, 0, 0, .05, .7, .7, .3);
  const gRecipe = B.glint(2.8, 1.55, -1.7);

  /* west: the jar dresser */
  const dr = B.grp(null, -2.72, 0, .45, PI / 2);
  B.box(dr, 0, .5, 0, 1.9, 1.0, .5, { t: 'woodB', c: [1.1, 1, 1], s: 8 }); B.box(dr, 0, 1.28, -.2, 1.9, .06, .1, WB);
  B.box(dr, 0, 1.3, 0, 1.9, .04, .5, WA); B.box(dr, 0, 1.9, -.2, 1.9, .9, .06, WB); B.box(dr, -.93, 1.6, 0, .05, .8, .5, WB); B.box(dr, .93, 1.6, 0, .05, .8, .5, WB); B.box(dr, 0, 2.02, 0, 1.9, .05, .5, WB);
  [-.45, .45].forEach(x => { B.box(dr, x, .5, .26, .84, .86, .015, { t: 'woodA', c: [.7, .65, .6] }); B.cyl(dr, x * .2, .55, .28, .02, .02, BR, PI / 2); });
  const JARS = [['jarFlour', 'labelFlour', '#e8e2d0', -.66], ['jarSalt', 'labelSalt', '#f0f0f0', -.33], ['jarSugar', 'labelSugar', '#f2e6c8', 0], ['jarTea', 'labelTea', '#3a2a1c', .33], ['jarRice', 'labelRice', '#d9d2b4', .66]];
  const jarLabels = [];
  JARS.forEach(([id, lbl, fill, x]) => {
    const g = B.grp(dr, x, 1.32, .06, 0, id);
    B.cyl(g, 0, .14, 0, .1, .28, { c: '#9fb8b0', a: .28, bl: 1 }); B.cyl(g, 0, .105, 0, .088, .2, { c: fill }); B.cyl(g, 0, .295, 0, .105, .03, '#3a3a3a');
    const blank = B.pln(g, 0, .13, .104, .13, .13, { t: 'labelBlank', un: false }), txt = B.pln(g, 0, .13, .106, .13, .13, { t: lbl });
    jarLabels.push([blank, txt]);
    B.hit(g, 0, .15, 0, .3, .36, .3);
  });
  B.box(dr, -.5, 1.65, .03, .22, .26, .2, { c: '#6b4a2a' }); B.box(dr, .55, 1.62, .03, .26, .2, .2, { c: '#554535' });
  B.blob(-2.7, .45, 1.1, 2.1, .5); B.col(-3, -.55, -2.4, 1.45);

  /* south: barred window, nailed door, butcher block */
  const kw = B.grp(null, 1.5, 1.7, 2.93, PI, 'kwindow');
  B.pln(kw, 0, 0, .01, .9, 1.3, { t: 'moonWindow', un: true, c: [.9, .95, 1.05] });
  for (let i = 0; i < 4; i++) B.box(kw, -.3 + i * .2, 0, .04, .03, 1.3, .03, '#111'); B.box(kw, 0, .67, .03, 1.0, .07, .06, WB); B.box(kw, 0, -.67, .03, 1.0, .07, .06, WB);
  B.hit(kw, 0, 0, .1, 1.1, 1.5, .4);
  B.light(1.5, 1.85, 2.3, [.5, .62, 1], .85, 6);
  const sd = B.grp(null, -1.6, 0, 2.94, PI, 'scullery');
  B.box(sd, 0, 1.05, 0, 1.0, 2.1, .06, { t: 'woodB', c: [.9, .85, .8] });
  [[1.7, .08], [1.1, -.1], [.5, .05]].forEach(([y, a]) => { B.box(sd, 0, y, .05, 1.3, .16, .035, { t: 'woodA', c: [.8, .7, .6], s: 4 }, 0, 0, a); B.cyl(sd, -.5, y, .075, .015, .02, '#222', PI / 2); B.cyl(sd, .5, y, .075, .015, .02, '#222', PI / 2); });
  B.hit(sd, 0, 1.05, .05, 1.3, 2.2, .3);
  const bb = B.grp(null, 2.55, 0, 2.5, 0, 'block');   // tucked into the corner so there is a way past the mortar
  B.cyl(bb, 0, .42, 0, .34, .84, { t: 'woodA', c: [.9, .8, .7], s: 6 }); B.box(bb, 0, .87, .05, .04, .22, .2, '#8a8f98'); B.box(bb, 0, .98, .05, .02, .08, .08, { c: '#5a3a1a' });
  B.hit(bb, 0, .6, 0, .8, 1.2, .8);
  B.blob(2.55, 2.5, 1, 1, .5); B.col(2.2, 2.15, 2.92, 2.88);
  const mo = B.grp(null, 1.45, 0, 2.55, 0, 'mortar');
  B.cyl(mo, 0, .12, 0, .2, .24, { t: 'woodA', c: [.75, .6, .45], s: 6 }); B.cyl(mo, 0, .32, 0, .14, .18, { t: 'woodA', c: [.7, .55, .42] }); B.cyl(mo, 0, .5, 0, .24, .2, { t: 'woodA', c: [.75, .6, .45], s: 6 });
  B.cyl(mo, 0, .605, 0, .19, .01, '#120a06'); B.cyl(mo, .08, .95, 0, .035, 1.1, { t: 'woodA', c: [.85, .72, .55] }, 0, -.28);
  B.hit(mo, 0, .5, 0, .6, 1.1, .6); B.col(1.2, 2.3, 1.7, 2.8);

  /* the table, with the household book */
  const tb = B.grp(null, .1, 0, .3, 0, 'ktable');
  B.box(tb, 0, .78, 0, 2.3, .08, .95, { t: 'woodA', c: [.85, .75, .7], s: 10 });
  [[-1, -.38], [1, -.38], [-1, .38], [1, .38]].forEach(([x, z]) => B.box(tb, x * 1.05, .38, z, .1, .76, .1, WB));
  B.box(tb, 0, .3, 0, 2.1, .06, .08, WB);
  B.box(tb, -.5, .835, .1, .34, .04, .26, { c: '#5a2f24' }, .25); B.box(tb, -.5, .86, .1, .3, .02, .22, { c: '#c9bfa4' }, .25);
  B.cyl(tb, .5, .85, -.15, .13, .08, { c: '#7d6a58', s: 20 }); B.cyl(tb, .5, .88, -.15, .1, .02, { c: '#3a3028' }); B.cyl(tb, .1, .82, .25, .13, .02, { c: '#9a9a96', s: 40 });
  B.hit(tb, 0, .9, 0, 2.4, .5, 1.05);
  const gTable = B.glint(-.4, .95, .4);
  B.blob(.1, .3, 2.7, 1.3, .55);
  chairMesh(B, null, -.7, -.55, 0); chairMesh(B, null, .9, -.55, 0); chairMesh(B, null, -.4, 1.15, PI);   // the fourth chair is gone: that corner is the way past the mortar
  const kch = B.grp(null, 1.55, 0, .3, -PI / 2, 'kchair');
  B.box(kch, 0, .45, 0, .46, .05, .46, WB); B.box(kch, 0, .86, -.22, .46, .8, .04, WB); B.box(kch, 0, 1.02, -.22, .34, .08, .05, WA);
  [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(([a, b]) => B.box(kch, a, .22, b, .04, .44, .04, WB));
  B.hit(kch, 0, .65, 0, .7, 1.4, .7);
  chairMesh(B, null, -1.45, .3, PI / 2);
  // the table and its chairs, box by box, so there is room to walk round both ends
  B.col(-1.1, -.25, 1.3, .85); B.col(-.95, -.8, 1.15, -.3); B.col(-.65, .9, -.15, 1.4); B.col(-1.7, .05, -1.2, .55); B.col(1.3, .05, 1.8, .55);
  // a dead lamp over the table
  B.cyl(null, .1, 2.6, .3, .008, .8, '#222'); B.cyl(null, .1, 2.15, .3, .12, .22, { c: '#6b5130', s: 30 });

  const rl = B.light(-1.3, .95, -2.0, [1, .6, .28], 0, 6.5, .14);
  const WARM = [.26, .2, .17], COLD = [.17, .18, .22];
  return {
    spawn: { x: 0, z: 2.45, yaw: 0 }, dark: false,
    chairPull() {
      kch.goal = { pos: [2.05, 0, .55], rot: [0, -PI / 2 + .7, 0], k: 3 };
    },
    apply(f) {
      const lit = !!f.rangeLit;
      rl.k0 = lit ? 1.5 : 0; rl.k = rl.k0; rl.fl = lit ? .14 : 0;
      rFlame.vis = lit; fireGlow.alpha = lit ? .85 : 0; steam.vis = lit; sc.amb = lit ? WARM : COLD;
      jarLabels.forEach(([b, t]) => { b.vis = !lit; t.vis = lit; });
      pantry.goal = { rot: [0, f.pantryOpen ? -1.75 : 0, 0], k: 3 };
      ckey.vis = !!f.pantryOpen && !f.gotCKey; gKey.off = !(f.pantryOpen && !f.gotCKey);
      kd.goal = { rot: [0, -PI / 2 + (f.doorOpen ? 1.55 : 0), 0], k: 2.6 };
      gKd.off = !has('cellarkey') || !!f.doorOpen; gRecipe.off = !!f.readRecipe; gRange.off = lit || !has('matches'); gTable.off = true;
      if (f.chairOut) kch.goal = { pos: [2.05, 0, .55], rot: [0, -PI / 2 + .7, 0], k: 3 };
    }
  };
};

/* ===================== 5. THE STUDY ===================== */
ROOMS3D.study = B => {
  const sc = B.sc;
  sc.amb = [.1, .095, .115]; sc.fog = [.01, .008, .012]; sc.fogD = .1;
  sc.player.k0 = sc.player.k = .55; sc.player.r = 4.2;
  B.shell({ w: 6, d: 6, h: 3.0, floor: 'floorStudy', wall: 'wallStudy', ceil: 'ceil', trim: '#1f130e', tile: 1.2 });
  B.pln(null, 0, .012, -.5, 3.0, 2.4, { t: 'rug', c: [.8, .7, .7] }, 0, -PI / 2);
  [-1.4, 1.4].forEach(z => B.box(null, 0, 2.9, z, 6, .2, .2, { t: 'woodB' }));

  /* north: bookcase wall and the iron door */
  const bs = B.grp(null, -1.2, 0, -2.78, 0, 'shelf');
  B.box(bs, 0, 1.4, 0, 3.6, 2.8, .4, WB); B.pln(bs, 0, 1.4, .205, 3.46, 2.66, { t: 'booksStudy', uv: [3.5, 5.2] });
  [.6, 1.2, 1.8, 2.4].forEach(y => B.box(bs, 0, y, .1, 3.5, .04, .3, WA));
  B.box(bs, -1.4, .9, .35, .05, 1.9, .05, '#2a2c31'); B.box(bs, -1.2, 1.1, .5, .05, 1.9, .05, '#2a2c31', 0, .15);
  B.hit(bs, 0, 1.4, .1, 3.7, 2.9, .6);
  B.col(-3, -3, .65, -2.5);
  B.box(null, 1.2, 1.12, -2.93, .12, 2.3, .14, { t: 'chimney' }); B.box(null, 2.4, 1.12, -2.93, .12, 2.3, .14, { t: 'chimney' }); B.box(null, 1.8, 2.28, -2.93, 1.32, .14, .14, { t: 'chimney' });
  B.pln(null, 1.8, 1.1, -2.97, 1.1, 2.2, { c: '#010103', un: true });
  const cd = B.grp(null, 1.25, 0, -2.88, 0, 'chdoor');
  B.box(cd, .55, 1.1, 0, 1.1, 2.2, .08, { t: 'woodB', c: [.7, .7, .75], s: 12 });
  [.35, 1.05, 1.85].forEach(y => B.box(cd, .55, y, .06, 1.08, .12, .03, IRON));
  B.cyl(cd, .92, 1.1, .08, .09, .03, { c: '#26282c', s: 30 }, PI / 2); B.cyl(cd, .92, 1.12, .1, .016, .02, '#000', PI / 2); B.box(cd, .92, 1.07, .1, .016, .06, .01, '#000');
  B.cyl(cd, .55, 1.4, .09, .07, .02, IRON, PI / 2); B.sph(cd, .55, 1.4, .1, .05, IRON);
  B.hit(cd, .55, 1.1, 0, 1.2, 2.3, .3);
  const gCd = B.glint(1.75, 1.1, -2.6);

  /* east: cold hearth and the portrait */
  const sf = B.grp(null, 2.62, 0, -.2, -PI / 2, 'sfire');
  B.box(sf, 0, .55, 0, .9, 1.1, .7, { c: '#2f3d34', s: 50 }); B.box(sf, 0, .55, .355, .8, 1.0, .01, { c: '#26322a', s: 60 });
  B.cyl(sf, -.12, .7, .37, .09, .03, { c: '#c9a94a', s: 60 }, PI / 2); B.cyl(sf, -.12, .7, .39, .02, .02, '#111', PI / 2);
  B.box(sf, .22, .62, .38, .04, .26, .04, { c: '#c9a94a', s: 60 }); B.box(sf, 0, .95, .365, .3, .06, .01, { c: '#c9a94a', s: 60 });
  B.box(sf, 0, .02, 0, .96, .04, .76, '#111');
  B.hit(sf, 0, .55, .1, 1.0, 1.2, .8);
  B.col(2.2, -.75, 3, .35);
  const sp = B.grp(null, 2.93, 1.95, -.2, -PI / 2, 'sportrait');
  B.box(sp, 0, 0, .035, .98, 1.28, .07, { c: '#a8873a', s: 40 });
  const pA = B.pln(sp, 0, 0, .075, .84, 1.12, { t: 'portraitSilas' }), pB = B.pln(sp, 0, 0, .078, .84, 1.12, { t: 'portraitSilasB' }); pB.vis = false;
  B.hit(sp, 0, 0, .1, 1.1, 1.4, .4);

  /* west: window, globe, gramophone */
  const sw = B.grp(null, -2.96, 1.7, -1.3, PI / 2, 'swindow');
  B.pln(sw, 0, 0, .01, .9, 1.4, { t: 'moonWindow', un: true, c: [.9, .95, 1.05] });
  B.box(sw, 0, 0, .035, .04, 1.4, .03, '#1b1410'); B.box(sw, 0, 0, .035, .9, .04, .03, '#1b1410'); B.box(sw, 0, .72, .03, 1.0, .06, .06, WB); B.box(sw, 0, -.72, .03, 1.0, .06, .06, WB);
  B.box(sw, -.6, -.1, .12, .26, 1.9, .12, { t: 'fabric', c: [.5, .6, .5] }); B.box(sw, .6, -.1, .12, .26, 1.9, .12, { t: 'fabric', c: [.5, .6, .5] });
  B.hit(sw, 0, 0, .1, 1.4, 1.9, .4);
  B.light(-2.4, 1.85, -1.3, [.5, .62, 1], .9, 6.5);
  const gl = B.grp(null, -2.2, 0, 1.0, 0, 'globe');
  B.cyl(gl, 0, .05, 0, .26, .1, WB); B.cyl(gl, 0, .6, 0, .03, 1.1, WB);
  const gSph = B.sph(gl, 0, 1.15, 0, .34, { t: 'globeTex', s: 40 });
  B.cyl(gl, 0, 1.15, 0, .37, .02, BR, PI / 2, 0.2);
  B.hit(gl, 0, .85, 0, .85, 1.7, .85);
  const gGlobe = B.glint(-2.2, 1.45, 1.0);
  B.col(-2.65, .35, -1.75, 1.65);
  sc.anims.push(t => { gSph.rot[1] = t * .12; });
  const gr = B.grp(null, -2.4, 0, -2.3, PI / 2, 'gramo');
  B.box(gr, 0, .45, 0, .7, .9, .6, WB); B.cyl(gr, 0, .94, 0, .26, .05, { c: '#17171a', s: 40 });
  B.box(gr, .0, .98, .0, .02, .02, .22, '#8a8f98');
  B.cone(gr, -.12, 1.35, -.1, .32, .9, { c: '#a8873a', s: 60 }, 0.0, 0.0); gr.kids[gr.kids.length - 1].rot[2] = .9;
  B.box(gr, .32, .98, .24, .12, .02, .02, BR);
  B.hit(gr, 0, .8, 0, .9, 1.6, .9);
  B.col(-2.85, -2.7, -2.0, -1.9);

  /* south: the way we came, armchair */
  const sb = B.grp(null, -.9, 0, 2.94, PI, 'sback');
  B.box(sb, 0, 1.05, 0, 1.0, 2.1, .08, { t: 'woodB', c: [.8, .75, .75], s: 8 }); B.box(sb, 0, 1.0, .06, .8, 1.8, .02, { c: '#1c120d' });
  B.cyl(sb, .38, 1.05, .08, .03, .03, BR, PI / 2);
  B.hit(sb, 0, 1.05, .05, 1.1, 2.2, .3);
  const ar = B.grp(null, 1.9, 0, 2.15, PI + .4, 'sarm');
  const LTH = { t: 'leather', s: 20 };
  B.box(ar, 0, .3, .02, .9, .26, .85, LTH); B.box(ar, 0, .74, -.36, .9, .86, .2, LTH); B.box(ar, -.5, .5, .02, .14, .52, .85, LTH); B.box(ar, .5, .5, .02, .14, .52, .85, LTH);
  B.hit(ar, 0, .55, 0, 1.2, 1.1, 1);
  B.blob(1.9, 2.15, 1.3, 1.3, .5); B.col(1.35, 1.6, 2.5, 2.7);

  /* the desk */
  const dk = B.grp(null, 0, 0, -1.15, 0, 'sdesk');
  B.box(dk, 0, .76, 0, 2.1, .07, .95, { t: 'woodB', c: [1.1, 1, 1], s: 30 }); B.pln(dk, 0, .8, 0, 1.8, .72, { t: 'leather' }, 0, -PI / 2);
  [-.85, .85].forEach(x => B.box(dk, x, .38, 0, .5, .74, .86, { t: 'woodB', c: [.95, .9, .9], s: 20 }));
  B.box(dk, 0, .4, -.4, 1.2, .72, .05, WB);
  [-.85].forEach(x => [.2, .45, .62].forEach(y => { B.box(dk, x, y, .44, .42, .02, .01, '#0a0604'); B.cyl(dk, x, y - .06, .45, .02, .02, BR, PI / 2); }));
  const dw = B.grp(dk, .85, .56, .44, 0, 'sdrawer');
  B.box(dw, 0, 0, 0, .44, .24, .03, { t: 'woodB', c: [1.2, 1.1, 1.1], s: 30 });
  B.box(dw, 0, -.02, -.22, .4, .17, .44, '#190e08');
  [-.15, -.05, .05, .15].forEach(x => B.cyl(dw, x, .0, .04, .028, .03, BR, PI / 2));
  const chk = B.grp(dw, 0, .075, -.2, .3, 'chkey');
  B.cyl(chk, 0, 0, 0, .05, .02, { c: '#17181c', s: 40 }, PI / 2); B.cyl(chk, 0, 0, 0, .02, .03, '#000', PI / 2);
  B.box(chk, .0, 0, -.14, .025, .02, .26, { c: '#17181c', s: 40 }); B.box(chk, 0, 0, -.25, .06, .02, .03, { c: '#17181c', s: 40 });
  B.hit(chk, 0, 0, -.1, .22, .22, .4);
  B.hit(dw, 0, 0, 0, .5, .34, .3);
  const gDrawer = B.glint(.85, .9, -.6), gChk = B.glint(.85, .9, -.9); gChk.off = true;
  const lp = B.grp(null, -.65, .835, -1.3, 0, 'lamp');
  const lampB = B.bushlamp(lp, 0, 0, 0, false, '#1f5a3a', 1.15);
  const lampGlow = B.glow(lp, 0, .2, 0, .9, [1, .85, .45], 0); lampGlow.vis = false;
  B.hit(lp, 0, .22, 0, .3, .55, .3);
  const gLamp = B.glint(-.65, 1.2, -1.2);
  const dy = B.grp(dk, .15, .835, .12, .2, 'diary');
  B.box(dy, 0, .015, 0, .5, .03, .34, { c: '#3a1c18' }); B.box(dy, -.12, .04, 0, .22, .025, .3, { c: '#d9cdb0' }, 0, 0, .02); B.box(dy, .12, .04, 0, .22, .025, .3, { c: '#cfc3a6' }, 0, 0, -.02);
  B.hit(dy, 0, .05, 0, .6, .2, .45);
  const rp = B.grp(dk, .7, .835, -.2, -.3, 'rosepic');
  B.box(rp, 0, .13, 0, .24, .3, .03, { c: '#a8873a', s: 40 }, 0, -.18); B.pln(rp, 0, .14, .02, .19, .24, { c: '#d9cdb0' }, 0, -.18);
  B.cyl(rp, 0, .15, .03, .05, .004, '#2a1c14', PI / 2 - .18); B.sph(rp, 0, .17, .03, .035, '#2a1c14', 1.0, .1);
  B.pln(rp, 0, .02, .1, .2, .1, { t: 'plateRose', s: 40 }, 0, -.7);
  B.hit(rp, 0, .12, .02, .32, .38, .25);
  const gRose = B.glint(.7, 1.15, -.35); gRose.off = true;
  B.cyl(dk, -.2, .86, -.28, .04, .09, { c: '#111', s: 40 });
  const chair = B.grp(null, 0, 0, -2.05, 0);
  B.box(chair, 0, .5, 0, .6, .08, .6, LTH); B.box(chair, 0, 1.0, -.28, .62, 1.0, .1, LTH); B.cyl(chair, 0, .25, 0, .04, .5, IRON);
  sc.anims.push(t => { chair.rot[1] = Math.sin(t * .31) * .45; });
  B.col(-1.2, -1.7, 1.2, -.62); B.col(-.45, -2.5, .45, -1.7);
  B.blob(0, -1.15, 2.6, 1.3, .55);

  const lampLight = B.light(-.65, 1.2, -1.2, [1, .86, .5], 0, 5.5, .08);
  return {
    spawn: { x: 0, z: 2.0, yaw: 0 }, dark: true,
    eyes(on) { pA.vis = !on; pB.vis = !!on; },
    apply(f) {
      const lit = !!f.lampLit;
      lampLight.k0 = lit ? 1.7 : 0; lampLight.k = lampLight.k0; lampGlow.vis = lit; lampB.fl.vis = lit; gLamp.off = lit || !has('matches');
      sc.amb = lit ? [.15, .13, .14] : [.1, .095, .115];
      gRose.off = !lit || !!f.photoFixed; gDrawer.off = !!f.drawerOpen || !f.photoFixed;
      LABELS.rosepic = f.photoFixed ? 'Mended photo' : 'Smashed photo';
      dw.goal = { pos: [.85, .56, f.drawerOpen ? .78 : .44], k: 4 };
      chk.vis = !!f.drawerOpen && !f.gotChKey; gChk.off = !(f.drawerOpen && !f.gotChKey);
      cd.goal = { rot: [0, f.doorOpen ? 1.55 : 0, 0], k: 2.6 };
      gCd.off = !has('chapelkey') || !!f.doorOpen; gGlobe.off = true;
    }
  };
};

/* ===================== 6. THE CHAPEL ===================== */
ROOMS3D.chapel = B => {
  const sc = B.sc;
  sc.amb = [.1, .1, .15]; sc.fog = [.012, .012, .022]; sc.fogD = .07;
  sc.player.k0 = sc.player.k = .55; sc.player.r = 4.4;
  B.shell({ w: 6, d: 6, h: 3.6, floor: 'floorChapel', wall: 'wallChapel', ceil: 'ceilStone', trim: '#1d1c1b', tile: 1.5, floorTile: 1.6 });
  [-1.6, 0, 1.6].forEach(z => B.box(null, 0, 3.45, z, 6, .26, .32, { t: 'woodB' }));
  B.pln(null, 0, .012, .2, 1.2, 5.4, { c: '#3a1418' }, 0, -PI / 2);

  /* north: stained glass and the altar */
  B.box(null, 0, 2.2, -2.95, 1.9, 3.3, .1, { t: 'wallChapel', c: [.7, .7, .7] });
  B.pln(null, 0, 2.15, -2.9, 1.5, 3.0, { t: 'stainedGlass', un: true, c: [1.15, 1.15, 1.15] });
  B.light(0, 2.4, -2.2, [.55, .45, .95], 1.15, 7.5);
  const al = B.grp(null, 0, 0, -2.4, 0, 'altar');
  B.box(al, 0, .07, .1, 2.6, .14, 1.3, { t: 'wallChapel', c: [.8, .8, .8] }); B.box(al, 0, .55, 0, 1.9, .82, .72, { t: 'wallChapel', c: [.9, .9, .9], uv: [1, 1] });
  B.pln(al, 0, .97, 0, 1.7, .76, { t: 'altarCloth' }, 0, -PI / 2); B.pln(al, 0, .62, .37, 1.7, .6, { t: 'altarCloth' });
  B.box(al, 0, 1.42, -.1, .05, .8, .05, { c: '#a8873a', s: 50 }); B.box(al, 0, 1.55, -.1, .34, .05, .05, { c: '#a8873a', s: 50 });
  const kneel = B.box(al, 0, .12, .95, 1.4, .24, .4, { t: 'woodB' }); B.box(al, 0, .27, .95, 1.4, .06, .4, { c: '#3a1418' }); B.box(al, -.1, .31, .95, .24, .012, .16, { c: '#d9cdb0' });
  B.hit(al, 0, .55, .1, 2.1, 1.0, 1.7);
  B.col(-1.4, -3, 1.4, -1.5);
  const candG = [];
  [-.62, .62].forEach(x => {
    const cg = B.grp(null, x, 0, -2.4, 0, 'acandle');
    B.cyl(cg, 0, .99, 0, .06, .03, '#7b6a3a'); B.cyl(cg, 0, 1.14, 0, .033, .26, '#d7caa8'); B.box(cg, 0, 1.28, 0, .004, .02, .004, '#111');
    const fl = B.flame(cg, 0, 1.32, 0, 1.15); fl.vis = false; candG.push(fl);
    B.hit(cg, 0, 1.15, 0, .3, .5, .3);
  });
  const gCand = B.glint(0, 1.3, -2.1);
  const inscr = B.pln(null, -2.1, 1.75, -2.965, 1.5, .75, { t: 'inscrWall', bl: 1, un: true, c: [1, .45, .4] }); inscr.vis = false;
  B.hit(null, -2.1, 1.75, -2.9, 1.7, 1.0, .2, 'inscr');
  const candleLight = B.light(0, 1.5, -2.0, [1, .7, .35], 0, 5.5, .15);

  /* east: the organ and its little panel */
  const og = B.grp(null, 2.7, 0, -.4, -PI / 2, 'organ');
  B.box(og, 0, .55, .05, 2.0, 1.1, .6, { t: 'woodB', c: [.9, .85, .85], s: 14 }); B.box(og, 0, 2.3, -.1, 2.0, 2.4, .32, { t: 'organPipes', uv: [2, 1.4] });
  B.box(og, 0, 3.55, -.1, 2.1, .1, .4, WB); B.box(og, 0, 1.2, .2, 1.9, .1, .3, WB);
  B.box(og, 0, 1.0, .3, 1.4, .05, .3, { c: '#d9d2bc' }); for (let i = 0; i < 9; i++) B.box(og, -.55 + i * .14, 1.04, .26, .06, .04, .18, '#0a0a0a');
  [-.6, -.25, .1, .45, -.9].forEach((x, i) => { B.cyl(og, x, 1.28, .26, .025, .06, BR, PI / 2); });
  B.box(og, 0, .4, .8, 1.2, .08, .3, WB);
  B.hit(og, 0, 1.3, .05, 2.1, 2.6, .8);
  const orgGlow = B.light(2.2, 1.2, -.4, [1, .78, .4], 0, 4.5, .1);
  B.col(2.25, -1.55, 3, 1.1);
  // a little hymnal cupboard against the east wall, with the bell rope inside
  const cp = B.grp(null, 2.72, 0, 1.9, -PI / 2);
  B.box(cp, -.38, .6, 0, .04, 1.2, .5, WB); B.box(cp, .38, .6, 0, .04, 1.2, .5, WB); B.box(cp, 0, 1.2, 0, .8, .04, .5, WB); B.box(cp, 0, .03, 0, .8, .06, .5, WB);
  B.pln(cp, 0, .6, -.24, .74, 1.14, { c: '#0b0806' }); B.box(cp, 0, .55, -.05, .72, .03, .4, WB);
  const pn = B.grp(cp, -.38, 0, .26, 0, 'opanel');
  B.box(pn, .38, .6, 0, .76, 1.14, .04, { t: 'woodPale', c: [.45, .45, .5], s: 10 }); B.cyl(pn, .66, .6, .04, .022, .02, BR, PI / 2);
  B.hit(pn, .38, .6, 0, .84, 1.24, .3);
  const rope = B.grp(cp, 0, .06, 0, 0, 'rope');
  for (let i = 0; i < 4; i++) B.cyl(rope, 0, i * .055, 0, .17 - i * .015, .05, { c: '#b59a6a', s: 4 });
  B.cyl(rope, .12, .06, .1, .015, .3, { c: '#b59a6a' }, PI / 2, .4);
  B.hit(rope, 0, .1, 0, .4, .35, .4);
  const gRope = B.glint(2.5, .9, 1.9); gRope.off = true;
  B.col(2.45, 1.5, 3, 2.3);

  /* west: lectern */
  const lc = B.grp(null, -2.35, 0, -.85, PI / 2, 'lectern');
  B.cyl(lc, 0, .55, 0, .09, 1.1, WB); B.cyl(lc, 0, .04, 0, .26, .08, WB); B.box(lc, 0, 1.15, 0, .7, .06, .5, WB, 0, .35);
  B.box(lc, 0, 1.22, .02, .55, .035, .38, { c: '#d3c7aa' }, 0, .35); B.box(lc, 0, 1.2, .0, .6, .03, .42, { c: '#2a1612' }, 0, .35);
  B.hit(lc, 0, .85, 0, .9, 1.7, .8);
  const gLec = B.glint(-2.3, 1.3, -.85);
  B.col(-2.85, -1.3, -1.9, -.4);

  /* the nave: pews */
  const pewCol = [];
  [-1.5, 1.5].forEach(x => [-.55, .8].forEach(z => {
    const pg = B.grp(null, x, 0, z, 0, 'pews');
    B.box(pg, 0, .26, 0, 1.5, .08, .46, WB); B.box(pg, 0, .66, -.22, 1.5, .85, .06, WB); B.box(pg, 0, .12, .28, 1.5, .24, .1, WB);
    [-.72, .72].forEach(a => B.box(pg, a, .48, 0, .08, .96, .52, WB));
    B.hit(pg, 0, .5, 0, 1.6, 1.0, .7);
    B.col(x - .85, z - .34, x + .85, z + .42);
  }));

  /* the hatch in the roof */
  const tr = B.grp(null, 0, 3.57, -.9, 0, 'trap');
  const hatch = B.box(tr, 0, 0, 0, 1.1, .05, 1.1, { t: 'woodB', c: [1, .9, .9], s: 8 });
  B.box(tr, 0, -.01, 0, .06, .06, 1.1, IRON); B.box(tr, 0, -.01, 0, 1.1, .06, .06, IRON);
  const cord = B.box(tr, .35, -.2, .35, .014, .36, .014, IRON); const ring = B.sph(tr, .35, -.42, .35, .06, { c: '#2a2c31', s: 40 });
  const dark = B.pln(tr, 0, -.04, 0, 1.0, 1.0, { c: '#020203', un: true }, 0, PI / 2); dark.vis = false;
  const lad = B.grp(tr, 0, 0, 0);
  [-.26, .26].forEach(x => B.box(lad, x, -1.7, .0, .06, 3.5, .06, WB));
  for (let i = 0; i < 11; i++) B.box(lad, 0, -.25 - i * .3, 0, .5, .05, .05, WA);
  lad.vis = false;
  B.hit(tr, 0, -.5, 0, 1.3, 1.2, 1.3);
  const gTrap = B.glint(.3, 3.0, -.55);

  /* south: the door we came by */
  const sdr = B.grp(null, 1.7, 0, 2.94, PI, 'cbdoor');
  B.box(sdr, 0, 1.0, 0, .95, 2.0, .08, { t: 'woodB', c: [.8, .8, .85], s: 8 }); [.4, 1.0, 1.6].forEach(y => B.box(sdr, 0, y, .06, .93, .1, .03, IRON));
  B.hit(sdr, 0, 1.0, .05, 1.1, 2.1, .3);
  B.light(-2.3, 2.0, 2.2, [.4, .45, .8], .35, 5);

  return {
    spawn: { x: 0, z: 2.1, yaw: 0 }, dark: true,
    organGlow(on) { orgGlow.k0 = on ? 1.5 : 0; orgGlow.k = orgGlow.k0; },
    apply(f) {
      const lit = !!f.candlesLit;
      candG.forEach(c => { c.vis = lit; }); candleLight.k0 = lit ? 1.3 : 0; candleLight.k = candleLight.k0; inscr.vis = lit;
      gCand.off = lit || !has('matches'); gLec.off = true;
      pn.goal = { rot: [0, f.panelOpen ? -1.6 : 0, 0], k: 3 };
      rope.vis = !!f.panelOpen && !f.gotRope; gRope.off = !(f.panelOpen && !f.gotRope);
      const open = !!f.trapOpen;
      hatch.vis = !open; cord.vis = ring.vis = !open; dark.vis = open; lad.vis = open; gTrap.off = open || !has('rope');
      sc.amb = lit ? [.13, .12, .16] : [.1, .1, .15];
    }
  };
};
