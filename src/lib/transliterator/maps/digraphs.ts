export const DIGRAPHS = {
  th: 'ث',
  kh: 'خ',
  dh: 'ذ',
  sh: 'ش',
  gh: 'غ',
  // R1d hamza-bearer family: `2`-suffix encodes the bearer letter.
  w2: 'ؤ',
  y2: 'ئ',
  a2: 'أ',
  i2: 'إ',
} as const satisfies Readonly<Record<string, string>>;
