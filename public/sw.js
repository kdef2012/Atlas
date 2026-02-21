/**
 * @fileOverview ATLAS Service Worker
 * Mandatory fetch event listener to satisfy PWA installation requirements on Android.
 */

const CACHE_NAME = 'atlas-nebula-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy required for PWA installation criteria
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});