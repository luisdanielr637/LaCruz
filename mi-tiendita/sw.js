
const CACHE = 'mi-tiendita-v4';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // No realizar solicitudes a servidores externos.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(async cached => {
      if (cached) return cached;

      try {
        const response = await fetch(event.request);

        if (response.ok) {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          await cache.put(event.request, copy);
        }

        return response;
      } catch (error) {
        return caches.match('./index.html');
      }
    })
  );
});
