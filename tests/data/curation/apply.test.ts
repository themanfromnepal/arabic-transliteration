import { describe, it, expect } from 'vitest';
import { promises as fs, mkdtempSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { applyCuration } from '../../../scripts/build/curation/apply';
import type { MergedCorpus } from '../../../scripts/build/merge';
import type { LemmaEntry } from '../../../src/types/dictionary';

const makeLemma = (overrides: Partial<LemmaEntry> = {}): LemmaEntry => ({
  lemmaId: 'rbb-rabb',
  arabic: 'رَبّ',
  lemma: 'rabb',
  root: 'rbb',
  phoneticKeys: ['rabb'],
  meaning: '',
  partOfSpeech: 'noun',
  occurrences: [{ sura: 1, ayah: 2, wordIndex: 0 }],
  reviewStatus: 'auto',
  ...overrides,
});

const makeCorpus = (lemmas: LemmaEntry[]): MergedCorpus => ({
  lemmas,
  verses: [],
  wbw: [],
  yusufali: [],
  stats: { lemmas: lemmas.length, occurrences: 0, skippedTokens: 0 },
});

const tmpFile = (): string => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'curation-'));
  return path.join(dir, 'lemmas.csv');
};

describe('applyCuration', () => {
  it('ENOENT path: creates fresh CSV with all lemmas as added', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'b-b', root: 'bbb', lemma: 'b' }),
    ]);
    const r = await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    expect(r.added).toBe(2);
    expect(r.edits).toBe(0);
    expect(r.orphaned).toBe(0);
    const exists = await fs
      .stat(csvPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it('idempotent: running twice produces identical bytes', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    const first = await fs.readFile(csvPath);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    const second = await fs.readFile(csvPath);
    expect(second.equals(first)).toBe(true);
  });

  it('applies edits to meaning and reviewStatus from CSV', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    let text = await fs.readFile(csvPath, 'utf8');
    text = text.replace('"",\r\n"auto"', '"lord",\r\n"reviewed"');
    // Fallback: do a more permissive edit.
    if (!text.includes('"lord"')) {
      text = text.replace(/""/, '"lord"').replace(/"auto"/, '"reviewed"');
    }
    await fs.writeFile(csvPath, text, 'utf8');

    const corpus2 = makeCorpus([makeLemma()]);
    const r = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: null });
    expect(r.added).toBe(0);
    expect(r.edits).toBe(2);
    expect(corpus2.lemmas[0]?.meaning).toBe('lord');
    expect(corpus2.lemmas[0]?.reviewStatus).toBe('reviewed');
  });

  it('orphans CSV rows not present in corpus', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'old-old', lemma: 'old', root: 'old' }),
    ]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });

    // Now corpus loses one lemma.
    const corpus2 = makeCorpus([makeLemma()]);
    const r = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: null });
    expect(r.orphaned).toBe(1);
    const text = await fs.readFile(csvPath, 'utf8');
    expect(text.includes('# orphaned')).toBe(true);
    expect(text.includes('old-old')).toBe(true);
  });

  it('warns when read-only column diverges', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    let text = await fs.readFile(csvPath, 'utf8');
    text = text.replace('"noun"', '"verb"');
    await fs.writeFile(csvPath, text, 'utf8');

    const corpus2 = makeCorpus([makeLemma()]);
    const r = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: null });
    expect(r.readOnlyEditWarnings).toContain('rbb-rabb');
  });

  it('applies curated lemma and phoneticKeys durably', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });

    let text = await fs.readFile(csvPath, 'utf8');
    text = text.replace('"rabb","rbb","noun","rabb"', '"rab-b","rbb","noun","rab|rabb"');
    await fs.writeFile(csvPath, text, 'utf8');

    const corpus2 = makeCorpus([makeLemma()]);
    const first = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: null });
    expect(first.edits).toBe(2);
    expect(first.readOnlyEditWarnings).toEqual([]);
    expect(corpus2.lemmas[0]?.lemma).toBe('rab-b');
    expect(corpus2.lemmas[0]?.phoneticKeys).toEqual(['rab', 'rabb']);

    const corpus3 = makeCorpus([makeLemma({ lemma: 'rab-b', phoneticKeys: ['rab', 'rabb'] })]);
    const second = await applyCuration(corpus3, { csvPath, dryRun: false, suraFilter: null });
    expect(second.edits).toBe(0);
    expect(second.readOnlyEditWarnings).toEqual([]);
  });

  it('dryRun does not write the file', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    const m1 = statSync(csvPath).mtimeMs;
    await new Promise((r) => setTimeout(r, 10));

    const corpus2 = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'new-new', lemma: 'new', root: 'new' }),
    ]);
    await applyCuration(corpus2, { csvPath, dryRun: true, suraFilter: null });
    const m2 = statSync(csvPath).mtimeMs;
    expect(m2).toBe(m1);
  });

  it('suraFilter does not write the file', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    const m1 = statSync(csvPath).mtimeMs;
    await new Promise((r) => setTimeout(r, 10));

    const corpus2 = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'new-new', lemma: 'new', root: 'new' }),
    ]);
    await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: 1 });
    const m2 = statSync(csvPath).mtimeMs;
    expect(m2).toBe(m1);
  });

  it('idempotent round-trip yields zero edits and zero read-only warnings', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'b-b', root: 'bbb', lemma: 'b' }),
    ]);
    const first = await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    expect(first.added).toBe(2);

    const corpus2 = makeCorpus([
      makeLemma(),
      makeLemma({ lemmaId: 'b-b', root: 'bbb', lemma: 'b' }),
    ]);
    const second = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: null });
    expect(second.edits).toBe(0);
    expect(second.readOnlyEditWarnings.length).toBe(0);
    expect(second.added).toBe(0);
    expect(second.orphaned).toBe(0);
  });

  it('suraFilter suppresses read-only warnings even when CSV diverges', async () => {
    const csvPath = tmpFile();
    const corpus = makeCorpus([makeLemma()]);
    await applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null });
    let text = await fs.readFile(csvPath, 'utf8');
    text = text.replace('"noun"', '"verb"');
    await fs.writeFile(csvPath, text, 'utf8');

    const corpus2 = makeCorpus([makeLemma()]);
    const r = await applyCuration(corpus2, { csvPath, dryRun: false, suraFilter: 1 });
    expect(r.readOnlyEditWarnings).toEqual([]);
  });

  it('ragged row surfaces structural error', async () => {
    const csvPath = tmpFile();
    // Unterminated quote in row 1 → papaparse classifies as Quotes.
    const bad =
      '\uFEFFlemmaId,arabic,lemma,root,partOfSpeech,phoneticKeys,occurrenceCount,firstRef,meaning,reviewStatus\r\n' +
      '"rbb-rabb,"رَبّ","rabb","rbb","noun","rabb","1","1:2:0","","auto"\r\n';
    await fs.writeFile(csvPath, bad, 'utf8');

    const corpus = makeCorpus([makeLemma()]);
    await expect(
      applyCuration(corpus, { csvPath, dryRun: false, suraFilter: null }),
    ).rejects.toThrow(/csv parse error.*row 1/);
  });
});
