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
