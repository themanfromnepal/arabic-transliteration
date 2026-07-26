import { describe, it, expect, beforeEach } from 'vitest';
import Fuse from 'fuse.js';
import type { LemmaEntry } from '@/src/types/dictionary';
import { normalizeQuery, createSearchIndex, fuzzySearch } from '@/src/lib/dictionary/search-index';

const FIXTURES: LemmaEntry[] = [
  {
    lemmaId: 'rHm-rHmn',
    arabic: 'ٱلرَّحْمَٰنِ',
    lemma: 'رَّحْمَٰن',
    root: 'rHm',
    phoneticKeys: ['rHmn'],
    meaning: 'The Most Gracious',
    partOfSpeech: 'adjective',
    occurrences: [{ sura: 1, ayah: 1, wordIndex: 3 }],
    reviewStatus: 'auto',
  },
  {
    lemmaId: 'rHm-rHym',
    arabic: 'ٱلرَّحِيمِ',
    lemma: 'رَّحِيم',
    root: 'rHm',
    phoneticKeys: ['rHym'],
    meaning: 'The Most Merciful',
    partOfSpeech: 'adjective',
    occurrences: [{ sura: 1, ayah: 1, wordIndex: 4 }],
    reviewStatus: 'auto',
  },
  {
    lemmaId: 'rHm-rHm@',
    arabic: 'رَحْمَةً',
    lemma: 'رَحْمَة',
    root: 'rHm',
    phoneticKeys: ['rHm@'],
    meaning: 'mercy',
    partOfSpeech: 'noun',
    occurrences: [{ sura: 2, ayah: 157, wordIndex: 3 }],
    reviewStatus: 'auto',
  },
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
  {
    lemmaId: 'Hsn-Hasan',
    arabic: 'حَسَنٌ',
    lemma: 'حَسَن',
    root: 'Hsn',
    phoneticKeys: ['Hsn'],
    meaning: 'good',
    partOfSpeech: 'adjective',
    occurrences: [{ sura: 2, ayah: 201, wordIndex: 5 }],
    reviewStatus: 'auto',
  },
  {
    lemmaId: 'Slm-Slm',
    arabic: 'سَلَامٌ',
    lemma: 'سَلَام',
    root: 'Slm',
    phoneticKeys: ['Slm'],
    meaning: 'peace',
    partOfSpeech: 'noun',
    occurrences: [{ sura: 36, ayah: 58, wordIndex: 1 }],
    reviewStatus: 'auto',
  },
];

describe('normalizeQuery', () => {
  it('strips Latin vowels from romanized input', () => {
    expect(normalizeQuery('rahman')).toBe('rhmn');
  });

  it('applies Arabizi digit substitution before vowel stripping', () => {
    expect(normalizeQuery('ra7man')).toBe('rHmn');
  });

  it('handles multiple Arabizi digits', () => {
    expect(normalizeQuery('7asan')).toBe('Hsn');
    expect(normalizeQuery('5alid')).toBe('khld');
    expect(normalizeQuery('9alah')).toBe('Slh');
  });

  it('strips Arabic diacritics from Arabic input', () => {
    // ٱلرَّحْمَٰنِ → strip fatHa, shadda, sukun, superscript alef, kasra → ٱلرحمن
    expect(normalizeQuery('ٱلرَّحْمَٰنِ')).toBe('ٱلرحمن');
  });

  it('Arabic input without diacritics passes through unchanged', () => {
    expect(normalizeQuery('الرحمن')).toBe('الرحمن');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeQuery('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeQuery('   ')).toBe('');
  });

  it('preserves case for Latin input (emphatic distinction)', () => {
    expect(normalizeQuery('rHmn')).toBe('rHmn');
  });

  it('documents Ayn (3) lossiness: 3 → a → stripped', () => {
    // '3ilm' → substitute 3→a → 'ailm' → strip vowels → 'lm'
    expect(normalizeQuery('3ilm')).toBe('lm');
  });
});

describe('createSearchIndex', () => {
  it('returns a Fuse instance', () => {
    const index = createSearchIndex(FIXTURES);
    expect(index).toBeTruthy();
    expect(typeof index.search).toBe('function');
  });

  // Guards against algorithmic blowup in index construction (an accidental O(n^2)
  // getFn, say), NOT against a latency budget. Wall-clock timing inside Vitest is
  // noisy because workers compete for cores, so this asserts the median with
  // several multiples of headroom over the observed cost (~29 ms locally).
  // Latency budgets live in docs/performance.md and are enforced by Lighthouse CI;
  // construction is a one-time cold-path cost inside the cold-cache budget, not
  // part of the warm lookup path.
  it('constructs the index without algorithmic blowup for ~4200 entries', () => {
    const bigList: LemmaEntry[] = [];
    for (let i = 0; i < 4200; i++) {
      const base = FIXTURES[i % FIXTURES.length]!;
      bigList.push({ ...base, lemmaId: `${base.lemmaId}-${i}` });
    }

    const times: number[] = [];
    for (let run = 0; run < 20; run++) {
      const start = performance.now();
      createSearchIndex(bigList);
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    // Median, not p95: across only 20 samples the p95 *is* the outlier, so it
    // measures scheduler luck rather than the cost of the code under test.
    const median = times[10]!;
    expect(median).toBeLessThan(250);
  });
});

describe('fuzzySearch', () => {
  let index: Fuse<LemmaEntry>;

  beforeEach(() => {
    index = createSearchIndex(FIXTURES);
  });

  describe('multi-variant resolution (AC1)', () => {
    it('resolves "rahman" to rHm-rHmn', () => {
      const results = fuzzySearch(index, 'rahman');
      const ids = results.map((r) => r.item.lemmaId);
      expect(ids).toContain('rHm-rHmn');
    });

    it('resolves "rahmaan" to rHm-rHmn', () => {
      const results = fuzzySearch(index, 'rahmaan');
      const ids = results.map((r) => r.item.lemmaId);
      expect(ids).toContain('rHm-rHmn');
    });

    it('resolves "ra7man" to rHm-rHmn', () => {
      const results = fuzzySearch(index, 'ra7man');
      const ids = results.map((r) => r.item.lemmaId);
      expect(ids).toContain('rHm-rHmn');
    });
  });

  describe('ranking (AC2)', () => {
    it('exact prefix on phoneticKey ranks above fuzzy root match', () => {
      const results = fuzzySearch(index, 'rHmn');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]!.item.lemmaId).toBe('rHm-rHmn');
    });
  });

  describe('Arabic queries (AC4)', () => {
    it('Arabic with diacritics finds the correct entry', () => {
      const results = fuzzySearch(index, 'ٱلرَّحْمَٰنِ');
      const ids = results.map((r) => r.item.lemmaId);
      expect(ids).toContain('rHm-rHmn');
    });

    it('Arabic without diacritics produces equivalent results', () => {
      const withDiacritics = fuzzySearch(index, 'ٱلرَّحْمَٰنِ');
      const without = fuzzySearch(index, 'ٱلرحمن');
      const idsWith = withDiacritics.map((r) => r.item.lemmaId).sort();
      const idsWithout = without.map((r) => r.item.lemmaId).sort();
      expect(idsWith).toEqual(idsWithout);
    });
  });

  describe('@ sentinel stripping', () => {
    it('finds entries with @ in phoneticKeys when @ is not in query', () => {
      const results = fuzzySearch(index, 'rHm');
      const ids = results.map((r) => r.item.lemmaId);
      expect(ids).toContain('rHm-rHm@');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty query', () => {
      expect(fuzzySearch(index, '')).toEqual([]);
    });

    it('returns empty array for whitespace-only query', () => {
      expect(fuzzySearch(index, '   ')).toEqual([]);
    });

    it('returns empty array for no-match query', () => {
      expect(fuzzySearch(index, 'xyzabc')).toEqual([]);
    });

    it('respects limit parameter', () => {
      const results = fuzzySearch(index, 'rHm', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });
});
