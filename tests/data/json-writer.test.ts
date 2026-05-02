import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { canonicalStringify, writeCanonicalJson } from '../../scripts/build/json-writer';

describe('canonicalStringify', () => {
  it('object key order does not affect output', () => {
    const a = { b: 1, a: 2, c: { y: 1, x: 2 } };
    const b = { c: { x: 2, y: 1 }, a: 2, b: 1 };
    expect(canonicalStringify(a)).toBe(canonicalStringify(b));
  });

  it('output ends in \\n', () => {
    const out = canonicalStringify({ a: 1 });
    expect(out.endsWith('\n')).toBe(true);
  });

  it('uses LF line endings (no CRLF)', () => {
    const out = canonicalStringify({ a: 1, b: [1, 2, 3] });
    expect(out.includes('\r')).toBe(false);
  });

  it('round-trips nested data', () => {
    const value = {
      version: '1.2.3',
      items: [
        { name: 'b', tags: ['x', 'y'] },
        { name: 'a', tags: [] },
      ],
      meta: { nested: { ok: true, count: 0, none: null } },
    };
    const parsed = JSON.parse(canonicalStringify(value));
    expect(parsed).toEqual(value);
  });

  it('throws on undefined, functions, symbols, bigint', () => {
    expect(() => canonicalStringify(undefined)).toThrow();
    expect(() => canonicalStringify(() => 1)).toThrow();
    expect(() => canonicalStringify(Symbol('x'))).toThrow();
    expect(() => canonicalStringify(BigInt(1))).toThrow();
  });

  it('throws on circular references', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(() => canonicalStringify(a)).toThrow();
  });
});

describe('writeCanonicalJson', () => {
  it('writes file with canonical content and creates parent dirs', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'json-writer-'));
    const target = path.join(tmp, 'nested', 'dir', 'out.json');
    await writeCanonicalJson(target, { b: 2, a: 1 });
    const content = await fs.readFile(target, 'utf8');
    expect(content).toBe('{\n  "a": 1,\n  "b": 2\n}\n');
    await fs.rm(tmp, { recursive: true, force: true });
  });
});
