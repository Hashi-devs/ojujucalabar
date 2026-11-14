/* ================= SPEEDRUN LEADERBOARD (Haunted mode only) ================= */
/* The scores live in a Supabase database (project "ojuju-calabar"). The key below is the public one: it can only
   read the board and call the three checked functions (start_run, checkpoint, submit_run). Each function checks the
   run on the server: every room entered in order, the clock never faster than the server's own clock, at least
   three minutes, and a name can only be used by the phone that first claimed it.
   A run counts when it starts in Haunted mode while online and stays in Haunted mode to the end. */
const LB = {
  url: 'https://sounkcvknblzazclfodt.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdW5rY3ZrbmJsemF6Y2xmb2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMjE5NTgsImV4cCI6MjEwODc5Nzk1OH0.bDsg_HKtMI2vSwxNIf8wPyx2wIGJQiDtVLND0zt7D44',
  ref: 'sounkcvknblzazclfodt'
};
const lbHeaders = () => ({ apikey: LB.key, Authorization: 'Bearer ' + LB.key, 'Content-Type': 'application/json' });
async function lbFetch(path, opt = {}, ms = 9000) {
  const ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ac && setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(LB.url + path, { ...opt, headers: lbHeaders(), signal: ac && ac.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  } finally { if (t) clearTimeout(t); }
}
const lbRpc = (fn, body) => lbFetch('/rest/v1/rpc/' + fn, { method: 'POST', body: JSON.stringify(body) });
const lbTop = () => lbFetch('/rest/v1/scores?select=name,best_ms,pages,true_ending,achieved_at&order=best_ms.asc,achieved_at.asc&limit=100');

// a secret made on this phone the first time; it proves a name is yours
function lbDeviceKey() {
  let k = store.get('oc_lbkey');
  if (!k || k.length < 24) {
    const a = new Uint8Array(24); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((v, i) => { a[i] = Math.random() * 256; });
    k = Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); store.set('oc_lbkey', k);
  }
  return k;
}
const fmtRun = ms => { const t = Math.floor(ms / 100), s = Math.floor(t / 10), m = Math.floor(s / 60), h = Math.floor(m / 60); return (h ? h + ':' + String(m % 60).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0') + '.' + (t % 10); };
const runMs = () => G.finalMs || (Date.now() - G.t0);

/* ---- the run ---- */
function lbNewRun() {
  G.run = null; G.finalMs = 0;
  if (G.mode !== 'haunted') return;
  const run = G.run = { id: null, ranked: true, q: [] };
  const tryStart = (left) => lbRpc('start_run', { p_version: (typeof VERSION_TAG !== 'undefined' ? VERSION_TAG : 'web') })
    .then(id => { if (G.run === run && id) { run.id = id; lbFlush(); queueSave(); lbTell(run, true); } })
    .catch(() => { if (G.run !== run) return; if (left > 0) setTimeout(() => tryStart(left - 1), 4000); else lbTell(run, false); });
  tryStart(2);
}
// one line when the game starts, so players know from the start whether this run is racing
function lbTell(run, ok) {
  setTimeout(() => {
    if (G.run !== run || !G.started || G.over) return;
    say(ok ? 'Your time is running for the speedrun leaderboard. Finish in Haunted mode to post it.' : 'No connection to the leaderboard, so this run won’t be timed for it. The game plays the same.', 4200);
  }, 9000);
}
// a run that leaves Haunted mode, even for a moment, no longer counts
function lbModeChanged(m) { if (m !== 'haunted' && G.run && G.started) G.run.ranked = false; }
function lbCheckpoint(room) {
  const run = G.run;
  if (!run || !run.ranked || room < 1 || room > 7 || !G.t0) return;
  if (!run.q.some(c => c[0] === room) && !(run.sent || []).includes(room)) run.q.push([room, Date.now() - G.t0]);
  lbFlush();
}
let lbBusy = false;
async function lbFlush() {
  const run = G.run;
  if (lbBusy || !run || !run.id || !run.q.length) return;
  lbBusy = true;
  try {
    while (run.q.length) {
      const [room, ms] = run.q[0];
      await lbRpc('checkpoint', { p_run: run.id, p_room: room, p_ms: ms });
      run.q.shift(); (run.sent = run.sent || []).push(room);
    }
  } catch (e) { /* offline for now: try again at the next room or at the end */ } finally { lbBusy = false; }
}
const lbEligible = () => !!(G.run && G.run.ranked && G.mode === 'haunted');

/* ---- the end screen ---- */
function lbResultsHtml() {
  if (G.chapterRun != null) return `<div class="lbbox"><p class="lbmsg">Chapter runs don’t count for the leaderboard. Pages found in any run: ${pagesEver().length} of ${PAGES.length}.</p><button class="btn" data-lb="view">See the leaderboard</button></div>`;
  // say exactly why a run can't be posted, so a player is never left guessing
  const why = !G.run ? (G.mode !== 'haunted' ? 'This run was played on Gentle. Only Haunted runs go on the leaderboard: pick Haunted on the title screen before you start.' : 'This run started before the leaderboard could time it (an older save, or the game was opened offline). Start a new game while online to race.')
    : !G.run.ranked || G.mode !== 'haunted' ? 'The scare level was switched to Gentle during this run, so it can’t go on the leaderboard. Keep it on Haunted from start to finish.'
    : !G.run.id ? 'The leaderboard couldn’t be reached when this run started, so it wasn’t timed. Start a new game with internet on to race.' : '';
  if (why) return `<div class="lbbox"><p class="lbmsg">${why}</p><button class="btn" data-lb="view">See the leaderboard</button></div>`;
  if (G.run.posted) return `<div class="lbbox"><p class="lbmsg ok">${esc(G.run.posted)}</p><button class="btn" data-lb="view">See the leaderboard</button></div>`;
  return `<div class="lbbox"><div class="lbt">Speedrun leaderboard</div>
    <p class="lbmsg">Your time: <b>${fmtRun(runMs())}</b>. Put it on the board.</p>
    <div class="lbrow"><input id="lbName" maxlength="16" autocomplete="nickname" spellcheck="false" placeholder="Your name" value="${esc(store.get('oc_lbname') || '')}" aria-label="Your name for the leaderboard"><button class="btn primary" data-lb="post">Post</button></div>
    <p class="lbnote">Your name and time are shown publicly on the leaderboard. <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></p>
    <p class="lbmsg" id="lbStatus" aria-live="polite"></p>
    <button class="btn" data-lb="view">See the leaderboard</button></div>`;
}
const LB_ERR = {
  bad_name: 'Use 2 to 16 letters or numbers (spaces, dots, dashes and _ are fine).',
  rude_name: 'Please pick a different name.',
  name_taken: 'That name belongs to another player. Pick another one.',
  not_valid: 'This run couldn’t be checked, so it wasn’t posted.',
  already_sent: 'This run is already on the board.',
  no_run: 'This run couldn’t be found on the server.'
};
async function lbPost(all) {
  const inp = $('#lbName'), st = $('#lbStatus'), btn = $('[data-lb="post"]');
  if (!inp || !G.run || !G.run.id) return;
  const name = inp.value.trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z0-9 _.\-]{2,16}$/.test(name)) { st.textContent = LB_ERR.bad_name; return; }
  btn.disabled = true; st.textContent = 'Checking your run…';
  try {
    await lbFlush();
    if (G.run.q.length) throw new Error('offline');
    const r = await lbRpc('submit_run', { p_run: G.run.id, p_name: name, p_key: lbDeviceKey(), p_ms: Math.round(runMs()), p_pages: G.pages.length, p_cowries: G.cowries.length, p_hints: G.hints });
    if (!r || !r.ok) { st.textContent = LB_ERR[r && r.error] || 'Something went wrong. Try again.'; btn.disabled = false; return; }
    store.set('oc_lbname', r.name);
    G.run.posted = r.improved ? `Posted! You’re #${r.rank} on the leaderboard as ${r.name}.` : `Posted. Your best is still ${fmtRun(r.best_ms)} (#${r.rank}).`;
    store.set('oc_lbbest', r.best_ms);
    Snd.chime && Snd.chime();
    openLeaderboard(() => results(all), r.name);
  } catch (e) {
    st.textContent = 'No connection. Check your internet and tap Post again.'; btn.disabled = false;
  }
}

/* ---- the board, updated live ---- */
let lbSock = null, lbPoll = 0;
function lbStopLive() { document.body.classList.remove('lbtitle'); clearInterval(lbPoll); lbPoll = 0; if (lbSock) { try { lbSock.close(); } catch (e) { } lbSock = null; } }
function lbLive(refresh) {
  const t = document.body.classList.contains('lbtitle'); lbStopLive(); document.body.classList.toggle('lbtitle', t);
  lbPoll = setInterval(() => { if (!$('#lbList')) return lbStopLive(); if (!lbSock || lbSock.readyState !== 1) refresh(); }, 15000);
  try {
    const ws = lbSock = new WebSocket(`wss://${LB.ref}.supabase.co/realtime/v1/websocket?apikey=${LB.key}&vsn=1.0.0`);
    let ref = 1, hb = 0;
    ws.onopen = () => {
      ws.send(JSON.stringify({ topic: 'realtime:lb', event: 'phx_join', ref: String(ref++), join_ref: '1',
        payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: 'scores' }] }, access_token: LB.key } }));
      hb = setInterval(() => { if (!$('#lbList')) { lbStopLive(); return; } ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(ref++) })); }, 25000);
    };
    ws.onmessage = ev => {
      if (!$('#lbList')) return lbStopLive();
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.event === 'postgres_changes') refresh(true);
      if (m.event === 'phx_reply' && m.payload && m.payload.status === 'ok') { const d = $('#lbLive'); if (d) d.classList.add('on'); }
    };
    ws.onclose = () => { clearInterval(hb); const d = $('#lbLive'); if (d) d.classList.remove('on'); };
  } catch (e) { /* no live updates: polling carries on */ }
}
function openLeaderboard(back, me) {
  me = (me || store.get('oc_lbname') || '').toLowerCase();
  document.body.classList.toggle('lbtitle', !$('#title').classList.contains('off'));   // the title screen sits above pop-ups
  openModal(`<h2>Leaderboard</h2>
    <p class="lead lbsub">Fastest escapes in Haunted mode <span id="lbLive" class="lblive" title="Updates live">● live</span></p>
    <ol class="lblist" id="lbList"><li class="lbempty">Loading…</li></ol>
    <p class="hint-note"><b>How to get on the board:</b> start a new game in Haunted mode with internet on, play to the end, and type your name on the last screen.</p>
    <p class="hint-note">★ found all 14 pages. Times count from the first door to the chimney; skip the comics if you are racing.</p>
    <div class="col"><button class="btn" data-x>Close</button></div>`, { onX: () => { lbStopLive(); if (back) back(); } });
  panel.onclick = e => { if (e.target.closest('[data-x]')) { lbStopLive(); closeModal(); if (back) back(); } };
  let flashName = '';
  const draw = (rows, fresh) => {
    const ol = $('#lbList'); if (!ol) return;
    if (!rows.length) { ol.innerHTML = '<li class="lbempty">No one has escaped yet. Be the first.</li>'; return; }
    ol.innerHTML = rows.map((r, i) => `<li class="${r.name.toLowerCase() === me ? 'me' : ''}${fresh && r.name === flashName ? ' new' : ''}"><span class="lbr">${i + 1}</span><span class="lbn">${esc(r.name)}${r.true_ending ? ' <i title="All 14 pages">★</i>' : ''}</span><span class="lbtime">${fmtRun(r.best_ms)}</span></li>`).join('');
    const mine = $('li.me', ol); if (mine && !fresh) mine.scrollIntoView({ block: 'center' });
  };
  let last = [];
  const refresh = async fresh => {
    try {
      const rows = await lbTop() || [];
      if (fresh) { const before = new Map(last.map(r => [r.name, r.best_ms])); const ch = rows.find(r => before.get(r.name) !== r.best_ms); flashName = ch ? ch.name : ''; }
      last = rows; draw(rows, fresh);
    } catch (e) { const ol = $('#lbList'); if (ol && !last.length) ol.innerHTML = '<li class="lbempty">Can’t reach the leaderboard. Check your internet.</li>'; }
  };
  refresh(false); lbLive(refresh);
}

/* ---- an on-screen speedrun timer (menu: Speedrun timer) ---- */
const runTimerEl = (() => { const d = document.createElement('div'); d.id = 'runTimer'; d.setAttribute('aria-hidden', 'true'); $('#stage').appendChild(d); return d; })();
setInterval(() => {
  const on = !!store.get('oc_timer') && G.started && !!G.t0 && $('#title').classList.contains('off');
  runTimerEl.classList.toggle('on', on);
  if (on) runTimerEl.textContent = fmtRun(runMs());
}, 100);
if (window.__hm) Object.assign(window.__hm, { results, openLeaderboard, lbNewRun, lbFlush, fmtRun });
