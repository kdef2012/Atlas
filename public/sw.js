
/**
 * ATLAS Service Worker
 * Mandatory for PWA installation on Android/Samsung devices.
 * Ensures the app can be installed to the home screen.
 */

const CACHE_NAME = 'atlas-core-v1';

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard fetch pass-through.
  // Required by Chrome/Samsung Internet to qualify for "Install" prompt.
  event.respondWith(fetch(event.request));
});
