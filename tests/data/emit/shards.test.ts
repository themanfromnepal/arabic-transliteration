import { describe, it, expect } from 'vitest';
import type { MergedCorpus } from '../../../scripts/build/merge';
import {
  buildDictionaryShard,
  buildInlineIndexShard,
  buildOccurrencesShard,
  buildTranslationShardsBySura,
  buildVerseShardsBySura,
  buildWbwShard,
} from '../../../scripts/build/emit/shards';
import type { LemmaEntry } from '../../../src/types/dictionary';

const lemma = (id: string, occ: Array<[number, number, number]> = []): LemmaEntry => ({
  lemmaId: id,
  arabic: 'ا',
  lemma: 'a',
  root: 'abc',
  rootArabic: 'جذر',
  transliteration: 'abc',
  phoneticKeys: [id],
  meaning: `m-${id}`,
  partOfSpeech: 'noun',
  occurrences: occ.map(([sura, ayah, wordIndex]) => ({ sura, ayah, wordIndex })),
  reviewStatus: 'auto',
});

const corpus: MergedCorpus = {
  lemmas: [lemma('z-z', [[1, 1, 0]]), lemma('a-a', [[2, 1, 0]]), lemma('m-m', [[1, 2, 0]])],
  verses: [
    { sura: 2, ayah: 1, uthmani: 'x' },
    { sura: 1, ayah: 2, uthmani: 'y' },
    { sura: 1, ayah: 1, uthmani: 'z' },
  ],
  wbw: [
    { sura: 1, ayah: 2, wordIndex: 0, arabic: 'a', english: 'a' },
    { sura: 1, ayah: 1, wordIndex: 1, arabic: 'b', english: 'b' },
    { sura: 1, ayah: 1, wordIndex: 0, arabic: 'c', english: 'c' },
  ],
  yusufali: [
    { sura: 2, ayah: 1, english: 'b' },
    { sura: 1, ayah: 1, english: 'a' },
  ],
  stats: { lemmas: 3, occurrences: 3, skippedTokens: 0 },
};

describe('shard builders', () => {
  it('dictionary: version + lemmaId-sorted', () => {
    const s = buildDictionaryShard(corpus);
    expect(s.version).toBe('1.0.0');
    expect(s.lemmas.map((l) => l.lemmaId)).toEqual(['a-a', 'm-m', 'z-z']);
    expect(s.lemmas.length).toBe(corpus.lemmas.length);
  });

  it('verses: one shard per sura, each (sura,ayah)-sorted', () => {
    const bySura = buildVerseShardsBySura(corpus);
    expect([...bySura.keys()].sort((a, b) => a - b)).toEqual([1, 2]);

    const sura1 = bySura.get(1)!;
    expect(sura1.version).toBe('1.0.0');
    expect(sura1.sura).toBe(1);
    expect(sura1.verses.map((v) => `${v.sura}:${v.ayah}`)).toEqual(['1:1', '1:2']);

    const sura2 = bySura.get(2)!;
    expect(sura2.verses.map((v) => `${v.sura}:${v.ayah}`)).toEqual(['2:1']);
  });

  it('occurrences: version + lemmaId-sorted entries', () => {
    const s = buildOccurrencesShard(corpus);
    expect(s.version).toBe('1.0.0');
    expect(s.occurrences.map((e) => e.lemmaId)).toEqual(['a-a', 'm-m', 'z-z']);
    expect(s.occurrences.length).toBe(corpus.lemmas.length);
  });

  it('wbw: version + (sura,ayah,word)-sorted', () => {
    const s = buildWbwShard(corpus);
    expect(s.version).toBe('1.0.0');
    expect(s.words.map((w) => `${w.sura}:${w.ayah}:${w.wordIndex}`)).toEqual([
      '1:1:0',
      '1:1:1',
      '1:2:0',
    ]);
  });

  it('translations: one shard per sura, each (sura,ayah)-sorted', () => {
    const bySura = buildTranslationShardsBySura(corpus);
    expect([...bySura.keys()].sort((a, b) => a - b)).toEqual([1, 2]);

    const sura1 = bySura.get(1)!;
    expect(sura1.version).toBe('1.0.0');
    expect(sura1.sura).toBe(1);
    expect(sura1.translations.map((t) => `${t.sura}:${t.ayah}`)).toEqual(['1:1']);

    const sura2 = bySura.get(2)!;
    expect(sura2.translations.map((t) => `${t.sura}:${t.ayah}`)).toEqual(['2:1']);
  });

  it('inline index: version + lemmaId-sorted, projected fields', () => {
    const s = buildInlineIndexShard(corpus);
    expect(s.version).toBe('1.0.0');
    expect(s.entries.map((e) => e.lemmaId)).toEqual(['a-a', 'm-m', 'z-z']);
    for (const e of s.entries) {
      expect(Object.keys(e).sort()).toEqual(['arabic', 'lemmaId', 'meaning', 'phoneticKeys']);
    }
  });
});
