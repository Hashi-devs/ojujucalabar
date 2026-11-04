/* ================= ICONS (tray items and lock symbols) ================= */
const polar = (cx, cy, deg, len) => {
  const a = deg * Math.PI / 180;
  return [+(cx + len * Math.sin(a)).toFixed(1), +(cy - len * Math.cos(a)).toFixed(1)];
};

/* symbols */
const symPath = {
  moon: '<path d="M26 4C14 6 8 16 11 26C14 35 26 38 34 30C24 32 17 24 19 15C20 10 23 6 26 4Z"/>',
  sun: (() => {
    let r = '<circle cx="20" cy="20" r="8"/>';
    for (let i = 0; i < 8; i++) {
      const [x1, y1] = polar(20, 20, i * 45, 12), [x2, y2] = polar(20, 20, i * 45, 18);
      r += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke-width="3" stroke-linecap="round"/>`;
    }
    return r;
  })(),
  star: (() => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const [x, y] = polar(20, 21, i * 36, i % 2 ? 7 : 17); pts.push(x + ',' + y); }
    return `<polygon points="${pts.join(' ')}" stroke-linejoin="round"/>`;
  })()
};
const symIcon = (n, s = 40) => `<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true">${symPath[n]}</svg>`;
const symAt = (n, x, y, s, cls = '', col = '#d9b36a') =>
  `<g class="${cls}" transform="translate(${x} ${y}) scale(${s / 40})" fill="${col}" stroke="${col}">${symPath[n]}</g>`;

/* item icons for the tray */
const ITEM_ART = {
  matches: '<rect x="7" y="14" width="26" height="18" rx="2" fill="#7a2a22"/><rect x="7" y="14" width="26" height="6" fill="#a8372d"/><g fill="#e8d8a8"><rect x="12" y="6" width="2.4" height="9"/><rect x="18" y="5" width="2.4" height="10"/><rect x="24" y="7" width="2.4" height="8"/></g><g fill="#c0392b"><circle cx="13.2" cy="6" r="2"/><circle cx="19.2" cy="5" r="2"/><circle cx="25.2" cy="7" r="2"/></g>',
  locket: '<path d="M10 6C12 19 28 19 30 6" fill="none" stroke="#c9a94a" stroke-width="1.6"/><ellipse cx="20" cy="26" rx="9" ry="11" fill="#c9a94a" stroke="#7d6420" stroke-width="1.5"/><ellipse cx="20" cy="26" rx="5.5" ry="7.5" fill="none" stroke="#7d6420"/>',
  ironkey: '<circle cx="11" cy="14" r="7" fill="none" stroke="#a3a9b2" stroke-width="3.6"/><rect x="16" y="12.2" width="20" height="3.6" fill="#a3a9b2"/><rect x="29" y="16" width="3.4" height="7" fill="#a3a9b2"/><rect x="34" y="16" width="3" height="5" fill="#a3a9b2"/>',
  button: '<circle cx="20" cy="20" r="14" fill="#1b1b1f" stroke="#454550" stroke-width="2"/><g fill="#7b7b88"><circle cx="15" cy="16" r="2"/><circle cx="25" cy="16" r="2"/><circle cx="15" cy="24" r="2"/><circle cx="25" cy="24" r="2"/></g><path d="M15 16L25 24M25 16L15 24" stroke="#cfcfd6" stroke-width=".9"/>',
  windkey: '<path d="M20 5C10 1 5 14 13 16L18 18V34H22V18L27 16C35 14 30 1 20 5Z" fill="#d1a85a"/><rect x="22" y="27" width="8" height="3" fill="#d1a85a"/><rect x="22" y="22" width="6" height="3" fill="#d1a85a"/>',
  brasskey: '<circle cx="11" cy="14" r="7" fill="none" stroke="#d7a93f" stroke-width="3.6"/><rect x="16" y="12.2" width="20" height="3.6" fill="#d7a93f"/><rect x="26" y="16" width="3.4" height="8" fill="#d7a93f"/><rect x="32" y="16" width="3.4" height="6" fill="#d7a93f"/>',
  crowbar: '<path d="M9 10C8 5 15 3 17 8L29 30C31 34 35 33 36 30" fill="none" stroke="#8a8f98" stroke-width="4.2" stroke-linecap="round"/>',
  cellarkey: '<rect x="4" y="8" width="14" height="12" rx="2" fill="none" stroke="#9fb0a8" stroke-width="3.4"/><rect x="17" y="12.2" width="19" height="3.6" fill="#9fb0a8"/><rect x="26" y="16" width="3.4" height="7" fill="#9fb0a8"/><rect x="32" y="16" width="3.4" height="9" fill="#9fb0a8"/>',
  chapelkey: '<g fill="none" stroke="#7d818c" stroke-width="3"><circle cx="9" cy="9" r="4.4"/><circle cx="17" cy="9" r="4.4"/><circle cx="13" cy="16" r="4.4"/></g><rect x="12" y="19" width="3.4" height="18" fill="#7d818c"/><rect x="15" y="29" width="7" height="3.2" fill="#7d818c"/><rect x="15" y="24" width="5" height="3.2" fill="#7d818c"/>',
  rope: '<g fill="none" stroke="#b59a6a" stroke-width="4" stroke-linecap="round"><ellipse cx="20" cy="26" rx="14" ry="7"/><ellipse cx="20" cy="21" rx="12" ry="6"/><ellipse cx="20" cy="16" rx="10" ry="5"/></g><path d="M30 14C36 8 38 5 36 3" fill="none" stroke="#b59a6a" stroke-width="3.4" stroke-linecap="round"/>',
  padkey: '<circle cx="13" cy="20" r="6.5" fill="none" stroke="#c9c2a8" stroke-width="3.2"/><rect x="18.5" y="18.4" width="16" height="3.2" fill="#c9c2a8"/><rect x="28" y="21" width="3" height="5" fill="#c9c2a8"/><rect x="23" y="21" width="2.6" height="4" fill="#c9c2a8"/>',
  rag: '<path d="M7 12L30 7L34 22L26 34L9 30Z" fill="#9a968a"/><path d="M12 16L28 12M13 24L30 20" stroke="#726e63" stroke-width="1.5"/>',
  // mason's hammer: wooden handle, steel head with a chisel end, old cement on it
  hammer: '<rect x="18" y="13" width="4.6" height="24" rx="2" fill="#8a5a2c" transform="rotate(28 20 25)"/><path d="M6 9L24 4L27 12L9 17Z" fill="#9aa1ab" stroke="#5d636c" stroke-width="1.2"/><path d="M24 4L33 3L34 10L27 12Z" fill="#c3c8cf" stroke="#5d636c" stroke-width="1.2"/><circle cx="12" cy="11" r="1.6" fill="#d8d2c2"/><circle cx="16" cy="9.5" r="1.1" fill="#d8d2c2"/>',
  // Mama's white altar cloth, folded, with a little embroidery
  whitecloth: '<path d="M6 14L20 8L34 14L34 30L20 36L6 30Z" fill="#f2ede2" stroke="#b9b09c" stroke-width="1.3"/><path d="M6 14L20 20L34 14M20 20V36" fill="none" stroke="#cfc6b2" stroke-width="1.2"/><path d="M11 24L14 26L11 28M29 24L26 26L29 28" fill="none" stroke="#c9a94a" stroke-width="1.2"/>'
};
const itemIcon = id => `<svg viewBox="0 0 40 40" aria-hidden="true">${ITEM_ART[id] || ''}</svg>`;

