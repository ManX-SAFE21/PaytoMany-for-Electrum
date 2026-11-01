/* Service worker — network-first, so the app always updates.
   GitHub Pages sends Cache-Control: max-age=600 and a phone browser (or an
   installed home-screen shortcut) can keep serving an old copy long after a
   new version is published. Here every same-origin request goes to the
   network first, bypassing the HTTP cache; the saved copy is only used when
   the network is unreachable, so the app still opens offline.

   Safe by design: a stale copy can never win while online. Bump CACHE only
   to throw away the offline copies. */
const CACHE = 'paytomany-offline-v1';
const ASSETS = [
  './', 'index.html', 'config.js', 'jsQR.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' }))))
      .catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Only our own files. Exchange-rate APIs and fonts go straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
