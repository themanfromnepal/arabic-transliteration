export const VOWELS = {
  aa: 'ا',
  ii: 'ي',
  ee: 'ي',
  uu: 'و',
  oo: 'و',
  a: '',
  i: '',
  u: '',
  e: '',
  o: '',
  // R1d: alef-with-madda lives in VOWELS as a length-3 key.
  // The tokenizer ladder tries length-3 keys first.
  aa2: 'آ',
} as const satisfies Readonly<Record<string, string>>;
