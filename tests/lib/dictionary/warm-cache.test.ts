import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock loader before importing warm-cache
vi.mock('@/src/lib/dictionary/loader', () => ({
  loadFullDictionary: vi.fn(),
}));

import { warmCache, _resetWarmCacheForTesting } from '@/src/lib/dictionary/warm-cache';
import { loadFullDictionary } from '@/src/lib/dictionary/loader';

const mockedLoad = vi.mocked(loadFullDictionary);

let originalRIC: typeof globalThis.requestIdleCallback | undefined;

beforeEach(() => {
  _resetWarmCacheForTesting();
  vi.clearAllMocks();
  mockedLoad.mockResolvedValue({ version: '1.0.0', lemmas: [] } as any);
  originalRIC = globalThis.requestIdleCallback;
});

afterEach(() => {
  // Restore requestIdleCallback
  if (originalRIC) {
    globalThis.requestIdleCallback = originalRIC;
  } else {
    delete (globalThis as any).requestIdleCallback;
  }
});

describe('warmCache', () => {
  describe('with requestIdleCallback available', () => {
    it('schedules loadFullDictionary via requestIdleCallback (AC1)', () => {
      const callbacks: IdleRequestCallback[] = [];
      globalThis.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
        callbacks.push(cb);
        return 1;
      });

      warmCache();

      expect(globalThis.requestIdleCallback).toHaveBeenCalledOnce();
      expect(mockedLoad).not.toHaveBeenCalled(); // not called yet — only scheduled

      // Simulate idle callback firing
      callbacks[0]!({} as IdleDeadline);
      expect(mockedLoad).toHaveBeenCalledOnce();
    });
  });

  describe('without requestIdleCallback', () => {
    it('falls back to setTimeout (AC2)', () => {
      delete (globalThis as any).requestIdleCallback;
      vi.useFakeTimers();

      warmCache();

      expect(mockedLoad).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(mockedLoad).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });
  });

  describe('idempotency (AC3)', () => {
    it('multiple calls trigger only one load', () => {
      const callbacks: IdleRequestCallback[] = [];
      globalThis.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
        callbacks.push(cb);
        return 1;
      });

      warmCache();
      warmCache();
      warmCache();

      expect(globalThis.requestIdleCallback).toHaveBeenCalledOnce();

      callbacks[0]!({} as IdleDeadline);
      expect(mockedLoad).toHaveBeenCalledOnce();
    });
  });

  describe('fire-and-forget', () => {
    it('swallows loadFullDictionary errors without unhandled rejection', async () => {
      mockedLoad.mockRejectedValue(new Error('Network error'));
      const callbacks: IdleRequestCallback[] = [];
      globalThis.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
        callbacks.push(cb);
        return 1;
      });

      warmCache();
      callbacks[0]!({} as IdleDeadline);

      // Flush microtasks — no unhandled rejection should occur
      (await vi.dynamicImportSettled?.()) ?? new Promise((r) => setTimeout(r, 0));
    });
  });
});
