import { describe, it, expect } from 'vitest';
import { buildManifest } from '../../../scripts/build/emit/manifest';
import type { MergedCorpus } from '../../../scripts/build/merge';

const corpus: MergedCorpus = {
  lemmas: [
    {
      lemmaId: 'a',
      arabic: 'ا',
      lemma: 'a',
      root: 'abc',
      phoneticKeys: ['a'],
      meaning: '',
      partOfSpeech: 'noun',
      occurrences: [
        { sura: 1, ayah: 1, wordIndex: 0 },
        { sura: 2, ayah: 1, wordIndex: 0 },
      ],
      reviewStatus: 'auto',
    },
  ],
  verses: [{ sura: 1, ayah: 1, uthmani: 'x' }],
  wbw: [
    { sura: 1, ayah: 1, wordIndex: 0, arabic: 'a', english: 'a' },
    { sura: 1, ayah: 1, wordIndex: 1, arabic: 'b', english: 'b' },
  ],
  yusufali: [{ sura: 1, ayah: 1, english: 'a' }],
  stats: { lemmas: 1, occurrences: 2, skippedTokens: 0 },
};

describe('buildManifest', () => {
  it('emits schemaVersion + counts only (no per-source hashes)', () => {
    const manifest = buildManifest(corpus);
    // Per-source provenance lives in `_meta.sources` (computed by the gate).
    // The manifest itself must not carry a parallel `sourceSha256` shape that
    // could drift from `_meta.sources`.
    expect(Object.keys(manifest).sort()).toEqual(['counts', 'schemaVersion']);
    expect(manifest.schemaVersion).toBe('1.0.0');
    expect(manifest.counts).toEqual({
      lemmas: 1,
      verses: 1,
      wbw: 2,
      yusufali: 1,
      occurrences: 2,
    });
  });
});
