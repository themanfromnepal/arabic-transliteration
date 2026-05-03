import { CONSONANTS, DIGRAPHS, ARABIZI, VOWELS } from './maps';

export type Token =
  | { kind: 'consonant'; key: string; arabic: string }
  | { kind: 'digraph'; key: string; arabic: string }
  | { kind: 'arabizi'; key: string; arabic: string }
  | { kind: 'vowel'; key: string; arabic: string }
  | { kind: 'passthrough'; key: string };

/**
 * Segment a Latin/Arabizi input string into the longest matching map keys.
 *
 * At each position, tries length-2 keys first (digraphs, long vowels), then
 * length-1 keys (consonants, short vowels, Arabizi numerals). Case-sensitive
 * (uppercase consonants are emphatic per ADR-0003). Unmatched characters
 * become single-char `passthrough` tokens. Pure, total, never throws.
 *
 * Tie-breaker for same-length matches at the same position: vowels > digraphs
 * > arabizi > consonants. (Currently no real ties exist in the locked tables;
 * the rule is fixed to lock future behavior.)
 *
 * @see docs/phases/phase-2-engine.md
 * @see docs/adr/0003-rule-based-transliteration.md
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    // Try length-2 (digraphs, long vowels) first.
    if (i + 2 <= input.length) {
      const two = input.slice(i, i + 2);
      const t = matchTwo(two);
      if (t) {
        tokens.push(t);
        i += 2;
        continue;
      }
    }
    // Length-1 (vowels, arabizi, consonants).
    const one = input.slice(i, i + 1);
    tokens.push(matchOne(one));
    i += 1;
  }
  return tokens;
}

function matchTwo(key: string): Token | null {
  // Priority: vowels > digraphs > arabizi > consonants.
  const vowelsMap = VOWELS as Readonly<Record<string, string>>;
  const digraphsMap = DIGRAPHS as Readonly<Record<string, string>>;
  if (key in vowelsMap) {
    const arabic = vowelsMap[key]!;
    return { kind: 'vowel', key, arabic };
  }
  if (key in digraphsMap) {
    return { kind: 'digraph', key, arabic: digraphsMap[key]! };
  }
  return null;
}

function matchOne(key: string): Token {
  // Priority: vowels > arabizi > consonants. (Digraphs are length-2 only; handled by matchTwo.)
  const vowelsMap = VOWELS as Readonly<Record<string, string>>;
  const arabiziMap = ARABIZI as Readonly<Record<string, string>>;
  const consonantsMap = CONSONANTS as Readonly<Record<string, string>>;
  if (key in vowelsMap) {
    // Short vowels map to '' (dropped) — emit as a vowel token with empty arabic
    // so Stage D can decide; passthrough is reserved for truly unmatched chars.
    return { kind: 'vowel', key, arabic: vowelsMap[key]! };
  }
  if (key in arabiziMap) {
    return { kind: 'arabizi', key, arabic: arabiziMap[key]! };
  }
  if (key in consonantsMap) {
    return { kind: 'consonant', key, arabic: consonantsMap[key]! };
  }
  return { kind: 'passthrough', key };
}
