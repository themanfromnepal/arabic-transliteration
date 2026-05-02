import { describe, it, expect } from 'vitest';
import { parseWbw } from '../../../scripts/build/parsers/wbw';

const fixture = JSON.stringify({
  '2:1:1': 'Alif',
  '1:1:2': 'the',
  '1:1:1': 'In (the) name',
  '1:1:10': '(10)',
});

describe('parseWbw', () => {
  it('parses all entries', () => {
    const out = parseWbw(fixture);
    expect(out).toHaveLength(4);
  });

  it('preserves pseudo-word marker like "(10)" verbatim', () => {
    const out = parseWbw(fixture);
    const marker = out.find((e) => e.sura === 1 && e.ayah === 1 && e.wordIndex === 10);
    expect(marker).toEqual({ sura: 1, ayah: 1, wordIndex: 10, arabic: '', english: '(10)' });
  });

  it('sorts by (sura, ayah, wordIndex) ascending', () => {
    const out = parseWbw(fixture);
    expect(out.map((e) => `${e.sura}:${e.ayah}:${e.wordIndex}`)).toEqual([
      '1:1:1',
      '1:1:2',
      '1:1:10',
      '2:1:1',
    ]);
  });
});
