import { describe, it, expect } from 'vitest';
import { CONSONANTS } from '@/src/lib/transliterator/maps/consonants';

const EXPECTED_KEYS = [
  'b',
  't',
  'j',
  'd',
  'r',
  'z',
  's',
  'f',
  'q',
  'k',
  'l',
  'm',
  'n',
  'h',
  'w',
  'y',
  'H',
  'S',
  'D',
  'T',
  'Z',
  "'",
  '@',
];

const isArabicChar = (c: string) => c.charCodeAt(0) >= 0x0600 && c.charCodeAt(0) <= 0x06ff;

describe('CONSONANTS map', () => {
  it('has no empty Latin keys', () => {
    expect(Object.keys(CONSONANTS).every((k) => k.length > 0)).toBe(true);
  });

  it('has the expected number of entries', () => {
    expect(Object.keys(CONSONANTS).length).toBe(23);
  });

  it('maps every key to a non-empty Arabic-block string', () => {
    for (const [key, value] of Object.entries(CONSONANTS)) {
      expect(value.length, `value for key ${key}`).toBeGreaterThan(0);
      expect([...value].every(isArabicChar), `value for key ${key} is in Arabic block`).toBe(true);
    }
  });

  it('spot-checks core mappings', () => {
    expect(CONSONANTS.b).toBe('ب');
    expect(CONSONANTS.S).toBe('ص');
    expect(CONSONANTS["'"]).toBe('ء');
  });

  it('has exactly the expected key set', () => {
    expect(Object.keys(CONSONANTS).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it('every value is exactly one codepoint', () => {
    for (const [k, v] of Object.entries(CONSONANTS)) {
      expect([...v].length, `key ${k}`).toBe(1);
    }
  });
});
