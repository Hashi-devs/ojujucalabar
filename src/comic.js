/* ================= COMIC STRIPS: the opening, the seven memories, the ending ================= */
/* A strip is a list of pages; a page is one to three panels. Panels appear one at a time (tap to go on).
   Each panel has an art id. Until the real drawings arrive, the art is drawn here in ink and flat colour
   (COMIC_ART). To use a drawing, save it as assets/comic/<art id>.png (or .jpg / .webp) and rebuild:
   the build embeds it as COMIC_IMG[<art id>] and it replaces the placeholder automatically.
   Speech balloons carry a voice-line id (v); when a recording exists it plays as the balloon appears. */

/* ---------- the ink kit ---------- */
const INK = '#120c08';
const ck = {
  sky: (a, b, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/>`,
  rect: (x, y, w, h, c, o = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${o}/>`,
  hill: (c, y = 210) => `<path d="M0 ${y}Q80 ${y - 70} 170 ${y - 40}T400 ${y - 20}V300H0Z" fill="${c}"/>`,
  /* the house on the hill: a big two-storey block, a gable, and the chimney */
  house: (x, y, s, c, lit) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0V-46H60V0Z" fill="${c}"/><path d="M-66 -44L0 -78L66 -44Z" fill="${c}"/><rect x="22" y="-96" width="12" height="36" fill="${c}"/>${lit ? '<rect x="-40" y="-36" width="10" height="12" fill="#ffcf6a"/><rect x="14" y="-36" width="10" height="12" fill="#ffcf6a" opacity=".6"/>' : ''}</g>`,
  palm: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-3 0Q2 -40 -2 -80H3Q7 -40 3 0Z"/><path d="M0 -80Q-30 -92 -48 -70Q-26 -84 0 -78ZM0 -80Q30 -94 50 -72Q26 -86 0 -78ZM0 -80Q-14 -104 -34 -104Q-12 -96 0 -78ZM0 -80Q16 -106 36 -100Q14 -94 0 -78Z"/></g>`,
  tree: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><rect x="-5" y="-50" width="10" height="50"/><circle cx="0" cy="-70" r="34"/><circle cx="-28" cy="-56" r="22"/><circle cx="28" cy="-58" r="24"/></g>`,
  rain: (op = .5) => `<g stroke="#cfe0ff" stroke-width="1.2" opacity="${op}">${Array.from({ length: 70 }, (_, i) => { const x = (i * 53) % 410, y = (i * 97) % 300; return `<path d="M${x} ${y}l-6 16"/>`; }).join('')}</g>`,
  dots: (c = '#000', op = .12) => `<defs><pattern id="ht" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.2" fill="${c}"/></pattern></defs><rect width="400" height="300" fill="url(#ht)" opacity="${op}"/>`,
  vig: (op = .6) => `<defs><radialGradient id="vg"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="400" height="300" fill="url(#vg)"/>`,
  glow: (x, y, r, c, op = .55) => `<defs><radialGradient id="gl${x}${y}"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gl${x}${y})"/>`
};

/* A figure, drawn as a flat silhouette with a lit edge. kind: man, agbada, gele, driver, child, old, ojuju, tobi
   pose: stand, run, point, sit, kneel, phone, carry. x,y = feet; h = height in px; flip faces left. */
function fig(o) {
  const { x, y, h = 120, kind = 'man', pose = 'stand', c = INK, rim = null, flip = false, skin = '#3a2418' } = o;
  const s = h / 120, f = flip ? -1 : 1;
  let body = '', head = '';
  const leg = pose === 'run' ? '<path d="M-6 70L-22 118L-14 120L0 80ZM6 70L26 112L18 118L2 80Z"/>' : pose === 'sit' ? '<path d="M-10 74H20V82H-10ZM12 78L14 118H22L22 78Z"/>' : pose === 'kneel' ? '<path d="M-10 72L-6 100L22 104L22 96L4 92L6 72Z"/>' : '<path d="M-10 70L-12 120H-2L0 76L2 120H12L10 70Z"/>';
  const armL = pose === 'point' ? '<path d="M8 34L44 26L44 32L8 42Z"/>' : pose === 'phone' ? '<path d="M8 34L16 20L22 14L26 18L18 28L12 42Z"/>' : pose === 'run' ? '<path d="M8 34L26 52L22 56L4 42Z"/>' : pose === 'carry' ? '<path d="M8 34L20 50L36 46L34 52L18 58L4 42Z"/>' : '<path d="M8 34L14 66L8 68L2 40Z"/>';
  const armR = pose === 'run' ? '<path d="M-8 34L-24 22L-20 18L-4 30Z"/>' : '<path d="M-8 34L-14 66L-8 68L-2 40Z"/>';
  if (kind === 'agbada') body = '<path d="M-30 74L-18 26Q0 18 18 26L30 74Z"/><path d="M-30 74H30V80H-30Z"/>';
  else if (kind === 'gele') body = '<path d="M-12 26Q0 20 12 26L14 70L20 120H-20L-14 70Z"/>';
  else if (kind === 'child') body = '<path d="M-9 30Q0 26 9 30L10 70H-10Z"/>';
  else if (kind === 'ojuju') body = '<path d="M-14 24Q0 16 14 24L16 64H-16Z"/><path d="M-22 60Q0 52 22 60L28 120H-28Z" opacity=".95"/>';
  else body = '<path d="M-12 26Q0 20 12 26L12 72H-12Z"/>';
  if (kind === 'gele') head = '<circle cx="0" cy="12" r="9"/><path d="M-16 6Q-14 -14 0 -12Q16 -16 18 4Q8 -2 0 -1Q-8 -2 -16 6Z"/>';
  else if (kind === 'agbada') head = '<circle cx="0" cy="12" r="10"/><path d="M-10 6Q-8 -6 4 -6L14 0L10 6Z"/>';
  else if (kind === 'driver') head = '<circle cx="0" cy="12" r="9"/><path d="M-10 6Q-10 -2 0 -3Q10 -2 10 6Z"/><path d="M-12 6H12V9H-12Z"/>';
  else if (kind === 'old') head = '<circle cx="0" cy="14" r="9"/><path d="M-9 9Q-8 2 0 2Q8 2 9 9Z"/>';
  else if (kind === 'child') head = '<circle cx="0" cy="18" r="10"/>';
  else if (kind === 'ojuju') head = '<ellipse cx="0" cy="4" rx="11" ry="16"/>';
  else head = '<circle cx="0" cy="12" r="9"/>';
  const ch = kind === 'child' ? .62 : kind === 'ojuju' ? 1.25 : 1;
  const legs = kind === 'gele' && pose !== 'run' ? '' : leg;
  const arms = kind === 'ojuju' ? '<path d="M10 30L22 92L17 94L6 40Z"/><path d="M-10 30L-22 92L-17 94L-6 40Z"/><path d="M22 92l3 10M20 92l-1 11M18 93l-4 9M-22 92l-3 10M-20 92l1 11M-18 93l4 9" stroke="' + c + '" stroke-width="1.6"/>' : armL + armR;
  const eyes = kind === 'ojuju' ? '<ellipse cx="-4" cy="2" rx="2.8" ry="3.6" fill="#f4f0e6"/><ellipse cx="4.5" cy="2" rx="2.8" ry="3.6" fill="#f4f0e6"/><path d="M-6 -6h4M2 -7h5M-1 10v4" stroke="#e8e2d4" stroke-width="1"/>' : '';
  const fringe = kind === 'ojuju' ? `<g stroke="#6e5a2a" stroke-width="1.4" opacity=".9">${Array.from({ length: 16 }, (_, i) => `<path d="M${-26 + i * 3.4} 62l${(i % 3) - 1} 58"/>`).join('')}</g>` : '';
  const rimp = rim ? `<g fill="none" stroke="${rim}" stroke-width="${1.6 / s}" opacity=".9"><path d="M${f * 9} 4Q${f * 13} 12 ${f * 10} 20M${f * 12} 28L${f * 13} 70"/></g>` : '';
  return `<g transform="translate(${x} ${y}) scale(${s * f * ch} ${s * ch}) translate(0 -120)" fill="${c}">${legs}${body}${arms}${head}${fringe}${eyes}${rimp}</g>`;
}

/* ---------- placeholder art for every panel (400 × 300, cropped to fit) ---------- */
const NOW = { ink: INK, wall: '#2a3340', warm: '#ffcf6a' };
const COMIC_ART = {
  // ---- the opening, 1997
  op_lagos: () => ck.sky('#1b2433', '#0d121a', 'a') + ck.rect(0, 0, 160, 300, '#121a24') + ck.rect(20, 30, 120, 150, '#3c5a78') + `<g fill="#0d1420">${[0, 1, 2, 3, 4].map(i => `<rect x="${28 + i * 22}" y="${110 - (i % 3) * 30}" width="16" height="${70 + (i % 3) * 30}"/>`).join('')}</g>` + ck.rect(170, 200, 230, 100, '#3a2a1e') + `<g transform="translate(270 196)"><rect x="-26" y="-14" width="52" height="16" rx="4" fill="#1e1e22"/><path d="M-22 -14Q-24 -30 -6 -30H6Q24 -30 22 -14" fill="#2a2a30"/><circle cx="0" cy="-6" r="6" fill="#55555c"/></g>` + `<g stroke="#ffd27a" stroke-width="3" fill="none" opacity=".8"><path d="M232 160q-8 -10 0 -20M220 166q-14 -16 0 -32M308 160q8 -10 0 -20M320 166q14 -16 0 -32"/></g>` + ck.dots(),
  op_desk: () => ck.sky('#24303f', '#141b25', 'a') + ck.glow(260, 90, 160, '#ffe2a0', .35) + fig({ x: 220, y: 300, h: 230, kind: 'tobi', pose: 'phone', c: '#0e0b09', rim: '#ffd9a0' }) + ck.rect(0, 250, 400, 50, '#2c2018') + `<rect x="300" y="210" width="70" height="44" fill="#d9cdb0"/><path d="M306 222h56M306 232h46M306 242h50" stroke="#8a7a60" stroke-width="2"/>` + ck.dots(),
  op_promise: () => ck.sky('#6b5038', '#2a1c12', 'a') + ck.glow(200, 120, 190, '#ffd9a0', .5) + `<g transform="translate(200 160)"><ellipse cx="0" cy="0" rx="62" ry="78" fill="#4a3022"/><path d="M-80 -30Q-70 -110 0 -112Q72 -112 84 -30Q50 -76 0 -70Q-46 -76 -80 -30Z" fill="#3f7a50"/><path d="M-30 -8q10 -6 20 0M12 -8q10 -6 20 0" stroke="#1a0e08" stroke-width="4" fill="none"/><path d="M-16 34q16 10 32 0" stroke="#1a0e08" stroke-width="4" fill="none"/></g>` + ck.vig(.75),
  op_pack: () => ck.sky('#2a3240', '#161c26', 'a') + ck.rect(0, 220, 400, 80, '#2a2420') + `<g transform="translate(250 230)"><rect x="-60" y="-40" width="120" height="44" rx="6" fill="#5a3a24"/><path d="M-60 -40l20 -22h80l20 22" fill="#6a4a2e"/><rect x="-14" y="-52" width="28" height="10" rx="3" fill="#2a1a10"/></g>` + fig({ x: 120, y: 300, h: 210, kind: 'tobi', c: '#0e0b09', rim: '#9fb4d0' }) + ck.dots(),
  op_bus: () => ck.sky('#9cc4e4', '#e8d8b0', 'a') + ck.hill('#6a8a4a', 200) + ck.house(300, 112, .55, '#3a3028', false) + ck.palm(250, 160, .6, '#3d5a2c') + ck.rect(0, 230, 400, 70, '#b08a5a') + `<g transform="translate(150 236)"><rect x="-90" y="-60" width="180" height="56" rx="8" fill="#e8b830"/><rect x="-80" y="-52" width="150" height="20" fill="#2a3a4a"/><path d="M-90 -14H90" stroke="#1a1a1a" stroke-width="5"/><circle cx="-56" cy="-2" r="12" fill="#1a1a1a"/><circle cx="56" cy="-2" r="12" fill="#1a1a1a"/><text x="0" y="-40" font-size="10" text-anchor="middle" fill="#e8b830" font-family="sans-serif">OKE-OLA</text></g>` + fig({ x: 300, y: 300, h: 120, kind: 'tobi', c: '#1a120c' }) + ck.dots('#000', .08),
  op_hill: () => ck.sky('#a8cce8', '#f0e2c0', 'a') + ck.hill('#58783c', 230) + `<path d="M0 300Q120 250 210 160T260 70" stroke="#c8a878" stroke-width="10" fill="none"/>` + ck.tree(230, 92, .5, '#2e4a24') + ck.tree(290, 86, .45, '#2e4a24') + ck.house(262, 72, .75, '#2a221c', false) + ck.tree(320, 96, .55, '#335028') + fig({ x: 80, y: 300, h: 140, kind: 'tobi', c: '#120c08', flip: true }) + ck.dots('#000', .06),
  op_okada: () => ck.sky('#b8d4ea', '#f2e4c4', 'a') + ck.rect(0, 220, 400, 80, '#c09868') + `<g transform="translate(250 270)"><circle cx="-50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><path d="M-50 0L-10 -36H30L50 0M30 -36L40 -58H56" stroke="${INK}" stroke-width="7" fill="none"/><rect x="-24" y="-48" width="40" height="14" rx="4" fill="#b82a2a"/></g>` + fig({ x: 240, y: 236, h: 120, kind: 'man', pose: 'sit', c: '#1a120c' }) + fig({ x: 90, y: 300, h: 190, kind: 'tobi', pose: 'point', c: '#120c08', rim: '#fff2d0' }) + ck.dots('#000', .07),
  op_okgone: () => ck.sky('#b8d4ea', '#f2e4c4', 'a') + ck.rect(0, 220, 400, 80, '#c09868') + `<g opacity=".8" transform="translate(320 250) scale(.6)"><circle cx="-50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><path d="M-50 0L-10 -36H30L50 0" stroke="${INK}" stroke-width="7" fill="none"/></g><path d="M200 252h60M190 262h70M210 242h40" stroke="#e8d8b8" stroke-width="3"/>` + fig({ x: 80, y: 300, h: 190, kind: 'tobi', c: '#120c08', flip: true }) + ck.dots('#000', .07),
  op_market: () => ck.sky('#e8c890', '#c89858', 'a') + `<path d="M40 120L200 90L360 120V140H40Z" fill="#2a6a8a"/><path d="M40 140L200 110L360 140" stroke="#e8e0c8" stroke-width="4" fill="none"/>` + ck.rect(60, 200, 280, 50, '#6a4a2a') + `<g>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${90 + i * 42}" cy="196" r="16" fill="${['#c8321e', '#e8a020', '#3a8a30', '#c8321e', '#e8c040', '#a82018'][i]}"/>`).join('')}</g>` + fig({ x: 200, y: 200, h: 100, kind: 'gele', c: '#1a120c', rim: '#ffe8b8' }) + ck.rect(0, 250, 400, 50, '#8a6a48') + ck.dots('#000', .08),
  op_basira: () => ck.sky('#e8b878', '#a87040', 'a') + ck.glow(200, 140, 180, '#fff0c8', .4) + `<g transform="translate(200 175)"><ellipse cx="0" cy="0" rx="60" ry="74" fill="#5a3824"/><path d="M-74 -26Q-60 -104 0 -106Q64 -106 76 -26Q40 -70 0 -64Q-40 -70 -74 -26Z" fill="#7a2a6a"/><ellipse cx="-22" cy="-6" rx="9" ry="11" fill="#f4ecdc"/><ellipse cx="22" cy="-6" rx="9" ry="11" fill="#f4ecdc"/><circle cx="-22" cy="-5" r="4" fill="${INK}"/><circle cx="22" cy="-5" r="4" fill="${INK}"/><ellipse cx="0" cy="38" rx="12" ry="9" fill="${INK}"/></g>` + ck.vig(.5),
  op_point: () => ck.sky('#e8c890', '#c89858', 'a') + `<path d="M0 260Q200 236 400 262V300H0Z" fill="#8a6a48"/>` + ck.tree(330, 250, .8, '#3a5a2a') + fig({ x: 140, y: 300, h: 200, kind: 'gele', pose: 'point', c: '#1a120c', rim: '#ffe8b8' }) + ck.dots('#000', .08),
  op_lawal: () => ck.sky('#d8b878', '#8a6a3a', 'a') + ck.tree(200, 260, 2.2, '#2e4224') + ck.rect(0, 250, 400, 50, '#7a5a38') + `<rect x="120" y="226" width="90" height="12" fill="#4a3018"/>` + fig({ x: 160, y: 250, h: 120, kind: 'old', pose: 'sit', c: '#120c08', rim: '#ffe0a0' }) + fig({ x: 300, y: 300, h: 170, kind: 'tobi', c: '#120c08', flip: true }) + ck.dots('#000', .08),
  op_driver: () => ck.sky('#5a4a3a', '#2a1e14', 'a') + ck.glow(200, 160, 160, '#e8c890', .35) + `<g opacity=".9"><path d="M110 250l40 -70h100l40 70z" fill="#1a1a1e"/><rect x="140" y="170" width="120" height="30" rx="10" fill="#26262c"/><circle cx="150" cy="252" r="18" fill="#0a0a0c"/><circle cx="250" cy="252" r="18" fill="#0a0a0c"/></g>` + fig({ x: 200, y: 190, h: 120, kind: 'driver', c: '#3a2a20', rim: '#f0d8a8' }) + ck.vig(.7) + ck.dots('#000', .15),
  op_tale: () => ck.sky('#1a1424', '#0a0810', 'a') + ck.house(200, 230, 1.8, '#050407', true) + fig({ x: 120, y: 236, h: 130, kind: 'ojuju', c: '#050407' }) + ck.vig(.6),
  op_warn: () => ck.sky('#c89858', '#5a3a1e', 'a') + ck.glow(200, 140, 170, '#ffe0a0', .45) + `<g transform="translate(200 180)"><ellipse cx="0" cy="0" rx="58" ry="72" fill="#4a2e1e"/><path d="M-60 -36Q-58 -84 0 -86Q58 -84 60 -36Q30 -60 0 -58Q-30 -60 -60 -36Z" fill="#6a5a4a"/><path d="M-30 -8h18M12 -8h18" stroke="${INK}" stroke-width="5"/><path d="M-22 40q22 -8 44 0" stroke="${INK}" stroke-width="4" fill="none"/><path d="M-50 70q50 30 100 0" stroke="#e8e0d0" stroke-width="5" fill="none" opacity=".7"/></g>` + ck.vig(.6),
  op_climb: () => ck.sky('#f0a050', '#5a2a3a', 'a') + `<circle cx="70" cy="120" r="30" fill="#ffd27a"/>` + ck.hill('#3a2a2a', 250) + `<path d="M400 300Q300 250 260 200T200 90" stroke="#7a5a48" stroke-width="12" fill="none"/>` + ck.house(200, 82, .7, '#1a1214', false) + fig({ x: 300, y: 262, h: 70, kind: 'tobi', c: '#100a0a' }) + ck.dots('#000', .1),
  op_gate: () => ck.sky('#e86a3a', '#3a1424', 'a') + ck.house(200, 200, 1.4, '#1a0e10', false) + `<g stroke="#2a1a14" stroke-width="6">${Array.from({ length: 12 }, (_, i) => `<path d="M${40 + i * 30} 300V150"/>`).join('')}<path d="M30 160H380M30 230H380" stroke-width="8"/></g><path d="M60 300V150M60 180l-20 -40" stroke="#5a3a2a" stroke-width="3" opacity=".6"/>` + fig({ x: 200, y: 300, h: 180, kind: 'tobi', c: '#0a0606' }) + ck.dots('#000', .12),
  op_breaker: () => ck.sky('#2a2030', '#140e18', 'a') + ck.rect(0, 0, 400, 300, '#3a3a34') + `<rect x="130" y="60" width="140" height="170" rx="6" fill="#5a5a50"/><rect x="146" y="80" width="108" height="130" fill="#2a2a26"/>${[0, 1, 2].map(i => `<rect x="${160 + i * 30}" y="110" width="18" height="40" fill="#888"/><rect x="${163 + i * 30}" y="${i === 1 ? 112 : 130}" width="12" height="16" fill="#c8321e"/>`).join('')}<text x="200" y="196" font-size="11" text-anchor="middle" fill="#e8c040" font-family="sans-serif">DANGER · NEPA</text>` + `<g transform="translate(320 300) scale(1.4)" fill="#0e0a08"><path d="M-30 0L-24 -60L-10 -70L0 -40L10 -70L24 -60L30 0Z"/></g>` + ck.dots('#000', .12),
  op_goats: () => ck.sky('#2a1a2a', '#0e0a10', 'a') + `<g fill="#0c140c">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50 - 20} 300Q${i * 50} ${170 + (i % 3) * 20} ${i * 50 + 30} 300Z"/>`).join('')}</g><ellipse cx="190" cy="210" rx="5" ry="4" fill="#f0e8c0"/><ellipse cx="206" cy="210" rx="5" ry="4" fill="#f0e8c0"/>` + fig({ x: 60, y: 300, h: 200, kind: 'tobi', c: '#050404', flip: true }) + ck.vig(.7),
  op_door: () => ck.sky('#3a3028', '#1a140e', 'a') + `<rect x="100" y="20" width="200" height="280" fill="#4a3220"/><rect x="118" y="40" width="164" height="110" fill="#5a3e28"/><rect x="118" y="164" width="164" height="120" fill="#5a3e28"/><circle cx="270" cy="160" r="8" fill="#c8a040"/>` + `<g stroke="#ffe8a0" stroke-width="4"><path d="M86 60l-30 -20M84 140h-40M86 220l-30 20M314 60l30 -20M316 140h40"/></g>` + ck.dots('#000', .1),
  op_glass: () => ck.sky('#0e1420', '#04060a', 'a') + `<rect x="60" y="20" width="280" height="280" fill="#2a2018"/><rect x="90" y="40" width="220" height="200" fill="#b8c8d0"/><g opacity=".85">${Array.from({ length: 40 }, (_, i) => `<circle cx="${100 + (i * 37) % 200}" cy="${50 + (i * 53) % 180}" r="${6 + i % 5}" fill="#d8e4ea"/>`).join('')}</g>` + ck.glow(200, 70, 90, '#ffffff', .6) + fig({ x: 210, y: 220, h: 110, kind: 'ojuju', c: '#1a1e24' }) + ck.vig(.5),
  op_name: () => ck.rect(0, 0, 400, 300, '#050304') + ck.glow(200, 150, 170, '#8a1010', .45) + `<g transform="translate(200 150)">
    <g stroke="#6e5a2a" stroke-width="2.4" opacity=".85">${Array.from({ length: 30 }, (_, i) => `<path d="M${-90 + i * 6} ${-60 + Math.abs(i - 15) * 2}l${(i % 3) - 1} ${170 - Math.abs(i - 15) * 3}"/>`).join('')}</g>
    <path d="M-46 -84Q0 -110 46 -84L50 30Q44 92 0 104Q-44 92 -50 30Z" fill="#1a0f0a"/>
    <path d="M-34 -70Q0 -84 34 -70" stroke="#d8d0c0" stroke-width="3" fill="none"/><path d="M-30 -56Q0 -66 30 -56" stroke="#d8d0c0" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M-36 -24Q-22 -40 -8 -24Q-22 -8 -36 -24Z" fill="#000"/><path d="M8 -24Q22 -40 36 -24Q22 -8 8 -24Z" fill="#000"/>
    <circle cx="-21" cy="-24" r="4" fill="#f4f0e6"/><circle cx="22" cy="-24" r="4" fill="#f4f0e6"/>
    <path d="M-4 -14L0 18L4 -14" fill="#2a1a10"/><path d="M-30 -6v40M30 -6v40" stroke="#d8d0c0" stroke-width="2" opacity=".6"/>
    <path d="M-26 42Q0 30 26 42Q22 70 0 74Q-22 70 -26 42Z" fill="#000"/>
    <path d="M-20 44l4 9l4 -9l4 9l4 -9l4 9l4 -9l4 9l4 -9" stroke="#e8e2d4" stroke-width="2.2" fill="none"/>
  </g>` + ck.vig(.85),
  op_run: () => ck.sky('#2a2018', '#100c08', 'a') + `<path d="M0 300L150 140H250L400 300Z" fill="#5a4630"/><path d="M0 0L150 140V200L0 300Z" fill="#3a2a1c"/><path d="M400 0L250 140V200L400 300Z" fill="#3a2a1c"/><rect x="150" y="60" width="100" height="80" fill="#1a120c"/>${[0, 1, 2].map(i => `<rect x="${40 + i * 30}" y="${70 + i * 18}" width="20" height="26" fill="#c8a868" opacity=".7"/><rect x="${340 - i * 30}" y="${70 + i * 18}" width="20" height="26" fill="#c8a868" opacity=".7"/>`).join('')}` + fig({ x: 200, y: 296, h: 170, kind: 'tobi', pose: 'run', c: '#0a0705' }) + ck.dots('#000', .12),
  op_slam: () => ck.sky('#1a140e', '#0a0806', 'a') + [0, 1, 2, 3].map(i => `<rect x="${30 + i * 92}" y="${60 + i * 12}" width="${70 - i * 8}" height="${200 - i * 24}" fill="#3a2a1c" stroke="#ffe8a0" stroke-width="${3 - i * .5}"/>`).join('') + ck.dots('#000', .15),
  op_breath: () => ck.sky('#1a1a24', '#06060a', 'a') + `<rect x="250" y="60" width="90" height="140" fill="#3a3020"/>` + fig({ x: 170, y: 300, h: 220, kind: 'tobi', pose: 'kneel', c: '#050404', rim: '#8aa0c0' }) + ck.vig(.7),

  // ---- memories, 1975 (drawn low, warm, slightly soft)
  f1_window: () => ck.sky('#2a2440', '#151020', 'a') + `<rect x="230" y="40" width="130" height="150" fill="#3a4a70"/><circle cx="300" cy="90" r="18" fill="#f4ecd0"/>` + ck.glow(120, 160, 140, '#ffd9a0', .45) + fig({ x: 150, y: 300, h: 210, kind: 'gele', c: '#1a120c', rim: '#ffd9a0' }) + fig({ x: 168, y: 232, h: 70, kind: 'child', c: '#2a1a12' }),
  f1_papa: () => ck.sky('#3a2a20', '#1a120c', 'a') + `<rect x="120" y="20" width="160" height="280" fill="#140e0a"/>` + ck.glow(200, 160, 160, '#ffd9a0', .3) + fig({ x: 200, y: 300, h: 240, kind: 'agbada', c: '#e8e0cc', rim: '#ffffff' }) + `<path d="M170 296q10 -6 22 0M208 296q10 -6 22 0" stroke="#5a3a1a" stroke-width="7"/>`,
  f1_shoes: () => ck.sky('#2a2018', '#120c08', 'a') + ck.rect(0, 200, 400, 100, '#5a4630') + `<g transform="translate(200 230)"><path d="M-70 0q0 -24 30 -24h30q14 0 16 18v8z" fill="#2a1a10"/><path d="M10 0q0 -24 30 -24h30q14 0 16 18v8z" fill="#2a1a10"/><path d="M-80 4q40 8 80 0q40 8 100 0" stroke="#6a4a24" stroke-width="10" fill="none"/></g>` + ck.glow(200, 230, 120, '#ffd9a0', .3),
  f2_school: () => ck.sky('#e8d0a0', '#a88050', 'a') + fig({ x: 110, y: 300, h: 230, kind: 'agbada', pose: 'point', c: '#1a120c', rim: '#fff0d0' }) + fig({ x: 300, y: 300, h: 210, kind: 'gele', c: '#1a120c', rim: '#fff0d0', flip: true }) + fig({ x: 205, y: 300, h: 80, kind: 'child', c: '#2a1a12' }),
  f2_money: () => ck.sky('#c8a070', '#6a4a2a', 'a') + `<g transform="translate(200 190)"><ellipse cx="0" cy="0" rx="58" ry="72" fill="#4a2e1e"/><path d="M-74 -26Q-60 -104 0 -106Q64 -106 76 -26Q40 -70 0 -64Q-40 -70 -74 -26Z" fill="#3f7a50"/><path d="M-30 -14l18 6M30 -14l-18 6" stroke="${INK}" stroke-width="5"/><path d="M-20 40h40" stroke="${INK}" stroke-width="5"/></g>` + ck.vig(.5),
  f2_cold: () => ck.sky('#3a2a1a', '#120c08', 'a') + `<g transform="translate(200 190)"><ellipse cx="0" cy="0" rx="64" ry="78" fill="#3a2418"/><path d="M-62 -40Q-50 -90 10 -90L64 -60Q60 -40 56 -30Q20 -54 -62 -40Z" fill="#2a4a7a"/><path d="M-32 -6h20M14 -6h20" stroke="#f0e8d8" stroke-width="3"/><path d="M-26 42h52" stroke="${INK}" stroke-width="6"/></g>` + ck.vig(.75),
  f3_backdoor: () => ck.sky('#1a1830', '#0a0818', 'a') + `<rect x="40" y="30" width="150" height="270" fill="#ffcf8a"/>` + fig({ x: 110, y: 300, h: 210, kind: 'gele', pose: 'carry', c: '#1a120c' }) + fig({ x: 270, y: 300, h: 220, kind: 'driver', c: '#120c08', rim: '#ffcf8a', flip: true }),
  f3_whisper: () => ck.sky('#2a2238', '#120e1c', 'a') + ck.glow(120, 140, 150, '#ffcf8a', .35) + `<g transform="translate(220 180)"><ellipse cx="0" cy="0" rx="60" ry="76" fill="#4a2e1e"/><path d="M-64 -30Q-64 -64 0 -66Q64 -64 64 -30Z" fill="#2c2a30"/><path d="M-70 -30H70V-22H-70Z" fill="#1a181c"/><path d="M-28 0h18M12 0h18" stroke="${INK}" stroke-width="5"/><path d="M-12 40q12 4 24 0" stroke="${INK}" stroke-width="4" fill="none"/></g>` + ck.vig(.6),
  f3_car: () => ck.sky('#e8d0a0', '#b89060', 'a') + ck.rect(0, 220, 400, 80, '#8a6a48') + `<g transform="translate(150 236)"><rect x="-36" y="-22" width="72" height="20" rx="6" fill="#c8321e"/><rect x="-18" y="-36" width="36" height="16" rx="4" fill="#a82818"/><circle cx="-22" cy="0" r="8" fill="${INK}"/><circle cx="22" cy="0" r="8" fill="${INK}"/></g>` + fig({ x: 90, y: 300, h: 110, kind: 'child', pose: 'run', c: '#2a1a12' }) + fig({ x: 300, y: 300, h: 220, kind: 'driver', pose: 'point', c: '#120c08', rim: '#fff0d0', flip: true }),
  f4_gap: () => ck.rect(0, 0, 400, 300, '#050302') + `<rect x="170" y="0" width="60" height="300" fill="#3a2a18"/>` + ck.glow(200, 150, 90, '#ffd9a0', .5) + fig({ x: 190, y: 300, h: 220, kind: 'driver', pose: 'point', c: '#120c08', rim: '#ffd9a0' }) + `<rect x="0" y="0" width="170" height="300" fill="#050302"/><rect x="230" y="0" width="170" height="300" fill="#050302"/>`,
  f4_papa: () => ck.sky('#3a2a18', '#140c06', 'a') + `<rect x="0" y="210" width="400" height="90" fill="#2a1a0e"/>` + fig({ x: 200, y: 300, h: 250, kind: 'agbada', c: '#0a0604', rim: '#ffd9a0' }) + ck.vig(.6),
  f4_calm: () => ck.rect(0, 0, 400, 300, '#0a0604') + `<g transform="translate(200 160)"><ellipse cx="0" cy="0" rx="70" ry="86" fill="#2a1a10"/><path d="M-70 -40Q-60 -96 10 -96L72 -66Q68 -46 62 -34Q20 -60 -70 -40Z" fill="#1a2a4a"/><path d="M-34 -4h22M14 -4h22" stroke="#e8e0d0" stroke-width="2"/></g>` + ck.vig(.9),
  f5_stairs: () => ck.sky('#14182a', '#06080e', 'a') + `<g fill="#2a2a3a">${Array.from({ length: 8 }, (_, i) => `<rect x="${40 + i * 40}" y="${260 - i * 26}" width="400" height="26"/>`).join('')}</g>` + fig({ x: 80, y: 260, h: 90, kind: 'child', c: '#1a1424', rim: '#8aa0d0' }),
  f5_bricks: () => ck.sky('#1a1420', '#08060a', 'a') + `<g fill="#3a3040">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 50}" y="${280 - i * 22}" width="400" height="22"/>`).join('')}</g>` + fig({ x: 230, y: 200, h: 220, kind: 'agbada', pose: 'carry', c: '#0a0808', rim: '#c8a070' }) + `<g transform="translate(262 120)">${[0, 1, 2].map(i => `<rect x="${i * 4}" y="${-i * 14}" width="40" height="12" fill="#8a3a2a" stroke="${INK}"/>`).join('')}</g>` + `<rect x="150" y="180" width="40" height="30" fill="#c8c0b0"/><text x="170" y="200" font-size="9" text-anchor="middle" font-family="sans-serif" fill="#333">CEMENT</text>`,
  f6_pray: () => ck.sky('#2a1a1a', '#0e0808', 'a') + ck.glow(200, 120, 140, '#ffcf6a', .5) + `<rect x="170" y="40" width="60" height="80" fill="#6a1a1a"/><path d="M200 60c-10 -12 -26 0 -14 14l14 14 14 -14c12 -14 -4 -26 -14 -14z" fill="#e83a2a"/>` + fig({ x: 200, y: 300, h: 200, kind: 'gele', pose: 'kneel', c: '#1a0e0a', rim: '#ffcf6a' }) + `<rect x="160" y="140" width="6" height="40" fill="#f0e8d0"/><rect x="234" y="140" width="6" height="40" fill="#f0e8d0"/>`,
  f6_scream: () => ck.rect(0, 0, 400, 300, '#08060a') + `<rect x="150" y="0" width="100" height="120" fill="#ffd27a" opacity=".8"/>` + fig({ x: 200, y: 120, h: 110, kind: 'ojuju', c: '#050305' }) + `<g stroke="#ffd27a" stroke-width="3" opacity=".7"><path d="M100 160l-40 -20M110 200h-60M300 160l40 -20M290 200h60"/></g>`,
  f6_run: () => ck.sky('#1a2030', '#06080c', 'a') + ck.rain(.6) + `<path d="M0 300Q200 180 400 120V300Z" fill="#141810"/>` + ck.house(330, 120, .6, '#0a0a0a', true) + fig({ x: 140, y: 290, h: 180, kind: 'gele', pose: 'run', c: '#0a0806', rim: '#a0b0d0', flip: true }) + fig({ x: 150, y: 210, h: 60, kind: 'child', c: '#14100c' }),
  f7_flat: () => ck.sky('#3a3040', '#1a1420', 'a') + `<rect x="40" y="200" width="260" height="70" fill="#6a5a7a"/><rect x="40" y="186" width="70" height="20" rx="6" fill="#e8e0d0"/>` + ck.glow(330, 80, 90, '#ffe8b0', .5) + fig({ x: 220, y: 300, h: 200, kind: 'gele', c: '#1a120c', rim: '#ffe8b0', flip: true }) + `<circle cx="80" cy="190" r="14" fill="#2a1a12"/>`,
  f7_promise: () => ck.sky('#4a3a4a', '#1a1220', 'a') + `<g transform="translate(200 170)"><path d="M-40 60q-10 -40 20 -50l40 -4q30 8 20 54z" fill="#2a1a12"/><path d="M10 10q30 -10 50 10l-20 40z" fill="#3a2418"/></g>` + ck.glow(200, 170, 120, '#ffe8b0', .3) + ck.vig(.6),

  // ---- the ending
  e_chimney: () => ck.sky('#1a2040', '#3a3050', 'a') + `<rect x="150" y="40" width="100" height="260" fill="#6a3a2a"/><g stroke="#3a1a10" stroke-width="2">${Array.from({ length: 12 }, (_, i) => `<path d="M150 ${60 + i * 20}H250M${i % 2 ? 175 : 200} ${40 + i * 20}v20"/>`).join('')}</g><rect x="170" y="200" width="60" height="80" fill="#0a0606"/><path d="M178 270q22 -40 44 0z" fill="#8a6a3a"/>` + fig({ x: 90, y: 300, h: 200, kind: 'tobi', pose: 'kneel', c: '#0a0808', rim: '#8aa0d0' }),
  e_roar: () => ck.sky('#0a0c18', '#1a1424', 'a') + fig({ x: 220, y: 330, h: 330, kind: 'ojuju', c: '#050305' }) + `<g stroke="#e8e0d0" stroke-width="3" opacity=".6"><path d="M60 100l-40 -10M50 150h-40M340 100l40 -10M350 150h40"/></g>` + ck.vig(.5),
  e_name: () => ck.sky('#1a1a30', '#2a2238', 'a') + `<rect x="250" y="0" width="100" height="300" fill="#5a3226"/>` + fig({ x: 140, y: 300, h: 230, kind: 'tobi', pose: 'point', c: '#0a0808', rim: '#c8d0f0' }) + `<path d="M270 300v-60q30 -20 60 0v60z" fill="#f0ece0"/>`,
  e_sorry: () => ck.sky('#2a2a40', '#4a3a48', 'a') + fig({ x: 200, y: 300, h: 220, kind: 'tobi', pose: 'kneel', c: '#0a0808', rim: '#f0c8a0' }) + ck.vig(.5),
  e_face: () => ck.sky('#e8a870', '#5a4a6a', 'a') + ck.glow(200, 140, 200, '#fff0d0', .7) + `<g transform="translate(200 170)"><ellipse cx="0" cy="0" rx="62" ry="78" fill="#4a2e1e"/><path d="M-64 -30Q-64 -66 0 -68Q64 -66 64 -30Z" fill="#2c2a30"/><path d="M-70 -30H70V-22H-70Z" fill="#1a181c"/><path d="M-28 -2q9 -6 18 0M12 -2q9 -6 18 0" stroke="${INK}" stroke-width="4" fill="none"/><path d="M-22 34q22 16 44 0" stroke="${INK}" stroke-width="4" fill="none"/></g><g stroke="#8a6a3a" stroke-width="2" opacity=".5">${Array.from({ length: 14 }, (_, i) => `<path d="M${130 + i * 10} 250l${(i % 3) - 1} 50"/>`).join('')}</g>`,
  e_dawn: () => ck.sky('#f0b070', '#6a7aa8', 'a') + `<circle cx="300" cy="230" r="44" fill="#ffe0a0"/>` + ck.hill('#3a4a3a', 260) + `<g fill="#2a3428">${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 30}" y="${250 + (i % 3) * 6}" width="20" height="20"/>`).join('')}</g>` + ck.dots('#000', .05),
  e_okada: () => ck.sky('#bcd8ee', '#f4e8cc', 'a') + ck.hill('#6a8a4a', 230) + `<path d="M0 300Q120 250 210 160T260 70" stroke="#c8a878" stroke-width="10" fill="none"/>` + `<g transform="translate(150 240) scale(.7)"><circle cx="-50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="50" cy="0" r="22" fill="none" stroke="${INK}" stroke-width="7"/><path d="M-50 0L-10 -36H30L50 0M30 -36L40 -58H56" stroke="${INK}" stroke-width="7" fill="none"/></g>` + fig({ x: 146, y: 214, h: 84, kind: 'man', pose: 'sit', c: '#1a120c' }) + ck.dots('#000', .05),
  e_basira: () => ck.sky('#f0d098', '#d0a060', 'a') + `<path d="M40 120L200 90L360 120V140H40Z" fill="#2a6a8a"/>` + ck.rect(60, 200, 280, 50, '#6a4a2a') + fig({ x: 240, y: 200, h: 100, kind: 'gele', c: '#1a120c', rim: '#fff0c8' }) + fig({ x: 110, y: 300, h: 150, kind: 'man', c: '#1a120c' }) + ck.dots('#000', .06),
  e_house: () => ck.sky('#bcd8ee', '#f4ecd4', 'a') + ck.hill('#7a9a5a', 240) + ck.house(200, 200, 1.6, '#8a7a6a', false) + `<g fill="#4a6a34">${Array.from({ length: 16 }, (_, i) => `<circle cx="${i * 26}" cy="${230 + (i % 4) * 8}" r="${14 + (i % 3) * 6}"/>`).join('')}</g>` + ck.dots('#000', .04),
  e_phone: () => ck.sky('#e8d8b0', '#a89070', 'a') + `<rect x="60" y="40" width="120" height="240" fill="#2a6a3a"/><text x="120" y="70" font-size="14" text-anchor="middle" font-family="sans-serif" fill="#f0e8c0">NITEL</text><rect x="80" y="90" width="80" height="60" fill="#c8d8c0"/>` + fig({ x: 260, y: 300, h: 220, kind: 'tobi', pose: 'phone', c: '#1a120c', rim: '#fff0d0' }) + ck.dots('#000', .06),
  e_mama: () => ck.sky('#9aa8c0', '#3a4058', 'a') + ck.rain(.3) + `<rect x="40" y="40" width="160" height="160" fill="#6a7a98"/>` + fig({ x: 280, y: 300, h: 220, kind: 'gele', pose: 'phone', c: '#1a120c', rim: '#e0e8ff', flip: true }) + ck.dots('#000', .06),
  e_end: () => ck.rect(0, 0, 400, 300, '#07050a') + ck.house(200, 230, 1.6, '#16121c', false) + ck.vig(.5)
};

/* ---------- the strips ---------- */
/* panel: { art, cap, say: [{ who, t, v, x, y }], sfx, snd } — x,y place the balloon (percent of the panel) */
const STRIPS = {
  opening: [
    { panels: [
      { art: 'op_lagos', cap: 'Lagos. Monday, 13 October 1997.', sfx: 'KRRRING', snd: 'phone' },
      { art: 'op_desk', say: [{ who: 'Engr. Femi (phone)', t: 'Tobi, good morning. The Oke-Ọla mast project: the client wants an engineer on site tomorrow, and you’re the only one not on leave.', v: 'V01', x: 52, y: 8 }, { who: 'Tobi', t: 'Oke-Ọla? …Okay, sir. I’ll go.', v: 'V02', x: 6, y: 62 }] }
    ] },
    { panels: [
      { art: 'op_promise', past: true, cap: 'A long time ago.', say: [{ who: 'Mama', t: 'Tobenna. My child. Never go back to that house. Promise me.', v: 'V03', x: 8, y: 66 }] },
      { art: 'op_pack', say: [{ who: 'Tobi', t: 'It’s just a job, Mama. In and out.', v: 'V04', x: 40, y: 10 }] }
    ] },
    { panels: [
      { art: 'op_bus', cap: 'Oke-Ọla. Tuesday, 14 October. Morning.', snd: 'bus' },
      { art: 'op_hill', say: [{ who: 'Tobi', t: 'So that’s it. The house on the hill.', v: 'V05', x: 8, y: 10 }] }
    ] },
    { panels: [
      { art: 'op_okada', say: [{ who: 'Tobi', t: 'Sir, how much to the top of the hill? The big house.', v: 'V06', x: 4, y: 6 }, { who: 'Okada rider', t: 'Which hill? Ah, that one? Brother, I don’t go there. Not even for a thousand naira.', v: 'V07', x: 50, y: 6 }] },
      { art: 'op_okgone', say: [{ who: 'Tobi', t: 'It’s just a road.', v: 'V08', x: 6, y: 10 }, { who: 'Okada rider', t: 'It’s a road, but not every road should be followed. Find someone else.', v: 'V09', x: 46, y: 46 }], snd: 'engine' }
    ] },
    { panels: [
      { art: 'op_market', cap: 'The market, at the foot of the hill.' },
      { art: 'op_basira', say: [{ who: 'Iya Basira', t: 'Eh! This face… are you Adaeze’s child? The little boy she carried away that night?', v: 'V10', x: 6, y: 6 }, { who: 'Tobi', t: 'You knew my mother?', v: 'V11', x: 56, y: 72 }] },
      { art: 'op_point', say: [{ who: 'Iya Basira', t: 'Who didn’t know her? Sweet woman. My child, please, don’t go up there. Go and ask Baba Lawal. He is older than all of us.', v: 'V12', x: 40, y: 6 }] }
    ] },
    { panels: [
      { art: 'op_lawal', say: [{ who: 'Baba Lawal', t: 'So the Chief’s son has come back. Sit. Let me tell you why nobody climbs that hill.', v: 'V15', x: 4, y: 6 }] },
      { art: 'op_driver', past: true, say: [{ who: 'Baba Lawal', t: 'Your father had a driver. A Calabar boy. Effiong. Good boy. One day he was there. The next day, nobody saw him again.', v: 'V16', x: 4, y: 6 }] }
    ] },
    { panels: [
      { art: 'op_tale', say: [{ who: 'Baba Lawal', t: 'After that, something began to walk that house at night. Tall. Long fingers. Raffia, like the masquerades from his side. The children named it Ojuju Calabar.', v: 'V17', x: 4, y: 6 }] },
      { art: 'op_warn', say: [{ who: 'Baba Lawal', t: 'One night it came for your father. He did not die. He never woke up. Twenty-two years tonight.', v: 'V18', x: 4, y: 6 }, { who: 'Baba Lawal', t: 'If you go, go before dark. And whatever calls you, my son, do not answer.', v: 'V19', x: 30, y: 64 }] }
    ] },
    { panels: [
      { art: 'op_climb', cap: 'The hill road. Afternoon becomes evening.' },
      { art: 'op_gate', say: [{ who: 'Tobi', t: 'Before dark. Right. Should have left earlier.', v: 'V20', x: 6, y: 8 }] }
    ] },
    { panels: [
      { art: 'op_breaker', sfx: 'KLAK', snd: 'clack', say: [{ who: 'Tobi', t: 'Breaker… let’s see if NEPA remembers this place.', v: 'V21', x: 4, y: 6 }] },
      { art: 'op_goats', say: [{ who: 'Tobi', t: 'Hello? …Is somebody there?', v: 'V22', x: 40, y: 8 }, { who: 'Tobi', t: 'Just goats. It’s just goats.', v: 'V23', x: 40, y: 70 }] }
    ] },
    { panels: [
      { art: 'op_door', sfx: 'BLAM', snd: 'slam', say: [{ who: 'Tobi', t: 'No, no, no. Hey! Open this door!', v: 'V24', x: 30, y: 6 }] },
      { art: 'op_glass', say: [{ who: 'Tobi', t: 'Who is that? …Hello? I can see you!', v: 'V25', x: 4, y: 74 }] },
      { art: 'op_name', snd: 'whisper', say: [{ who: 'ojuju', t: 'Tobiii…', v: 'V26', x: 30, y: 74 }] }
    ] },
    { panels: [
      { art: 'op_run', snd: 'steps', say: [{ who: 'Tobi', t: 'Okay. Okay. Move. MOVE.', v: 'V27', x: 4, y: 6 }] },
      { art: 'op_slam', sfx: 'BLAM · BLAM · BLAM', snd: 'slams' },
      { art: 'op_breath', say: [{ who: 'Tobi', t: 'Mama… I’m sorry.', v: 'V28', x: 46, y: 12 }] }
    ] }
  ],
  F1: [{ past: true, panels: [
    { art: 'f1_window', cap: 'October 1975. You are four.', say: [{ who: 'Mama', t: 'My child, sleep now, sleep now… Mama is here.', v: 'F1-1', x: 40, y: 6 }] },
    { art: 'f1_papa', say: [{ who: 'Papa', t: 'Adaeze! Is my son still awake? Tobi! My son! Come to Daddy.', v: 'F1-2', x: 4, y: 6 }] },
    { art: 'f1_shoes', say: [{ who: 'Mama', t: 'Olumide, it’s past midnight. And your shoes. Where were you?', v: 'F1-3', x: 4, y: 6 }, { who: 'Papa', t: 'Business, my dear. Business does not sleep.', v: 'F1-4', x: 44, y: 66 }] }
  ] }],
  F2: [{ past: true, panels: [
    { art: 'f2_school', say: [{ who: 'Papa', t: 'My son will go to school in London. He will never suffer the way I suffered.', v: 'F2-1', x: 4, y: 6 }] },
    { art: 'f2_money', say: [{ who: 'Mama', t: 'With what money, Olumide? Every month there is more. More cars. More men at the gate at night. Where is it coming from?', v: 'F2-2', x: 4, y: 6 }] },
    { art: 'f2_cold', say: [{ who: 'Papa', t: 'You want to sleep in a house like this? Then stop asking questions you don’t want the answer to.', v: 'F2-3', x: 4, y: 6 }, { who: 'Mama', t: 'My God… Please, just tell me the truth.', v: 'F2-4', x: 40, y: 72 }] }
  ] }],
  F3: [{ past: true, panels: [
    { art: 'f3_backdoor', say: [{ who: 'Effiong', t: 'Good evening, Madam. Thank you, Madam. God bless you.', v: 'F3-1', x: 46, y: 6 }, { who: 'Mama', t: 'Effiong, you look like you haven’t slept in days. Are you all right? What is it?', v: 'F3-2', x: 4, y: 64 }] },
    { art: 'f3_whisper', say: [{ who: 'Effiong', t: 'Madam… I cannot say. But if I were you, I would take the small boy and go to your people for some time. Please.', v: 'F3-3', x: 4, y: 6 }] },
    { art: 'f3_car', say: [{ who: 'Small Tobi', t: 'Uncle Effiong! Vroom vroom!', v: 'F3-4', x: 4, y: 6 }, { who: 'Effiong', t: 'Ah, my small driver! Drive well!', v: 'F3-5', x: 46, y: 6 }] }
  ] }],
  F4: [{ past: true, panels: [
    { art: 'f4_gap', cap: 'Through the gap in Papa’s office door.', say: [{ who: 'Effiong', t: 'Sir, those families lost their land. Somebody died on that site. I will not keep quiet again.', v: 'F4-1', x: 52, y: 20 }] },
    { art: 'f4_papa', say: [{ who: 'Papa', t: 'You will keep quiet. You eat from this house. You drive my car. You will keep quiet.', v: 'F4-2', x: 4, y: 6 }, { who: 'Effiong', t: 'Then sack me. But I will talk.', v: 'F4-3', x: 50, y: 70 }] },
    { art: 'f4_calm', say: [{ who: 'Papa', t: 'Nobody is going anywhere, Effiong.', v: 'F4-4', x: 20, y: 74 }] }
  ] }],
  F5: [{ past: true, panels: [
    { art: 'f5_stairs', cap: 'Late. Very late.', say: [{ who: 'Small Tobi', t: 'Daddy? What are you building?', v: 'F5-1', x: 30, y: 10 }] },
    { art: 'f5_bricks', say: [{ who: 'Papa', t: 'Ah, Tobi. It’s nothing. Daddy is fixing the chimney. Everything is fine. Go back to bed.', v: 'F5-2', x: 4, y: 6 }] }
  ] }],
  F6: [{ past: true, panels: [
    { art: 'f6_pray', cap: '14 October 1975. Seven twenty in the evening.', say: [{ who: 'Mama', t: 'Holy Mary, Mother of God… God, protect my child, protect my child…', v: 'F6-1', x: 4, y: 64 }] },
    { art: 'f6_scream', snd: 'shriek', say: [{ who: 'Papa (upstairs)', t: 'Get away from me! Effiong, I’m sorry! I’m sorry!', v: 'F6-2', x: 4, y: 64 }] },
    { art: 'f6_run', snd: 'rain', say: [{ who: 'Mama', t: 'Tobenna! Come, come, come! Don’t look back. Don’t look back!', v: 'F6-3', x: 4, y: 6 }, { who: 'Small Tobi', t: 'Mummy, Daddy is shouting…', v: 'F6-4', x: 50, y: 70 }] }
  ] }],
  F7: [{ past: true, panels: [
    { art: 'f7_flat', cap: 'Surulere, Lagos. 1981. You are ten.', say: [{ who: 'Mama', t: 'Promise me, Tobenna. Whatever happens, you will never go back to that house.', v: 'F7-1', x: 40, y: 6 }, { who: 'Tobi (10)', t: 'Why, Mummy?', v: 'F7-2', x: 4, y: 70 }] },
    { art: 'f7_promise', say: [{ who: 'Mama', t: 'Because some houses keep what they take. Promise me.', v: 'F7-3', x: 4, y: 6 }, { who: 'Tobi (10)', t: 'I promise.', v: 'F7-4', x: 56, y: 74 }] }
  ] }],
  release: [
    { panels: [
      { art: 'e_roar', snd: 'shriek', say: [{ who: 'ojuju', t: 'TOBIII!', v: 'E02', x: 30, y: 70 }] },
      { art: 'e_name', say: [{ who: 'Tobi', t: 'Effiong Etim! Your name is Effiong Etim! I know your name!', v: 'E03', x: 4, y: 6 }] },
      { art: 'e_sorry', say: [{ who: 'Tobi', t: 'I’m sorry for what my father did to you. I’m so sorry. You can go home now.', v: 'E04', x: 4, y: 6 }] }
    ] },
    { panels: [
      { art: 'e_face', cap: 'The raffia falls away.', say: [{ who: 'Effiong', t: 'Small driver… you have grown. Thank you, Tobi.', v: 'E05', x: 30, y: 72 }] },
      { art: 'e_dawn', cap: 'The sun comes up over Oke-Ọla.', snd: 'rooster' }
    ] },
    { panels: [
      { art: 'e_okada', cap: 'Morning.', say: [{ who: 'Okada rider', t: 'So! Let me go and see this house everybody is afraid of.', v: 'E06', x: 30, y: 6 }] },
      { art: 'e_basira', say: [{ who: 'Iya Basira', t: 'They say the house is quiet now. Thank God.', v: 'E07', x: 40, y: 6 }] },
      { art: 'e_house', cap: 'An abandoned house on a hill. Nothing more.' }
    ] }
  ],
  trueEnd: [
    { panels: [
      { art: 'e_phone', cap: 'The NITEL office in Oke-Ọla. A call to London.', say: [{ who: 'Mama (phone)', t: 'Hello? Tobenna? …You went there. …And?', v: 'E08', x: 4, y: 6 }] },
      { art: 'e_phone', say: [{ who: 'Tobi', t: 'It’s finished, Mama. He’s free. We all are.', v: 'E09', x: 4, y: 6 }] },
      { art: 'e_mama', say: [{ who: 'Mama (phone)', t: 'Tobenna Oluwaseun Adeleke… my son.', v: 'E10', x: 4, y: 6 }] }
    ] },
    { panels: [{ art: 'e_end', cap: 'Effiong Etim, 1951–1975. Buried at Ikot Ekpene, among his people.' }] }
  ],
  plainEnd: [
    { panels: [{ art: 'e_end', cap: 'There are pages of this house you never found. Some of what it kept, it is keeping still.' }] }
  ]
};

/* ---------- the reader ---------- */
const comicEl = (() => {
  const el = document.createElement('section'); el.id = 'comic'; el.setAttribute('aria-live', 'polite');
  el.innerHTML = '<div class="cpage"></div><button class="cskip" type="button">Skip</button><div class="cnext" aria-hidden="true">Tap to continue</div>';
  document.body.appendChild(el); return el;
})();
const SNDS = { phone: () => Snd.phone(), slam: () => Snd.slam(), slams: () => { [0, 350, 700, 1100].forEach(t => setTimeout(() => Snd.slam(), t)); }, whisper: () => Snd.whisper(), shriek: () => Snd.shriek(), clack: () => Snd.click(), steps: () => { for (let i = 0; i < 6; i++) setTimeout(() => Snd.step(), i * 160); }, rain: () => Snd.rain(), rooster: () => Snd.rooster(), engine: () => Snd.okada(), bus: () => Snd.bus() };
let artN = 0;
/* every inline drawing gets its own gradient/pattern ids, or panels on one page would borrow each other's */
const uniqIds = svg => { const n = ++artN; return svg.replace(/id="([^"]+)"/g, (m, id) => `id="${id}_${n}"`).replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${id}_${n})`); };
function panelHtml(p, past) {
  const img = (typeof COMIC_IMG !== 'undefined' && COMIC_IMG[p.art]) ? `<img src="${COMIC_IMG[p.art]}" alt="">` : `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${uniqIds((COMIC_ART[p.art] || COMIC_ART.e_end)())}</svg>`;
  const balloons = (p.say || []).map((b, i) => `<div class="cbal${b.who === 'ojuju' ? ' ojuju' : ''}" data-x="${b.x}" data-y="${b.y}" style="left:${b.x}%;top:${b.y}%;--d:${(.35 + i * .9).toFixed(2)}s">${b.who === 'ojuju' ? '' : `<b>${esc(b.who)}</b>`}${esc(b.t)}</div>`).join('');
  return `<figure class="cpanel${p.past || past ? ' past' : ''}" data-art="${p.art}">${img}${p.cap ? `<figcaption class="ccap">${esc(p.cap)}</figcaption>` : ''}${p.sfx ? `<div class="csfx">${esc(p.sfx)}</div>` : ''}${balloons}</figure>`;
}
/* on narrow screens two balloons can land on each other: keep each inside its panel and push later ones clear */
function fitBalloons() {
  $$('.cpanel', comicEl).forEach(fig => {
    const W = fig.clientWidth, H = fig.clientHeight, placed = [];
    $$('.cbal', fig).forEach(el => {
      el.style.left = el.dataset.x + '%'; el.style.top = el.dataset.y + '%';
      let x = el.offsetLeft, y = el.offsetTop; const w = el.offsetWidth, h = el.offsetHeight;
      x = Math.max(4, Math.min(x, W - w - 4)); y = Math.max(4, Math.min(y, H - h - 4));
      for (let pass = 0; pass < 3; pass++) {
        const hit = placed.find(r => x < r.x + r.w + 4 && x + w + 4 > r.x && y < r.y + r.h + 4 && y + h + 4 > r.y);
        if (!hit) break;
        if (hit.y + hit.h + 6 + h <= H - 4) y = hit.y + hit.h + 6;          // below it
        else if (hit.y - h - 6 >= 4) y = hit.y - h - 6;                      // or above it
        else x = (x > hit.x) ? Math.min(W - w - 4, hit.x + hit.w + 6) : Math.max(4, hit.x - w - 6);
      }
      el.style.left = x + 'px'; el.style.top = y + 'px';
      placed.push({ x, y, w, h });
    });
  });
}
window.addEventListener('resize', () => { if (comicEl.classList.contains('on')) setTimeout(fitBalloons, 60); });
/* play a strip; done() runs when it ends or is skipped */
function playComic(name, done) {
  const pages = STRIPS[name] || [];
  const pg = $('.cpage', comicEl);
  let pi = 0, shown = 0, busy = false;
  const wasPaused = G.paused;
  G.paused = true; comicEl.classList.add('on'); comicEl.classList.toggle('pastmode', !!(pages[0] && pages[0].past));
  // load this comic's voices up front, so tapping quickly never waits on one
  Snd.preload && Snd.preload(pages.flatMap(pp => pp.panels.flatMap(pn => (pn.say || []).map(b => b.v && VOICES[b.v]))).filter(Boolean));
  // the voices on a panel speak one after another, never over each other; moving on hushes them
  let vtok = 0;
  const playVoices = async p => {
    const tok = ++vtok;
    await new Promise(r => setTimeout(r, 350));
    for (const b of (p.say || [])) {
      const v = b.v && VOICES[b.v];
      if (!v) continue;
      if (tok !== vtok || !comicEl.classList.contains('on')) return;
      const d = await Snd.voice(v, b.who === 'ojuju' ? 'ojuju' : 'plain');
      await new Promise(r => setTimeout(r, (d || 0) * 1000 + 250));
    }
  };
  const hush = () => { vtok++; Snd.stopVoices && Snd.stopVoices(); };
  const showPage = () => {
    const page = pages[pi];
    pg.innerHTML = page.panels.map(p => panelHtml(p, page.past)).join('');
    pg.className = 'cpage n' + page.panels.length;
    fitBalloons(); shown = 0; reveal();
  };
  const reveal = () => {
    const page = pages[pi], el = pg.children[shown];
    if (!el) return;
    el.classList.add('in');
    const p = page.panels[shown];
    if (p.snd && SNDS[p.snd]) SNDS[p.snd]();
    hush(); playVoices(p);
    shown++;
    comicEl.classList.toggle('last', pi === pages.length - 1 && shown === page.panels.length);
  };
  const finish = () => {
    hush();
    comicEl.classList.remove('on'); comicEl.onclick = null; $('.cskip', comicEl).onclick = null;
    G.paused = wasPaused; pg.innerHTML = '';
    if (done) done();
  };
  const next = () => {
    if (busy) return; busy = true; setTimeout(() => { busy = false; }, 280);
    const page = pages[pi];
    if (shown < page.panels.length) return reveal();
    pi++;
    if (pi >= pages.length) return finish();
    hush(); pg.classList.add('turn'); setTimeout(showPage, 160);
  };
  comicEl.onclick = e => { if (e.target.closest('.cskip')) return; Snd.init(); next(); };
  $('.cskip', comicEl).onclick = e => { e.stopPropagation(); finish(); };
  if (!pages.length) return finish();
  showPage();
}

/* ---------- the seven memories ---------- */
/* Each plays once, when the house goes dark at its moment, and only when you are free (no chase, no visit, no page open). */
function flashback(id) {
  G.flash = G.flash || [];
  if (G.flash.includes(id) || !STRIPS[id]) return;
  const tk = G.token;
  const tryNow = () => {
    if (G.token !== tk || G.over || !G.started) return;
    if (modalOpen() || G.busy || G.paused || CH.on || CH.hidden || PRES.on || QUIET.on) { setTimeout(tryNow, 700); return; }
    G.flash.push(id); queueSave();
    G.busy = true; Snd.drop();
    const fl = $('#flash'); if (fl) { fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); }
    setTimeout(() => playComic(id, () => { G.busy = false; Snd.heartbeat(); say('The house snaps back around you. Cold. Twenty past seven.', 3600); }), 700);
  };
  setTimeout(tryNow, 900);
}
