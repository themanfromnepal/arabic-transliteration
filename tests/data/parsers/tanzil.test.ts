import { describe, it, expect } from 'vitest';
import { parseTanzil } from '../../../scripts/build/parsers/tanzil';

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
