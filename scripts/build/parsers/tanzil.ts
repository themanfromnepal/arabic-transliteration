export {};

import type { Verse } from '../../../src/types/dictionary';
import { VerseSchema } from '../schema';

const BOM = '\uFEFF';

export const parseTanzil = (input: string): Verse[] => {
  const text = input.startsWith(BOM) ? input.slice(1) : input;
  const verses: Verse[] = [];
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (line.length === 0) continue;
    if (line.startsWith('#')) continue;
    const parts = line.split('|');
    if (parts.length < 3) {
      throw new Error(`tanzil: malformed line (expected sura|ayah|text): ${raw}`);
    }
    const sura = Number.parseInt(parts[0]!, 10);
    const ayah = Number.parseInt(parts[1]!, 10);
    const uthmani = parts.slice(2).join('|');
    verses.push(VerseSchema.parse({ sura, ayah, uthmani }));
  }
  return verses;
};

/**
 * Whitespace-tokenize an Uthmani ayah string into its constituent words.
 * Splits on any run of Unicode whitespace and drops empty fragments.
 */
export const splitUthmaniWords = (uthmani: string): string[] =>
  uthmani.split(/\s+/).filter((w) => w.length > 0);

/**
 * Build a (sura,ayah) -> ordered words[] index from parsed Tanzil verses.
 * Words are 0-indexed in the array; QAC `wordIndex` is 1-based, so callers
 * should look up `words[wordIndex - 1]`.
 */
export const buildVerseWordIndex = (verses: Verse[]): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const v of verses) {
    map.set(`${v.sura}:${v.ayah}`, splitUthmaniWords(v.uthmani));
  }
  return map;
};
