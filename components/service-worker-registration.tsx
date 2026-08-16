'use client';

import { useEffect } from 'react';

/**
 * Registers the app-shell service worker in production only.
 *
 * Registering in development would let a cached shell shadow the dev server's output, which is a
 * confusing failure to debug. It renders nothing.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    // Wait for load so registration never competes with the first paint for bandwidth.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A failed registration costs offline support, not the app. Nothing to surface.
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
