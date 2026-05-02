import { describe, it, expect } from 'vitest';
import { promises as fs, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { emitShards, KNOWN_SHARD_FILES } from '../../../scripts/build/emit';
import type { MergedCorpus } from '../../../scripts/build/merge';
import type { LemmaEntry } from '../../../src/types/dictionary';

const makeCorpus = (): MergedCorpus => ({
  lemmas: [
    {
      lemmaId: 'a-a',
      arabic: 'ا',
      lemma: 'a',
      root: 'abc',
      phoneticKeys: ['a'],
      meaning: '',
      partOfSpeech: 'noun',
      occurrences: [{ sura: 1, ayah: 1, wordIndex: 0 }],
      reviewStatus: 'auto',
    },
  ],
  verses: [{ sura: 1, ayah: 1, uthmani: 'x' }],
  wbw: [{ sura: 1, ayah: 1, wordIndex: 0, arabic: 'a', english: 'a' }],
  yusufali: [{ sura: 1, ayah: 1, english: 'a' }],
  stats: { lemmas: 1, occurrences: 1, skippedTokens: 0 },
});

const writeFakeSources = async (
  dir: string,
): Promise<{ tanzil: string; qac: string; wbw: string; yusufali: string }> => {
  const paths = {
    tanzil: path.join(dir, 't.txt'),
    qac: path.join(dir, 'q.txt'),
    wbw: path.join(dir, 'w.json'),
    yusufali: path.join(dir, 'y.json'),
  };
  await Promise.all(Object.values(paths).map((p, i) => fs.writeFile(p, `src-${i}`)));
  return paths;
};

const tmp = (prefix: string): string => mkdtempSync(path.join(os.tmpdir(), prefix));

describe('emitShards', () => {
  it('happy path: writes 7 files; second run is byte-identical', async () => {
    const outDir = tmp('emit-happy-');
    const srcDir = tmp('emit-src-');
    try {
      const sourcePaths = await writeFakeSources(srcDir);
      const opts = {
        outDir,
        validate: true,
        suraFilter: null,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
        sourcePaths,
      };
      const r1 = await emitShards(makeCorpus(), opts);
      expect(r1.written).toEqual([...KNOWN_SHARD_FILES]);
      const before = await Promise.all(
        KNOWN_SHARD_FILES.map((n) => fs.readFile(path.join(outDir, n))),
      );
      await emitShards(makeCorpus(), opts);
      const after = await Promise.all(
        KNOWN_SHARD_FILES.map((n) => fs.readFile(path.join(outDir, n))),
      );
      for (let i = 0; i < before.length; i++) {
        expect(after[i]!.equals(before[i]!)).toBe(true);
      }
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.rm(srcDir, { recursive: true, force: true });
    }
  });

  it('cleanup safety: leaves unrelated files; replaces stale shard', async () => {
    const outDir = tmp('emit-clean-');
    const srcDir = tmp('emit-src-');
    try {
      const sourcePaths = await writeFakeSources(srcDir);
      const readme = path.join(outDir, 'README.md');
      const stale = path.join(outDir, 'dictionary.json');
      await fs.writeFile(readme, 'hello');
      await fs.writeFile(stale, '{"stale":true}\n');
      await emitShards(makeCorpus(), {
        outDir,
        validate: true,
        suraFilter: null,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
        sourcePaths,
      });
      expect(await fs.readFile(readme, 'utf8')).toBe('hello');
      const dict = await fs.readFile(stale, 'utf8');
      expect(dict).not.toContain('stale');
      expect(dict).toContain('"version"');
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.rm(srcDir, { recursive: true, force: true });
    }
  });

  it('Q4 guard: --sura with default outDir rejects with --sura/--out message', async () => {
    const srcDir = tmp('emit-src-');
    try {
      const sourcePaths = await writeFakeSources(srcDir);
      const defaultOutDir = path.resolve(process.cwd(), 'public/data');
      await expect(
        emitShards(makeCorpus(), {
          outDir: defaultOutDir,
          validate: true,
          suraFilter: 1,
          defaultOutDir,
          sourcePaths,
        }),
      ).rejects.toThrow(/--sura[\s\S]*--out|--out[\s\S]*--sura/);
    } finally {
      await fs.rm(srcDir, { recursive: true, force: true });
    }
  });

  it('Q4 guard explicit override: --sura with non-default outDir succeeds', async () => {
    const outDir = tmp('emit-sura-');
    const srcDir = tmp('emit-src-');
    try {
      const sourcePaths = await writeFakeSources(srcDir);
      const r = await emitShards(makeCorpus(), {
        outDir,
        validate: true,
        suraFilter: 1,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
        sourcePaths,
      });
      expect(r.written).toEqual([...KNOWN_SHARD_FILES]);
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.rm(srcDir, { recursive: true, force: true });
    }
  });

  it('validation failure: throws and writes nothing', async () => {
    const outDir = tmp('emit-bad-');
    const srcDir = tmp('emit-src-');
    try {
      const sourcePaths = await writeFakeSources(srcDir);
      const corpus = makeCorpus();
      // Force invalid: blank arabic violates LemmaEntrySchema (z.string().min(1))
      (corpus.lemmas[0] as LemmaEntry).arabic = '';
      await expect(
        emitShards(corpus, {
          outDir,
          validate: true,
          suraFilter: null,
          defaultOutDir: path.resolve(process.cwd(), 'public/data'),
          sourcePaths,
        }),
      ).rejects.toThrow();
      const entries = await fs.readdir(outDir);
      expect(entries).toEqual([]);
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.rm(srcDir, { recursive: true, force: true });
    }
  });
});
