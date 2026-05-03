import { describe, it, expect } from 'vitest';
import { ARABIZI } from '@/src/lib/transliterator/maps/arabizi';

const EXPECTED_KEYS = ['7', '3', '2', '5', '9'];

const isArabicChar = (c: string) => c.charCodeAt(0) >= 0x0600 && c.charCodeAt(0) <= 0x06ff;

describe('ARABIZI map', () => {
  it('has no empty Latin keys', () => {
    expect(Object.keys(ARABIZI).every((k) => k.length > 0)).toBe(true);
  });

  it('has exactly 5 entries', () => {
    expect(Object.keys(ARABIZI).length).toBe(5);
  });

  it('every key is a single digit character', () => {
    for (const key of Object.keys(ARABIZI)) {
      expect(key.length).toBe(1);
      expect(/^[0-9]$/.test(key)).toBe(true);
    }
  });

  it('maps every key to a non-empty Arabic-block string', () => {
    for (const [key, value] of Object.entries(ARABIZI)) {
      expect(value.length, `value for key ${key}`).toBeGreaterThan(0);
      expect([...value].every(isArabicChar), `value for key ${key} is in Arabic block`).toBe(true);
    }
  });

  it('spot-checks core mappings', () => {
    expect(ARABIZI['7']).toBe('ح');
    expect(ARABIZI['3']).toBe('ع');
  });

  it('has exactly the expected key set', () => {
    expect(Object.keys(ARABIZI).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it('every value is exactly one codepoint', () => {
    for (const [k, v] of Object.entries(ARABIZI)) {
      expect([...v].length, `key ${k}`).toBe(1);
    }
  });
});
