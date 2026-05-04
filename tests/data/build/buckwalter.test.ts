import { describe, it, expect } from 'vitest';
import { BW_TO_UTHMANI, bw2uthmani } from '../../../scripts/build/buckwalter';

describe('bw2uthmani', () => {
  it('returns empty string for empty input', () => {
    expect(bw2uthmani('')).toBe('');
  });

  it('passes through unmapped characters unchanged', () => {
    expect(bw2uthmani('?')).toBe('?');
    // 'c' is not in the table; should pass through verbatim mixed with mapped chars.
    expect(bw2uthmani('bc')).toBe('\u0628c');
  });

  it('converts QAC LEM "Eabada" to عَبَدَ', () => {
    expect(bw2uthmani('Eabada')).toBe('\u0639\u064E\u0628\u064E\u062F\u064E');
  });

  it('converts QAC LEM "rab~" to رَبّ', () => {
    expect(bw2uthmani('rab~')).toBe('\u0631\u064E\u0628\u0651');
  });

  it('converts QAC LEM ">ab~" to أَبّ', () => {
    expect(bw2uthmani('>ab~')).toBe('\u0623\u064E\u0628\u0651');
  });

  it('converts QAC LEM "{ll~ah" to ٱللَّه (alef wasla + lam + lam + shadda + fatha + heh)', () => {
    expect(bw2uthmani('{ll~ah')).toBe('\u0671\u0644\u0644\u0651\u064E\u0647');
  });

  it('converts the dagger-alef form "r~aHoma`n" to a string with shadda + dagger alef', () => {
    // Char-by-char: r, ~, a, H, o, m, a, `, n
    expect(bw2uthmani('r~aHoma`n')).toBe('\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646');
  });

  it('handles a token with hamza-on-waw and small high madda: "yaEoba&uA@"', () => {
    expect(bw2uthmani('yaEoba&uA@')).toBe(
      '\u064A\u064E\u0639\u0652\u0628\u064E\u0624\u064F\u0627\u06E4',
    );
  });

  it('covers every entry in BW_TO_UTHMANI as a single-char input', () => {
    for (const [bw, ar] of Object.entries(BW_TO_UTHMANI)) {
      expect(bw2uthmani(bw), `mapping for ${JSON.stringify(bw)}`).toBe(ar);
    }
  });

  it('table contains the expected number of entries (37 letters + 8 diacritics + 11 extended = 56)', () => {
    expect(Object.keys(BW_TO_UTHMANI).length).toBe(56);
  });
});
