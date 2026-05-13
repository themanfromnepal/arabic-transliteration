import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LemmaEntry, DictionaryShard, ManifestShard } from '@/src/types/dictionary';

// Hoisted mocks BEFORE imports
vi.mock('@/public/data/index.json', () => ({
  default: {
    _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
    version: '1.0.0',
    entries: [],
  },
}));

vi.mock('@/src/lib/storage', () => ({
  getShardFromCache: vi.fn(),
  putShardToCache: vi.fn(),
  getCachedManifestVersion: vi.fn(),
  setCachedManifestVersion: vi.fn(),
  clearCache: vi.fn(),
}));

// Then imports AFTER vi.mock
import { lookup, _resetForTesting } from '@/src/lib/dictionary/lookup';
import { _resetForTesting as _resetLoaderForTesting } from '@/src/lib/dictionary/loader';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
} from '@/src/lib/storage';

// ---------------------------------------------------------------------------
// Fixture data (5 entries)
// ---------------------------------------------------------------------------

const KITAB_ENTRY: LemmaEntry = {
  lemmaId: 'ktb-ktb',
  arabic: 'كِتَابٌ',
  lemma: 'كِتَاب',
  root: 'ktb',
  phoneticKeys: ['ktb', 'kitab'],
  meaning: 'book',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 2, ayah: 2, wordIndex: 3 }],
  reviewStatus: 'auto',
};

const RAHMAN_ENTRY: LemmaEntry = {
  lemmaId: 'rHm-rHmn',
  arabic: 'ٱلرَّحْمَٰنِ',
  lemma: 'رَّحْمَٰن',
  root: 'rHm',
  phoneticKeys: ['rHmn', 'rahman'],
  meaning: 'The Most Gracious',
  partOfSpeech: 'adjective',
  occurrences: [{ sura: 1, ayah: 1, wordIndex: 3 }],
  reviewStatus: 'auto',
};

const SALAAM_ENTRY: LemmaEntry = {
  lemmaId: 'Slm-Slm',
  arabic: 'سَلَامٌ',
  lemma: 'سَلَام',
  root: 'Slm',
  phoneticKeys: ['Slm', 'salaam'],
  meaning: 'peace',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 36, ayah: 58, wordIndex: 1 }],
  reviewStatus: 'auto',
};

const SAMAD_ENTRY: LemmaEntry = {
  lemmaId: 'Smd-Smd',
  arabic: 'ٱلصَّمَدُ',
  lemma: 'صَّمَد',
  root: 'Smd',
  phoneticKeys: ['Smd', 'samad'],
  meaning: 'The Eternal',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 112, ayah: 2, wordIndex: 2 }],
  reviewStatus: 'auto',
};

const ILAH_ENTRY: LemmaEntry = {
  lemmaId: 'Elh-Elh',
  arabic: 'إِلَٰهٌ',
  lemma: 'إِلَٰه',
  root: 'Elh',
  phoneticKeys: ['Elh', 'ilah'],
  meaning: 'god/deity',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 2, ayah: 163, wordIndex: 4 }],
  reviewStatus: 'auto',
};

const ALL_ENTRIES = [KITAB_ENTRY, RAHMAN_ENTRY, SALAAM_ENTRY, SAMAD_ENTRY, ILAH_ENTRY];

const FAKE_MANIFEST: ManifestShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  schemaVersion: '1.0.0',
  counts: { lemmas: 5, verses: 0, wbw: 0, yusufali: 0, occurrences: 0 },
};

const FAKE_DICT: DictionaryShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  version: '1.0.0',
  lemmas: ALL_ENTRIES,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  _resetForTesting();
  _resetLoaderForTesting();
  vi.clearAllMocks();

  // Storage mocks — all return null/undefined
  vi.mocked(getShardFromCache).mockResolvedValue(null);
  vi.mocked(putShardToCache).mockResolvedValue(undefined);
  vi.mocked(getCachedManifestVersion).mockResolvedValue(null);
  vi.mocked(setCachedManifestVersion).mockResolvedValue(undefined);
  vi.mocked(clearCache).mockResolvedValue(undefined);

  // Fetch mock
  fetchSpy = vi.spyOn(globalThis, 'fetch');
  mockFetchResponses({
    'manifest.json': FAKE_MANIFEST,
    'dictionary.json': FAKE_DICT,
  });
});

afterEach(() => {
  fetchSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('integration: full lookup pipeline', () => {
  describe('phonetic English input', () => {
    it('lookup("kitab") returns entry with lemmaId "ktb-ktb"', async () => {
      const results = await lookup('kitab');
      expect(results.some((r) => r.lemmaId === 'ktb-ktb')).toBe(true);
    });

    it('lookup("salaam") returns entry with meaning "peace"', async () => {
      const results = await lookup('salaam');
      expect(results.some((r) => r.lemmaId === 'Slm-Slm')).toBe(true);
    });

    it('lookup("ilah") returns entry for god/deity', async () => {
      const results = await lookup('ilah');
      expect(results.some((r) => r.lemmaId === 'Elh-Elh')).toBe(true);
    });
  });

  describe('Arabic input', () => {
    it('lookup("كتاب") returns matching entry via exact match (diacritics stripped)', async () => {
      const results = await lookup('كتاب');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]!.lemmaId).toBe('ktb-ktb');
    });

    it('lookup("كِتَابٌ") matches despite diacritics in input', async () => {
      const results = await lookup('كِتَابٌ');
      expect(results.some((r) => r.lemmaId === 'ktb-ktb')).toBe(true);
    });

    it('lookup("سلام") returns سَلَامٌ entry', async () => {
      const results = await lookup('سلام');
      expect(results.some((r) => r.lemmaId === 'Slm-Slm')).toBe(true);
    });
  });

  describe('Arabizi numeral input', () => {
    it('lookup("ra7man") matches via 7→ح phonetic mapping', async () => {
      const results = await lookup('ra7man');
      expect(results.some((r) => r.lemmaId === 'rHm-rHmn')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('empty string returns []', async () => {
      const results = await lookup('');
      expect(results).toEqual([]);
    });

    it('whitespace-only returns []', async () => {
      const results = await lookup('   ');
      expect(results).toEqual([]);
    });

    it('very long input (10,000 chars) returns without throwing', async () => {
      const results = await lookup('a'.repeat(10_000));
      expect(Array.isArray(results)).toBe(true);
    });

    it('mixed Arabic + Latin does not throw', async () => {
      const results = await lookup('كتاب book');
      expect(Array.isArray(results)).toBe(true);
    });

    it('standalone Arabizi numerals do not throw', async () => {
      for (const ch of ['7', '3', '2']) {
        const results = await lookup(ch);
        expect(Array.isArray(results)).toBe(true);
      }
    });

    it('diacritics-only input returns without error', async () => {
      const results = await lookup('\u0650\u0651');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deduplication and ranking', () => {
    it('results contain no duplicate lemmaIds', async () => {
      const results = await lookup('kitab');
      const ids = results.map((r) => r.lemmaId);
      expect(ids.length).toBe(new Set(ids).size);
    });

    it('exact match appears before fuzzy match', async () => {
      // Arabic exact match should be first
      const results = await lookup('كتاب');
      if (results.length > 0) {
        expect(results[0]!.lemmaId).toBe('ktb-ktb');
      }
    });

    it('results are capped at limit parameter', async () => {
      const results = await lookup('a', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('index caching', () => {
    it('second lookup reuses cached index (dictionary.json fetched once)', async () => {
      await lookup('kitab');
      await lookup('salaam');
      const dictCalls = fetchSpy.mock.calls.filter((call: unknown[]) =>
        String(call[0]).includes('dictionary.json'),
      );
      expect(dictCalls).toHaveLength(1);
    });
  });
});
