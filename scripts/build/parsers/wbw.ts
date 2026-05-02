export {};

import type { WbwEntry } from '../../../src/types/dictionary';
import { WbwEntrySchema } from '../schema';

const KEY_RE = /^(\d+):(\d+):(\d+)$/;

export const parseWbw = (input: string): WbwEntry[] => {
  const data: unknown = JSON.parse(input);
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('wbw: expected top-level JSON object keyed by "sura:ayah:wordIndex"');
  }
  const entries: WbwEntry[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const m = KEY_RE.exec(key);
    if (!m) {
      throw new Error(`wbw: malformed key (expected sura:ayah:wordIndex): ${key}`);
    }
    if (typeof value !== 'string') {
      throw new Error(`wbw: value for key ${key} must be a string`);
    }
    entries.push(
      WbwEntrySchema.parse({
        sura: Number.parseInt(m[1]!, 10),
        ayah: Number.parseInt(m[2]!, 10),
        wordIndex: Number.parseInt(m[3]!, 10),
        arabic: '',
        english: value,
      }),
    );
  }
  entries.sort((a, b) => {
    if (a.sura !== b.sura) return a.sura - b.sura;
    if (a.ayah !== b.ayah) return a.ayah - b.ayah;
    return a.wordIndex - b.wordIndex;
  });
  return entries;
};
