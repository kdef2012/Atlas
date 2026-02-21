/**
 * ATLAS PWA Service Worker
 * 
 * This file is required for Android browsers to trigger the "Install App" prompt.
 * It also handles offline caching and environment-specific request filtering.
 */

const CACHE_NAME = 'atlas-v1';

// We don't pre-cache everything to keep the app lightweight and avoid workstation auth issues
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Skip intercepting workstation internal authentication or socket requests.
  // These often involve redirects to different origins which cause CORS/network failures in fetch listeners.
  if (
    url.pathname.includes('_workstation') || 
    url.pathname.includes('forwardAuthCookie') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Standard fetch behavior for app resources
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, try cache (or just fail gracefully for now)
      return caches.match(event.request);
    })
  );
});
