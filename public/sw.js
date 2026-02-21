
/**
 * ATLAS PWA Service Worker
 * Satisfies the requirement for Android "Install App" banners.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A fetch event listener is required for PWA installation eligibility.
  // We leave it as a pass-through for now to maintain standard Next.js behavior.
  event.respondWith(fetch(event.request));
});
