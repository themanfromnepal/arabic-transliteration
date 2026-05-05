# Phase 2: Transliteration Engine

> **Status: ✅ Complete** — May 5, 2026
>
> 98.7% accuracy (148/150 golden entries pass, 2 known residuals documented).
> All deliverables shipped. Pure, synchronous, zero runtime dependencies. Unit tests gate CI.

## Goal

Deliver a pure TypeScript function that maps phonetic English to Arabic Uthmani script using a
deterministic, rule-based approach, suitable for use as the input layer in front of the dictionary
lookup.

## Inputs

- Phase 0 complete (tooling and unit-test runner in place).
- The lemma corpus from Phase 1 is used to validate the engine against curated phonetic keys.

## Deliverables

- `src/lib/transliterator/` module (planned in this phase) containing:
  - Letter map covering the standard Arabic consonants and vowels.
  - Digraph map for `sh`, `kh`, `th`, `dh`, and `gh`.
  - Arabizi numeral map: `7` → ح, `3` → ع, `2` → ء, `5` → خ, `9` → ص.
  - A longest-match tokenizer over the input string.
  - A pure function with the signature `transliterate(input: string): string`.
- A unit test suite covering 100+ phonetic examples, scoped per the unit test plan in
  [../testing-strategy.md](../testing-strategy.md#unit-tests-vitest).

## Workstreams

1. Define the mapping tables for letters, digraphs, and Arabizi numerals.
2. Implement the longest-match tokenizer.
3. Implement the pure `transliterate` function.
4. Write the unit test suite.
5. Validate engine output against curated lemma phonetic keys from Phase 1.

## Acceptance criteria

1. The engine reaches at least 95% accuracy on a curated test set of common Quranic lemma keys.
2. The function is pure and synchronous: same input always produces the same output, no I/O.
3. The engine module has zero runtime dependencies.
4. Unit tests gate CI: a failing engine test blocks merge.

## Risks and mitigations

| Risk                                                 | Mitigation                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambiguous letter mappings (for example `s` → س vs ص) | Per [../adr/0003-rule-based-transliteration.md](../adr/0003-rule-based-transliteration.md), choose the statistical default and reserve the capital-letter convention (`S`) for the alternate. The engine emits the most common form and dictionary fuzzy match handles the rest. |
| Long-vowel and diacritic ambiguity                   | Preserve doubled-letter long vowels and defer fine-grained diacritic placement to the dictionary entry.                                                                                                                                                                          |

## Related decisions and docs

- [../adr/0003-rule-based-transliteration.md](../adr/0003-rule-based-transliteration.md)
- [../spec.md](../spec.md#input-handling)
- [../testing-strategy.md](../testing-strategy.md)
