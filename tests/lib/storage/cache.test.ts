import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, set, clear } from 'idb-keyval';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
} from '@/src/lib/storage';

const store = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: IDBValidKey) => store.get(String(key))),
  set: vi.fn(async (key: IDBValidKey, value: unknown) => {
    store.set(String(key), value);
  }),
  clear: vi.fn(async () => {
    store.clear();
  }),
}));

beforeEach(() => {
  store.clear();
  vi.mocked(get).mockImplementation(async (key: IDBValidKey) => store.get(String(key)) as any);
  vi.mocked(set).mockImplementation(async (key: IDBValidKey, value: unknown) => {
    store.set(String(key), value);
  });
  vi.mocked(clear).mockImplementation(async () => {
    store.clear();
  });
});

describe('Storage Cache', () => {
  describe('getShardFromCache / putShardToCache', () => {
    it('round-trips a stored value with deep equality', async () => {
      const shard = { version: '1.0.0', lemmas: [{ id: 'test', arabic: 'تَسْت' }] };
      await putShardToCache('dictionary-shard-0', shard);
      const result = await getShardFromCache<typeof shard>('dictionary-shard-0');
      expect(result).toEqual(shard);
    });

    it('returns null on cache miss', async () => {
      const result = await getShardFromCache('nonexistent-key');
      expect(result).toBeNull();
    });
  });

  describe('getCachedManifestVersion / setCachedManifestVersion', () => {
    it('round-trips the manifest version string', async () => {
      const version = '2026-05-04T01:46:05.527Z';
      await setCachedManifestVersion(version);
      const result = await getCachedManifestVersion();
      expect(result).toBe(version);
    });

    it('returns null when no version has been set', async () => {
      const result = await getCachedManifestVersion();
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('removes all stored shards and the manifest version', async () => {
      await putShardToCache('shard-a', { data: 'a' });
      await putShardToCache('shard-b', { data: 'b' });
      await setCachedManifestVersion('2026-05-04T01:46:05.527Z');

      await clearCache();

      expect(await getShardFromCache('shard-a')).toBeNull();
      expect(await getShardFromCache('shard-b')).toBeNull();
      expect(await getCachedManifestVersion()).toBeNull();
    });
  });

  describe('graceful fallback — IndexedDB unavailable', () => {
    it('getShardFromCache returns null when get throws', async () => {
      vi.mocked(get).mockRejectedValueOnce(new Error('IDB unavailable'));
      const result = await getShardFromCache('any-key');
      expect(result).toBeNull();
    });

    it('putShardToCache resolves without throwing when set throws', async () => {
      vi.mocked(set).mockRejectedValueOnce(new Error('IDB unavailable'));
      await expect(putShardToCache('any-key', { data: 'test' })).resolves.toBeUndefined();
    });

    it('getCachedManifestVersion returns null when get throws', async () => {
      vi.mocked(get).mockRejectedValueOnce(new Error('IDB unavailable'));
      const result = await getCachedManifestVersion();
      expect(result).toBeNull();
    });

    it('setCachedManifestVersion resolves without throwing when set throws', async () => {
      vi.mocked(set).mockRejectedValueOnce(new Error('IDB unavailable'));
      await expect(setCachedManifestVersion('2026-01-01')).resolves.toBeUndefined();
    });

    it('clearCache resolves without throwing when clear throws', async () => {
      vi.mocked(clear).mockRejectedValueOnce(new Error('IDB unavailable'));
      await expect(clearCache()).resolves.toBeUndefined();
    });
  });

  describe('graceful fallback — quota exceeded', () => {
    it('putShardToCache no-ops on QuotaExceededError', async () => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      vi.mocked(set).mockRejectedValueOnce(err);
      await expect(putShardToCache('key', { big: 'data' })).resolves.toBeUndefined();
    });

    it('setCachedManifestVersion no-ops on QuotaExceededError', async () => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      vi.mocked(set).mockRejectedValueOnce(err);
      await expect(setCachedManifestVersion('2026-01-01')).resolves.toBeUndefined();
    });
  });
});
