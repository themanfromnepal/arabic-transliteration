import { describe, it, expect } from 'vitest';
import { VOWELS } from '@/src/lib/transliterator/maps/vowels';

const EXPECTED_KEYS = ['aa', 'ii', 'ee', 'uu', 'oo', 'a', 'i', 'u', 'e', 'o', 'aa2'];

const isArabicChar = (c: string) => c.charCodeAt(0) >= 0x0600 && c.charCodeAt(0) <= 0x06ff;

describe('VOWELS map', () => {
  it('has no empty Latin keys', () => {
    expect(Object.keys(VOWELS).every((k) => k.length > 0)).toBe(true);
  });

  it('has the expected number of entries', () => {
    expect(Object.keys(VOWELS).length).toBe(11);
  });

  it('values are either empty (dropped) or all Arabic-block characters', () => {
    for (const [key, value] of Object.entries(VOWELS)) {
      if (value === '') continue;
      expect([...value].every(isArabicChar), `value for key ${key} is in Arabic block`).toBe(true);
    }
  });

  it('spot-checks core mappings', () => {
    expect(VOWELS.aa).toBe('ا');
    expect(VOWELS.a).toBe('');
    expect(VOWELS.uu).toBe('و');
  });

  it('has exactly the expected key set', () => {
    expect(Object.keys(VOWELS).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it('every value is empty or exactly one codepoint', () => {
    for (const [k, v] of Object.entries(VOWELS)) {
      const len = [...v].length;
      expect(len === 0 || len === 1, `key ${k} length ${len}`).toBe(true);
    }
  });
});
