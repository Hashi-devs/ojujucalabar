/* ================= ADS: optional, and only where an ad can really play ================= */
/* The game never depends on an ad. On CrazyGames (their SDK is loaded by the CrazyGames build only)
   a player can choose a short video to skip the wait for a hint, or to relight a lantern when the last one
   goes out. Everywhere else (the Cloudflare site, the APK, this preview) there are no ad buttons at all. */
const ADS = { prov: null, adblock: false, playing: false };

async function adsInit() {
  const C = window.CrazyGames && window.CrazyGames.SDK;
  if (!C) return;
  try {
    await C.init();
    if (C.environment === 'crazygames' || C.environment === 'local') ADS.prov = 'cg';
    try { ADS.adblock = !!(await C.ad.hasAdblock()); } catch (e) { /* unknown: assume none */ }
  } catch (e) { ADS.prov = null; }
}
const adsCanReward = () => ADS.prov === 'cg' && !ADS.adblock && !ADS.playing;

/* tell the portal when real play starts and stops (CrazyGames asks for this) */
function adsGameplay(on) {
  if (ADS.prov !== 'cg') return;
  try { const g = window.CrazyGames.SDK.game; if (on) g.gameplayStart(); else g.gameplayStop(); } catch (e) { /* ignore */ }
}

/* a rewarded video. onReward only runs if the ad played to the end. */
function rewardedAd(onReward, onFail) {
  if (!adsCanReward()) { if (onFail) onFail('unavailable'); return; }
  ADS.playing = true;
  const wasPaused = G.paused;
  let started = false;
  const resume = () => { ADS.playing = false; if (started) { Snd.adMute(false); G.paused = wasPaused; adsGameplay(true); } };
  adsGameplay(false);
  try {
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adStarted: () => { started = true; G.paused = true; Snd.adMute(true); },
      adFinished: () => { resume(); if (onReward) onReward(); },
      adError: err => { resume(); if (!started) adsGameplay(true); if (onFail) onFail(err && err.code || 'other'); }
    });
  } catch (e) { ADS.playing = false; adsGameplay(true); if (onFail) onFail('other'); }
}

/* the little film icon that marks an ad button */
const AD_ICON = '<svg class="adico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.2v5.6l4.8-2.8z"/></svg>';
