import type { ResultCard } from '@/src/types/result-card';

export const lemmaResultCardFixture: ResultCard = {
  id: 'lemma-rahmah',
  arabicHeadline: '\u0631\u062d\u0645\u0629',
  transliteration: 'rahmah',
  englishGloss: 'mercy',
  rootLetters: ['\u0631', '\u062d', '\u0645'],
  audio: {
    label: 'Play audio for rahmah',
    controlLabels: {
      idle: 'Play audio for rahmah',
      playing: 'Audio playing for rahmah',
      error: 'Retry audio for rahmah',
    },
    state: 'idle',
  },
  occurrences: {
    previewCount: 3,
    totalCount: 5,
    allLoadedItems: [
      {
        id: '2:218',
        sura: 2,
        ayah: 218,
        referenceLabel: '2:218',
        arabicSnippet: '\u0631\u062d\u0645\u0629 \u0645\u0646 \u0639\u0646\u062f\u0647',
        translationSnippet: 'Indeed Allah is Forgiving and Merciful.',
      },
      {
        id: '3:8',
        sura: 3,
        ayah: 8,
        referenceLabel: '3:8',
        arabicSnippet:
          '\u0648\u0647\u0628 \u0644\u0646\u0627 \u0645\u0646 \u0644\u062f\u0646\u0643 \u0631\u062d\u0645\u0629',
        translationSnippet: 'Grant us mercy from Yourself.',
      },
      {
        id: '6:54',
        sura: 6,
        ayah: 54,
        referenceLabel: '6:54',
        arabicSnippet:
          '\u0643\u062a\u0628 \u0631\u0628\u0643\u0645 \u0639\u0644\u0649 \u0646\u0641\u0633\u0647 \u0627\u0644\u0631\u062d\u0645\u0629',
        translationSnippet: 'Your Lord has prescribed mercy upon Himself.',
      },
      {
        id: '7:56',
        sura: 7,
        ayah: 56,
        referenceLabel: '7:56',
        arabicSnippet:
          '\u0627\u0646 \u0631\u062d\u0645\u0629 \u0627\u0644\u0644\u0647 \u0642\u0631\u064a\u0628',
        translationSnippet: 'The mercy of Allah is near to the doers of good.',
      },
      {
        id: '17:82',
        sura: 17,
        ayah: 82,
        referenceLabel: '17:82',
        arabicSnippet:
          '\u0634\u0641\u0627\u0621 \u0648\u0631\u062d\u0645\u0629 \u0644\u0644\u0645\u0624\u0645\u0646\u064a\u0646',
        translationSnippet: 'It is a healing and a mercy for the believers.',
      },
    ],
  },
};
