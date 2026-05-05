import type { Token } from './tokenize';

/**
 * Render a token stream to a single Arabic string.
 *
 * - Drops `passthrough` tokens (whitespace, punctuation, unknown letters).
 * - Vowel tokens with empty `arabic` (short vowels) contribute nothing.
 * - Adjacent same-`arabic` consonant/digraph/arabizi emissions collapse
 *   ONLY when the emitted unit is the Arabic letter `ل` (lam). All other
 *   doubled consonants, digraphs, and arabizi units pass through unchanged
 *   (D2: dedup scoped to ل only — non-ل gemination preserved). Vowels are
 *   never deduped.
 *
 * Pure, total. Internal helper; not re-exported from the module barrel.
 */
export function render(tokens: Token[]): string {
  let out = '';
  let lastDedupableArabic: string | null = null;
  for (const t of tokens) {
    if (t.kind === 'passthrough') {
      lastDedupableArabic = null;
      continue;
    }
    if (t.kind === 'vowel') {
      out += t.arabic;
      lastDedupableArabic = null;
      continue;
    }
    // consonant | digraph | arabizi
    if (t.arabic === 'ل' && t.arabic === lastDedupableArabic) {
      // Skip the duplicate ل emission (D2: only ل collapses).
      continue;
    }
    out += t.arabic;
    lastDedupableArabic = t.arabic;
  }
  return out;
}
