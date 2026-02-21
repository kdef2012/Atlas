
/**
 * ATLAS PWA Service Worker
 * Mandatory fetch listener to enable "Install App" prompt on Android browsers.
 */

const CACHE_NAME = 'atlas-nebula-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard pass-through fetch listener
  // Required by Chrome/Samsung Internet for PWA eligibility
  event.respondWith(fetch(event.request));
});
