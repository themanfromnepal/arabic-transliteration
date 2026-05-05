export {};

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseCsvWithTrailer } from './build/curation/csv';
import { CURATION_HEADER } from './build/curation/schema';
import { writeCanonicalJson } from './build/json-writer';

type GoldenEntry = {
  id: string;
  phonetic: string;
  expectedArabic: string;
  source: 'sample' | 'canonical';
};

type LemmaLite = {
  lemmaId: string;
  arabic: string;
  lemma: string;
};

const SEED = 42;
const SAMPLE_SIZE = 150;

const CANONICAL_PHRASES: ReadonlyArray<{ phonetic: string; expectedArabic: string }> = [];
// Inlined LCG (Numerical Recipes constants). Returns a uint32 each step.
const makeLcg = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
};

// Fisher-Yates shuffle driven by the LCG (in-place on a copy).
const shuffle = <T>(items: ReadonlyArray<T>, rand: () => number): T[] => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
};

const loadCurationRows = async (csvPath: string): Promise<Map<string, string>> => {
  const text = await fs.readFile(csvPath, 'utf8');
  const parsed = parseCsvWithTrailer(text);
  const header = parsed.header;
  const lemmaIdIdx = header.indexOf('lemmaId');
  const phoneticKeysIdx = header.indexOf('phoneticKeys');
  if (lemmaIdIdx < 0 || phoneticKeysIdx < 0) {
    throw new Error(
      `lemmas.csv missing required columns; header=${JSON.stringify(header)} expected to include ${CURATION_HEADER.join(',')}`,
    );
  }
  const map = new Map<string, string>();
  for (const row of parsed.rows) {
    const lemmaId = (row[lemmaIdIdx] ?? '').trim();
    const phoneticKeys = (row[phoneticKeysIdx] ?? '').trim();
    if (!lemmaId || !phoneticKeys) continue;
    map.set(lemmaId, phoneticKeys);
  }
  return map;
};

const loadDictionaryLemma = async (dictPath: string): Promise<Map<string, string>> => {
  const raw = await fs.readFile(dictPath, 'utf8');
  const dict = JSON.parse(raw) as { lemmas?: LemmaLite[] };
  const lemmas = dict.lemmas ?? [];
  const map = new Map<string, string>();
  for (const l of lemmas) {
    if (l.lemmaId) map.set(l.lemmaId, l.lemma);
  }
  return map;
};

const main = async (): Promise<void> => {
  const cwd = process.cwd();
  const csvPath = path.resolve(cwd, 'data/curation/lemmas.csv');
  const dictPath = path.resolve(cwd, 'public/data/dictionary.json');
  const outPath = path.resolve(cwd, 'tests/lib/transliterator/fixtures/golden.json');

  const csvMap = await loadCurationRows(csvPath);
  const dictMap = await loadDictionaryLemma(dictPath);

  // Filter rows with non-empty phoneticKeys, sorted by lemmaId ascending.
  const candidates = Array.from(csvMap.entries())
    .map(([lemmaId, phoneticKeys]) => ({ lemmaId, phoneticKeys }))
    .sort((a, b) => (a.lemmaId < b.lemmaId ? -1 : a.lemmaId > b.lemmaId ? 1 : 0));

  if (candidates.length < SAMPLE_SIZE) {
    throw new Error(
      `not enough lemmas with phoneticKeys: have ${candidates.length}, need ${SAMPLE_SIZE}`,
    );
  }

  const rand = makeLcg(SEED);
  const shuffled = shuffle(candidates, rand);
  const sampled = shuffled.slice(0, SAMPLE_SIZE);

  const sampleEntries: GoldenEntry[] = sampled.map((row) => {
    const lemma = dictMap.get(row.lemmaId);
    if (lemma === undefined) {
      throw new Error(`lemmaId not found in dictionary: ${row.lemmaId}`);
    }
    if (!lemma) {
      throw new Error(`empty lemma (citation form) for lemmaId=${row.lemmaId}`);
    }
    const phonetic = row.phoneticKeys.split('|')[0]!.trim();
    if (!phonetic) {
      throw new Error(`empty phonetic key for lemmaId=${row.lemmaId}`);
    }
    return {
      id: row.lemmaId,
      phonetic,
      expectedArabic: lemma,
      source: 'sample' as const,
    };
  });

  const canonicalEntries: GoldenEntry[] = CANONICAL_PHRASES.map((c) => ({
    id: `canonical-${c.phonetic}`,
    phonetic: c.phonetic,
    expectedArabic: c.expectedArabic,
    source: 'canonical' as const,
  }));

  const allEntries = [...sampleEntries, ...canonicalEntries].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );

  await writeCanonicalJson(outPath, { seed: SEED, entries: allEntries });

  console.log('build-golden');
  console.log(
    `  total=${allEntries.length} sample=${sampleEntries.length} canonical=${canonicalEntries.length}`,
  );
  console.log(`  wrote ${path.relative(cwd, outPath)}`);
};

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
