const CACHE = 'mcut-v2';

// Solo archivos pequeños en la instalación inicial
const CORE_ASSETS = [
  './index.html',
  './solicitudes.html',
  './manifest.json',
  './manifest-inventario.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar — solo cachea archivos pequeños
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // addAll falla si alguno falla — usamos add individual
      return Promise.allSettled(
        CORE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// Activar — limpiar cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — red primero, caché como respaldo
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
