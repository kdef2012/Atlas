/**
 * ATLAS Nebula Service Worker
 * Mandatory fetch handler required for PWA installation on Android/Samsung devices.
 */

const CACHE_NAME = 'atlas-nebula-v1.1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/dashboard'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // A functional fetch handler is required for PWA install criteria
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
