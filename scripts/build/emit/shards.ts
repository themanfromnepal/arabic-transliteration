import type { MergedCorpus } from '../merge';
import type {
  DictionaryShard,
  InlineIndexShard,
  OccurrencesShard,
  TranslationsShard,
  VersesShard,
  WbwShard,
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
  lemmas: [...corpus.lemmas].sort(byLemmaId),
});

export const buildVersesShard = (corpus: MergedCorpus): VersesShard => ({
  version: SHARD_VERSION,
  verses: [...corpus.verses].sort(bySuraAyah),
});

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

export const buildTranslationsShard = (corpus: MergedCorpus): TranslationsShard => ({
  version: SHARD_VERSION,
  translations: [...corpus.yusufali].sort(bySuraAyah),
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
