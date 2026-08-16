import { z } from 'zod';
import { ReviewStatusSchema } from '../schema';

export const CURATION_HEADER = [
  'lemmaId',
  'arabic',
  'lemma',
  'root',
  'rootArabic',
  'transliteration',
  'partOfSpeech',
  'phoneticKeys',
  'occurrenceCount',
  'firstRef',
  'meaning',
  'reviewStatus',
] as const;

export type CurationRow = {
  lemmaId: string;
  arabic: string;
  lemma: string;
  root: string;
  rootArabic: string;
  transliteration: string;
  partOfSpeech: string;
  phoneticKeys: string;
  occurrenceCount: number;
  firstRef: string;
  meaning: string;
  reviewStatus: z.infer<typeof ReviewStatusSchema>;
};

const NonEmpty = z.string().min(1);
const FirstRef = z.string().regex(/^\d+:\d+:\d+$/, 'firstRef must match SURA:AYAH:WORD');

export const CurationRowSchema = z
  .object({
    lemmaId: NonEmpty,
    arabic: NonEmpty,
    lemma: NonEmpty,
    root: NonEmpty,
    rootArabic: NonEmpty,
    transliteration: NonEmpty,
    partOfSpeech: NonEmpty,
    phoneticKeys: NonEmpty,
    occurrenceCount: z.number().int().nonnegative(),
    firstRef: FirstRef,
    meaning: z.string(),
    reviewStatus: ReviewStatusSchema,
  })
  .strict() satisfies z.ZodType<CurationRow>;

export const validateHeader = (headerRow: string[]): void => {
  if (headerRow.length !== CURATION_HEADER.length) {
    throw new Error(`header: expected ${CURATION_HEADER.length} columns, got ${headerRow.length}`);
  }
  for (let i = 0; i < CURATION_HEADER.length; i++) {
    if (headerRow[i] !== CURATION_HEADER[i]) {
      throw new Error(
        `header: column ${i} expected '${CURATION_HEADER[i]}', got '${headerRow[i] ?? ''}'`,
      );
    }
  }
};

export const parseRow = (cells: string[], rowNumber: number): CurationRow => {
  if (cells.length !== CURATION_HEADER.length) {
    throw new Error(
      `row ${rowNumber}: expected ${CURATION_HEADER.length} columns, got ${cells.length}`,
    );
  }
  const raw = {
    lemmaId: cells[0] ?? '',
    arabic: cells[1] ?? '',
    lemma: cells[2] ?? '',
    root: cells[3] ?? '',
    rootArabic: cells[4] ?? '',
    transliteration: cells[5] ?? '',
    partOfSpeech: cells[6] ?? '',
    phoneticKeys: cells[7] ?? '',
    occurrenceCount: Number.parseInt(cells[8] ?? '', 10),
    firstRef: cells[9] ?? '',
    meaning: cells[10] ?? '',
    reviewStatus: cells[11] ?? '',
  };
  if (!Number.isInteger(raw.occurrenceCount) || raw.occurrenceCount < 0) {
    throw new Error(`row ${rowNumber}: occurrenceCount must be a non-negative integer`);
  }
  const result = CurationRowSchema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join('.') ?? '';
    throw new Error(`row ${rowNumber}: ${path ? `${path}: ` : ''}${first?.message ?? 'invalid'}`);
  }
  return result.data;
};

export const assertNoDuplicateLemmaIds = (rows: { lemmaId: string; rowNumber: number }[]): void => {
  const seen = new Map<string, number>();
  for (const r of rows) {
    const prev = seen.get(r.lemmaId);
    if (prev !== undefined) {
      throw new Error(
        `row ${r.rowNumber}: duplicate lemmaId '${r.lemmaId}' (first seen at row ${prev})`,
      );
    }
    seen.set(r.lemmaId, r.rowNumber);
  }
};
