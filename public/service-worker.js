const FILES_TO_CACHE = [
    '/',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './db.js',
    './index.html',
    './index.js',
    './manifest.webmanifest',
    './styles.css',
  ];
  
  const PRECACHE = `pre-cache-v1`;
  const RUNTIME = "runtime-cache";
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  
  self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(RUNTIME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => {
          res.status(statusCode >= 100 && statusCode < 600 ? err.code : 500);
        })
      );
  
      return;
    }
  
    event.respondWith(
      caches.open(PRECACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });