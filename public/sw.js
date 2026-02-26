/**
 * ATLAS Service Worker
 * Technical requirement for PWA installation on Android/Samsung devices.
 * Hardened to ignore workstation-specific authentication redirects.
 */

const CACHE_NAME = 'atlas-cache-v1';

// We skip caching workstation-specific internal paths and cross-origin auth redirects
const IGNORED_HOSTS = [
  'cloudworkstations.dev',
  'google.com',
  'firebase.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Ignore all cross-origin requests and internal workstation redirects.
  // Intercepting these causes CORS and network failures during manifest loading.
  if (
    url.origin !== self.location.origin || 
    url.pathname.includes('_workstation') || 
    url.pathname.includes('forwardAuthCookie') ||
    url.pathname.includes('manifest')
  ) {
    return;
  }

  // Basic "Cache-First" strategy for local assets to satisfy PWA requirements
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
