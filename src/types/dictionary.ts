export type SuraAyah = {
  sura: number;
  ayah: number;
};

export type Occurrence = {
  sura: number;
  ayah: number;
  wordIndex: number;
};

export type ReviewStatus = 'auto' | 'reviewed' | 'needs-work';

export type LemmaEntry = {
  lemmaId: string;
  arabic: string;
  lemma: string;
  root: string;
  phoneticKeys: string[];
  meaning: string;
  partOfSpeech: string;
  occurrences: Occurrence[];
  reviewStatus: ReviewStatus;
};

export type Verse = {
  sura: number;
  ayah: number;
  uthmani: string;
};

export type WbwEntry = {
  sura: number;
  ayah: number;
  wordIndex: number;
  arabic: string;
  english: string;
};

export type AyahTranslation = {
  sura: number;
  ayah: number;
  english: string;
};

export type InlineIndexEntry = Pick<LemmaEntry, 'lemmaId' | 'arabic' | 'phoneticKeys' | 'meaning'>;

export type DictionaryShard = {
  version: string;
  lemmas: LemmaEntry[];
};

export type VersesShard = {
  version: string;
  verses: Verse[];
};

export type OccurrencesShard = {
  version: string;
  // TODO: confirm in Stage C
  occurrences: Array<{ lemmaId: string; occurrences: Occurrence[] }>;
};

export type WbwShard = {
  version: string;
  words: WbwEntry[];
};

export type InlineIndexShard = {
  version: string;
  entries: InlineIndexEntry[];
};

export type TranslationsShard = {
  version: string;
  translations: AyahTranslation[];
};

export type ManifestShard = {
  schemaVersion: string;
  sourceSha256: {
    tanzil: string;
    qac: string;
    wbw: string;
    yusufali: string;
  };
  counts: {
    lemmas: number;
    verses: number;
    wbw: number;
    yusufali: number;
    occurrences: number;
  };
};
