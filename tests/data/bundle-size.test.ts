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

  // Raised from 75 KB when glosses were derived: the index carries `meaning` for all 4,199 lemmas,
  // and populating it grew the shard from 64 KB to about 102 KB gzipped. This is a lazy-fetched
  // shard rather than part of the initial bundle, so the cost is off the critical path — see the
  // budget table in docs/architecture.md.
  it('index.json gzipped ≤ 125 KB', () => {
    const gzipped = gzipSync(raw);
    expect(gzipped.byteLength).toBeLessThanOrEqual(125 * 1024);
  });

  it('index.json is valid JSON with entries array', () => {
    const data = JSON.parse(raw.toString('utf8'));
    expect(data).toHaveProperty('entries');
    expect(Array.isArray(data.entries)).toBe(true);
  });
});
