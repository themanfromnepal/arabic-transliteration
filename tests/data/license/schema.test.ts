import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { LicenseManifestSchema } from '../../../scripts/build/license/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
const realManifestPath = resolve(__dirname, '../../../data/sources/licenses.json');

const minimalEntry = {
  filename: 'foo.txt',
  license: 'MIT',
  status: 'approved',
  sha256: 'TBD',
  attribution: 'someone',
};

const minimalManifest = () => ({
  version: 1,
  sources: [{ ...minimalEntry }],
});

describe('LicenseManifestSchema', () => {
  it('parses a valid minimal manifest', () => {
    const result = LicenseManifestSchema.safeParse(minimalManifest());
    expect(result.success).toBe(true);
  });

  it('parses the real licenses.json on disk', async () => {
    const raw = JSON.parse(await readFile(realManifestPath, 'utf8'));
    const result = LicenseManifestSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sources).toHaveLength(4);
    }
  });

  it('rejects missing version', () => {
    const m = minimalManifest() as Record<string, unknown>;
    delete m.version;
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects wrong version', () => {
    const m = { ...minimalManifest(), version: 2 };
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects entry missing a required field', () => {
    const m = minimalManifest();
    delete (m.sources[0] as Record<string, unknown>).attribution;
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects bad status enum', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).status = 'bogus';
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects sha256 of wrong length', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).sha256 = 'a'.repeat(63);
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects sha256 with non-hex characters', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).sha256 = 'z'.repeat(64);
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('accepts valid lower-case sha256 hex', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).sha256 =
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
    expect(LicenseManifestSchema.safeParse(m).success).toBe(true);
  });

  it('rejects filename containing /', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).filename = 'sub/foo.txt';
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects filename containing ..', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).filename = '..foo.txt';
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects duplicate filenames', () => {
    const m = {
      version: 1,
      sources: [{ ...minimalEntry }, { ...minimalEntry }],
    };
    const result = LicenseManifestSchema.safeParse(m);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /duplicate/.test(i.message))).toBe(true);
    }
  });

  it('rejects unknown extra key on entry', () => {
    const m = minimalManifest();
    (m.sources[0] as Record<string, unknown>).extra = 'nope';
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects unknown extra key on manifest', () => {
    const m = { ...minimalManifest(), extra: 'nope' };
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });

  it('rejects empty sources array', () => {
    const m = { version: 1, sources: [] };
    expect(LicenseManifestSchema.safeParse(m).success).toBe(false);
  });
});
