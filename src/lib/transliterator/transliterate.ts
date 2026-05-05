import { normalize } from './normalize';
import { tokenize } from './tokenize';
import { render } from './render';

/**
 * Transliterate phonetic English (with optional Arabizi numerals) into
 * undiacriticized Arabic Uthmani script.
 *
 * Pipeline: normalize → per-word article-strip + tokenize + render → join.
 *
 * Behavior locked by Phase 2 design:
 * - Capitals are emphatic consonants (S→ص, D→ض, T→ط, Z→ظ, H→ح).
 * - Arabizi: 7→ح, 3→ع, 2→ء, 5→خ, 9→ص.
 * - Article `al-` / `el-` (any case) at the start of a whitespace-delimited
 *   word emits literal `ال` with no sun-letter assimilation.
 * - Doubled consonants collapse to a single consonant (no shadda diacritic).
 * - Output is undiacriticized: short vowels are dropped, long vowels emit
 *   their letter form.
 *
 * Pure, synchronous, deterministic, no I/O, no runtime dependencies.
 *
 * @see docs/adr/0003-rule-based-transliteration.md
 * @see docs/phases/phase-2-engine.md
 */
export function transliterate(input: string): string {
  const normalized = normalize(input);
  if (normalized === '') return '';
  const words = normalized.split(' ');
  return words.map(transliterateWord).join('');
}

const ARTICLE_PREFIX = /^[AaEe]l-/;
const ARABIC_ARTICLE = 'ال';

/**
 * Apply the article rule then run the standard tokenize → render pipeline
 * on a single whitespace-delimited word.
 *
 * The Arabic article prefix `ال` is concatenated as a literal string
 * OUTSIDE the render dedup window. This is intentional: it preserves
 * doubled ل around a long vowel (e.g. `al-laah` → `اللاه`) while still
 * allowing the canonical `al-lah` → `الله` to fall out naturally because
 * render's dedup tracker never sees the article's ل.
 */
function transliterateWord(word: string): string {
  let prefix = '';
  let rest = word;
  const m = ARTICLE_PREFIX.exec(word);
  if (m) {
    prefix = ARABIC_ARTICLE;
    rest = word.slice(m[0].length);
  }
  return prefix + render(tokenize(rest));
}
