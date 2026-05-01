# ADR-0003: Rule-based transliteration engine

Status: Accepted

## Context

The transliteration engine turns phonetic English typed by an English speaker into candidate
Arabic forms suitable for lemma lookup. The input domain is small and well understood: Latin
letters, common digraphs (`sh`, `kh`, `th`, `dh`, `gh`), doubled long vowels (`aa`, `ii`, `uu`),
and Arabizi numerals (7, 3, 2, 5, 9). The target is a closed, ~3,500-lemma Quranic vocabulary
(see [ADR-0004](0004-quranic-vocabulary-scope.md)). The engine must be free, fast, fully offline
after first load, deterministic across runs, and add zero per-request cost. Input handling rules
are described in [spec.md](../spec.md#input-handling) and the engine library boundary is defined
in [tech-stack.md](../tech-stack.md).

## Decision

The transliteration engine is a pure TypeScript rule-based function. It uses deterministic letter
and digraph mappings, recognizes Arabizi numerals 7, 3, 2, 5, and 9, and applies longest-match
tokenization so that multi-character sequences such as `sh` resolve before single letters. There
is no machine-learning model, no third-party transliteration API, and no network call on the
lookup path.

## Consequences

**Positive**

- Deterministic output: the same input always produces the same candidate list, which makes the
  engine trivial to unit-test and to debug.
- Zero runtime cost and zero latency beyond local computation; the engine works offline after the
  first load.
- The engine ships as a small TypeScript module with no model weights and no API client, which
  preserves the bundle budget defined in
  [architecture.md](../architecture.md#bundle-and-storage-budget).
- The rules are auditable by any contributor without specialized tooling.

**Negative**

- Edge cases in phonetic English (regional spellings, non-standard romanizations) must be added
  to the rule set or handled by Fuse.js fuzzy matching downstream.
- Adding new mappings requires a code change and a release rather than a data update.

**Neutral**

- The engine's output is always passed to Fuse.js for fuzzy ranking, so a single typo or
  alternative spelling does not depend on the rules alone.

## Alternatives considered

### Machine-learning model (transformer fine-tuned on transliteration pairs)

- Pros: Could capture long-tail phonetic variation without hand-written rules.
- Cons: Requires a training corpus the project does not own; produces non-deterministic output;
  ships large model weights that violate the bundle budget; needs ongoing retraining and
  evaluation; adds opaque failure modes.
- Reason rejected: The problem is a closed mapping problem, not a comprehension problem; the
  engineering and storage cost is not justified.

### Third-party transliteration API (Yamli-style)

- Pros: Outsources the rules to an external provider with broad coverage.
- Cons: Adds per-request cost and latency; introduces a network dependency that breaks offline
  use; gives up determinism; ties the project to a third-party privacy policy and uptime; many
  such services target Arabic-speaker chat input rather than English-speaker phonetic spelling.
- Reason rejected: Breaks the offline guarantee, adds cost, and is the wrong tool for English
  speakers learning to read.

### Buckwalter-only mapping

- Pros: Standardized, well-documented Latin-to-Arabic transliteration with a single
  character-for-character mapping.
- Cons: Buckwalter is designed for Arabic-script input encoded in ASCII, not for the phonetic
  English an English-speaking learner would type; users would need to learn Buckwalter to use the
  search box, which defeats the mission.
- Reason rejected: Mismatch with English-speaker phonetic spelling; would shift learning burden
  onto the user.

## References

- [spec.md](../spec.md)
- [tech-stack.md](../tech-stack.md)
- [architecture.md](../architecture.md)
- [phases/phase-2-engine.md](../phases/phase-2-engine.md)
