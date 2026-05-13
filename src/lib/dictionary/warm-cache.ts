import { loadFullDictionary } from './loader';

let warmed = false;

export function warmCache(): void {
  if (warmed) return;
  warmed = true;

  const schedule =
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb: IdleRequestCallback) => setTimeout(cb, 0);

  schedule(() => {
    loadFullDictionary().catch(() => {});
  });
}

export function _resetWarmCacheForTesting(): void {
  warmed = false;
}
