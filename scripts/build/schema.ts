import { z } from 'zod';
import type {
  AyahTranslation,
  DictionaryShard,
  InlineIndexEntry,
  InlineIndexShard,
  LemmaEntry,
  ManifestShard,
  Occurrence,
  OccurrencesShard,
  ShardMeta,
  ShardMetaSource,
  SuraAyah,
  TranslationsShard,
  Verse,
  VersesShard,
  WbwEntry,
  WbwShard,
} from '../../src/types/dictionary';

const SemverString = z.string().regex(/^\d+\.\d+\.\d+$/, 'must be semver-like (X.Y.Z)');

const SuraNumber = z.number().int().min(1).max(114);
const AyahNumber = z.number().int().positive();
const WordIndex = z.number().int().nonnegative();

export const ShardMetaSourceSchema = z.object({
  name: z.string().min(1),
  license: z.string().min(1),
  sha256: z.union([z.string().min(1), z.null()]),
  attribution: z.string().min(1),
}) satisfies z.ZodType<ShardMetaSource>;

export const ShardMetaSchema = z.object({
  generatedAt: z.string().min(1),
  sources: z.array(ShardMetaSourceSchema),
}) satisfies z.ZodType<ShardMeta>;

export const SuraAyahSchema = z.object({
  sura: SuraNumber,
  ayah: AyahNumber,
}) satisfies z.ZodType<SuraAyah>;

export const OccurrenceSchema = z.object({
  sura: SuraNumber,
  ayah: AyahNumber,
  wordIndex: WordIndex,
}) satisfies z.ZodType<Occurrence>;

export const ReviewStatusSchema = z.enum(['auto', 'reviewed', 'needs-work']);

const RootSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length === 3 || s.length === 4, {
    message: 'root must be 3 or 4 characters after trimming',
  });

const PhoneticKeysSchema = z
  .array(z.string().min(1))
  .min(1)
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'phoneticKeys must be unique',
  });

export const LemmaEntrySchema = z.object({
  lemmaId: z.string().min(1),
  arabic: z.string().min(1),
  lemma: z.string().min(1),
  root: RootSchema,
  phoneticKeys: PhoneticKeysSchema,
  meaning: z.string(),
  partOfSpeech: z.string(),
  occurrences: z.array(OccurrenceSchema),
  reviewStatus: ReviewStatusSchema,
}) satisfies z.ZodType<LemmaEntry>;

export const VerseSchema = z.object({
  sura: SuraNumber,
  ayah: AyahNumber,
  uthmani: z.string().min(1),
}) satisfies z.ZodType<Verse>;

export const WbwEntrySchema = z.object({
  sura: SuraNumber,
  ayah: AyahNumber,
  wordIndex: WordIndex,
  arabic: z.string(),
  english: z.string(),
}) satisfies z.ZodType<WbwEntry>;

export const AyahTranslationSchema = z.object({
  sura: SuraNumber,
  ayah: AyahNumber,
  english: z.string(),
}) satisfies z.ZodType<AyahTranslation>;

export const InlineIndexEntrySchema = z.object({
  lemmaId: z.string().min(1),
  arabic: z.string().min(1),
  phoneticKeys: PhoneticKeysSchema,
  meaning: z.string(),
}) satisfies z.ZodType<InlineIndexEntry>;

export const DictionaryShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  lemmas: z.array(LemmaEntrySchema),
}) satisfies z.ZodType<DictionaryShard>;

export const VersesShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  verses: z.array(VerseSchema),
}) satisfies z.ZodType<VersesShard>;

export const OccurrencesShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  occurrences: z.array(
    z.object({
      lemmaId: z.string().min(1),
      occurrences: z.array(OccurrenceSchema),
    }),
  ),
}) satisfies z.ZodType<OccurrencesShard>;

export const WbwShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  words: z.array(WbwEntrySchema),
}) satisfies z.ZodType<WbwShard>;

export const InlineIndexShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  entries: z.array(InlineIndexEntrySchema),
}) satisfies z.ZodType<InlineIndexShard>;

export const TranslationsShardSchema = z.object({
  _meta: ShardMetaSchema.optional(),
  version: SemverString,
  translations: z.array(AyahTranslationSchema),
}) satisfies z.ZodType<TranslationsShard>;

const NonNegInt = z.number().int().nonnegative();

export const ManifestShardSchema = z
  .object({
    _meta: ShardMetaSchema.optional(),
    schemaVersion: SemverString,
    counts: z
      .object({
        lemmas: NonNegInt,
        verses: NonNegInt,
        wbw: NonNegInt,
        yusufali: NonNegInt,
        occurrences: NonNegInt,
      })
      .strict(),
  })
  .strict() satisfies z.ZodType<ManifestShard>;

export const parseLemmaEntry = (value: unknown): LemmaEntry => LemmaEntrySchema.parse(value);
export const parseOccurrence = (value: unknown): Occurrence => OccurrenceSchema.parse(value);
export const parseVerse = (value: unknown): Verse => VerseSchema.parse(value);
export const parseWbwEntry = (value: unknown): WbwEntry => WbwEntrySchema.parse(value);
export const parseAyahTranslation = (value: unknown): AyahTranslation =>
  AyahTranslationSchema.parse(value);
export const parseInlineIndexEntry = (value: unknown): InlineIndexEntry =>
  InlineIndexEntrySchema.parse(value);
export const parseDictionaryShard = (value: unknown): DictionaryShard =>
  DictionaryShardSchema.parse(value);
export const parseVersesShard = (value: unknown): VersesShard => VersesShardSchema.parse(value);
export const parseOccurrencesShard = (value: unknown): OccurrencesShard =>
  OccurrencesShardSchema.parse(value);
export const parseWbwShard = (value: unknown): WbwShard => WbwShardSchema.parse(value);
export const parseInlineIndexShard = (value: unknown): InlineIndexShard =>
  InlineIndexShardSchema.parse(value);
export const parseTranslationsShard = (value: unknown): TranslationsShard =>
  TranslationsShardSchema.parse(value);
export const parseManifestShard = (value: unknown): ManifestShard =>
  ManifestShardSchema.parse(value);
