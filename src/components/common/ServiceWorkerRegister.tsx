
'use client';

import { useEffect } from 'react';

/**
 * Registers the ATLAS Service Worker.
 * This is the technical requirement for the "Install App" prompt on Android.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ATLAS Signal Locked: ServiceWorker registered');
          })
          .catch((error) => {
            console.error('ATLAS Signal Failure: ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
