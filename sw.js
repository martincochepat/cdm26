const CACHE_NAME = 'guide-mondial-2026-v15';
const ASSETS = ['/favicon.png','/apple-touch-icon.png','/icon-192.png','/icon-512.png','/guide-mondial-logo.svg','/guide-mondial-icon.svg','/manifest.webmanifest'];
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('guide-mondial-2026-') && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html') || request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
    return response;
  })));
});
