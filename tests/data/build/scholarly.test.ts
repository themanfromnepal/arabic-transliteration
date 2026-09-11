import { describe, it, expect } from 'vitest';

import { scholarlyTranslit } from '../../../scripts/build/scholarly';

describe('scholarlyTranslit (DIN 31635)', () => {
  it('renders long vowels with a macron', () => {
    expect(scholarlyTranslit('kitaAb')).toBe('kitāb');
    expect(scholarlyTranslit('salaAm')).toBe('salām');
  });

  it('renders emphatics and the distinctive consonants with their dots', () => {
    expect(scholarlyTranslit('DaAHik')).toBe('ḍāḥik');
    expect(scholarlyTranslit('$ahiyd')).toBe('šahīd');
  });

  it('renders the dagger alef as a long vowel', () => {
    expect(scholarlyTranslit('raHoma`n')).toBe('raḥmān');
  });

  it('doubles a geminated consonant', () => {
    expect(scholarlyTranslit('rab~')).toBe('rabb');
  });

  it('does not double a word-initial consonant', () => {
    // A leading shadda survives assimilation to a definite article the citation form has already
    // dropped. Arabic has no word-initial gemination, so it must not surface as "rraḥima".
    expect(scholarlyTranslit('r~aHima')).toBe('raḥima');
  });

  it('does not double the vowel after a hamza bearer', () => {
    // The bearer carries the glottal stop; the vowel comes from the following diacritic.
    expect(scholarlyTranslit('>aroHaAm')).toBe('ʾarḥām');
  });

  it('leaves taa marbuta silent in the pausal form', () => {
    expect(scholarlyTranslit('maroHamap')).toBe('marḥama');
    expect(scholarlyTranslit('raHomap')).toBe('raḥma');
  });

  it('renders ayn and hamza distinctly', () => {
    expect(scholarlyTranslit('Eilom')).toBe('ʿilm');
    expect(scholarlyTranslit("'amor")).toBe('ʾamr');
  });

  it('drops recitation marks rather than passing them through', () => {
    // Anything outside the tables must not leak Buckwalter punctuation into reader-facing text.
    expect(scholarlyTranslit('kitaAb:')).toBe('kitāb');
  });
});
