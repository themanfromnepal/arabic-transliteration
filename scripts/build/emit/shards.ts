import type { MergedCorpus } from '../merge';
import {
  RESULT_CARD_OCCURRENCE_PREVIEW_COUNT,
  type DictionaryShard,
  type InlineIndexShard,
  type OccurrencesShard,
  type TranslationsShard,
  type VersesShard,
  type WbwShard,
} from '../../../src/types/dictionary';

const SHARD_VERSION = '1.0.0';

const bySuraAyah = <T extends { sura: number; ayah: number }>(a: T, b: T): number => {
  if (a.sura !== b.sura) return a.sura - b.sura;
  return a.ayah - b.ayah;
};

const bySuraAyahWord = <T extends { sura: number; ayah: number; wordIndex: number }>(
  a: T,
  b: T,
): number => {
  if (a.sura !== b.sura) return a.sura - b.sura;
  if (a.ayah !== b.ayah) return a.ayah - b.ayah;
  return a.wordIndex - b.wordIndex;
};

const byLemmaId = <T extends { lemmaId: string }>(a: T, b: T): number =>
  a.lemmaId < b.lemmaId ? -1 : a.lemmaId > b.lemmaId ? 1 : 0;

export const buildDictionaryShard = (corpus: MergedCorpus): DictionaryShard => ({
  version: SHARD_VERSION,
  // The full occurrence list is what makes dictionary.json duplicate occurrences.json almost
  // byte-for-byte (see B7 in phase-4-ui-stages.md) — one lemma carries 2,699 occurrences while the
  // card only ever previews a handful. Only the bounded preview + a count travel in this shard;
  // occurrences.json remains the sole full-list source.
  lemmas: [...corpus.lemmas].sort(byLemmaId).map(({ occurrences, ...rest }) => ({
    ...rest,
    occurrencesPreview: occurrences.slice(0, RESULT_CARD_OCCURRENCE_PREVIEW_COUNT),
    occurrenceCount: occurrences.length,
  })),
});

const groupBySura = <T extends { sura: number }>(items: readonly T[]): Map<number, T[]> => {
  const bySura = new Map<number, T[]>();
  for (const item of items) {
    const group = bySura.get(item.sura);
    if (group) {
      group.push(item);
    } else {
      bySura.set(item.sura, [item]);
    }
  }
  return bySura;
};

/**
 * One shard per sura rather than one shard for the whole Quran (B5 in phase-4-ui-stages.md): the
 * runtime only ever needs the suras touched by a lemma's previewed occurrences, and the monolithic
 * form made every first lookup pay for all 6,236 verses to render three snippets.
 */
export const buildVerseShardsBySura = (corpus: MergedCorpus): Map<number, VersesShard> => {
  const bySura = groupBySura(corpus.verses);
  const shards = new Map<number, VersesShard>();
  for (const [sura, verses] of bySura) {
    shards.set(sura, { version: SHARD_VERSION, sura, verses: [...verses].sort(bySuraAyah) });
  }
  return shards;
};

export const buildTranslationShardsBySura = (
  corpus: MergedCorpus,
): Map<number, TranslationsShard> => {
  const bySura = groupBySura(corpus.yusufali);
  const shards = new Map<number, TranslationsShard>();
  for (const [sura, translations] of bySura) {
    shards.set(sura, {
      version: SHARD_VERSION,
      sura,
      translations: [...translations].sort(bySuraAyah),
    });
  }
  return shards;
};

export const buildOccurrencesShard = (corpus: MergedCorpus): OccurrencesShard => ({
  version: SHARD_VERSION,
  occurrences: [...corpus.lemmas]
    .sort(byLemmaId)
    .map((l) => ({ lemmaId: l.lemmaId, occurrences: l.occurrences })),
});

export const buildWbwShard = (corpus: MergedCorpus): WbwShard => ({
  version: SHARD_VERSION,
  words: [...corpus.wbw].sort(bySuraAyahWord),
});

export const buildInlineIndexShard = (corpus: MergedCorpus): InlineIndexShard => ({
  version: SHARD_VERSION,
  entries: [...corpus.lemmas]
    .map((l) => ({
      lemmaId: l.lemmaId,
      arabic: l.arabic,
      phoneticKeys: l.phoneticKeys,
      meaning: l.meaning,
    }))
    .sort(byLemmaId),
});
