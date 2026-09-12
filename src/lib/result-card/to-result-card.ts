import {
  RESULT_CARD_OCCURRENCE_PREVIEW_COUNT,
  type DictionaryLemmaEntry,
} from '@/src/types/dictionary';
import type { ResultCard, ResultCardRootLetters } from '@/src/types/result-card';
import type { VerseContext } from '@/src/lib/dictionary/verse-context';

/**
 * How many occurrences the card carries before the "show all" expansion.
 *
 * `dictionary.json` already embeds only this many per lemma (see `DictionaryLemmaEntry` and B7 in
 * phase-4-ui-stages.md), so this is documentation of that contract, not a runtime bound — there is
 * nothing left to slice here.
 */
export const PREVIEW_COUNT = RESULT_CARD_OCCURRENCE_PREVIEW_COUNT;

/**
 * Per-ayah recitation from everyayah.com, resolved by sura:ayah, matching the Credits attribution
 * (Saad Al-Ghamdi, 40 kbps). Requested only when the learner presses play.
 */
export function audioUrlFor(sura: number, ayah: number): string {
  const pad = (n: number) => String(n).padStart(3, '0');
  return `https://everyayah.com/data/Ghamadi_40kbps/${pad(sura)}${pad(ayah)}.mp3`;
}

function toRootLetters(rootArabic: string): ResultCardRootLetters {
  // Spread rather than split so a root written with surrogate pairs stays intact.
  const letters = [...rootArabic];
  if (letters.length === 4) {
    return [letters[0]!, letters[1]!, letters[2]!, letters[3]!];
  }
  // The schema guarantees 3 or 4; pad defensively so a malformed row cannot crash the card.
  return [letters[0] ?? '', letters[1] ?? '', letters[2] ?? ''];
}

/**
 * Build the presentational result card from a resolved lemma.
 *
 * The verse context supplies the Uthmani text and translation for each previewed occurrence; a
 * missing verse degrades that one snippet rather than failing the card.
 */
export function toResultCard(lemma: DictionaryLemmaEntry, context: VerseContext): ResultCard {
  const preview = lemma.occurrencesPreview;
  const reading = lemma.transliteration || lemma.phoneticKeys[0] || lemma.lemmaId;

  return {
    id: lemma.lemmaId,
    arabicHeadline: lemma.arabic,
    transliteration: reading,
    englishGloss: lemma.meaning,
    rootLetters: toRootLetters(lemma.rootArabic),
    audio: {
      label: `Recitation of ${reading}`,
      controlLabels: {
        idle: `Play audio for ${reading}`,
        playing: `Pause audio for ${reading}`,
        error: `Retry audio for ${reading}`,
      },
      state: 'idle',
    },
    occurrences: {
      previewCount: PREVIEW_COUNT,
      totalCount: lemma.occurrenceCount,
      allLoadedItems: preview.map((occ) => ({
        id: `${occ.sura}:${occ.ayah}:${occ.wordIndex}`,
        sura: occ.sura,
        ayah: occ.ayah,
        referenceLabel: `${occ.sura}:${occ.ayah}`,
        arabicSnippet: context.verse(occ.sura, occ.ayah) ?? '',
        translationSnippet: context.translation(occ.sura, occ.ayah) ?? '',
      })),
    },
  };
}
