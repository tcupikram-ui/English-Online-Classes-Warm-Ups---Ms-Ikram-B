/* Offline helper for English Warm-ups. Change the version number below when you publish a big update. */
const V = 'warmups-v2';
const CORE = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'preview.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    // newest page when online, saved copy when offline
    e.respondWith(fetch(r).then(res => {
      const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin) {
    e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => {
      const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res;
    })));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(V).then(c => c.match(r).then(h => {
      const f = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => h);
      return h || f;
    })));
  }
});
