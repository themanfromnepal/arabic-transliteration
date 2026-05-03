import { describe, it, expect } from 'vitest';
import { promises as fs, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { emitShards, KNOWN_SHARD_FILES } from '../../../scripts/build/emit';
import type { MergedCorpus } from '../../../scripts/build/merge';
import type { LemmaEntry, ShardMeta } from '../../../src/types/dictionary';

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

const tmp = (prefix: string): string => mkdtempSync(path.join(os.tmpdir(), prefix));

describe('emitShards', () => {
  it('happy path: writes 7 files; second run is byte-identical', async () => {
    const outDir = tmp('emit-happy-');
    try {
      const opts = {
        outDir,
        validate: true,
        suraFilter: null,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
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
      // No meta passed → no _meta field in any shard
      for (const name of KNOWN_SHARD_FILES) {
        const parsed = JSON.parse(await fs.readFile(path.join(outDir, name), 'utf8'));
        expect(parsed).not.toHaveProperty('_meta');
      }
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  });

  it('cleanup safety: leaves unrelated files; replaces stale shard', async () => {
    const outDir = tmp('emit-clean-');
    try {
      const readme = path.join(outDir, 'README.md');
      const stale = path.join(outDir, 'dictionary.json');
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(readme, 'hello');
      await fs.writeFile(stale, '{"stale":true}\n');
      await emitShards(makeCorpus(), {
        outDir,
        validate: true,
        suraFilter: null,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
      });
      expect(await fs.readFile(readme, 'utf8')).toBe('hello');
      const dict = await fs.readFile(stale, 'utf8');
      expect(dict).not.toContain('stale');
      expect(dict).toContain('"version"');
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  });

  it('Q4 guard: --sura with default outDir rejects with --sura/--out message', async () => {
    const defaultOutDir = path.resolve(process.cwd(), 'public/data');
    await expect(
      emitShards(makeCorpus(), {
        outDir: defaultOutDir,
        validate: true,
        suraFilter: 1,
        defaultOutDir,
      }),
    ).rejects.toThrow(/--sura[\s\S]*--out|--out[\s\S]*--sura/);
  });

  it('Q4 guard explicit override: --sura with non-default outDir succeeds', async () => {
    const outDir = tmp('emit-sura-');
    try {
      const r = await emitShards(makeCorpus(), {
        outDir,
        validate: true,
        suraFilter: 1,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
      });
      expect(r.written).toEqual([...KNOWN_SHARD_FILES]);
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  });

  it('validation failure: throws and writes nothing', async () => {
    const outDir = tmp('emit-bad-');
    try {
      const corpus = makeCorpus();
      // Force invalid: blank arabic violates LemmaEntrySchema (z.string().min(1))
      (corpus.lemmas[0] as LemmaEntry).arabic = '';
      await expect(
        emitShards(corpus, {
          outDir,
          validate: true,
          suraFilter: null,
          defaultOutDir: path.resolve(process.cwd(), 'public/data'),
        }),
      ).rejects.toThrow();
      // emitShards mkdir's the dir before validating, then writes nothing.
      const exists = await fs
        .access(outDir)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        const entries = await fs.readdir(outDir);
        expect(entries).toEqual([]);
      }
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  });

  it('meta injection: every shard contains _meta and it is the first key', async () => {
    const outDir = tmp('emit-meta-');
    try {
      const meta: ShardMeta = {
        generatedAt: '2026-05-02T12:00:00Z',
        sources: [
          { name: 'a-src', license: 'CC0', sha256: null, attribution: 'A' },
          {
            name: 'b-src',
            license: 'MIT',
            sha256: 'd0a83a015a08ec6e8e9e5b5e2e2d0a83a015a08ec6e8e9e5b5e2e2d0a83a015a',
            attribution: 'B',
          },
        ],
      };
      await emitShards(makeCorpus(), {
        outDir,
        validate: true,
        suraFilter: null,
        defaultOutDir: path.resolve(process.cwd(), 'public/data'),
        meta,
      });
      for (const name of KNOWN_SHARD_FILES) {
        const raw = await fs.readFile(path.join(outDir, name), 'utf8');
        const parsed = JSON.parse(raw);
        expect(Object.keys(parsed)[0]).toBe('_meta');
        expect(parsed._meta).toEqual(meta);
        // Sources round-trip in given order
        expect(parsed._meta.sources.map((s: { name: string }) => s.name)).toEqual([
          'a-src',
          'b-src',
        ]);
        // sha256 may be null (skip mode) or a hex digest (verified)
        expect(parsed._meta.sources[0].sha256).toBeNull();
        expect(typeof parsed._meta.sources[1].sha256).toBe('string');
      }
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  });
});
