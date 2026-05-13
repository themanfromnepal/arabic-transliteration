import type Fuse from 'fuse.js';
import type { LemmaEntry } from '@/src/types/dictionary';
import { transliterate } from '@/src/lib/transliterator';
import { loadFullDictionary } from './loader';
import { createSearchIndex, fuzzySearch } from './search-index';

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_CHAR = /[\u0600-\u06FF]/;

let cachedIndex: Fuse<LemmaEntry> | null = null;
let cachedLemmas: LemmaEntry[] | null = null;

async function ensureIndex(): Promise<{ index: Fuse<LemmaEntry>; lemmas: LemmaEntry[] }> {
  if (cachedIndex && cachedLemmas) return { index: cachedIndex, lemmas: cachedLemmas };
  const shard = await loadFullDictionary();
  cachedLemmas = shard.lemmas;
  cachedIndex = createSearchIndex(cachedLemmas);
  return { index: cachedIndex, lemmas: cachedLemmas };
}

function stripDiacritics(text: string): string {
  return text.replace(ARABIC_DIACRITICS, '');
}

function isArabic(text: string): boolean {
  return ARABIC_CHAR.test(text);
}

function findExactMatches(lemmas: LemmaEntry[], arabicQuery: string): LemmaEntry[] {
  const normalized = stripDiacritics(arabicQuery);
  return lemmas.filter((entry) => stripDiacritics(entry.arabic) === normalized);
}

export async function lookup(query: string, limit = 10): Promise<LemmaEntry[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { index, lemmas } = await ensureIndex();

  let exactMatches: LemmaEntry[];
  let fuzzyResults: Array<{ item: LemmaEntry; score: number }>;

  if (isArabic(trimmed)) {
    exactMatches = findExactMatches(lemmas, trimmed);
    fuzzyResults = fuzzySearch(index, trimmed, limit);
  } else {
    const arabicOutput = transliterate(trimmed);
    exactMatches = arabicOutput ? findExactMatches(lemmas, arabicOutput) : [];
    fuzzyResults = fuzzySearch(index, trimmed, limit);
  }

  const seen = new Set<string>();
  const merged: LemmaEntry[] = [];

  for (const entry of exactMatches) {
    if (!seen.has(entry.lemmaId)) {
      seen.add(entry.lemmaId);
      merged.push(entry);
    }
  }

  for (const { item } of fuzzyResults) {
    if (!seen.has(item.lemmaId)) {
      seen.add(item.lemmaId);
      merged.push(item);
    }
  }

  return merged.slice(0, limit);
}

export function _resetForTesting(): void {
  cachedIndex = null;
  cachedLemmas = null;
}
