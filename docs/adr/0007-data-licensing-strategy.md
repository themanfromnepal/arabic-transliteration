# ADR-0007: Data Licensing Strategy

Status: Accepted — resolved

## Context

The project ships MIT-licensed code that bundles data derived from sources with heterogeneous
licenses: Tanzil (free use, text must not be modified), the Quranic Arabic Corpus (GPL v3,
copyleft), Quran.com word-by-word translations (license varies by contributor and snapshot), and
everyayah.com audio (public free CDN). The interaction between code license and data license is
unsettled in the broader open-source ecosystem, and the project's mission requires respectful,
legally clean handling of Quranic scholarship. Without an explicit decision, contributors and
downstream consumers cannot know on what terms they receive the bundled lemma shards. The source
inventory and attribution requirements live in
[../data-pipeline.md](../data-pipeline.md#source-inventory) and
[../data-pipeline.md](../data-pipeline.md#licensing-and-attribution).

## Decision

The project adopts a two-step licensing strategy.

1. Request written permission from the Quranic Arabic Corpus maintainers to bundle derived
   morphology data (lemma identifiers, root letters, occurrences) under permissive terms with
   attribution. The request, the response, and any granted scope are documented in the repository
   and surfaced on `/credits`.
2. If permission is denied, no response is received within a reasonable window, or the granted
   scope is insufficient, fall back to dual-licensing. Project code remains MIT under `LICENSE`,
   and data shards derived from the Quranic Arabic Corpus are released under GPL v3 under
   `LICENSE-DATA`.

Quran.com word-by-word data is pinned to a specific snapshot whose license is verified and
documented on `/credits` before bundling. If no permissive snapshot is available, the same
dual-license fallback applies to the affected shards.

## Consequences

**Positive**

- Legal clarity for contributors, downstream forks, and learners about the terms under which the
  data is distributed.
- Respect for upstream scholarship: the strategy starts by asking, not by assuming permissive
  reuse of copyleft-licensed data.
- Mission alignment: the project remains free and open-source while honoring upstream license
  obligations.

**Negative**

- The licensing story is more complex to explain on `/credits` than a single-license project.
- Downstream forks of the data shards carry GPL obligations even though the project code is MIT;
  this constrains how forks can redistribute derived datasets.
- The two-step process introduces a Phase 1 dependency: licensing must be resolved before JSON
  shards are bundled into v1 (see
  [../phases/phase-1-data-pipeline.md](../phases/phase-1-data-pipeline.md)).

**Neutral**

- Code consumers of MIT-licensed source files are unaffected; they may use, modify, and
  redistribute project code under MIT regardless of the data-shard license outcome.

## Alternatives considered

### Bundle without permission and accept the legal risk

- Pros: No upstream conversation required; ships fastest.
- Cons: Disrespects the upstream maintainers and the GPL terms of the corpus; exposes the project
  and its forks to a takedown request or legal challenge; conflicts with the mission of
  respectful handling of Quranic scholarship.
- Reason rejected: Mission-incompatible and legally fragile.

### Substitute the Quranic Arabic Corpus with a permissive source

- Pros: Eliminates the copyleft dependency entirely; simplifies the licensing story to MIT
  end-to-end.
- Cons: No equivalent permissive source for Quranic morphology, root letters, and occurrences is
  known at the quality and coverage required by [../spec.md](../spec.md); building one in-house is
  out of scope for v1.
- Reason rejected: No viable substitute exists today at the required scholarship quality.

### Drop root letters and lemma features from v1

- Pros: Removes the copyleft dependency by removing the dependent features.
- Cons: Root letters and lemma-level features are core to the mission stated in
  [../vision.md](../vision.md) and to the result card contract in
  [../spec.md](../spec.md#result-card-contract); removing them gutts the v1 value proposition.
- Reason rejected: Unacceptable mission regression.

## References

- [../data-pipeline.md](../data-pipeline.md)
- [0004-quranic-vocabulary-scope.md](0004-quranic-vocabulary-scope.md)
- [../contributing.md](../contributing.md)

## Resolution (May 2026)

The two-step strategy has been resolved for all bundled data sources:

1. **Quranic Arabic Corpus v0.4** — The source file's own copyright block (lines 1–28 of
   `quranic-corpus-morphology-0.4.txt`) grants explicit permission to use the annotation in any
   website or application, provided the source is clearly indicated and a link to
   http://corpus.quran.com is made. The file must not be modified, and the copyright notice must
   be included in derived works. This is a custom license recorded as `LicenseRef-QAC-0.4`. The
   dual-license fallback (step 2) is not needed for this source.
2. **Tarteel/Qul word-by-word data** (resources 92 and 124) — Written permission was obtained
   from the Tarteel Team on 6 May 2026 (email from Hazem, hazem.talha@tarteel). The resources are
   free and open to use with no specific license. Recorded as `LicenseRef-Tarteel-free-use`.
3. **everyayah.com audio** — Streamed from a public CDN, not bundled. Formal permission status
   remains pending; attribution is provided on `/credits`.

The `LICENSE-DATA` fallback file described in the original decision was never needed and has not
been created. All bundled data is usable under the terms documented in
[../licensing.md](../licensing.md).
