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
 * Ladder priority (R1d): length-3 first, then length-2, then length-1. The
 * length-3 step matches against VOWELS only (currently `aa2` → آ); length-2
 * checks vowels then digraphs; length-1 checks vowels, arabizi, consonants.
 * Case-sensitive (uppercase consonants are emphatic per ADR-0003). Unmatched
 * characters become single-char `passthrough` tokens. Pure, total, never throws.
 *
 * Tie-breaker for same-length matches at the same position: vowels > digraphs
 * > arabizi > consonants.
 *
 * @see docs/phases/phase-2-engine.md
 * @see docs/adr/0003-rule-based-transliteration.md
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    // Try length-3 (vowels-3 first; currently only `aa2`).
    if (i + 3 <= input.length) {
      const three = input.slice(i, i + 3);
      const t = matchThree(three);
      if (t) {
        tokens.push(t);
        i += 3;
        continue;
      }
    }
    // Try length-2 (vowels, digraphs).
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

function matchThree(key: string): Token | null {
  // R1d: only vowels carry length-3 keys (e.g. `aa2` → آ).
  const vowelsMap = VOWELS as Readonly<Record<string, string>>;
  if (key in vowelsMap) {
    return { kind: 'vowel', key, arabic: vowelsMap[key]! };
  }
  return null;
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
