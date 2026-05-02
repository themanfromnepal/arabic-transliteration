import { z } from 'zod';
import type {
  AyahTranslation,
  DictionaryShard,
  InlineIndexEntry,
  InlineIndexShard,
  LemmaEntry,
  Occurrence,
  OccurrencesShard,
  SuraAyah,
  Verse,
  VersesShard,
  WbwEntry,
  WbwShard,
} from '../../src/types/dictionary';

const SemverString = z.string().regex(/^\d+\.\d+\.\d+$/, 'must be semver-like (X.Y.Z)');

const SuraNumber = z.number().int().min(1).max(114);
const AyahNumber = z.number().int().positive();
const WordIndex = z.number().int().nonnegative();

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
  version: SemverString,
  lemmas: z.array(LemmaEntrySchema),
}) satisfies z.ZodType<DictionaryShard>;

export const VersesShardSchema = z.object({
  version: SemverString,
  verses: z.array(VerseSchema),
}) satisfies z.ZodType<VersesShard>;

export const OccurrencesShardSchema = z.object({
  version: SemverString,
  occurrences: z.array(
    z.object({
      lemmaId: z.string().min(1),
      occurrences: z.array(OccurrenceSchema),
    }),
  ),
}) satisfies z.ZodType<OccurrencesShard>;

export const WbwShardSchema = z.object({
  version: SemverString,
  words: z.array(WbwEntrySchema),
}) satisfies z.ZodType<WbwShard>;

export const InlineIndexShardSchema = z.object({
  version: SemverString,
  entries: z.array(InlineIndexEntrySchema),
}) satisfies z.ZodType<InlineIndexShard>;

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
