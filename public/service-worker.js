const FILES_TO_CACHE = [
    '/',
    './index.html',
    './style.css',
    './db.js',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './index.js',
    './manifest.webmanifest',
  ];
  
  const PRE_CACHE = `pre-cache-v1`;
  const RUNTIME_CACHE = "runtime-cache";
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(PRE_CACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
 
  self.addEventListener('activate', (event) => {
    const currentCaches = [PRE_CACHE, RUNTIME_CACHE];
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
        .catch(err => {
          res.status(statusCode >= 100 && statusCode < 600 ? err.code : 500);
        })
    );
  });
  
  
  
  self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(evt.request)
            .then(response => {
            
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(evt.request);
            });
        }).catch(err => {
          res.status(statusCode >= 100 && statusCode < 600 ? err.code : 500);
        })
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(PRE_CACHE).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });