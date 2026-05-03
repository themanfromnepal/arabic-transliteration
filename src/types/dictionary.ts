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

/**
 * Per-source provenance entry in `_meta.sources`.
 *
 * `sha256`:
 *   - hex-encoded sha256 of the source file as computed by the license gate
 *   - `null` indicates the source was not verified (e.g. license gate run in
 *     `skip` mode). A null digest means "unverified" — clients must not
 *     treat it as a trust signal.
 */
export type ShardMetaSource = {
  name: string;
  license: string;
  sha256: string | null;
  attribution: string;
};

export type ShardMeta = {
  generatedAt: string;
  sources: ShardMetaSource[];
};

export type DictionaryShard = {
  _meta?: ShardMeta;
  version: string;
  lemmas: LemmaEntry[];
};

export type VersesShard = {
  _meta?: ShardMeta;
  version: string;
  verses: Verse[];
};

export type OccurrencesShard = {
  _meta?: ShardMeta;
  version: string;
  // TODO: confirm in Stage C
  occurrences: Array<{ lemmaId: string; occurrences: Occurrence[] }>;
};

export type WbwShard = {
  _meta?: ShardMeta;
  version: string;
  words: WbwEntry[];
};

export type InlineIndexShard = {
  _meta?: ShardMeta;
  version: string;
  entries: InlineIndexEntry[];
};

export type TranslationsShard = {
  _meta?: ShardMeta;
  version: string;
  translations: AyahTranslation[];
};

export type ManifestShard = {
  _meta?: ShardMeta;
  schemaVersion: string;
  counts: {
    lemmas: number;
    verses: number;
    wbw: number;
    yusufali: number;
    occurrences: number;
  };
};
