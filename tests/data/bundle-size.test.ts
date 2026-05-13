import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const INDEX_PATH = path.resolve(process.cwd(), 'public/data/index.json');

describe('bundle size', () => {
  if (!existsSync(INDEX_PATH)) {
    it.skip('index.json not built yet — run `npx tsx scripts/build-dictionary.ts`', () => {});
    return;
  }

  const raw = readFileSync(INDEX_PATH);

  it('index.json gzipped ≤ 75 KB', () => {
    const gzipped = gzipSync(raw);
    expect(gzipped.byteLength).toBeLessThanOrEqual(75 * 1024);
  });

  it('index.json is valid JSON with entries array', () => {
    const data = JSON.parse(raw.toString('utf8'));
    expect(data).toHaveProperty('entries');
    expect(Array.isArray(data.entries)).toBe(true);
  });
});
