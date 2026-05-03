/**
 * Transliterate phonetic English input into Arabic Uthmani script.
 *
 * Stage A: identity stub. Returns input unchanged. The rule-based
 * mappings, longest-match tokenizer, and Arabizi numeral handling
 * land in subsequent stages of Phase 2.
 *
 * Pure and synchronous. No I/O. No runtime dependencies.
 *
 * @see docs/adr/0003-rule-based-transliteration.md
 * @see docs/phases/phase-2-engine.md
 *
 * @param input - Raw user input string (phonetic English, possibly with Arabizi numerals).
 * @returns Candidate Arabic string. In Stage A, returns `input` unchanged.
 */
export function transliterate(input: string): string {
  return input;
}
