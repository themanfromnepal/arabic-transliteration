import { describe, it, expect, expectTypeOf } from 'vitest';
import { transliterate } from '@/src/lib/transliterator';

describe('transliterator (Stage A smoke)', () => {
  it('exports a transliterate function with the expected signature', () => {
    expect(typeof transliterate).toBe('function');
    expectTypeOf(transliterate).toEqualTypeOf<(input: string) => string>();
  });

  it('returns a string for any input', () => {
    expect(typeof transliterate('')).toBe('string');
    expect(typeof transliterate('a')).toBe('string');
  });
});
