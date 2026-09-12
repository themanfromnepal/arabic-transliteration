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
  /** Buckwalter form, e.g. `rHm`. Kept as the search key and the lemmaId component. */
  root: string;
  /** The same root in Arabic letters, e.g. `رحم`. Derived at build time; what the card displays. */
  rootArabic: string;
  /**
   * Reader-facing scholarly romanization in DIN 31635, e.g. `raḥmān`. Distinct from
   * `phoneticKeys`, which are vowel-stripped lookup keys and are not readable.
   */
  transliteration: string;
  phoneticKeys: string[];
  /**
   * English gloss. Auto-derived from the word-by-word translation when `reviewStatus` is `auto`,
   * and overridden by `data/curation/lemmas.csv` once a human reviews it.
   */
  meaning: string;
  partOfSpeech: string;
  occurrences: Occurrence[];
  reviewStatus: ReviewStatus;
};

/**
 * How many occurrences the result card shows before "show all N"; also how many are embedded per
 * lemma in `dictionary.json` (see `DictionaryLemmaEntry`). Shared between the build pipeline and
 * the runtime so the two can never drift.
 */
export const RESULT_CARD_OCCURRENCE_PREVIEW_COUNT = 3;

/**
 * The shape of a lemma as emitted into `dictionary.json` and consumed at runtime — distinct from
 * `LemmaEntry`, which is the build-time, full-fidelity type used while merging and curating.
 *
 * A lemma's full occurrence list belongs in `occurrences.json` alone; embedding it here too used to
 * duplicate up to 2,699 rows per lemma into the dictionary shard for a card that only ever previews
 * `RESULT_CARD_OCCURRENCE_PREVIEW_COUNT` of them. `occurrencesPreview` carries only that bounded
 * slice, and `occurrenceCount` is the true total the card reports.
 */
export type DictionaryLemmaEntry = Omit<LemmaEntry, 'occurrences'> & {
  occurrencesPreview: Occurrence[];
  occurrenceCount: number;
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
  lemmas: DictionaryLemmaEntry[];
};

export type VersesShard = {
  _meta?: ShardMeta;
  version: string;
  /** Every verse shard is scoped to one sura — see `docs/data-pipeline.md` (B5). */
  sura: number;
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
  /** Every translation shard is scoped to one sura — see `docs/data-pipeline.md` (B5). */
  sura: number;
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
