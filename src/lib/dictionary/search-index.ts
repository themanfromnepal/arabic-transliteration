import Fuse from 'fuse.js';
import type { LemmaEntry } from '@/src/types/dictionary';

const ARABIZI_MAP: Record<string, string> = { '7': 'H', '9': 'S', '5': 'kh', '3': 'a' };
const LATIN_VOWELS = /[aeiou]/gi;
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_CHAR = /[\u0600-\u06FF]/;

function extractString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'v' in v) return String((v as { v: string }).v);
  return String(v);
}

export function normalizeQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (ARABIC_CHAR.test(trimmed)) {
    return trimmed.replace(ARABIC_DIACRITICS, '');
  }

  // Latin path: substitute Arabizi digits, then strip Latin vowels
  const substituted = trimmed
    .split('')
    .map((ch) => ARABIZI_MAP[ch] ?? ch)
    .join('');
  return substituted.replace(LATIN_VOWELS, '');
}

export function createSearchIndex(entries: LemmaEntry[]): Fuse<LemmaEntry> {
  return new Fuse(entries, {
    keys: [
      { name: 'phoneticKeys', weight: 2 },
      { name: 'arabic', weight: 1.5 },
      { name: 'root', weight: 1 },
    ],
    isCaseSensitive: false,
    threshold: 0.4,
    shouldSort: true,
    includeScore: true,
    getFn: (obj: LemmaEntry, path: string | string[]): ReadonlyArray<string> | string => {
      const value = Fuse.config.getFn(obj, path);
      const pathStr = Array.isArray(path) ? path[0] : path;

      if (pathStr === 'phoneticKeys') {
        if (Array.isArray(value)) {
          return value.map((v) => extractString(v).replace(/@/g, ''));
        }
        return extractString(value).replace(/@/g, '');
      }

      if (pathStr === 'arabic') {
        if (Array.isArray(value)) {
          return value.map((v) => extractString(v).replace(ARABIC_DIACRITICS, ''));
        }
        return extractString(value).replace(ARABIC_DIACRITICS, '');
      }

      // root and others: pass through
      return value;
    },
  });
}

export function fuzzySearch(
  index: Fuse<LemmaEntry>,
  query: string,
  limit = 10,
): Array<{ item: LemmaEntry; score: number }> {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const results = index.search(normalized, { limit });
  return results.map((r) => ({ item: r.item, score: r.score ?? 1 }));
}
