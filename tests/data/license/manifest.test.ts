import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest } from '../../../scripts/build/license/manifest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const realManifestPath = resolve(__dirname, '../../../data/sources/licenses.json');

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'license-manifest-'));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('loadManifest', () => {
  it('loads the real licenses.json', async () => {
    const result = await loadManifest(realManifestPath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.version).toBe(1);
      expect(result.value.sources.length).toBeGreaterThan(0);
    }
  });

  it('returns missing for nonexistent file', async () => {
    const result = await loadManifest(join(tmpDir, 'does-not-exist.json'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('missing');
    }
  });

  it('returns malformed for invalid JSON', async () => {
    const p = join(tmpDir, 'malformed.json');
    await writeFile(p, 'not json', 'utf8');
    const result = await loadManifest(p);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('malformed');
      expect(result.detail).toMatch(/JSON parse error/);
    }
  });

  it('returns schema for valid JSON of wrong shape', async () => {
    const p = join(tmpDir, 'wrong-shape.json');
    await writeFile(p, JSON.stringify({ version: 1, sources: [] }), 'utf8');
    const result = await loadManifest(p);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('schema');
      expect(result.detail.length).toBeGreaterThan(0);
    }
  });
});
