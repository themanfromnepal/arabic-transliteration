import { describe, it, expect } from 'vitest';
import { parseQac } from '../../../scripts/build/parsers/qac';

const fixture = [
  '# QAC v0.4 header',
  '(1:1:1:1)\tbi\tP\tPOS:P',
  '(1:1:2:1)\tsm\tN\tPOS:N|LEM:rabb|ROOT:rbb',
  '(1:1:2:2)\tu\tSUFF\tSTEM',
].join('\n');

describe('parseQac', () => {
  it('parses 3 tokens and skips header', () => {
    const out = parseQac(fixture);
    expect(out).toHaveLength(3);
  });

  it('parses full features map for KEY:VALUE tokens', () => {
    const out = parseQac(fixture);
    expect(out[1]).toEqual({
      sura: 1,
      ayah: 1,
      wordIndex: 2,
      segmentIndex: 1,
      form: 'sm',
      tag: 'N',
      features: { POS: 'N', LEM: 'rabb', ROOT: 'rbb' },
    });
  });

  it('treats bare token (no colon) as empty-value feature', () => {
    const out = parseQac(fixture);
    expect(out[2]!.features).toEqual({ STEM: '' });
  });
});
