
'use client';

import { useEffect } from 'react';

/**
 * Registers a minimal service worker to satisfy PWA requirements
 * for Android/Chrome "Install App" functionality.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ATLAS ServiceWorker registered:', registration.scope);
        },
        (error) => {
          console.error('ATLAS ServiceWorker registration failed:', error);
        }
      );
    }
  }, []);

  return null;
}
