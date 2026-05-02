const BUCKWALTER_MAP: Record<string, string> = {
  A: 'a',
  b: 'b',
  t: 't',
  v: 'th',
  j: 'j',
  H: 'h',
  x: 'kh',
  d: 'd',
  '*': 'dh',
  r: 'r',
  z: 'z',
  s: 's',
  $: 'sh',
  S: 's',
  D: 'd',
  T: 't',
  Z: 'z',
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
  p: 'h',
  "'": 'a',
  '>': 'a',
  '<': 'i',
  '&': 'w',
  '}': 'y',
  '|': 'a',
  Y: 'a',
  '`': 'a',
};

const DIACRITICS = new Set(['~', 'a', 'i', 'u', 'o', 'F', 'N', 'K']);

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
      out += ch.toLowerCase();
      continue;
    }
  }
  out = out.toLowerCase();
  out = out.replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '');
  if (out.length === 0) {
    throw new Error(`latinSlug: empty result for input: ${JSON.stringify(input)}`);
  }
  return out;
};
