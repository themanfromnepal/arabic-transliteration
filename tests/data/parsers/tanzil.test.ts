import { describe, it, expect } from 'vitest';
import {
  buildVerseWordIndex,
  parseTanzil,
  splitUthmaniWords,
} from '../../../scripts/build/parsers/tanzil';

const fixture = [
  '# Tanzil Quran Text (Uthmani)',
  '',
  '1|1|بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  '1|2|ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
  '2|1|الٓمٓ',
].join('\n');

describe('parseTanzil', () => {
  it('parses verse rows and skips blank/comment lines', () => {
    const out = parseTanzil(fixture);
    expect(out).toHaveLength(3);
  });

  it('produces correct first record shape', () => {
    const out = parseTanzil(fixture);
    expect(out[0]).toEqual({
      sura: 1,
      ayah: 1,
      uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    });
  });

  it('strips BOM and skips header/blank lines', () => {
    const withBom = '\uFEFF# header\n\n1|1|بِسْمِ';
    const out = parseTanzil(withBom);
    expect(out).toEqual([{ sura: 1, ayah: 1, uthmani: 'بِسْمِ' }]);
  });
});

describe('splitUthmaniWords', () => {
  it('splits on whitespace and drops empties', () => {
    expect(splitUthmaniWords('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')).toEqual([
      'بِسْمِ',
      'ٱللَّهِ',
      'ٱلرَّحْمَٰنِ',
      'ٱلرَّحِيمِ',
    ]);
    expect(splitUthmaniWords('  a   b\tc\n')).toEqual(['a', 'b', 'c']);
  });
});

describe('buildVerseWordIndex', () => {
  it('returns the Uthmani word at a given (sura,ayah,wordIndex)', () => {
    const verses = parseTanzil(
      [
        '1|1|بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        '1|2|ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      ].join('\n'),
    );
    const idx = buildVerseWordIndex(verses);
    // QAC wordIndex is 1-based; lookup is words[wordIndex - 1].
    expect(idx.get('1:1')?.[0]).toBe('بِسْمِ');
    expect(idx.get('1:1')?.[1]).toBe('ٱللَّهِ');
    expect(idx.get('1:2')?.[2]).toBe('رَبِّ');
  });
});
