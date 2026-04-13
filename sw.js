self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCriticalAsset =
    request.method === 'GET' &&
    isSameOrigin &&
    (
      request.mode === 'navigate' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'worker' ||
      request.destination === 'manifest' ||
      /\.(html|js|css|json)$/i.test(url.pathname)
    );

  if (!isCriticalAsset) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(new Request(request, { cache: 'no-store' })).catch(() => fetch(request))
  );
});
