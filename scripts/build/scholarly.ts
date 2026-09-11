// Buckwalter → scholarly romanization (DIN 31635).
//
// Distinct from `latinSlug` in translit.ts, which produces a lookup key: that one strips vowels and
// folds emphatics into ASCII so a learner typing "rahman" matches. This one is the reader-facing
// form required by the result card contract in docs/spec.md — "standard diacritic conventions;
// intended for reference, not input" — so it keeps vowels, length, and the emphatic dots.
//
// DIN 31635 was chosen over ALA-LC and IJMES because it is the common scholarly default and its
// hamza/ʿayn handling is unambiguous to generate from Buckwalter, which is itself 1:1 with Arabic.
//
// Input is the QAC Buckwalter LEM, which merge.ts holds before converting it to Uthmani.

const CONSONANTS: Readonly<Record<string, string>> = {
  "'": 'ʾ', // ء hamza
  '|': 'ʾā', // آ alef with madda
  // Hamza bearers carry only the glottal stop; the vowel arrives as the following diacritic, so
  // emitting one here too would double it (ʾaarḥām for what should be ʾarḥām).
  '>': 'ʾ', // أ
  '&': 'ʾ', // ؤ
  '<': 'ʾ', // إ
  '}': 'ʾ', // ئ
  A: 'ā', // ا
  b: 'b',
  // ة in pausal form is silent; the preceding fatha already supplies the -a of marḥama.
  p: '',
  t: 't',
  v: 'ṯ', // ث
  j: 'ǧ', // ج
  H: 'ḥ', // ح
  x: 'ḫ', // خ
  d: 'd',
  '*': 'ḏ', // ذ
  r: 'r',
  z: 'z',
  s: 's',
  $: 'š', // ش
  S: 'ṣ', // ص
  D: 'ḍ', // ض
  T: 'ṭ', // ط
  Z: 'ẓ', // ظ
  E: 'ʿ', // ع
  g: 'ġ', // غ
  f: 'f',
  q: 'q',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  h: 'h',
  w: 'w',
  Y: 'ā', // ى alef maksura
  y: 'y',
  '{': 'ā', // ٱ alef wasla
};

const SHORT_VOWELS: Readonly<Record<string, string>> = {
  a: 'a',
  u: 'u',
  i: 'i',
  '`': 'ā', // ٰ superscript (dagger) alef reads as a long ā
};

const TANWEEN: Readonly<Record<string, string>> = {
  F: 'an',
  N: 'un',
  K: 'in',
};

const SHADDA = '~';
const SUKUN = 'o';
const TATWEEL = '_';

/**
 * Romanize a Buckwalter string to DIN 31635.
 *
 * Shadda doubles the preceding consonant. Long vowels are written with a macron. Tanween is
 * rendered because the citation form in the corpus carries it. Characters outside the tables —
 * Quranic recitation marks, for instance — are dropped rather than passed through, so no Buckwalter
 * punctuation leaks into reader-facing text.
 */
export const scholarlyTranslit = (input: string): string => {
  let out = '';
  let lastConsonant = '';

  for (const ch of input) {
    if (ch === TATWEEL) continue;
    if (ch === SUKUN) continue;

    if (ch === SHADDA) {
      // Double the last emitted consonant. Digraphs such as ṯ or ġ double whole.
      //
      // A shadda on the first consonant is skipped: Arabic has no word-initial gemination, and one
      // appears here only as an artifact of assimilation to a definite article the citation form
      // has already dropped — raḥima, not rraḥima.
      if (out !== lastConsonant) {
        out += lastConsonant;
      }
      continue;
    }

    const consonant = CONSONANTS[ch];
    if (consonant !== undefined) {
      out += consonant;
      lastConsonant = consonant;
      continue;
    }

    const vowel = SHORT_VOWELS[ch];
    if (vowel !== undefined) {
      out += vowel;
      lastConsonant = '';
      continue;
    }

    const tanween = TANWEEN[ch];
    if (tanween !== undefined) {
      out += tanween;
      lastConsonant = '';
      continue;
    }

    // Anything else (recitation marks, stray punctuation) is intentionally dropped.
  }

  // "aā" arises where a fatha precedes an alef; the macron already carries the length.
  out = out.replace(/aā/g, 'ā').replace(/uū/g, 'ū').replace(/iī/g, 'ī');

  // Buckwalter writes long ī and ū as kasra+ya and damma+waw. Collapse them only when the y or w is
  // acting as a vowel letter — that is, when no vowel follows — so a genuine consonantal y or w
  // (biyad, ḥiwār) is left alone.
  out = out.replace(/iy(?![aiuāīū])/g, 'ī').replace(/uw(?![aiuāīū])/g, 'ū');

  return out;
};
