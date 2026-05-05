import { describe, it, expect } from 'vitest';
import { mergeSources } from '../../../scripts/build/merge';
import type { QacToken } from '../../../scripts/build/parsers/qac';
import type { Verse } from '../../../src/types/dictionary';

const verses: Verse[] = [
  // Word 1 = بِسْمِ, Word 2 = ٱللَّهِ
  { sura: 1, ayah: 1, uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  // Word 3 = رَبِّ
  { sura: 1, ayah: 2, uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ' },
];

const qacTokens: QacToken[] = [
  // LEM "rab~" (root: rbb) at 1:2:3 — Uthmani word should be رَبِّ; lemma form رَبّ
  {
    sura: 1,
    ayah: 2,
    wordIndex: 3,
    segmentIndex: 1,
    form: 'rabbi',
    tag: 'N',
    features: { LEM: 'rab~', ROOT: 'rbb' },
  },
  // LEM "{ll~ah" (root: Alh) at 1:1:2 — Uthmani word should be ٱللَّهِ; lemma form ٱللَّه
  {
    sura: 1,
    ayah: 1,
    wordIndex: 2,
    segmentIndex: 1,
    form: 'Allahi',
    tag: 'PN',
    features: { LEM: '{ll~ah', ROOT: 'Alh' },
  },
];

describe('mergeSources — Uthmani arabic/lemma', () => {
  it('sets arabic to the Tanzil Uthmani word at the first occurrence and lemma to bw2uthmani(LEM)', () => {
    const merged = mergeSources({ verses, qacTokens, wbw: [], yusufali: [] });
    const byId = new Map(merged.lemmas.map((l) => [l.lemmaId, l]));

    const rabb = byId.get('rbb-rb');
    expect(rabb).toBeDefined();
    expect(rabb!.arabic).toBe('رَبِّ');
    expect(rabb!.lemma).toBe('رَبّ');
    // arabic and lemma must now be distinct (inflected surface vs. citation form).
    expect(rabb!.arabic).not.toBe(rabb!.lemma);
    // Buckwalter LEM must NOT have leaked into arabic/lemma fields.
    expect(rabb!.arabic).not.toBe('rab~');
    expect(rabb!.lemma).not.toBe('rab~');

    const allah = byId.get('aalh-aallh');
    expect(allah).toBeDefined();
    expect(allah!.arabic).toBe('ٱللَّهِ');
    // bw2uthmani('{ll~ah') = alef-wasla + lam + lam + shadda + fatha + heh
    expect(allah!.lemma).toBe('\u0671\u0644\u0644\u0651\u064E\u0647');
    // phoneticKeys still derive from Buckwalter LEM via latinSlug. R1d:
    // `{ → aa`, double `l`, `h` → `aallh`.
    expect(allah!.phoneticKeys).toEqual(['aallh']);
  });

  it('throws when Tanzil verse is missing for an occurrence', () => {
    const orphan: QacToken = {
      sura: 9,
      ayah: 9,
      wordIndex: 1,
      segmentIndex: 1,
      form: 'x',
      tag: 'N',
      features: { LEM: 'x', ROOT: 'xyz' },
    };
    expect(() => mergeSources({ verses, qacTokens: [orphan], wbw: [], yusufali: [] })).toThrow(
      /Tanzil verse missing/,
    );
  });

  it('throws when Tanzil wordIndex is out of range', () => {
    const oob: QacToken = {
      sura: 1,
      ayah: 1,
      wordIndex: 99,
      segmentIndex: 1,
      form: 'x',
      tag: 'N',
      features: { LEM: 'x', ROOT: 'xyz' },
    };
    expect(() => mergeSources({ verses, qacTokens: [oob], wbw: [], yusufali: [] })).toThrow(
      /wordIndex out of range/,
    );
  });
});
