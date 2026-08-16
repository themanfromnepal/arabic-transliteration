import { describe, it, expect } from 'vitest';

import { audioUrlFor, PREVIEW_COUNT, toResultCard } from '@/src/lib/result-card/to-result-card';
import type { VerseContext } from '@/src/lib/dictionary/verse-context';
import type { LemmaEntry } from '@/src/types/dictionary';

const LEMMA: LemmaEntry = {
  lemmaId: 'rHm-rHm@',
  arabic: 'رَحْمَةً',
  lemma: 'رَحْمَة',
  root: 'rHm',
  rootArabic: 'رحم',
  transliteration: 'raḥma',
  phoneticKeys: ['rHm@'],
  meaning: 'mercy',
  partOfSpeech: 'noun',
  occurrences: [
    { sura: 2, ayah: 157, wordIndex: 3 },
    { sura: 3, ayah: 8, wordIndex: 5 },
    { sura: 6, ayah: 54, wordIndex: 2 },
    { sura: 7, ayah: 56, wordIndex: 1 },
  ],
  reviewStatus: 'auto',
};

const CONTEXT: VerseContext = {
  verse: (sura, ayah) => (sura === 2 && ayah === 157 ? 'رَحْمَةٌ مِّن رَّبِّهِمْ' : undefined),
  translation: (sura, ayah) =>
    sura === 2 && ayah === 157 ? 'Blessings from their Lord.' : undefined,
};

describe('toResultCard', () => {
  it('maps the contract fields from the lemma', () => {
    const card = toResultCard(LEMMA, CONTEXT);

    expect(card.arabicHeadline).toBe('رَحْمَةً');
    expect(card.transliteration).toBe('raḥma');
    expect(card.englishGloss).toBe('mercy');
    expect(card.rootLetters).toEqual(['ر', 'ح', 'م']);
  });

  it('supports four-letter roots', () => {
    const card = toResultCard({ ...LEMMA, rootArabic: 'زلزل' }, CONTEXT);

    expect(card.rootLetters).toEqual(['ز', 'ل', 'ز', 'ل']);
  });

  it('previews a bounded number of occurrences while reporting the true total', () => {
    const card = toResultCard(LEMMA, CONTEXT);

    // One lemma in the corpus carries 2,699 occurrences; the card must not try to render them all.
    expect(card.occurrences.allLoadedItems).toHaveLength(PREVIEW_COUNT);
    expect(card.occurrences.totalCount).toBe(4);
  });

  it('fills verse text and translation from the context', () => {
    const first = toResultCard(LEMMA, CONTEXT).occurrences.allLoadedItems[0]!;

    expect(first.referenceLabel).toBe('2:157');
    expect(first.arabicSnippet).toBe('رَحْمَةٌ مِّن رَّبِّهِمْ');
    expect(first.translationSnippet).toBe('Blessings from their Lord.');
  });

  it('degrades a single snippet rather than failing the card when a verse is missing', () => {
    const second = toResultCard(LEMMA, CONTEXT).occurrences.allLoadedItems[1]!;

    expect(second.arabicSnippet).toBe('');
    expect(second.translationSnippet).toBe('');
  });

  it('names the audio action rather than the state', () => {
    const { audio } = toResultCard(LEMMA, CONTEXT);

    expect(audio.controlLabels.idle).toBe('Play audio for raḥma');
    expect(audio.controlLabels.playing).toBe('Pause audio for raḥma');
    expect(audio.state).toBe('idle');
  });

  it('falls back to a phonetic key when no transliteration exists', () => {
    const card = toResultCard({ ...LEMMA, transliteration: '' }, CONTEXT);

    expect(card.transliteration).toBe('rHm@');
  });
});

describe('audioUrlFor', () => {
  it('zero-pads sura and ayah to the everyayah path shape', () => {
    expect(audioUrlFor(1, 1)).toBe('https://everyayah.com/data/Ghamadi_40kbps/001001.mp3');
    expect(audioUrlFor(114, 6)).toBe('https://everyayah.com/data/Ghamadi_40kbps/114006.mp3');
  });
});
