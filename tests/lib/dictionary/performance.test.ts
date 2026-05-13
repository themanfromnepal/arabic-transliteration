import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LemmaEntry, DictionaryShard, ManifestShard } from '@/src/types/dictionary';

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

import { lookup, _resetForTesting } from '@/src/lib/dictionary/lookup';
import { _resetForTesting as _resetLoaderForTesting } from '@/src/lib/dictionary/loader';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
} from '@/src/lib/storage';

function generateEntries(count: number): LemmaEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    lemmaId: `lemma-${i}`,
    arabic: `عرب${i}`,
    lemma: `عرب${i}`,
    root: `root${i}`,
    phoneticKeys: [`key${i}`, `phonetic${i}`],
    meaning: `meaning ${i}`,
    partOfSpeech: 'noun',
    occurrences: [{ sura: 1, ayah: i + 1, wordIndex: 1 }],
    reviewStatus: 'auto' as const,
  }));
}

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

const ALL_ENTRIES = [KITAB_ENTRY, ...generateEntries(49)];

const FAKE_MANIFEST: ManifestShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  schemaVersion: '1.0.0',
  counts: { lemmas: ALL_ENTRIES.length, verses: 0, wbw: 0, yusufali: 0, occurrences: 0 },
};

const FAKE_DICT: DictionaryShard = {
  _meta: { generatedAt: '2026-05-04T00:00:00Z', sources: [] },
  version: '1.0.0',
  lemmas: ALL_ENTRIES,
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

function computeP95(timings: number[]): number {
  const sorted = [...timings].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[index]!;
}

describe('performance: lookup latency', { timeout: 30_000 }, () => {
  beforeEach(() => {
    _resetForTesting();
    _resetLoaderForTesting();
    vi.clearAllMocks();

    vi.mocked(getShardFromCache).mockResolvedValue(null);
    vi.mocked(putShardToCache).mockResolvedValue(undefined);
    vi.mocked(getCachedManifestVersion).mockResolvedValue(null);
    vi.mocked(setCachedManifestVersion).mockResolvedValue(undefined);
    vi.mocked(clearCache).mockResolvedValue(undefined);

    fetchSpy = vi.spyOn(globalThis, 'fetch');
    mockFetchResponses({
      'manifest.json': FAKE_MANIFEST,
      'dictionary.json': FAKE_DICT,
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('warm-cache p95', () => {
    it('p95 ≤ 50 ms over 100 iterations', async () => {
      // Prime the cache with first call
      await lookup('kitab');

      const timings: number[] = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await lookup('kitab');
        timings.push(performance.now() - start);
      }

      const p95 = computeP95(timings);
      expect(p95).toBeLessThanOrEqual(50);
    });
  });

  describe('cold-cache p95', () => {
    it('p95 ≤ 500 ms over 20 iterations', async () => {
      const timings: number[] = [];
      for (let i = 0; i < 20; i++) {
        _resetForTesting();
        _resetLoaderForTesting();
        // Re-mock storage since clearAllMocks would clear them
        vi.mocked(getShardFromCache).mockResolvedValue(null);
        vi.mocked(putShardToCache).mockResolvedValue(undefined);
        vi.mocked(getCachedManifestVersion).mockResolvedValue(null);
        vi.mocked(setCachedManifestVersion).mockResolvedValue(undefined);
        vi.mocked(clearCache).mockResolvedValue(undefined);

        const start = performance.now();
        await lookup('kitab');
        timings.push(performance.now() - start);
      }

      const p95 = computeP95(timings);
      expect(p95).toBeLessThanOrEqual(500);
    });
  });
});
