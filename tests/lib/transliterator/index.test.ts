import { describe, it, expect, expectTypeOf } from 'vitest';
import { transliterate } from '@/src/lib/transliterator';

describe('transliterator (Stage A smoke)', () => {
  it('exports a transliterate function with the expected signature', () => {
    expect(typeof transliterate).toBe('function');
    expectTypeOf(transliterate).toEqualTypeOf<(input: string) => string>();
  });

  it('returns input unchanged (identity stub)', () => {
    expect(transliterate('')).toBe('');
    expect(transliterate('hello')).toBe('hello');
  });
});
