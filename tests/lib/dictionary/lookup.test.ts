import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LemmaEntry } from '@/src/types/dictionary';

vi.mock('@/src/lib/transliterator', () => ({
  transliterate: vi.fn(),
}));

vi.mock('@/src/lib/dictionary/loader', () => ({
  loadFullDictionary: vi.fn(),
}));

vi.mock('@/src/lib/dictionary/search-index', () => ({
  createSearchIndex: vi.fn(),
  fuzzySearch: vi.fn(),
}));

import { lookup, _resetForTesting } from '@/src/lib/dictionary/lookup';
import { transliterate } from '@/src/lib/transliterator';
import { loadFullDictionary } from '@/src/lib/dictionary/loader';
import { createSearchIndex, fuzzySearch } from '@/src/lib/dictionary/search-index';

const mockedTransliterate = vi.mocked(transliterate);
const mockedLoadFullDictionary = vi.mocked(loadFullDictionary);
const mockedCreateSearchIndex = vi.mocked(createSearchIndex);
const mockedFuzzySearch = vi.mocked(fuzzySearch);

const KITAB_ENTRY: LemmaEntry = {
  lemmaId: 'ktb-ktb',
  arabic: 'كِتَابٌ',
  lemma: 'كِتَاب',
  root: 'ktb',
  phoneticKeys: ['ktb'],
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
  phoneticKeys: ['rHmn'],
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
  phoneticKeys: ['Slm'],
  meaning: 'peace',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 36, ayah: 58, wordIndex: 1 }],
  reviewStatus: 'auto',
};

const ALL_ENTRIES = [KITAB_ENTRY, RAHMAN_ENTRY, SALAAM_ENTRY];

const fakeIndex = {} as ReturnType<typeof createSearchIndex>;

beforeEach(() => {
  _resetForTesting();
  vi.clearAllMocks();

  mockedLoadFullDictionary.mockResolvedValue({
    version: '1.0.0',
    lemmas: ALL_ENTRIES,
  } as never);
  mockedCreateSearchIndex.mockReturnValue(fakeIndex);
  mockedFuzzySearch.mockReturnValue([]);
  mockedTransliterate.mockReturnValue('');
});

describe('lookup', () => {
  describe('empty input', () => {
    it('returns [] for empty string', async () => {
      expect(await lookup('')).toEqual([]);
    });

    it('returns [] for whitespace-only input', async () => {
      expect(await lookup('   ')).toEqual([]);
    });

    it('does not call transliterate or fuzzySearch', async () => {
      await lookup('');
      expect(mockedTransliterate).not.toHaveBeenCalled();
      expect(mockedFuzzySearch).not.toHaveBeenCalled();
    });
  });

  describe('Latin input — exact + fuzzy', () => {
    it('returns exact match from transliteration path', async () => {
      mockedTransliterate.mockReturnValue('كتاب');
      mockedFuzzySearch.mockReturnValue([]);

      const result = await lookup('kitab');
      expect(result).toContainEqual(KITAB_ENTRY);
    });

    it('returns fuzzy results when no exact match', async () => {
      mockedTransliterate.mockReturnValue('xyz');
      mockedFuzzySearch.mockReturnValue([{ item: KITAB_ENTRY, score: 0.3 }]);

      const result = await lookup('kitab');
      expect(result).toContainEqual(KITAB_ENTRY);
    });

    it('deduplicates when same lemma found in both paths', async () => {
      mockedTransliterate.mockReturnValue('كتاب');
      mockedFuzzySearch.mockReturnValue([{ item: KITAB_ENTRY, score: 0.1 }]);

      const result = await lookup('kitab');
      const kitabCount = result.filter((e) => e.lemmaId === 'ktb-ktb').length;
      expect(kitabCount).toBe(1);
    });

    it('ranks exact matches before fuzzy matches', async () => {
      mockedTransliterate.mockReturnValue('كتاب');
      mockedFuzzySearch.mockReturnValue([{ item: SALAAM_ENTRY, score: 0.2 }]);

      const result = await lookup('kitab');
      expect(result[0]).toEqual(KITAB_ENTRY);
      expect(result[1]).toEqual(SALAAM_ENTRY);
    });
  });

  describe('Arabic input', () => {
    it('returns exact match without calling transliterate', async () => {
      mockedFuzzySearch.mockReturnValue([]);

      const result = await lookup('كتاب');
      expect(result).toContainEqual(KITAB_ENTRY);
      expect(mockedTransliterate).not.toHaveBeenCalled();
    });

    it('handles Arabic input with diacritics', async () => {
      mockedFuzzySearch.mockReturnValue([]);

      const result = await lookup('كِتَابٌ');
      expect(result).toContainEqual(KITAB_ENTRY);
    });
  });

  describe('multi-variant resolution', () => {
    it('resolves different spellings to the same lemma', async () => {
      mockedTransliterate.mockReturnValue('رحمن');
      mockedFuzzySearch.mockReturnValue([]);

      const result1 = await lookup('rahman');
      _resetForTesting();

      mockedTransliterate.mockReturnValue('رحمن');
      const result2 = await lookup('rahmaan');

      expect(result1.map((e) => e.lemmaId)).toEqual(result2.map((e) => e.lemmaId));
    });
  });

  describe('index caching', () => {
    it('creates search index only once across multiple calls', async () => {
      mockedFuzzySearch.mockReturnValue([]);
      mockedTransliterate.mockReturnValue('');

      await lookup('test1');
      await lookup('test2');

      expect(mockedCreateSearchIndex).toHaveBeenCalledTimes(1);
    });
  });

  describe('limit parameter', () => {
    it('respects custom limit', async () => {
      mockedTransliterate.mockReturnValue('');
      mockedFuzzySearch.mockReturnValue(ALL_ENTRIES.map((item) => ({ item, score: 0.2 })));

      const result = await lookup('test', 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });
});
