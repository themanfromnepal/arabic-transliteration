import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DictionaryShard, ManifestShard } from '@/src/types/dictionary';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
} from '@/src/lib/storage';
import { getInlineIndex, loadFullDictionary } from '@/src/lib/dictionary';
import { _resetForTesting } from '@/src/lib/dictionary/loader';

vi.mock('@/public/data/index.json', () => ({
  default: {
    _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
    version: '1.0.0',
    entries: [{ lemmaId: 'L001', arabic: 'بِ', phoneticKeys: ['bi'], meaning: 'in/with' }],
  },
}));

vi.mock('@/src/lib/storage', () => ({
  getShardFromCache: vi.fn(),
  putShardToCache: vi.fn(),
  getCachedManifestVersion: vi.fn(),
  setCachedManifestVersion: vi.fn(),
  clearCache: vi.fn(),
}));

const FAKE_MANIFEST: ManifestShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  schemaVersion: '1.0.0',
  counts: { lemmas: 1, verses: 0, wbw: 0, yusufali: 0, occurrences: 0 },
};

const FAKE_DICT: DictionaryShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  version: '1.0.0',
  lemmas: [
    {
      lemmaId: 'L001',
      arabic: 'بِ',
      lemma: 'بِ',
      root: 'ب',
      phoneticKeys: ['bi'],
      meaning: 'in/with',
      partOfSpeech: 'PREP',
      occurrences: [{ sura: 1, ayah: 1, wordIndex: 1 }],
      reviewStatus: 'auto',
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchSpy: any;

function mockFetchResponses(responses: Record<string, unknown>) {
  fetchSpy.mockImplementation(async (input: unknown) => {
    const url = typeof input === 'string' ? input : String(input);
    for (const [pattern, data] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }
    return new Response('Not found', { status: 404 });
  });
}

beforeEach(() => {
  _resetForTesting();
  vi.clearAllMocks();
  vi.mocked(getShardFromCache).mockResolvedValue(null);
  vi.mocked(putShardToCache).mockResolvedValue(undefined);
  vi.mocked(getCachedManifestVersion).mockResolvedValue(null);
  vi.mocked(setCachedManifestVersion).mockResolvedValue(undefined);
  vi.mocked(clearCache).mockResolvedValue(undefined);
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('getInlineIndex', () => {
  it('returns InlineIndexEntry[] from the static import synchronously', () => {
    const result = getInlineIndex();
    expect(result).toEqual([
      { lemmaId: 'L001', arabic: 'بِ', phoneticKeys: ['bi'], meaning: 'in/with' },
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('loadFullDictionary', () => {
  describe('cold load', () => {
    it('fetches manifest + dictionary, writes to cache, returns DictionaryShard', async () => {
      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST, 'dictionary.json': FAKE_DICT });

      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
      expect(putShardToCache).toHaveBeenCalledWith('dictionary', FAKE_DICT);
      expect(setCachedManifestVersion).toHaveBeenCalledWith('2026-05-04T00:00:00Z');
    });
  });

  describe('warm load from IDB', () => {
    it('returns cached shard without fetching dictionary.json', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      vi.mocked(getCachedManifestVersion).mockResolvedValue('2026-05-04T00:00:00Z');
      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST });

      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0]![0]).toContain('manifest.json');
    });
  });

  describe('warm load from memory', () => {
    it('skips IDB and fetch on second call', async () => {
      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST, 'dictionary.json': FAKE_DICT });

      await loadFullDictionary();
      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
      expect(getShardFromCache).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('stale cache', () => {
    it('clears cache and re-fetches when manifest version differs', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      vi.mocked(getCachedManifestVersion).mockResolvedValue('old-version');
      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST, 'dictionary.json': FAKE_DICT });

      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
      expect(clearCache).toHaveBeenCalled();
      expect(putShardToCache).toHaveBeenCalledWith('dictionary', FAKE_DICT);
      expect(setCachedManifestVersion).toHaveBeenCalledWith('2026-05-04T00:00:00Z');
    });
  });

  describe('concurrent deduplication', () => {
    it('returns same result for concurrent callers; fetches once', async () => {
      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST, 'dictionary.json': FAKE_DICT });

      const p1 = loadFullDictionary();
      const p2 = loadFullDictionary();
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toBe(r2);
      const dictFetches = fetchSpy.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('dictionary.json'),
      );
      expect(dictFetches).toHaveLength(1);
    });
  });

  describe('fetch failure', () => {
    it('throws when manifest fetch fails', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('Error', { status: 500 }));

      await expect(loadFullDictionary()).rejects.toThrow(/Manifest fetch failed/);
    });

    it('throws when dictionary fetch fails', async () => {
      fetchSpy.mockImplementation(async (input: unknown) => {
        const url = typeof input === 'string' ? input : String(input);
        if (url.includes('manifest.json')) {
          return new Response(JSON.stringify(FAKE_MANIFEST), { status: 200 });
        }
        return new Response('Error', { status: 500 });
      });

      await expect(loadFullDictionary()).rejects.toThrow(/Dictionary fetch failed/);
    });

    it('throws on network error', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(loadFullDictionary()).rejects.toThrow(TypeError);
    });

    it('clears inflightPromise after failure so retry is possible', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(loadFullDictionary()).rejects.toThrow(TypeError);

      mockFetchResponses({ 'manifest.json': FAKE_MANIFEST, 'dictionary.json': FAKE_DICT });

      const result = await loadFullDictionary();
      expect(result).toEqual(FAKE_DICT);
    });
  });
});
