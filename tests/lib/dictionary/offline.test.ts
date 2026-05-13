import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DictionaryShard, ManifestShard } from '@/src/types/dictionary';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
  _resetCacheForTesting,
} from '@/src/lib/storage';
import { loadFullDictionary, _resetForTesting } from '@/src/lib/dictionary/loader';

// Mock the storage layer so we can control IDB behavior
vi.mock('@/src/lib/storage', () => ({
  getShardFromCache: vi.fn(),
  putShardToCache: vi.fn(),
  getCachedManifestVersion: vi.fn(),
  setCachedManifestVersion: vi.fn(),
  clearCache: vi.fn(),
  _resetCacheForTesting: vi.fn(),
}));

// Mock the static import used by getInlineIndex
vi.mock('@/public/data/index.json', () => ({
  default: {
    _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
    version: '1.0.0',
    entries: [],
  },
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
      lemmaId: 'ktb-ktb',
      arabic: 'كِتَابٌ',
      lemma: 'كِتَاب',
      root: 'ktb',
      phoneticKeys: ['ktb'],
      meaning: 'book',
      partOfSpeech: 'noun',
      occurrences: [{ sura: 2, ayah: 2, wordIndex: 3 }],
      reviewStatus: 'auto',
    },
  ],
};

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  _resetForTesting();
  vi.clearAllMocks();
  vi.mocked(getShardFromCache).mockResolvedValue(null);
  vi.mocked(putShardToCache).mockResolvedValue(undefined);
  vi.mocked(getCachedManifestVersion).mockResolvedValue(null);
  vi.mocked(setCachedManifestVersion).mockResolvedValue(undefined);
  vi.mocked(clearCache).mockResolvedValue(undefined);
  fetchSpy = vi.spyOn(globalThis, 'fetch') as unknown as typeof fetchSpy;
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('Offline fallback — loadFullDictionary', () => {
  describe('network unavailable + IDB has cached data (AC4)', () => {
    it('returns cached DictionaryShard without throwing', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
    });

    it('logs a console.warn about staleness (AC10)', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await loadFullDictionary();

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('staleness'));
      warnSpy.mockRestore();
    });

    it('handles non-ok manifest response when IDB has data', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      fetchSpy.mockResolvedValue(new Response('Server Error', { status: 500 }));

      const result = await loadFullDictionary();

      expect(result).toEqual(FAKE_DICT);
    });
  });

  describe('network unavailable + IDB empty (AC5)', () => {
    it('throws when no cached data exists', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(null);
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(loadFullDictionary()).rejects.toThrow();
    });
  });

  describe('dictionary fetch fails but manifest succeeded + IDB has data', () => {
    it('falls back to cache when dictionary.json fetch fails', async () => {
      vi.mocked(getShardFromCache).mockResolvedValue(FAKE_DICT);
      vi.mocked(getCachedManifestVersion).mockResolvedValue('different-version');

      let callCount = 0;
      fetchSpy.mockImplementation(async (input: unknown) => {
        callCount++;
        const url = typeof input === 'string' ? input : String(input);
        if (url.includes('manifest.json')) {
          return new Response(JSON.stringify(FAKE_MANIFEST), { status: 200 });
        }
        // dictionary.json fails
        throw new TypeError('Failed to fetch');
      });

      const result = await loadFullDictionary();
      expect(result).toEqual(FAKE_DICT);
    });
  });
});
