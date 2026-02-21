
/**
 * ATLAS Core Service Worker
 * Required for PWA installation on Android/Samsung devices.
 */

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Allow the service worker to take control of the page immediately.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard fetch listener to satisfy PWA installation criteria.
  // This allows the app to be installed even if we aren't using advanced caching yet.
  event.respondWith(fetch(event.request));
});
