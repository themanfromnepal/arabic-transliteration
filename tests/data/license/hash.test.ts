import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashesEqual, sha256File } from '../../../scripts/build/license/hash';

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'license-hash-'));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('sha256File', () => {
  it('hashes a known fixture (sha256 of "hello")', async () => {
    const p = join(tmpDir, 'hello.txt');
    await writeFile(p, 'hello', 'utf8');
    const digest = await sha256File(p);
    expect(digest).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('rejects when path does not exist', async () => {
    await expect(sha256File(join(tmpDir, 'missing.txt'))).rejects.toBeDefined();
  });
});

describe('hashesEqual', () => {
  it('matches uppercase vs lowercase', () => {
    const lower = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
    expect(hashesEqual(lower, lower.toUpperCase())).toBe(true);
  });

  it('returns false for different hashes', () => {
    expect(hashesEqual('a'.repeat(64), 'b'.repeat(64))).toBe(false);
  });
});
