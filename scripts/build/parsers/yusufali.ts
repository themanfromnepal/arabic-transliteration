export {};

import type { AyahTranslation } from '../../../src/types/dictionary';
import { AyahTranslationSchema } from '../schema';

const FLAT_KEY_RE = /^(\d+):(\d+)$/;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const pushFlat = (out: AyahTranslation[], obj: Record<string, unknown>): boolean => {
  let matched = false;
  for (const [key, value] of Object.entries(obj)) {
    const m = FLAT_KEY_RE.exec(key);
    if (!m) return false;
    let english: string | undefined;
    if (typeof value === 'string') {
      english = value;
    } else if (isPlainObject(value)) {
      for (const field of ['t', 'text', 'translation'] as const) {
        const candidate = value[field];
        if (typeof candidate === 'string') {
          english = candidate;
          break;
        }
      }
    }
    if (english === undefined) {
      throw new Error(
        `yusufali: value for key ${key} must be a string or an object with a "t"/"text"/"translation" string field`,
      );
    }
    matched = true;
    out.push(
      AyahTranslationSchema.parse({
        sura: Number.parseInt(m[1]!, 10),
        ayah: Number.parseInt(m[2]!, 10),
        english,
      }),
    );
  }
  return matched || Object.keys(obj).length === 0;
};

const pushNested = (out: AyahTranslation[], obj: Record<string, unknown>): boolean => {
  for (const [suraKey, suraVal] of Object.entries(obj)) {
    if (!/^\d+$/.test(suraKey)) return false;
    if (!isPlainObject(suraVal)) return false;
    const sura = Number.parseInt(suraKey, 10);
    for (const [ayahKey, val] of Object.entries(suraVal)) {
      if (!/^\d+$/.test(ayahKey)) return false;
      if (typeof val !== 'string') {
        throw new Error(`yusufali: value at ${suraKey}:${ayahKey} must be a string`);
      }
      out.push(
        AyahTranslationSchema.parse({
          sura,
          ayah: Number.parseInt(ayahKey, 10),
          english: val,
        }),
      );
    }
  }
  return true;
};

export const parseYusufali = (input: string): AyahTranslation[] => {
  const data: unknown = JSON.parse(input);
  const out: AyahTranslation[] = [];

  if (isPlainObject(data)) {
    const flatOut: AyahTranslation[] = [];
    if (pushFlat(flatOut, data) && flatOut.length > 0) {
      out.push(...flatOut);
    } else {
      const nestedOut: AyahTranslation[] = [];
      if (!pushNested(nestedOut, data)) {
        throw new Error(
          'yusufali: unrecognized JSON shape (expected "sura:ayah" or nested {sura:{ayah:text}})',
        );
      }
      out.push(...nestedOut);
    }
  } else if (Array.isArray(data)) {
    for (const item of data) {
      if (!isPlainObject(item)) {
        throw new Error('yusufali: array items must be objects');
      }
      const sura = Number(item.sura ?? item.chapter ?? item.surah);
      const ayah = Number(item.ayah ?? item.verse ?? item.aya);
      const english = item.text ?? item.translation ?? item.english;
      if (!Number.isInteger(sura) || !Number.isInteger(ayah) || typeof english !== 'string') {
        throw new Error('yusufali: array items must have numeric sura/ayah and string text');
      }
      out.push(AyahTranslationSchema.parse({ sura, ayah, english }));
    }
  } else {
    throw new Error('yusufali: expected top-level object or array');
  }

  out.sort((a, b) => (a.sura !== b.sura ? a.sura - b.sura : a.ayah - b.ayah));
  return out;
};
