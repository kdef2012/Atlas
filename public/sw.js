const CACHE_NAME = 'atlas-v1';

// Mandatory for PWA installation on Android
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // WORKSTATION COMPATIBILITY: Skip interception for workstation auth redirects and manifest
  // This prevents the CORS and net::ERR_FAILED errors in your specific environment
  if (
    event.request.url.includes('_workstation') || 
    event.request.url.includes('forwardAuthCookie') ||
    event.request.url.endsWith('manifest.webmanifest')
  ) {
    return;
  }

  // Standard fetch-first strategy for dynamic content
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
