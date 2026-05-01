# Phase 1: Data Pipeline

## Goal

Produce the full Quranic lemma corpus as queryable JSON shards shipped from `public/data/`, so
that the transliteration engine, search, and UI in later phases can rely on a stable, validated
data contract.

## Inputs

- Phase 0 complete: repository, tooling, and CI in place.
- Source datasets downloaded into `data/sources/` per the source inventory in
  [../data-pipeline.md](../data-pipeline.md#source-inventory).

## Deliverables

- Source files committed under `data/sources/` with versions documented.
- `scripts/build-dictionary.ts` build script that assembles lemma data deterministically.
- LemmaEntry TypeScript types in `src/types/dictionary.ts` (planned during this phase).
- Curated CSV review process operational, with an auto-generated and human-reviewed split per
  [../adr/0005-curation-strategy.md](../adr/0005-curation-strategy.md).
- Generated JSON shards in `public/data/` committed to the repository: top-N inline index, full
  dictionary, verses, word-occurrences, and word-by-word translations.
- CI drift check that rebuilds the corpus and fails the job if the output differs from the
  committed shards.

## Workstreams

1. Resolve upstream data licensing (request permission from Quranic Arabic Corpus maintainers;
   pin Quran.com word-by-word dataset version and license). See
   [ADR-0007](../adr/0007-data-licensing-strategy.md).
2. Ingest sources from Tanzil, the Quranic Arabic Corpus, and Quran.com into `data/sources/`.
3. Normalize and merge sources into a single intermediate representation.
4. Generate draft LemmaEntry records keyed by lemma.
5. Run the first human-review pass over the curated CSV.
6. Emit JSON shards to `public/data/`.
7. Wire the CI drift check.

## Acceptance criteria

1. Every emitted entry passes schema validation for the LemmaEntry shape.
2. All occurrences resolve to a valid sura:ayah within the 114-sura, ayah-bounded reference space.
3. Phonetic English keys are non-empty and unique within each entry.
4. The CI drift check passes: rebuilding the corpus produces no diff against the committed shards.
5. Total cached payload stays within the budget defined in
   [../architecture.md](../architecture.md#bundle-and-storage-budget).
6. Upstream data licensing is resolved per
   [ADR-0007](../adr/0007-data-licensing-strategy.md) before JSON shards are bundled into v1.

## Risks and mitigations

| Risk                                          | Mitigation                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Source license drift between dataset versions | Pin source versions and document them in `/credits`.                                                                           |
| Curation throughput bottleneck                | Ship auto-generated entries flagged for later review per [../adr/0005-curation-strategy.md](../adr/0005-curation-strategy.md). |
| Build non-determinism across machines         | Sort outputs and stable-format JSON; gate via the CI drift check.                                                              |

## Related decisions and docs

- [../adr/0004-quranic-vocabulary-scope.md](../adr/0004-quranic-vocabulary-scope.md)
- [../adr/0005-curation-strategy.md](../adr/0005-curation-strategy.md)
- [../adr/0006-hybrid-build-pipeline.md](../adr/0006-hybrid-build-pipeline.md)
- [../data-pipeline.md](../data-pipeline.md)
- [../testing-strategy.md](../testing-strategy.md#data-integrity-tests)
