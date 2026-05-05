/**
 * Normalize a raw user input string before tokenization.
 *
 * - Trim leading/trailing whitespace.
 * - Collapse internal whitespace runs to a single ASCII space.
 * - NO case changes (uppercase consonants are emphatic per ADR-0003).
 * - NO Unicode normalization (Phase 2 input is ASCII-range).
 */
export function normalize(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
