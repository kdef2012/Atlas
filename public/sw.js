/**
 * ATLAS Nebula Service Worker
 * Critical for Android/Samsung PWA installation and offline app shell caching.
 */

const CACHE_NAME = 'atlas-core-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/dashboard',
  '/quests',
  '/profile'
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
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler required for PWA "Install" prompt
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
