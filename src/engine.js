/* ================= 3D ENGINE: a tiny WebGL renderer ================= */
const R3 = (() => {
  const NL = 8;
  const VS = `
attribute vec3 aP; attribute vec3 aN; attribute vec2 aT;
uniform mat4 uVP; uniform mat4 uM; uniform mat3 uNM; uniform vec2 uUV;
varying vec3 vW; varying vec3 vN; varying vec2 vT;
void main(){ vec4 w = uM * vec4(aP, 1.0); vW = w.xyz; vN = uNM * aN; vT = aT * uUV; gl_Position = uVP * w; }`;
  const FSsrc = (nl, low) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define NL ${nl}
varying vec3 vW; varying vec3 vN; varying vec2 vT;
uniform sampler2D uTex; uniform vec3 uCol; uniform vec3 uEm; uniform float uHasTex; uniform float uShin; uniform float uAlpha; uniform float uUnlit;
uniform vec3 uAmb; uniform vec3 uCam; uniform vec3 uFog; uniform float uFogD;
uniform vec4 uLP[NL]; uniform vec3 uLC[NL];
void main(){
  vec4 tx = uHasTex > 0.5 ? texture2D(uTex, vT) : vec4(1.0);
  vec3 base = uCol * tx.rgb;
  float a = uAlpha * tx.a;
  if (a < 0.01) discard;
  float dist = length(uCam - vW);
  vec3 col;
  if (uUnlit > 0.5) { col = base + uEm; }
  else {
    vec3 N = normalize(vN);
    vec3 V = (uCam - vW) / max(dist, 0.001);
    if (dot(N, V) < 0.0) N = -N;
    vec3 lit = uAmb;
    vec3 spec = vec3(0.0);
    for (int i = 0; i < NL; i++) {
      vec3 L = uLP[i].xyz - vW;
      float d = length(L);
      L = L / max(d, 0.001);
      float att = clamp(1.0 - d / uLP[i].w, 0.0, 1.0);
      att = att * att;
      float nd = max(dot(N, L), 0.0) * 0.9 + 0.1;
      lit += uLC[i] * att * nd;
      if (${low ? 'false' : 'uShin > 1.0'}) {
        vec3 H = normalize(L + V);
        spec += uLC[i] * att * pow(max(dot(N, H), 0.0), uShin) * 0.55;
      }
    }
    col = base * lit + spec + uEm;
    col = pow(max(col, vec3(0.0)), vec3(0.78));
  }
  float f = clamp(1.0 - exp(-dist * uFogD), 0.0, 1.0);
  col = mix(col, uFog, f);
  gl_FragColor = vec4(col, a);
}`;

  /* ---------- math ---------- */
  const ID4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function compose(p, r, s) {
    const cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
    const a0 = cy, a1 = sy * sx, a2 = sy * cx, a3 = 0, a4 = cx, a5 = -sx, a6 = -sy, a7 = cy * sx, a8 = cy * cx;
    const R = [a0 * cz + a1 * sz, -a0 * sz + a1 * cz, a2, a3 * cz + a4 * sz, -a3 * sz + a4 * cz, a5, a6 * cz + a7 * sz, -a6 * sz + a7 * cz, a8];
    const o = new Float32Array(16);
    for (let j = 0; j < 3; j++) { o[j * 4] = R[j] * s[j]; o[j * 4 + 1] = R[3 + j] * s[j]; o[j * 4 + 2] = R[6 + j] * s[j]; }
    o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1;
    return o;
  }
  function persp(fov, asp, n, f) {
    const t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function basis(yaw, pitch) {
    const cp = Math.cos(pitch), sp = Math.sin(pitch), sy = Math.sin(yaw), cy = Math.cos(yaw);
    const f = [sy * cp, sp, -cy * cp];
    const r = [cy, 0, sy];
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    return { f, r, u };
  }
  function viewMat(eye, yaw, pitch) {
    const { f, r, u } = basis(yaw, pitch), o = new Float32Array(16);
    o[0] = r[0]; o[4] = r[1]; o[8] = r[2]; o[12] = -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]);
    o[1] = u[0]; o[5] = u[1]; o[9] = u[2]; o[13] = -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]);
    o[2] = -f[0]; o[6] = -f[1]; o[10] = -f[2]; o[14] = f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2];
    o[15] = 1;
    return o;
  }
  function cof3(m) {
    const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
    const c00 = e * i - h * f, c01 = -(b * i - h * c), c02 = b * f - e * c;
    const c10 = -(d * i - g * f), c11 = a * i - g * c, c12 = -(a * f - d * c);
    const c20 = d * h - g * e, c21 = -(a * h - g * b), c22 = a * e - d * b;
    let det = a * c00 + d * c01 + g * c02;
    if (Math.abs(det) < 1e-12) det = 1e-12;
    return { c: [c00, c01, c02, c10, c11, c12, c20, c21, c22], det };
  }
  function normalMat(m) {
    const { c, det } = cof3(m), id = 1 / det, o = new Float32Array(9);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) o[k * 3 + r] = c[r * 3 + k] * id;
    return o;
  }
  function affInv(m) {
    const { c, det } = cof3(m), id = 1 / det;
    const iv = [c[0] * id, c[3] * id, c[6] * id, c[1] * id, c[4] * id, c[7] * id, c[2] * id, c[5] * id, c[8] * id];
    const t = [m[12], m[13], m[14]];
    return { iv, t };
  }

  /* ---------- geometry ---------- */
  let gl, cv, P, U = {}, whiteTex = null, curTex = null, PH = null, PL = null, quality = 'high', nlActive = NL;
  const GEO = {}, TEXC = {};
  function makeGeo(v) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (let i = 0; i < v.length; i += 8) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[i + k]); mx[k] = Math.max(mx[k], v[i + k]); }
    const c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], rad = Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2;
    return { buf, n: v.length / 8, mn, mx, c, rad };
  }
  function quad(out, p, n, u, v, hu = .5, hv = .5) {
    const c = [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]];
    const pt = c.map(q => [p[0] + u[0] * q[0] * hu + v[0] * q[1] * hv, p[1] + u[1] * q[0] * hu + v[1] * q[1] * hv, p[2] + u[2] * q[0] * hu + v[2] * q[1] * hv, q[2], q[3]]);
    for (const i of [0, 1, 2, 0, 2, 3]) out.push(pt[i][0], pt[i][1], pt[i][2], n[0], n[1], n[2], pt[i][3], pt[i][4]);
  }
  function buildGeos() {
    let o = [];
    const F = [[[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [1, 0, 0], [0, 0, -1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
    for (const [n, u, v] of F) quad(o, [n[0] * .5, n[1] * .5, n[2] * .5], n, u, v);
    GEO.box = makeGeo(o);
    o = []; quad(o, [0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    GEO.plane = makeGeo(o);
    GEO.plane.mn[2] = -.04; GEO.plane.mx[2] = .04;
    const SEG = 22;
    o = [];
    for (let i = 0; i < SEG; i++) {
      const a0 = i / SEG * Math.PI * 2, a1 = (i + 1) / SEG * Math.PI * 2;
      const p0 = [Math.sin(a0) * .5, Math.cos(a0) * .5], p1 = [Math.sin(a1) * .5, Math.cos(a1) * .5];
      const n0 = [Math.sin(a0), 0, Math.cos(a0)], n1 = [Math.sin(a1), 0, Math.cos(a1)];
      const t0 = i / SEG, t1 = (i + 1) / SEG;
      o.push(p0[0], -.5, p0[1], ...n0, t0, 0, p1[0], -.5, p1[1], ...n1, t1, 0, p1[0], .5, p1[1], ...n1, t1, 1);
      o.push(p0[0], -.5, p0[1], ...n0, t0, 0, p1[0], .5, p1[1], ...n1, t1, 1, p0[0], .5, p0[1], ...n0, t0, 1);
      o.push(0, .5, 0, 0, 1, 0, .5, .5, p0[0], .5, p0[1], 0, 1, 0, .5 + p0[0], .5 + p0[1], p1[0], .5, p1[1], 0, 1, 0, .5 + p1[0], .5 + p1[1]);
      o.push(0, -.5, 0, 0, -1, 0, .5, .5, p1[0], -.5, p1[1], 0, -1, 0, .5 + p1[0], .5 + p1[1], p0[0], -.5, p0[1], 0, -1, 0, .5 + p0[0], .5 + p0[1]);
    }
    GEO.cyl = makeGeo(o);
    o = [];
    for (let i = 0; i < SEG; i++) {
      const a0 = i / SEG * Math.PI * 2, a1 = (i + 1) / SEG * Math.PI * 2;
      const p0 = [Math.sin(a0) * .5, Math.cos(a0) * .5], p1 = [Math.sin(a1) * .5, Math.cos(a1) * .5];
      const nn = a => { const l = Math.hypot(1, .5); return [Math.sin(a) / l, .5 / l, Math.cos(a) / l]; };
      const n0 = nn(a0), n1 = nn(a1);
      o.push(p0[0], -.5, p0[1], ...n0, i / SEG, 0, p1[0], -.5, p1[1], ...n1, (i + 1) / SEG, 0, 0, .5, 0, ...nn((a0 + a1) / 2), (i + .5) / SEG, 1);
      o.push(0, -.5, 0, 0, -1, 0, .5, .5, p1[0], -.5, p1[1], 0, -1, 0, .5 + p1[0], .5 + p1[1], p0[0], -.5, p0[1], 0, -1, 0, .5 + p0[0], .5 + p0[1]);
    }
    GEO.cone = makeGeo(o);
    o = [];
    const LA = 14, LO = 20;
    const sp = (la, lo) => { const th = la / LA * Math.PI, ph = lo / LO * Math.PI * 2; const x = Math.sin(th) * Math.sin(ph), y = Math.cos(th), z = Math.sin(th) * Math.cos(ph); return [x * .5, y * .5, z * .5, x, y, z, lo / LO, 1 - la / LA]; };
    for (let la = 0; la < LA; la++) for (let lo = 0; lo < LO; lo++) {
      const a = sp(la, lo), b = sp(la + 1, lo), c = sp(la + 1, lo + 1), d = sp(la, lo + 1);
      o.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
    GEO.sph = makeGeo(o);
  }

  /* ---------- textures ---------- */
  function upload(c, clamp, tex) {
    const t = tex || gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    const pot = v => (v & (v - 1)) === 0;
    const mip = pot(c.width) && pot(c.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const wrap = (clamp || !mip) ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    return t;
  }
  function tex(name) {
    if (!name) return null;
    if (TEXC[name]) return TEXC[name];
    const painter = TP[name];
    if (!painter) { console.warn('missing texture', name); return null; }
    const c = painter();
    return (TEXC[name] = upload(c, !!c.clampWrap));
  }
  function svgTex(name, svg, w = 256, h = 256) {
    if (TEXC[name]) return TEXC[name];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const t = upload(c, true); TEXC[name] = t;
    const img = new Image();
    img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, w, h); upload(c, true, t); };
    const full = /xmlns=/.test(svg) ? svg : svg.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"`);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(full);
    return t;
  }

  /* ---------- scene graph ---------- */
  const parseCol = c => {
    if (Array.isArray(c)) return c;
    if (typeof c === 'number') return [c, c, c];
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  function node(o) {
    const n = { geo: null, tex: null, col: [1, 1, 1], em: [0, 0, 0], shin: 0, alpha: 1, blend: 0, unlit: false, uv: [1, 1], pos: [0, 0, 0], rot: [0, 0, 0], scl: [1, 1, 1], vis: true, kids: [], par: null, id: null, bb: false, goal: null, proxy: false, world: ID4, _hid: null };
    return Object.assign(n, o || {});
  }
  function add(parent, n) { n.par = parent; parent.kids.push(n); return n; }
  function newScene() {
    return { root: node(), lights: [], amb: [.1, .1, .1], fog: [0, 0, 0], fogD: .05, colliders: [], anims: [], t: 0, dim: 1, draw: [], trans: [], pick: [], hd: [], ht: [] };
  }
  function walk(n, pw, hid, sc, cam, dt, hud) {
    if (!n.vis) return;
    if (n.goal) {
      const k = 1 - Math.exp(-(n.goal.k || 5) * dt);
      for (const key of ['rot', 'pos', 'scl']) { const g = n.goal[key]; if (g) { const v = n[key]; for (let i = 0; i < 3; i++) v[i] += (g[i] - v[i]) * k; } }
    }
    const h = n.id || hid;
    let w;
    if (n.hud) {
      hud = true;
      const b = basis(cam.yaw, cam.pitch), o = n.hud.slice(); o[0] = Math.sign(o[0]) * Math.min(Math.abs(o[0]), .5 * Math.tan(fovV / 2) * (cv.width / cv.height) * o[2]);
      w = compose([cam.pos[0] + b.r[0] * o[0] + b.u[0] * o[1] + b.f[0] * o[2], cam.pos[1] + b.r[1] * o[0] + b.u[1] * o[1] + b.f[1] * o[2], cam.pos[2] + b.r[2] * o[0] + b.u[2] * o[1] + b.f[2] * o[2]], n.rot, n.scl);
    } else {
      // most of a room never moves: reuse last frame's matrix unless this node or its parent changed
      const p = n.pos, r = n.rot, q = n.scl, k = n._k;
      if (k && n._pw === pw && !n.bb && k[0] === p[0] && k[1] === p[1] && k[2] === p[2] && k[3] === r[0] && k[4] === r[1] && k[5] === r[2] && k[6] === q[0] && k[7] === q[1] && k[8] === q[2]) w = n.world;
      else {
        w = mul(pw, compose(p, r, q)); n._pw = pw;
        if (!n.bb) { const kk = n._k || (n._k = new Float64Array(9)); kk[0] = p[0]; kk[1] = p[1]; kk[2] = p[2]; kk[3] = r[0]; kk[4] = r[1]; kk[5] = r[2]; kk[6] = q[0]; kk[7] = q[1]; kk[8] = q[2]; }
      }
    }
    if (n.bb) {
      const px = w[12], py = w[13], pz = w[14];
      w = compose([px, py, pz], [0, Math.atan2(cam.pos[0] - px, cam.pos[2] - pz), 0], n.scl);
    }
    n.world = w;
    if (n.geo) {
      n._hid = h;
      if (!n.proxy) { if (hud) (n.blend || n.alpha < 1 ? sc.ht : sc.hd).push(n); else (n.blend || n.alpha < 1 ? sc.trans : sc.draw).push(n); }
      if (h && !n.nopick && !hud) sc.pick.push(n);
    }
    for (let i = 0; i < n.kids.length; i++) walk(n.kids[i], w, h, sc, cam, dt, hud);
  }
  function update(sc, cam, dt) {
    sc.t += dt;
    for (const a of sc.anims) a(sc.t, dt);
    sc.draw = []; sc.trans = []; sc.pick = []; sc.hd = []; sc.ht = [];
    walk(sc.root, ID4, null, sc, cam, dt, false);
  }
  function worldPos(n) { return [n.world[12], n.world[13], n.world[14]]; }

  /* ---------- render ---------- */
  let scale = 1, slow = 0, fovV = 1.2, fixedScale = false;
  const lp = new Float32Array(NL * 4), lc = new Float32Array(NL * 3);
  function resize() {
    const dpr = quality === 'low' ? Math.min(window.devicePixelRatio || 1, 1) * .7 : Math.min(window.devicePixelRatio || 1, 1.5) * scale;
    const w = Math.max(2, Math.round(cv.clientWidth * dpr)), h = Math.max(2, Math.round(cv.clientHeight * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }
  function setU(n, c) {
    gl.uniform3f(U.uCol, c.col[0], c.col[1], c.col[2]);
    gl.uniform3f(U.uEm, n.em[0], n.em[1], n.em[2]);
    gl.uniform1f(U.uShin, n.shin);
    gl.uniform1f(U.uAlpha, n.alpha);
    gl.uniform1f(U.uUnlit, n.unlit ? 1 : 0);
    gl.uniform2f(U.uUV, n.uv[0], n.uv[1]);
    const t = n.tex ? tex(n.tex) : null;
    gl.uniform1f(U.uHasTex, t ? 1 : 0);
    if (t && curTex !== t) { gl.bindTexture(gl.TEXTURE_2D, t); curTex = t; }
  }
  let cullF = null, cullP = null, cullCos = 0;
  function visible(n) { // skip anything wholly behind or outside the view cone
    const g = GEO[n.geo]; if (!g || !g.rad) return true;
    const w = n.world, sx = Math.hypot(w[0], w[1], w[2]), sy = Math.hypot(w[4], w[5], w[6]), sz = Math.hypot(w[8], w[9], w[10]);
    const rad = g.rad * Math.max(sx, sy, sz);
    const cx = w[0] * g.c[0] + w[4] * g.c[1] + w[8] * g.c[2] + w[12] - cullP[0], cy = w[1] * g.c[0] + w[5] * g.c[1] + w[9] * g.c[2] + w[13] - cullP[1], cz = w[2] * g.c[0] + w[6] * g.c[1] + w[10] * g.c[2] + w[14] - cullP[2];
    const d = Math.hypot(cx, cy, cz);
    if (d <= rad + .3) return true;
    if (d - rad > 40) return false;
    const along = cx * cullF[0] + cy * cullF[1] + cz * cullF[2];
    // the angle between view direction and the sphere centre, widened by the sphere's own angular size
    const ang = Math.acos(Math.max(-1, Math.min(1, along / d))) - Math.asin(Math.min(1, rad / d));
    return ang < cullCos;
  }
  function drawNode(n) {
    const g = GEO[n.geo];
    if (cullF && !visible(n)) return;
    gl.uniformMatrix4fv(U.uM, false, n.world);
    if (n._nmW !== n.world) { n._nm = normalMat(n.world); n._nmW = n.world; }
    gl.uniformMatrix3fv(U.uNM, false, n._nm);
    setU(n, n);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.buf);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);
    gl.drawArrays(gl.TRIANGLES, 0, g.n);
  }
  function render(sc, cam) {
    resize();
    const t0 = performance.now();
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(sc.fog[0], sc.fog[1], sc.fog[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const prog = quality === 'low' && PL ? PL : PH; P = prog.P; U = prog.U; nlActive = prog.nl;
    gl.useProgram(P);
    const asp = cv.width / cv.height;
    fovV = (asp < 1 ? 78 : 62) * Math.PI / 180;
    const VP = mul(persp(fovV, asp, .05, 40), viewMat(cam.pos, cam.yaw, cam.pitch));
    cullF = basis(cam.yaw, cam.pitch).f; cullP = cam.pos;
    cullCos = Math.atan(Math.tan(fovV / 2) * Math.hypot(1, asp)) + .08; // half-angle of the view cone through the screen corners
    gl.uniformMatrix4fv(U.uVP, false, VP);
    gl.uniform3f(U.uCam, cam.pos[0], cam.pos[1], cam.pos[2]);
    gl.uniform3f(U.uAmb, sc.amb[0] * sc.dim, sc.amb[1] * sc.dim, sc.amb[2] * sc.dim);
    gl.uniform3f(U.uFog, sc.fog[0], sc.fog[1], sc.fog[2]);
    gl.uniform1f(U.uFogD, sc.fogD);
    lp.fill(0); lc.fill(0);
    let L = sc.lights;
    if (L.length > nlActive) { // keep the player's own light, then the nearest others
      const rest = L.slice(1).map(l => [l, (l.p[0] - cam.pos[0]) ** 2 + (l.p[2] - cam.pos[2]) ** 2 + (l.k > .05 ? 0 : 1e6)]);
      rest.sort((a, b) => a[1] - b[1]); L = [L[0]]; for (let i = 0; i < nlActive - 1 && i < rest.length; i++) L.push(rest[i][0]);
    }
    for (let i = 0; i < nlActive && i < L.length; i++) {
      const l = L[i];
      lp[i * 4] = l.p[0]; lp[i * 4 + 1] = l.p[1]; lp[i * 4 + 2] = l.p[2]; lp[i * 4 + 3] = Math.max(.1, l.r);
      const kk = l.k * (l.keep ? 1 : sc.dim); lc[i * 3] = l.c[0] * kk; lc[i * 3 + 1] = l.c[1] * kk; lc[i * 3 + 2] = l.c[2] * kk;
    }
    gl.uniform4fv(U.uLP, lp); gl.uniform3fv(U.uLC, lc);
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(U.uTex, 0);
    curTex = null;
    gl.bindTexture(gl.TEXTURE_2D, whiteTex);
    gl.disable(gl.BLEND); gl.depthMask(true);
    for (const n of sc.draw) { if (!n.tex) { gl.bindTexture(gl.TEXTURE_2D, whiteTex); curTex = null; } drawNode(n); }
    const tr = sc.trans;
    for (const n of tr) { const dx = n.world[12] - cam.pos[0], dy = n.world[13] - cam.pos[1], dz = n.world[14] - cam.pos[2]; n._d = dx * dx + dy * dy + dz * dz; }
    tr.sort((a, b) => b._d - a._d);
    gl.enable(gl.BLEND); gl.depthMask(false);
    let bm = -1;
    for (const n of tr) {
      if (n.blend !== bm) { bm = n.blend; if (bm === 2) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); }
      if (!n.tex) { gl.bindTexture(gl.TEXTURE_2D, whiteTex); curTex = null; }
      drawNode(n);
    }
    gl.depthMask(true);
    if (sc.hd.length || sc.ht.length) {
      cullF = null;
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND);
      for (const n of sc.hd) { if (!n.tex) { gl.bindTexture(gl.TEXTURE_2D, whiteTex); curTex = null; } drawNode(n); }
      gl.enable(gl.BLEND); gl.depthMask(false); bm = -1;
      for (const n of sc.ht) {
        if (n.blend !== bm) { bm = n.blend; if (bm === 2) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); }
        if (!n.tex) { gl.bindTexture(gl.TEXTURE_2D, whiteTex); curTex = null; }
        drawNode(n);
      }
      gl.depthMask(true);
    }
    // adaptive resolution: if frames take too long, draw fewer pixels
    const ft = (window.__ft = (window.__ft || 16) * .9 + (performance.now() - (render._last || t0)) * .1);
    render._last = performance.now();
    if (!fixedScale && ft > 30 && scale > .55) { slow++; if (slow > 40) { scale = Math.max(.55, scale - .12); slow = 0; } } else slow = 0;
  }

  /* ---------- picking ---------- */
  function ray(cam, nx, ny, asp) {
    const { f, r, u } = basis(cam.yaw, cam.pitch), t = Math.tan(fovV / 2);
    const d = [f[0] + r[0] * nx * t * asp + u[0] * ny * t, f[1] + r[1] * nx * t * asp + u[1] * ny * t, f[2] + r[2] * nx * t * asp + u[2] * ny * t];
    const l = Math.hypot(d[0], d[1], d[2]);
    return [d[0] / l, d[1] / l, d[2] / l];
  }
  function pick(sc, cam, nx, ny) {
    const asp = cv.width / cv.height, d = ray(cam, nx, ny, asp);
    let best = null, bt = 1e9;
    for (const n of sc.pick) {
      const g = GEO[n.geo];
      if (n._ivW !== n.world) { n._iv = affInv(n.world); n._ivW = n.world; }
      const { iv, t } = n._iv;
      const ox = cam.pos[0] - t[0], oy = cam.pos[1] - t[1], oz = cam.pos[2] - t[2];
      const o = [iv[0] * ox + iv[1] * oy + iv[2] * oz, iv[3] * ox + iv[4] * oy + iv[5] * oz, iv[6] * ox + iv[7] * oy + iv[8] * oz];
      const dl = [iv[0] * d[0] + iv[1] * d[1] + iv[2] * d[2], iv[3] * d[0] + iv[4] * d[1] + iv[5] * d[2], iv[6] * d[0] + iv[7] * d[1] + iv[8] * d[2]];
      let t0 = 0, t1 = 1e9, ok = true;
      for (let k = 0; k < 3 && ok; k++) {
        if (Math.abs(dl[k]) < 1e-9) { if (o[k] < g.mn[k] || o[k] > g.mx[k]) ok = false; }
        else {
          let a = (g.mn[k] - o[k]) / dl[k], b = (g.mx[k] - o[k]) / dl[k];
          if (a > b) { const s = a; a = b; b = s; }
          t0 = Math.max(t0, a); t1 = Math.min(t1, b);
          if (t0 > t1) ok = false;
        }
      }
      if (ok && t0 < bt) { bt = t0; best = n; }
    }
    return best ? { id: best._hid, t: bt, node: best } : null;
  }
  const project = (cam, p) => {
    const asp = cv.width / cv.height, { f, r, u } = basis(cam.yaw, cam.pitch);
    const v = [p[0] - cam.pos[0], p[1] - cam.pos[1], p[2] - cam.pos[2]];
    const z = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
    if (z < .1) return null;
    const t = Math.tan(fovV / 2);
    return { x: (v[0] * r[0] + v[1] * r[1] + v[2] * r[2]) / (z * t * asp), y: (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / (z * t), z };
  };

  /* ---------- collision ---------- */
  function collide(pos, dx, dz, rad, sc) {
    const hit = (x, z) => { for (const c of sc.colliders) if (x > c[0] - rad && x < c[2] + rad && z > c[1] - rad && z < c[3] + rad) return true; return false; };
    if (!hit(pos[0] + dx, pos[2])) pos[0] += dx;
    if (!hit(pos[0], pos[2] + dz)) pos[2] += dz;
  }

  function init(canvas) {
    cv = canvas;
    const opt = { antialias: (window.devicePixelRatio || 1) < 2, alpha: false, powerPreference: 'high-performance' };
    gl = cv.getContext('webgl', opt) || cv.getContext('experimental-webgl', opt);
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
    const build = (nl, low) => {
      const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FSsrc(nl, low));
      if (!vs || !fs) return null;
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs);
      gl.bindAttribLocation(p, 0, 'aP'); gl.bindAttribLocation(p, 1, 'aN'); gl.bindAttribLocation(p, 2, 'aT');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
      const u = {};
      for (const n of ['uVP', 'uM', 'uNM', 'uUV', 'uTex', 'uCol', 'uEm', 'uHasTex', 'uShin', 'uAlpha', 'uUnlit', 'uAmb', 'uCam', 'uFog', 'uFogD']) u[n] = gl.getUniformLocation(p, n);
      u.uLP = gl.getUniformLocation(p, 'uLP[0]'); u.uLC = gl.getUniformLocation(p, 'uLC[0]');
      return { P: p, U: u, nl };
    };
    PH = build(NL, false); if (!PH) return false;
    PL = build(4, true) || PH;
    P = PH.P; U = PH.U;
    gl.useProgram(P);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    buildGeos();
    const w = document.createElement('canvas'); w.width = w.height = 2; const g = w.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 2, 2);
    whiteTex = upload(w, true);
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); R3.lost = true; });
    return true;
  }

  return { init, fixScale(v) { fixedScale = true; scale = v; }, setQuality(q) { quality = q === 'low' ? 'low' : 'high'; }, get quality() { return quality; }, node, add, newScene, update, render, pick, project, collide, tex, svgTex, parseCol, worldPos, ray, NL, get fov() { return fovV; }, get ok() { return !!gl; }, lost: false, mul, compose };
})();
