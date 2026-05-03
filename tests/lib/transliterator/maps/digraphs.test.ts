import { describe, it, expect } from 'vitest';
import { DIGRAPHS } from '@/src/lib/transliterator/maps/digraphs';

const EXPECTED_KEYS = ['th', 'kh', 'dh', 'sh', 'gh'];

const isArabicChar = (c: string) => c.charCodeAt(0) >= 0x0600 && c.charCodeAt(0) <= 0x06ff;

describe('DIGRAPHS map', () => {
  it('has no empty Latin keys', () => {
    expect(Object.keys(DIGRAPHS).every((k) => k.length > 0)).toBe(true);
  });

  it('has exactly 5 entries', () => {
    expect(Object.keys(DIGRAPHS).length).toBe(5);
  });

  it('every key is exactly length 2', () => {
    expect(Object.keys(DIGRAPHS).every((k) => k.length === 2)).toBe(true);
  });

  it('maps every key to a non-empty Arabic-block string', () => {
    for (const [key, value] of Object.entries(DIGRAPHS)) {
      expect(value.length, `value for key ${key}`).toBeGreaterThan(0);
      expect([...value].every(isArabicChar), `value for key ${key} is in Arabic block`).toBe(true);
    }
  });

  it('spot-checks core mappings', () => {
    expect(DIGRAPHS.sh).toBe('ش');
    expect(DIGRAPHS.kh).toBe('خ');
  });

  it('has exactly the expected key set', () => {
    expect(Object.keys(DIGRAPHS).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it('every value is exactly one codepoint', () => {
    for (const [k, v] of Object.entries(DIGRAPHS)) {
      expect([...v].length, `key ${k}`).toBe(1);
    }
  });
});
