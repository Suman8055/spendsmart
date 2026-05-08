const CACHE = 'spendsmart-v6';
const STATIC = ['/spendsmart/manifest.json', '/spendsmart/icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML — always get the latest app when online.
// Cache-first for static assets (icon, manifest) — rarely change.
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match('/spendsmart/index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .catch(() => caches.match('/spendsmart/index.html')))
  );
});
