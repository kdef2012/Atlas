/**
 * ATLAS Service Worker
 * Prioritizes network for live application updates while satisfying PWA install requirements.
 */

const CACHE_NAME = 'atlas-signal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (Server Actions, Auth, etc.)
  if (request.method !== 'GET') return;

  // 2. Skip workstation-internal paths and cross-origin requests
  // This prevents CORS/redirection errors in the developer environment
  if (
    url.pathname.includes('_workstation') || 
    url.pathname.includes('forwardAuthCookie') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // 3. Network-First Strategy
  // Ensures you always get the latest code I write, but keeps the app "installable"
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});
