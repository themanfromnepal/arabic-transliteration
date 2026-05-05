import { describe, it, expect } from 'vitest';
import { tokenize, type Token } from '@/src/lib/transliterator/tokenize';

describe('tokenize (Stage C)', () => {
  it('returns [] for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('matches a single consonant', () => {
    expect(tokenize('b')).toEqual<Token[]>([{ kind: 'consonant', key: 'b', arabic: 'ب' }]);
  });

  it('matches a single Arabizi numeral', () => {
    expect(tokenize('7')).toEqual<Token[]>([{ kind: 'arabizi', key: '7', arabic: 'ح' }]);
  });

  it('matches a single short vowel with empty arabic', () => {
    expect(tokenize('a')).toEqual<Token[]>([{ kind: 'vowel', key: 'a', arabic: '' }]);
  });

  it('matches a long vowel as one token, not two shorts', () => {
    const out = tokenize('aa');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ kind: 'vowel', key: 'aa', arabic: 'ا' });
  });

  it('matches digraphs greedily as one token', () => {
    const out = tokenize('sh');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ kind: 'digraph', key: 'sh', arabic: 'ش' });
  });

  it('tokenizes a mixed Arabizi word (7abib)', () => {
    const out = tokenize('7abib');
    expect(out).toHaveLength(5);
    expect(out).toEqual<Token[]>([
      { kind: 'arabizi', key: '7', arabic: 'ح' },
      { kind: 'vowel', key: 'a', arabic: '' },
      { kind: 'consonant', key: 'b', arabic: 'ب' },
      { kind: 'vowel', key: 'i', arabic: '' },
      { kind: 'consonant', key: 'b', arabic: 'ب' },
    ]);
  });

  it('respects emphatic capitals (Salaam)', () => {
    const out = tokenize('Salaam');
    expect(out).toHaveLength(5);
    expect(out).toEqual<Token[]>([
      { kind: 'consonant', key: 'S', arabic: 'ص' },
      { kind: 'vowel', key: 'a', arabic: '' },
      { kind: 'consonant', key: 'l', arabic: 'ل' },
      { kind: 'vowel', key: 'aa', arabic: 'ا' },
      { kind: 'consonant', key: 'm', arabic: 'م' },
    ]);
  });

  it("treats apostrophe as hamza (a'lim)", () => {
    const out = tokenize("a'lim");
    expect(out).toHaveLength(5);
    expect(out).toEqual<Token[]>([
      { kind: 'vowel', key: 'a', arabic: '' },
      { kind: 'consonant', key: "'", arabic: 'ء' },
      { kind: 'consonant', key: 'l', arabic: 'ل' },
      { kind: 'vowel', key: 'i', arabic: '' },
      { kind: 'consonant', key: 'm', arabic: 'م' },
    ]);
  });

  it('emits passthrough for whitespace without an arabic field', () => {
    const tokens = tokenize('a b');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ kind: 'vowel', key: 'a', arabic: '' });
    expect(tokens[1]).toEqual({ kind: 'passthrough', key: ' ' });
    expect('arabic' in tokens[1]!).toBe(false);
    expect(tokens[2]).toEqual({ kind: 'consonant', key: 'b', arabic: 'ب' });
  });

  it('emits passthrough for unknown letters', () => {
    expect(tokenize('xvp')).toEqual<Token[]>([
      { kind: 'passthrough', key: 'x' },
      { kind: 'passthrough', key: 'v' },
      { kind: 'passthrough', key: 'p' },
    ]);
  });

  it('is greedy at boundaries (aab)', () => {
    const out = tokenize('aab');
    expect(out).toHaveLength(2);
    expect(out).toEqual<Token[]>([
      { kind: 'vowel', key: 'aa', arabic: 'ا' },
      { kind: 'consonant', key: 'b', arabic: 'ب' },
    ]);
  });

  it('produces tokens with consistent shape (kind + arabic? per kind)', () => {
    const tokens = tokenize('sh3a');
    for (const t of tokens) {
      expect(typeof t.kind).toBe('string');
      if (t.kind === 'passthrough') {
        expect('arabic' in t).toBe(false);
      } else {
        expect(typeof t.arabic).toBe('string');
      }
    }
  });

  it('lone uppercase non-emphatic letter is passthrough', () => {
    // 'A' is uppercase but not in CONSONANTS (only S/D/T/Z/H are emphatic)
    expect(tokenize('A')).toEqual([{ kind: 'passthrough', key: 'A' }]);
  });

  it('apostrophe at start tokenizes as hamza', () => {
    expect(tokenize("'a")).toEqual([
      { kind: 'consonant', key: "'", arabic: 'ء' },
      { kind: 'vowel', key: 'a', arabic: '' },
    ]);
  });

  it('apostrophe at end tokenizes as hamza', () => {
    expect(tokenize("a'")).toEqual([
      { kind: 'vowel', key: 'a', arabic: '' },
      { kind: 'consonant', key: "'", arabic: 'ء' },
    ]);
  });

  it('arabizi adjacent to digraph splits correctly', () => {
    // '7s' is not a length-2 match anywhere, so falls through to length-1: arabizi(7) then... 's' alone, then 'h' alone
    // BUT for '7sh': length-2 attempt at '7s' fails, emit arabizi(7), then length-2 attempt at 'sh' succeeds as digraph
    expect(tokenize('7sh')).toEqual([
      { kind: 'arabizi', key: '7', arabic: 'ح' },
      { kind: 'digraph', key: 'sh', arabic: 'ش' },
    ]);
  });

  it('digit outside the Arabizi set is passthrough', () => {
    expect(tokenize('4')).toEqual([{ kind: 'passthrough', key: '4' }]);
    expect(tokenize('8')).toEqual([{ kind: 'passthrough', key: '8' }]);
  });

  it('long greedy chain pairs into long vowels left-to-right', () => {
    // 'aaaa' should be [aa, aa], not [aa, a, a] or [a, aa, a]
    expect(tokenize('aaaa')).toEqual([
      { kind: 'vowel', key: 'aa', arabic: 'ا' },
      { kind: 'vowel', key: 'aa', arabic: 'ا' },
    ]);
  });

  it('all-passthrough whitespace run is preserved one token per char', () => {
    expect(tokenize('   ')).toEqual([
      { kind: 'passthrough', key: ' ' },
      { kind: 'passthrough', key: ' ' },
      { kind: 'passthrough', key: ' ' },
    ]);
  });

  // R1d: hamza-bearer digraphs and the length-3 madda vowel.
  it('matches length-3 aa2 as alef-with-madda', () => {
    expect(tokenize('aa2')).toEqual<Token[]>([{ kind: 'vowel', key: 'aa2', arabic: 'آ' }]);
  });

  it('aa2 takes priority over aa+2 length-2/length-1 fallbacks', () => {
    // Without length-3 priority this would tokenize as [aa, 2] which would
    // emit ا + ء instead of the single آ.
    const out = tokenize('aa2b');
    expect(out).toEqual<Token[]>([
      { kind: 'vowel', key: 'aa2', arabic: 'آ' },
      { kind: 'consonant', key: 'b', arabic: 'ب' },
    ]);
  });

  it('matches length-2 hamza-bearer digraphs (w2/y2/a2/i2)', () => {
    expect(tokenize('w2')).toEqual<Token[]>([{ kind: 'digraph', key: 'w2', arabic: 'ؤ' }]);
    expect(tokenize('y2')).toEqual<Token[]>([{ kind: 'digraph', key: 'y2', arabic: 'ئ' }]);
    expect(tokenize('a2')).toEqual<Token[]>([{ kind: 'digraph', key: 'a2', arabic: 'أ' }]);
    expect(tokenize('i2')).toEqual<Token[]>([{ kind: 'digraph', key: 'i2', arabic: 'إ' }]);
  });

  it('hamza-bearer digraph wins over a+2 split', () => {
    const out = tokenize('a2lim');
    expect(out).toEqual<Token[]>([
      { kind: 'digraph', key: 'a2', arabic: 'أ' },
      { kind: 'consonant', key: 'l', arabic: 'ل' },
      { kind: 'vowel', key: 'i', arabic: '' },
      { kind: 'consonant', key: 'm', arabic: 'م' },
    ]);
  });
});
