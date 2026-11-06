/* ================= SOUND (synthesised, no files) ================= */
const Snd = (() => {
  let ctx = null, master = null, noise = null, outNode = null;
  let muted = !!store.get('hm3_mute');

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 2;
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      ambient();
      loadSfx();
      setTimeout(() => api.ambience(G.started && typeof roomKey === 'function' ? roomKey() : 'title'), 300);
    } catch (e) { ctx = null; }
  }

  function ambient() {
    const g = ctx.createGain(); g.gain.value = 0.05; g.connect(master);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.connect(g);
    [48, 48.7, 72.2].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sawtooth';
      o.frequency.value = f; o.connect(lp); o.start();
    });
    const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.8;
    const wg = ctx.createGain(); wg.gain.value = 0.025;
    n.connect(bp); bp.connect(wg); wg.connect(master); n.start();
    const l1 = ctx.createOscillator(); l1.frequency.value = 0.07;
    const lg = ctx.createGain(); lg.gain.value = 180; l1.connect(lg); lg.connect(bp.frequency); l1.start();
    const l2 = ctx.createOscillator(); l2.frequency.value = 0.11;
    const lg2 = ctx.createGain(); lg2.gain.value = 0.02; l2.connect(lg2); lg2.connect(wg.gain); l2.start();
  }

  function tone(freq, dur, type = 'sine', vol = 0.2, slideTo = null, delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(outNode || master); o.start(t); o.stop(t + dur + 0.05);
  }

  function burst(dur, vol, freq, type = 'bandpass', q = 1, delay = 0, sweepTo = null) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(); s.buffer = noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(outNode || master);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  /* ---------- plucked strings (Karplus-Strong), for the title music ---------- */
  const pluckCache = {};
  function pluckBuf(freq) {
    const key = Math.round(freq);
    if (pluckCache[key]) return pluckCache[key];
    const sr = ctx.sampleRate, len = Math.floor(sr * 2.2), b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
    const p = Math.max(2, Math.round(sr / freq)), ring = new Float32Array(p);
    for (let i = 0; i < p; i++) ring[i] = (Math.random() * 2 - 1) * .8;
    let idx = 0;
    for (let i = 0; i < len; i++) { const nx = (idx + 1) % p; const v = ring[idx]; ring[idx] = (v + ring[nx]) * .4985; d[i] = v; idx = nx; }
    return (pluckCache[key] = b);
  }
  function pluck(freq, when, vol = .16, pan = 0) {
    if (!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = pluckBuf(freq);
    const g = ctx.createGain(); g.gain.value = vol;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    s.connect(lp); lp.connect(g);
    if (ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = pan; g.connect(pn); pn.connect(musicBus()); } else g.connect(musicBus());
    s.start(when);
  }
  let mBus = null, mTimer = 0, mNext = 0, mStep = 0;
  function musicBus() {
    if (mBus) return mBus;
    mBus = ctx.createGain(); mBus.gain.value = 0; mBus.connect(bedBus());
    const d = ctx.createDelay(1); d.delayTime.value = .33; const fb = ctx.createGain(); fb.gain.value = .32; const wet = ctx.createGain(); wet.gain.value = .28;
    mBus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(bedBus());
    return mBus;
  }
  // a slow, minor, palm-wine highlife figure: Am, Dm, E, Am, with a walking bass
  const PROG = [[220, 261.6, 329.6, 110], [293.7, 349.2, 440, 146.8], [246.9, 329.6, 415.3, 82.4], [220, 261.6, 329.6, 110]];
  const PAT = [0, 2, 1, 2, 0, 1, 2, 1];
  function musicTick() {
    if (!ctx || !mBus) return;
    const beat = 60 / 84 / 2;
    while (mNext < ctx.currentTime + .4) {
      const bar = Math.floor(mStep / 8) % PROG.length, st = mStep % 8, ch = PROG[bar];
      const note = ch[PAT[st]] * (st === 5 ? 2 : 1);
      pluck(note, mNext, st % 2 ? .1 : .14, st % 2 ? .35 : -.25);
      if (st === 0 || st === 4) pluck(ch[3] * (st === 4 ? 1.5 : 1), mNext, .2, 0);
      if (st === 7 && bar === 2) pluck(ch[2] * 2, mNext + beat / 2, .06, .5); // a little ghost note
      mNext += beat * (st % 2 ? .92 : 1.08); // a lazy swing
      mStep++;
    }
  }
  // the whole tune laid out from now for a set number of seconds (used for the trailer)
  function musicScore(dur) {
    if (!ctx) return;
    musicBus(); mBus.gain.setValueAtTime(.9, ctx.currentTime);
    const beat = 60 / 84 / 2; let tt = ctx.currentTime + .05, st = 0;
    while (tt < ctx.currentTime + dur) {
      const bar = Math.floor(st / 8) % PROG.length, s8 = st % 8, ch = PROG[bar];
      pluck(ch[PAT[s8]] * (s8 === 5 ? 2 : 1), tt, s8 % 2 ? .1 : .14, s8 % 2 ? .35 : -.25);
      if (s8 === 0 || s8 === 4) pluck(ch[3] * (s8 === 4 ? 1.5 : 1), tt, .2, 0);
      tt += beat * (s8 % 2 ? .92 : 1.08); st++;
    }
  }
  function music(on) {
    if (!ctx) return;
    musicBus();
    if (on) {
      if (mTimer) return;
      mNext = ctx.currentTime + .1; mStep = 0;
      mBus.gain.cancelScheduledValues(ctx.currentTime); mBus.gain.setTargetAtTime(.9, ctx.currentTime, 1.2);
      mTimer = setInterval(musicTick, 120); musicTick();
    } else if (mTimer) {
      mBus.gain.setTargetAtTime(0, ctx.currentTime, .6);
      const t = mTimer; mTimer = 0; setTimeout(() => { if (!mTimer) clearInterval(t); }, 2500);
    }
  }

  /* ---------- the sounds of Calabar at night ---------- */
  function mosquito() {
    if (!ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 610; lfo.frequency.value = 7; lg.gain.value = 28; lfo.connect(lg); lg.connect(o.frequency);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 2;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .9); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6);
    const out = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    o.connect(bp); bp.connect(g);
    if (out) { out.pan.setValueAtTime(-.9, t); out.pan.linearRampToValueAtTime(.9, t + 2.6); g.connect(out); out.connect(master); } else g.connect(master);
    o.start(t); lfo.start(t); o.stop(t + 2.7); lfo.stop(t + 2.7);
  }
  function generator() {
    if (!ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(34, t); o.frequency.linearRampToValueAtTime(52, t + .8); o.frequency.setValueAtTime(52, t + 3); o.frequency.exponentialRampToValueAtTime(18, t + 4.4);
    lp.type = 'lowpass'; lp.frequency.value = 260;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.14, t + .5);
    [1.2, 1.9, 2.6].forEach(k => { g.gain.setValueAtTime(.14, t + k); g.gain.linearRampToValueAtTime(.03, t + k + .1); g.gain.linearRampToValueAtTime(.14, t + k + .25); }); // it coughs
    g.gain.setValueAtTime(.14, t + 3.2); g.gain.exponentialRampToValueAtTime(.0001, t + 4.5);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 4.6);
  }
  function ekpe() { // distant drums and a bell: far away, and only for a moment
    if (!ctx) return;
    const pat = [0, .32, .48, .8, 1.12, 1.28, 1.6, 1.92, 2.08, 2.4];
    pat.forEach((d, i) => { tone(i % 3 ? 96 : 72, .3, 'sine', .14, 52, d); burst(.08, .05, 300, 'lowpass', 1, d); });
    [0, .8, 1.6, 2.4].forEach(d => { tone(1180, .5, 'square', .018, null, d); tone(1610, .4, 'sine', .02, null, d + .02); });
  }
  function choir() { // a church far down the road
    if (!ctx) return;
    const t = ctx.currentTime, mel = [220, 246.9, 261.6, 246.9, 220, 196];
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + 1.2); g.gain.setValueAtTime(.05, t + 4.6); g.gain.exponentialRampToValueAtTime(.0001, t + 5.2);
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 3;
    const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 1400;
    f1.connect(f2); f2.connect(g); g.connect(master);
    [0, 1.003, .5, 1.498].forEach(k => {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      mel.forEach((f, i) => o.frequency.setValueAtTime(f * (k || 1) * (k === .5 ? 1 : 1), t + i * .8));
      o.detune.value = (Math.random() - .5) * 18; o.connect(f1); o.start(t); o.stop(t + 5.3);
    });
  }
  function rooster() {
    if (!ctx) return;
    [[0, .18, 600, 900], [.2, .16, 800, 1100], [.38, .7, 1100, 700]].forEach(([d, dur, a, b]) => {
      const t = ctx.currentTime + d, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + dur);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.4;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.08, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(bp); bp.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    });
  }

  /* ---------- recorded voices, made ghostly ---------- */
  const vcache = {};
  /* a sound is either embedded (data: URI, single-file builds) or a small file next to the page (web builds) */
  function bytesOf(uri) {
    if (uri.startsWith('data:')) {
      const bin = atob(uri.slice(uri.indexOf(',') + 1)), b = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
      return Promise.resolve(b.buffer);
    }
    return fetch(uri).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
  }
  /* voices sit on their own louder bus, through a limiter, and the music and loops dip while someone speaks */
  let vBus = null, bed = null, speaking = 0;
  function voiceBus() {
    if (vBus) return vBus;
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -12; lim.knee.value = 6; lim.ratio.value = 8; lim.attack.value = .003; lim.release.value = .2;
    vBus = ctx.createGain(); vBus.gain.value = 2.2; vBus.connect(lim); lim.connect(master);
    return vBus;
  }
  function bedBus() { if (!bed) { bed = ctx.createGain(); bed.gain.value = 1; bed.connect(master); } return bed; }
  function duck(on) {
    speaking = Math.max(0, speaking + (on ? 1 : -1));
    if (bed) bed.gain.setTargetAtTime(speaking ? .35 : 1, ctx.currentTime, speaking ? .08 : .5);
  }
  let verb = null;
  function reverb() {
    if (verb) return verb;
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb = ctx.createConvolver(); verb.buffer = ir; verb.connect(master);
    return verb;
  }
  function decode(uri) {
    if (vcache[uri]) return vcache[uri];
    vcache[uri] = bytesOf(uri).then(b => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej)));
    vcache[uri].catch(() => { delete vcache[uri]; });
    return vcache[uri];
  }
  // who: 'ojuju' (deep, doubled, from behind), 'mama' (soft, echoing), 'kid' (small Tobi, a memory), 'plain' (Tobi himself)
  /* voices still speaking, so a new panel or a skip can hush them */
  const VOX = [];
  function stopVoices() {
    if (!ctx) return;
    const t = ctx.currentTime;
    VOX.splice(0).forEach(r => { r.gains.forEach(g => { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, .04); }); r.srcs.forEach(x => { try { x.stop(t + .2); } catch (e) { /* done */ } }); });
  }
  async function voice(uri, who) {
    if (!ctx || muted || !uri) return 0;
    let ab; try { ab = await decode(uri); } catch (e) { return 0; }
    const P = { ojuju: { rate: .8, wet: .5, dry: .9, hp: 60, lp: 3200, pan: .7, under: .45 }, mama: { rate: .98, wet: .75, dry: .55, hp: 260, lp: 5200, pan: .35, echo: .3 }, kid: { rate: 1.12, wet: .55, dry: .7, hp: 300, lp: 7000, pan: .8 }, plain: { rate: 1, wet: .1, dry: 1, hp: 80, lp: 9000, pan: 0 } }[who] || { rate: .92, wet: .6, dry: .6, hp: 200, lp: 4500, pan: .5 };
    const t = ctx.currentTime + .02, pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = P.hp;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = P.lp;
    const dry = ctx.createGain(); dry.gain.value = P.dry; const wet = ctx.createGain(); wet.gain.value = P.wet;
    hp.connect(lp); const out = pan || lp; if (pan) { lp.connect(pan); pan.pan.setValueAtTime((Math.random() < .5 ? -1 : 1) * P.pan, t); pan.pan.linearRampToValueAtTime((Math.random() - .5) * .4, t + ab.duration / P.rate); }
    out.connect(dry); dry.connect(voiceBus()); out.connect(wet); wet.connect(reverb());
    const src = ctx.createBufferSource(); src.buffer = ab; src.playbackRate.value = P.rate; src.connect(hp); src.start(t);
    const rec = { srcs: [src], gains: [dry, wet] }; VOX.push(rec); duck(true); src.onended = () => { duck(false); const i = VOX.indexOf(rec); if (i >= 0) VOX.splice(i, 1); };
    if (P.under) { // a second, deeper copy underneath: two throats, one voice
      const s2 = ctx.createBufferSource(); s2.buffer = ab; s2.playbackRate.value = P.rate * .74; const g2 = ctx.createGain(); g2.gain.value = P.under;
      s2.connect(g2); g2.connect(hp); s2.start(t); rec.srcs.push(s2);
    }
    if (P.echo) {
      const d = ctx.createDelay(1); d.delayTime.value = .28; const fb = ctx.createGain(); fb.gain.value = P.echo;
      out.connect(d); d.connect(fb); fb.connect(d); d.connect(wet);
    }
    return ab.duration / P.rate;
  }

  /* play some sounds through a panner (-1 left … 1 right), or into any node */
  function via(node, fn) { if (!ctx) return; const prev = outNode; outNode = node; try { fn(); } finally { outNode = prev; } }
  function panned(pan, fn) {
    if (!ctx) return;
    if (!ctx.createStereoPanner) return fn();
    const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(master);
    via(p, fn); setTimeout(() => { try { p.disconnect(); } catch (e) { /* gone */ } }, 3000);
  }

  /* an old valve radio: static that clears as you near the station, a whistle, and music underneath */
  function radio() {
    if (!ctx) return { set() {}, stop() {}, sing() {} };
    const out = ctx.createGain(); out.gain.value = 0; out.connect(master);
    out.gain.setTargetAtTime(1, ctx.currentTime, .1);
    const rec = SB.radio && SB.radio.length ? SB.radio[0] : null;   // the recorded static, if we have it
    const n = ctx.createBufferSource(); n.buffer = rec || noise; n.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = rec ? 'allpass' : 'bandpass'; bp.frequency.value = 1900; bp.Q.value = .5;
    const sg = ctx.createGain(); sg.gain.value = .22; n.connect(bp); bp.connect(sg);
    if (rec) { const rg = ctx.createGain(); rg.gain.value = .5; sg.connect(rg); rg.connect(out); } else sg.connect(out);
    n.start();
    const w = ctx.createOscillator(); w.type = 'sine'; w.frequency.value = 900;
    const wg = ctx.createGain(); wg.gain.value = .0; w.connect(wg); wg.connect(out); w.start();
    const mg = ctx.createGain(); mg.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; mg.connect(lp); lp.connect(out);
    const tune = [392, 440, 523.25, 440, 392, 329.63, 392, 0, 392, 440, 523.25, 587.33, 523.25, 440, 392, 0];
    let i = 0;
    const iv = setInterval(() => { const f = tune[i++ % tune.length]; if (f) via(mg, () => { tone(f, .5, 'triangle', .22); tone(f / 2, .45, 'sine', .1); }); }, 380);
    return {
      set(clear, off) { // clear: 0 (only static) … 1 (the station); off: how far off the station, for the whistle
        const t = ctx.currentTime;
        sg.gain.setTargetAtTime(.04 + .26 * (1 - clear), t, .05);
        mg.gain.setTargetAtTime(clear * clear, t, .08);
        wg.gain.setTargetAtTime(off < 3 && clear < .95 ? .035 * (1 - off / 3) : 0, t, .05);
        w.frequency.setTargetAtTime(240 + off * 520, t, .03);
      },
      stop() { clearInterval(iv); out.gain.setTargetAtTime(0, ctx.currentTime, .08); setTimeout(() => { try { n.stop(); w.stop(); out.disconnect(); } catch (e) { /* gone */ } }, 600); }
    };
  }
  /* a muffled voice on an old record: syllables of formant noise over a pitch */
  function murmur(pitch, n = 9) {
    if (!ctx) return 0;
    let d = 0;
    for (let k = 0; k < n; k++) {
      const len = .1 + Math.random() * .12, f = pitch * (1 + (Math.random() - .5) * .25);
      tone(f, len, 'triangle', .1, f * (Math.random() < .5 ? .92 : 1.06), d);
      burst(len, .09, pitch * (4 + Math.random() * 3), 'bandpass', 4, d);
      d += len + (k % 3 === 2 ? .2 : .05);
    }
    burst(d + .3, .03, 3000, 'highpass', .5);
    return d;
  }

  /* recorded sound effects (assets/sfx): each one replaces the synth sound of the same name once decoded */
  const SB = {};
  function loadSfx() {
    if (typeof SFX === 'undefined') return;
    Object.keys(SFX).forEach(k => {
      SB[k] = [];
      SFX[k].forEach(u => {
        bytesOf(u).then(b => ctx.decodeAudioData(b, buf => SB[k].push(buf), () => {})).catch(() => { /* this one stays synth */ });
      });
    });
  }
  function sample(k, vol = 1, delay = 0) {
    const L = SB[k];
    if (!ctx || !L || !L.length) return false;
    const s = ctx.createBufferSource(); s.buffer = L[Math.random() * L.length | 0];
    s.playbackRate.value = .95 + Math.random() * .1;            // no two footsteps quite the same
    const g = ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(outNode || master);
    s.start(ctx.currentTime + delay);
    return true;
  }

  const api = {
    init, voice, stopVoices, radio, murmur, music, musicScore, mosquito, generator, ekpe, choir, rooster,
    get muted() { return muted; },
    setMuted(m) {
      muted = m; store.set('hm3_mute', m);
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
    },
    adMute(on) { if (master) master.gain.setTargetAtTime(on || muted ? 0 : 0.9, ctx.currentTime, 0.05); },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    tick() { tone(520, 0.05, 'square', 0.04); },
    // the warning before Ojuju comes: a dry clicking, like a calabash rattle (Amuro's recording replaces it: assets/sfx/warn.mp3)
    warn() { [0, .09, .2, .29, .52, .61, .72].forEach(d => { burst(.03, .45, 2600, 'bandpass', 6, d); tone(1900, .02, 'square', .05, null, d); }); },
    stomp(v = 1) { burst(0.16, 0.22 * v, 140, 'lowpass', 1); tone(48, 0.2, 'sine', 0.3 * v, 30); },
    stompAt(v, pan) { panned(pan, () => api.stomp(v)); },
    creakAt(pan) { panned(pan, () => api.creak()); },
    rattle(pan = 0) { panned(pan, () => { for (let i = 0; i < 5; i++) { burst(.06, .3, 700 + i * 40, 'bandpass', 3, i * .07); tone(160, .05, 'square', .05, 120, i * .07); } }); },
    breath(pan = 0) { panned(pan, () => { burst(1.6, .14, 520, 'bandpass', 1.2, 0, 300); burst(1.2, .1, 900, 'bandpass', 1.5, 1.7, 500); }); },
    pound(v = 1) { tone(78, .22, 'sine', .5 * v, 42); burst(.1, .3 * v, 260, 'lowpass', 1); burst(.05, .12 * v, 1500, 'bandpass', 2); },
    lanternOut() { burst(.6, .25, 900, 'bandpass', 1, 0, 200); tone(300, .5, 'sine', .08, 120); tone(60, .9, 'sine', .3, 35, .2); },
    relight() { burst(.35, .18, 1400, 'highpass', .5); tone(392, .4, 'triangle', .12); tone(587, .6, 'triangle', .1, null, .15); },
    step() { burst(0.1, 0.07, 170, 'lowpass', 1); tone(62, 0.09, 'sine', 0.07, 40); },
    tap() { burst(0.07, 0.05, 900, 'bandpass', 2); },
    pickup() { tone(660, 0.12, 'triangle', 0.16); tone(990, 0.2, 'triangle', 0.14, null, 0.09); },
    select() { tone(440, 0.08, 'sine', 0.12); },
    unlock() { burst(0.18, 0.4, 600, 'bandpass', 3); tone(140, 0.3, 'sine', 0.3, 60); tone(880, 0.35, 'triangle', 0.1, null, 0.18); },
    wrong() { tone(150, 0.25, 'sawtooth', 0.1, 90); },
    creak() { burst(0.9, 0.22, 380, 'bandpass', 9, 0, 150); tone(120, 0.8, 'sawtooth', 0.04, 70); },
    whisper() { burst(1.4, 0.25, 2400, 'bandpass', 2.5, 0, 1500); burst(1.2, 0.18, 3400, 'bandpass', 3, 0.25, 2200); },
    thump() { tone(70, 0.35, 'sine', 0.4, 38); },
    scare() {
      burst(0.7, 0.7, 1800, 'bandpass', 0.7, 0, 400);
      tone(90, 0.8, 'sawtooth', 0.35, 40);
      tone(466, 0.6, 'sawtooth', 0.12); tone(494, 0.6, 'sawtooth', 0.12); tone(932, 0.5, 'square', 0.06, 400);
    },
    flame() { burst(0.35, 0.18, 1400, 'highpass', 0.5); tone(260, 0.2, 'sine', 0.05); },
    snuff() { burst(0.5, 0.2, 1200, 'bandpass', 1, 0, 300); },
    note(freq, delay = 0) {
      tone(freq, 1.2, 'sine', 0.22, null, delay);
      tone(freq * 2, 0.6, 'sine', 0.06, null, delay);
    },
    chime() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.9, 'triangle', 0.14, null, i * 0.14)); },
    open() { burst(0.8, 0.25, 300, 'lowpass', 1, 0, 700); tone(90, 0.7, 'sawtooth', 0.08, 140); },
    slam() { burst(0.35, 0.8, 220, 'lowpass', 0.7); tone(55, 0.5, 'sine', 0.55, 30); burst(0.12, 0.5, 2400, 'highpass', 0.5); },
    shriek() { tone(1100, 1.0, 'sawtooth', 0.16, 3200); tone(1480, 0.9, 'square', 0.08, 2600, 0.05); burst(0.9, 0.5, 2600, 'bandpass', 0.6, 0, 900); tone(80, 0.7, 'sawtooth', 0.3, 35); },
    drop() { tone(150, 1.1, 'sawtooth', 0.4, 28); tone(75, 1.1, 'square', 0.18, 25); burst(0.8, 0.6, 500, 'lowpass', 0.8, 0, 90); },
    giggle() { [0, .11, .22, .36, .47].forEach((d, i) => tone(740 + i * 90, 0.09, 'triangle', 0.1, 520 + i * 60, d)); },
    knock(n = 3) { for (let i = 0; i < n; i++) { tone(95, 0.12, 'sine', 0.4, 55, i * 0.3); burst(0.06, 0.25, 500, 'lowpass', 1, i * 0.3); } },
    click() { burst(0.05, 0.35, 1800, 'bandpass', 4); tone(300, 0.04, 'square', 0.06); },
    heartbeat() { tone(60, 0.16, 'sine', 0.5, 38); tone(55, 0.18, 'sine', 0.4, 36, 0.24); },
    bell() { [[1, .3], [2.01, .16], [2.76, .12], [4.07, .08], [5.4, .05]].forEach(([m, v]) => tone(118 * m, 4.2 / (.6 + m * .35), 'sine', v, null)); burst(0.12, 0.2, 1500, 'bandpass', 2); },
    kettle() { tone(900, 1.8, 'sawtooth', 0.08, 2400); tone(1350, 1.8, 'sine', 0.07, 3600); burst(1.6, 0.14, 4200, 'highpass', 0.6); },
    organ() { [130.8, 164.8, 196, 261.6].forEach(f => { tone(f, 2.6, 'sawtooth', 0.045); tone(f * 2, 2.6, 'square', 0.02); }); tone(65.4, 2.8, 'triangle', 0.14); },
    gramo() {
      [659.25, 523.25, 392, 0, 659.25, 523.25, 349].forEach((f, i) => { if (f) { tone(f * .94, 1.1, 'triangle', 0.1, f * .9, i * 0.85); tone(f * 1.5, 0.8, 'sine', 0.02, null, i * 0.85); } });
      burst(6, 0.04, 3200, 'highpass', 0.5);
    }
  };
  // how loud each recording plays, and which ones keep the synth underneath for weight
  const MIX = { warn: { v: 1 }, step: { v: .35 }, tap: { v: .5 }, click: { v: .45 }, select: { v: .4 }, pickup: { v: .5, layer: 1 }, slam: { v: 1, layer: 1 },
    thump: { v: .8 }, open: { v: .7 }, creak: { v: .7 }, unlock: { v: .8 }, bell: { v: .75 }, knock: { v: .8 },
    shriek: { v: 1 }, heartbeat: { v: .85 }, rooster: { v: .7 }, mosquito: { v: .45 }, giggle: { v: .6 }, flame: { v: .8 }, pound: { v: .85, layer: 1 }, kettle: { v: .5 }, snuff: { v: .8 }, ekpe: { v: .3, layer: 1 } };
  const KEEP = ['init', 'stopVoices', 'setMuted', 'adMute', 'suspend', 'resume', 'radio', 'murmur', 'voice', 'music', 'musicScore', 'stompAt', 'creakAt', 'muted'];
  Object.keys(api).forEach(k => {
    const d = Object.getOwnPropertyDescriptor(api, k);
    if (KEEP.includes(k) || typeof d.value !== 'function') return;
    const orig = d.value, m = MIX[k] || {};
    api[k] = k === 'knock'
      ? (n = 3) => { if (!SB.knock || !SB.knock.length) return orig(n); for (let i = 0; i < n; i++) sample('knock', m.v, i * .3); }
      : k === 'stomp'    // Ojuju's footfall: the recording, with the low synth thud kept underneath for weight
      ? (v = 1) => { if (sample('stomp', Math.min(1.4, v * 1.2))) tone(46, .22, 'sine', .22 * v, 30); else orig(v); }
      : k === 'breath'   // from the side he is on
      ? (pan = 0) => { if (!SB.breath || !SB.breath.length) return orig(pan); panned(pan, () => sample('breath', .9)); }
      : (...a) => { if (!sample(k, m.v || 1)) return orig(...a); if (m.layer) orig(...a); };
  });
  /* looping beds: the crickets outside under everything, and the grandfather clock in the Living Room */
  const LOOP = {}, LOOPT = {};
  function loopOn(k, vol, fade = 1.5) {
    if (!ctx || typeof SFX === 'undefined' || !SFX[k]) return;
    if (LOOP[k]) { LOOP[k].g.gain.setTargetAtTime(vol, ctx.currentTime, fade / 3); return; }
    const L = SB[k];
    if (!L || !L.length) { clearTimeout(LOOPT[k]); LOOPT[k] = setTimeout(() => loopOn(k, vol, fade), 700); return; }   // still decoding
    const src = ctx.createBufferSource(); src.buffer = L[0]; src.loop = true;
    const g = ctx.createGain(); g.gain.value = .0001; src.connect(g); g.connect(bedBus()); src.start();
    g.gain.setTargetAtTime(vol, ctx.currentTime, fade / 3);
    LOOP[k] = { src, g };
  }
  function loopOff(k, fade = 1) {
    clearTimeout(LOOPT[k]); const l = LOOP[k]; if (!l || !ctx) return; delete LOOP[k];
    l.g.gain.setTargetAtTime(.0001, ctx.currentTime, fade / 3);
    setTimeout(() => { try { l.src.stop(); l.src.disconnect(); } catch (e) { /* gone */ } }, fade * 1000 + 500);
  }
  api.ambience = where => {
    loopOn('night', where === 'roof' ? .5 : where === 'title' ? .22 : .16);
    if (where === 'foyer') loopOn('clock', .32); else loopOff('clock');
  };
  api.phone = () => { if (!sample('phone', .7)) { api.bell(); setTimeout(() => api.bell(), 500); } };
  api.rain = () => { if (!sample('rain', .75)) api.whisper(); };
  api.bus = () => { if (!sample('bus', .6)) generator(); };
  api.okada = () => { if (!sample('okada', .7)) generator(); };
  api.glass = () => { if (!sample('glass', 1)) { burst(.5, .5, 4200, 'highpass', .6); burst(.25, .4, 2600, 'bandpass', 2, .05); } };
  api.cheer = () => sample('cheer', .9);                 // "Up NEPA!"
  api.callTobi = () => sample('calltobi', 1);           // Ojuju calling Tobi's name
  api.page = () => sample('page', .6);      // turning a memory page
  api.cowrie = () => sample('cowrie', .6);  // a cowrie in the hand
  return api;
})();
