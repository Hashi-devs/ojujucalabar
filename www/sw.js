const CACHE = 'ojuju-calabar-v19';
const ASSETS = ['./', 'index.html', 'privacy.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  const keep = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  if (same) { // game files: newest first, cached copy when offline
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(e.request.url)) { // fonts: cached copy first
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(keep)));
  }
});
