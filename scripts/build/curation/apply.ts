import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { LemmaEntry } from '../../../src/types/dictionary';
import type { MergedCorpus } from '../merge';
import { parseCsvWithTrailer, serializeCsvWithTrailer } from './csv';
import {
  CURATION_HEADER,
  assertNoDuplicateLemmaIds,
  parseRow,
  validateHeader,
  type CurationRow,
} from './schema';

export type ApplyCurationOptions = {
  csvPath: string;
  dryRun: boolean;
  suraFilter: number | null;
};

export type ApplyCurationResult = {
  added: number;
  edits: number;
  orphaned: number;
  readOnlyEditWarnings: string[];
};

const READ_ONLY_COLUMNS = [
  'arabic',
  'root',
  'partOfSpeech',
  'occurrenceCount',
  'firstRef',
] as const;

const READ_ONLY_INDICES: readonly number[] = READ_ONLY_COLUMNS.map((name) => {
  const idx = CURATION_HEADER.indexOf(name as (typeof CURATION_HEADER)[number]);
  if (idx < 0) {
    throw new Error(`apply: read-only column '${name}' missing from CURATION_HEADER`);
  }
  return idx;
});

const rowFromLemma = (entry: LemmaEntry): string[] => {
  const first = entry.occurrences[0];
  const firstRef = first ? `${first.sura}:${first.ayah}:${first.wordIndex}` : '';
  return [
    entry.lemmaId,
    entry.arabic,
    entry.lemma,
    entry.root,
    entry.partOfSpeech,
    entry.phoneticKeys.join('|'),
    String(entry.occurrences.length),
    firstRef,
    entry.meaning,
    entry.reviewStatus,
  ];
};

const sameStringArray = (left: readonly string[], right: readonly string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
};

const readCsvOrEmpty = async (
  csvPath: string,
): Promise<{ header: string[]; rows: string[][]; trailer: string[][] }> => {
  let text: string;
  try {
    text = await fs.readFile(csvPath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { header: [...CURATION_HEADER], rows: [], trailer: [] };
    }
    throw err;
  }
  return parseCsvWithTrailer(text);
};

export const applyCuration = async (
  corpus: MergedCorpus,
  opts: ApplyCurationOptions,
): Promise<ApplyCurationResult> => {
  const parsed = await readCsvOrEmpty(opts.csvPath);

  // If file existed (header non-empty AND not the default), validate. ENOENT path
  // produces our default header, which is by definition valid; still call to be safe.
  if (parsed.header.length > 0 || parsed.rows.length > 0) {
    validateHeader(parsed.header);
  }

  const csvMap = new Map<string, { row: CurationRow; raw: string[]; originalIndex: number }>();
  const dupCheck: { lemmaId: string; rowNumber: number }[] = [];
  for (let i = 0; i < parsed.rows.length; i++) {
    const cells = parsed.rows[i] ?? [];
    const rowNumber = i + 2; // +1 for header, +1 for 1-based
    const row = parseRow(cells, rowNumber);
    dupCheck.push({ lemmaId: row.lemmaId, rowNumber });
    csvMap.set(row.lemmaId, { row, raw: cells, originalIndex: i });
  }
  assertNoDuplicateLemmaIds(dupCheck);

  let added = 0;
  let edits = 0;
  const readOnlyEditWarnings: string[] = [];
  const seenInCsv = new Set<string>();

  for (const entry of corpus.lemmas) {
    const match = csvMap.get(entry.lemmaId);
    if (!match) {
      added += 1;
      continue;
    }
    seenInCsv.add(entry.lemmaId);

    if (entry.lemma !== match.row.lemma) {
      entry.lemma = match.row.lemma;
      edits += 1;
    }

    const curatedPhoneticKeys = match.row.phoneticKeys.split('|');
    if (!sameStringArray(entry.phoneticKeys, curatedPhoneticKeys)) {
      entry.phoneticKeys = curatedPhoneticKeys;
      edits += 1;
    }

    const regenerated = rowFromLemma(entry);
    if (opts.suraFilter === null) {
      let readOnlyDiverged = false;
      for (const idx of READ_ONLY_INDICES) {
        const csvVal = match.raw[idx] ?? '';
        const genVal = regenerated[idx] ?? '';
        if (csvVal !== genVal) {
          readOnlyDiverged = true;
          break;
        }
      }
      if (readOnlyDiverged) {
        readOnlyEditWarnings.push(entry.lemmaId);
      }
    }

    if (entry.meaning !== match.row.meaning) {
      entry.meaning = match.row.meaning;
      edits += 1;
    }
    if (entry.reviewStatus !== match.row.reviewStatus) {
      entry.reviewStatus = match.row.reviewStatus;
      edits += 1;
    }
  }

  // Orphans: csv lemmaIds not present in current corpus, preserve original order.
  const orphanEntries: { raw: string[]; originalIndex: number }[] = [];
  for (const [lemmaId, info] of csvMap) {
    if (!seenInCsv.has(lemmaId)) {
      orphanEntries.push({ raw: info.raw, originalIndex: info.originalIndex });
    }
  }
  orphanEntries.sort((a, b) => a.originalIndex - b.originalIndex);
  const orphaned = orphanEntries.length;

  // Defensive re-sort.
  corpus.lemmas.sort((a, b) => (a.lemmaId < b.lemmaId ? -1 : a.lemmaId > b.lemmaId ? 1 : 0));

  const primaryRows = corpus.lemmas.map(rowFromLemma);
  const trailerRows = orphanEntries.map((o) => o.raw);
  const serialized = serializeCsvWithTrailer([...CURATION_HEADER], primaryRows, trailerRows);

  if (!opts.dryRun && opts.suraFilter === null) {
    await fs.mkdir(path.dirname(opts.csvPath), { recursive: true });
    await fs.writeFile(opts.csvPath, serialized, 'utf8');
  }

  return { added, edits, orphaned, readOnlyEditWarnings };
};
