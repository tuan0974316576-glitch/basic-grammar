self.APP_CACHE_VERSION = 'v0.59-20260508';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install', self.APP_CACHE_VERSION);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate', self.APP_CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
