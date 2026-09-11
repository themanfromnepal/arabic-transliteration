/*
 * Minimal app-shell service worker.
 *
 * Hand-written rather than generated: `next-pwa` does not work with `output: 'export'` in Next 15,
 * and docs/architecture.md specifies a minimal worker at this path registered from the root layout.
 * Because a static export produces content-hashed asset names that are unknown when this file is
 * authored, there is no precache manifest — the shell is cached at runtime on first use instead.
 *
 * Strategies:
 *   - Navigations      network-first, falling back to cache, then to the cached home shell.
 *   - Static assets    cache-first for /_next/static/** and /fonts/** (content-hashed, immutable).
 *   - /data/**         not handled at all. The dictionary store owns those shards and caches them
 *                      in IndexedDB; caching them here too would double the storage footprint.
 *   - Cross-origin     not handled. Audio streams from everyayah.com stay on the HTTP cache.
 *
 * Deviation worth knowing about: docs/performance.md describes HTML as served "cache-first from
 * precache". Taken literally that would pin learners to the deployment they first visited, because
 * a cached shell would win over a newer one indefinitely. Navigations are therefore network-first
 * with a cache fallback, which satisfies both stated intents — latest deployment when online, and a
 * shell that loads with no network after first use.
 */

const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const HOME_SHELL = '/';

const CACHEABLE_ASSET_PREFIXES = ['/_next/static/', '/fonts/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([HOME_SHELL, '/about', '/credits', '/privacy']))
      // A failed precache must not block activation; runtime caching will fill the gap.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheableAsset(url) {
  return CACHEABLE_ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    const shell = await cache.match(HOME_SHELL);
    if (shell) return shell;

    throw new Error('Offline and no cached shell available');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);

  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The dictionary store owns /data/** in IndexedDB. Leave it to the network.
  if (url.pathname.startsWith('/data/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
