// Studio Voxel 3D — Service Worker
const CACHE_NAME = 'voxel3d-v1';
const urlsToCache = [
  '/studiovoxel3d/admin.html',
  '/studiovoxel3d/cliente.html',
  '/studiovoxel3d/manifest-admin.json',
  '/studiovoxel3d/manifest-cliente.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap'
];

// Instalar e cachear
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests — network first, cache fallback
self.addEventListener('fetch', function(event) {
  // Não cachear requests da API JSONBin
  if (event.request.url.includes('jsonbin.io') || 
      event.request.url.includes('api.')) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (!response || response.status !== 200) {
        return caches.match(event.request);
      }
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
