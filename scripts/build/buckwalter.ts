// Buckwalter → Uthmani Arabic conversion.
// Tim Buckwalter's standard transliteration is a 1:1 mapping between
// ASCII characters and Arabic Unicode codepoints. Used to convert QAC
// morphology LEM tokens into displayable Arabic citation forms.

export const BW_TO_UTHMANI: Readonly<Record<string, string>> = {
  // Letters
  "'": '\u0621', // ء hamza
  '|': '\u0622', // آ alef with madda above
  '>': '\u0623', // أ alef with hamza above
  '&': '\u0624', // ؤ waw with hamza above
  '<': '\u0625', // إ alef with hamza below
  '}': '\u0626', // ئ yeh with hamza above
  A: '\u0627', // ا alef
  b: '\u0628', // ب
  p: '\u0629', // ة teh marbuta
  t: '\u062A', // ت
  v: '\u062B', // ث
  j: '\u062C', // ج
  H: '\u062D', // ح
  x: '\u062E', // خ
  d: '\u062F', // د
  '*': '\u0630', // ذ
  r: '\u0631', // ر
  z: '\u0632', // ز
  s: '\u0633', // س
  $: '\u0634', // ش
  S: '\u0635', // ص
  D: '\u0636', // ض
  T: '\u0637', // ط
  Z: '\u0638', // ظ
  E: '\u0639', // ع
  g: '\u063A', // غ
  _: '\u0640', // ـ tatweel
  f: '\u0641', // ف
  q: '\u0642', // ق
  k: '\u0643', // ك
  l: '\u0644', // ل
  m: '\u0645', // م
  n: '\u0646', // ن
  h: '\u0647', // ه
  w: '\u0648', // و
  Y: '\u0649', // ى alef maksura
  y: '\u064A', // ي

  // Diacritics
  F: '\u064B', // ً fathatan
  N: '\u064C', // ٌ dammatan
  K: '\u064D', // ٍ kasratan
  a: '\u064E', // َ fatha
  u: '\u064F', // ُ damma
  i: '\u0650', // ِ kasra
  '~': '\u0651', // ّ shadda
  o: '\u0652', // ْ sukun

  // Quranic / extended
  '^': '\u0654', // ٔ hamza above
  '#': '\u0655', // ٕ hamza below
  '`': '\u0670', // ٰ superscript (dagger) alef
  '{': '\u0671', // ٱ alef wasla
  ':': '\u06DC', // ۜ small high seen
  '@': '\u06E4', // ۤ small high madda
  '"': '\u06E5', // ۥ small waw
  '[': '\u06E6', // ۦ small yeh
  ';': '\u06E1', // ۡ small high dotless head of khah
  ',': '\u06E2', // ۢ small high meem isolated form
  '.': '\u06E3', // ۣ small low meem
};

export const bw2uthmani = (input: string): string => {
  let out = '';
  for (const ch of input) {
    const mapped = BW_TO_UTHMANI[ch];
    out += mapped !== undefined ? mapped : ch;
  }
  return out;
};
