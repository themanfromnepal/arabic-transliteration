import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { buildManifest, sha256File } from '../../../scripts/build/emit/manifest';
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
  it('hashes match independent reference and counts/keys are correct', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'manifest-'));
    try {
      const sourcePaths = {
        tanzil: path.join(tmp, 'tanzil.txt'),
        qac: path.join(tmp, 'qac.txt'),
        wbw: path.join(tmp, 'wbw.json'),
        yusufali: path.join(tmp, 'yusufali.json'),
      };
      const data = {
        tanzil: 'hello tanzil',
        qac: 'qac content\n',
        wbw: '{"a":1}',
        yusufali: 'y',
      };
      await Promise.all(
        (Object.keys(data) as Array<keyof typeof data>).map((k) =>
          fs.writeFile(sourcePaths[k], data[k]),
        ),
      );

      const manifest = await buildManifest(corpus, sourcePaths);

      for (const k of Object.keys(data) as Array<keyof typeof data>) {
        const ref = createHash('sha256').update(data[k]).digest('hex');
        expect(manifest.sourceSha256[k]).toBe(ref);
        const streamed = await sha256File(sourcePaths[k]);
        expect(streamed).toBe(ref);
      }

      expect(Object.keys(manifest).sort()).toEqual(['counts', 'schemaVersion', 'sourceSha256']);
      expect(manifest.schemaVersion).toBe('1.0.0');
      expect(manifest.counts).toEqual({
        lemmas: 1,
        verses: 1,
        wbw: 2,
        yusufali: 1,
        occurrences: 2,
      });
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  });
});
