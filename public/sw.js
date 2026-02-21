/**
 * ATLAS Service Worker
 * Required for PWA installation on Android/Chrome.
 */

const CACHE_NAME = 'atlas-cache-v1';

// We don't necessarily need to cache everything for the install prompt to work,
// but we MUST have a fetch handler.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through fetch handler satisfies the PWA requirement
  event.respondWith(fetch(event.request));
});
