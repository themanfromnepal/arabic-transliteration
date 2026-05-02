import { describe, it, expect } from 'vitest';
import { parseYusufali } from '../../../scripts/build/parsers/yusufali';

const fixture = JSON.stringify({
  '2:1': 'Alif Lam Mim.',
  '1:2': 'Praise be to Allah...',
  '1:1': 'In the name of Allah...',
  '1:3': '',
});

describe('parseYusufali', () => {
  it('parses all entries from "sura:ayah" keyed object', () => {
    const out = parseYusufali(fixture);
    expect(out).toHaveLength(4);
  });

  it('handles empty translation strings', () => {
    const out = parseYusufali(fixture);
    const empty = out.find((e) => e.sura === 1 && e.ayah === 3);
    expect(empty).toEqual({ sura: 1, ayah: 3, english: '' });
  });

  it('sorts by (sura, ayah) ascending', () => {
    const out = parseYusufali(fixture);
    expect(out.map((e) => `${e.sura}:${e.ayah}`)).toEqual(['1:1', '1:2', '1:3', '2:1']);
  });
});
