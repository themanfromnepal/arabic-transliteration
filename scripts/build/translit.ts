// Per R1d locked decisions:
// - `@` is the sentinel for ة (taa-marbuta); BUCKWALTER_MAP emits `p → "@"`
//   and the engine consonants table maps `@ → ة`.
// - Uppercase emphatics (S/D/T/Z/H) are preserved (no toLowerCase) so the
//   engine can disambiguate them from their plain counterparts.
// - The `2`-suffix family encodes hamza bearers in slug form:
//     `'→2`, `>→a2`, `<→i2`, `&→w2`, `}→y2`, `|→aa2`.
//   The engine adds digraphs w2/y2/a2/i2 → ؤ/ئ/أ/إ and a length-3 vowel
//   aa2 → آ (lives in VOWELS table; tokenizer ladder tries length-3 first).
// - Long-alef family: `A→aa`, `Y→y`, `` ` `` (small alef) is dropped, and
//   alef-wasla `{→aa`. After cleanup, runs of 3+ `a` collapse to `aa` so
//   stacked alefs/fathas can't inflate the long-vowel form.
// - Cleanup widens to `[a-zA-Z0-9@]` so emphatic capitals, digits (Arabizi),
//   and the ة sentinel survive; everything else is stripped.
// URL safety note: future routing on `phoneticKeys` must `encodeURIComponent`
// because `@` is a reserved URL character.
const BUCKWALTER_MAP: Record<string, string> = {
  A: 'aa',
  b: 'b',
  t: 't',
  v: 'th',
  j: 'j',
  H: 'H',
  x: 'kh',
  d: 'd',
  '*': 'dh',
  r: 'r',
  z: 'z',
  s: 's',
  $: 'sh',
  S: 'S',
  D: 'D',
  T: 'T',
  Z: 'Z',
  E: 'a',
  g: 'gh',
  f: 'f',
  q: 'q',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  h: 'h',
  w: 'w',
  y: 'y',
  p: '@',
  "'": '2',
  '>': 'a2',
  '<': 'i2',
  '&': 'w2',
  '}': 'y2',
  '|': 'aa2',
  Y: 'y',
  '{': 'aa',
};

// `~` shadda, short-vowel/tanween diacritics, and `` ` `` superscript-alef
// are all dropped from the slug.
const DIACRITICS = new Set(['~', 'a', 'i', 'u', 'o', 'F', 'N', 'K', '`']);

export const latinSlug = (input: string): string => {
  let out = '';
  for (const ch of input) {
    const mapped = BUCKWALTER_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    if (DIACRITICS.has(ch)) continue;
    if (/[A-Za-z]/.test(ch)) {
      out += ch;
      continue;
    }
  }
  // Keep alphanumerics + the ة sentinel; strip everything else.
  out = out.replace(/[^a-zA-Z0-9@]+/g, '');
  // Collapse runs of 3+ `a` (e.g. A + leftover diacritic-a chains) to `aa`.
  out = out.replace(/a{3,}/g, 'aa');
  if (out.length === 0) {
    throw new Error(`latinSlug: empty result for input: ${JSON.stringify(input)}`);
  }
  return out;
};
