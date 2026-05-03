import { describe, it, expect } from 'vitest';
import {
  CURATION_HEADER,
  assertNoDuplicateLemmaIds,
  parseRow,
  validateHeader,
} from '../../../scripts/build/curation/schema';

const validCells = (
  overrides: Partial<Record<(typeof CURATION_HEADER)[number], string>> = {},
): string[] => {
  const base: Record<(typeof CURATION_HEADER)[number], string> = {
    lemmaId: 'rbb-rabb',
    arabic: 'رَبّ',
    lemma: 'rabb',
    root: 'rbb',
    partOfSpeech: 'noun',
    phoneticKeys: 'rabb',
    occurrenceCount: '5',
    firstRef: '1:2:3',
    meaning: 'lord',
    reviewStatus: 'auto',
  };
  return CURATION_HEADER.map((c) => overrides[c] ?? base[c]);
};

describe('validateHeader', () => {
  it('accepts canonical header', () => {
    expect(() => validateHeader([...CURATION_HEADER])).not.toThrow();
  });

  it('rejects missing column', () => {
    const h = CURATION_HEADER.slice(0, -1);
    expect(() => validateHeader([...h])).toThrow(/header/);
  });

  it('rejects extra column', () => {
    const h = [...CURATION_HEADER, 'extra'];
    expect(() => validateHeader(h)).toThrow(/header/);
  });

  it('rejects wrong column name', () => {
    const h: string[] = [...CURATION_HEADER];
    h[0] = 'wrong';
    expect(() => validateHeader(h)).toThrow(/header/);
  });
});

describe('parseRow', () => {
  it('parses a valid row', () => {
    const row = parseRow(validCells(), 2);
    expect(row.lemmaId).toBe('rbb-rabb');
    expect(row.occurrenceCount).toBe(5);
  });

  it('allows empty meaning', () => {
    const row = parseRow(validCells({ meaning: '' }), 2);
    expect(row.meaning).toBe('');
  });

  it('rejects invalid reviewStatus', () => {
    expect(() => parseRow(validCells({ reviewStatus: 'bogus' }), 2)).toThrow(/row 2/);
  });

  it('rejects non-numeric occurrenceCount', () => {
    expect(() => parseRow(validCells({ occurrenceCount: 'abc' }), 5)).toThrow(/row 5/);
  });

  it('rejects malformed firstRef', () => {
    expect(() => parseRow(validCells({ firstRef: '1-2-3' }), 7)).toThrow(/row 7/);
  });
});

describe('assertNoDuplicateLemmaIds', () => {
  it('passes on unique ids', () => {
    expect(() =>
      assertNoDuplicateLemmaIds([
        { lemmaId: 'a', rowNumber: 2 },
        { lemmaId: 'b', rowNumber: 3 },
      ]),
    ).not.toThrow();
  });

  it('throws on duplicate', () => {
    expect(() =>
      assertNoDuplicateLemmaIds([
        { lemmaId: 'a', rowNumber: 2 },
        { lemmaId: 'a', rowNumber: 5 },
      ]),
    ).toThrow(/duplicate/);
  });
});
