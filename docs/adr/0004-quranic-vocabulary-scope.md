# ADR-0004: Quranic vocabulary scope (~3,500 lemmas)

Status: Accepted

## Context

The mission is to help English speakers learn to read and understand the Quran. Quranic
vocabulary is a closed, public-domain dataset of approximately 3,500 unique lemmas, fully covered
by the source datasets listed in [data-pipeline.md](../data-pipeline.md). Partial coverage would
produce frequent "not found" results on common words and undermine the mission stated in
[vision.md](../vision.md). The cached payload required to ship full coverage fits comfortably
within the budget defined in
[architecture.md](../architecture.md#bundle-and-storage-budget), and the v1 functional contract
in [spec.md](../spec.md) assumes coverage of the full ~3,500-lemma set.

## Decision

v1 ships full coverage of all ~3,500 unique Quranic lemmas. The top-N most frequent lemmas are
inlined into the initial bundle so that the most common lookups resolve without a network
request, and the full dictionary is lazy-loaded on first real use and cached in IndexedDB for
subsequent lookups.

## Consequences

**Positive**

- Every lookup against a Quranic word resolves to a real result card; learners do not encounter
  dead ends on common vocabulary.
- The closed scope makes test coverage tractable: every covered lemma can be exercised by the
  test suite.
- Lazy-loading the full dictionary keeps the initial bundle small while still delivering full
  coverage on warm loads from the IndexedDB cache.

**Negative**

- The full dictionary shard must be fetched once before the site is fully useful offline; first
  cold use is heavier than for a top-N-only build.
- Curating phonetic English keys and English meanings for ~3,500 lemmas is a meaningful one-time
  effort (see [ADR-0005](0005-curation-strategy.md)).
- Reliance on the Quranic Arabic Corpus introduces a copyleft licensing dependency that must be
  resolved before launch (see [ADR-0007](0007-data-licensing-strategy.md)).

**Neutral**

- Words outside the Quranic corpus are intentionally not covered; the search box returns no
  result rather than guessing.
- Coverage is fixed at the closed Quranic set; growth comes from improving curation quality, not
  from adding more lemmas.

## Alternatives considered

### Top-1,000 lemmas only (~80% token coverage)

- Pros: Smallest possible payload; fastest first cold load; simplest curation effort.
- Cons: Leaves long-tail gaps that learners hit constantly once they move past the most common
  words; the user experience degrades exactly when the learner is ready to read more deeply.
- Reason rejected: Token coverage is not lemma coverage; long-tail gaps produce frequent
  not-found results that undermine the mission.

### A full classical Arabic lexicon (large external dictionary)

- Pros: Definitive scholarly coverage well beyond the Quranic corpus.
- Cons: Payload size is one to two orders of magnitude over the storage ceiling defined in
  [architecture.md](../architecture.md#bundle-and-storage-budget); content is targeted at scholars
  rather than English-speaking learners; integration is explicitly out of scope in
  [spec.md](../spec.md).
- Reason rejected: Scope creep and payload size; wrong reading level for the audience. Specific candidates for post-v1 expansion are catalogued in [../roadmap.md](../roadmap.md#deferred-features-post-v1).

### Modern Standard Arabic frequency list

- Pros: Larger general-purpose vocabulary for everyday Arabic.
- Cons: Wrong corpus for the mission; many high-frequency MSA words do not appear in the Quran
  and many Quranic words are rare in MSA frequency lists.
- Reason rejected: Wrong corpus; would not improve the Quranic learning experience and would
  dilute the result quality.

## References

- [vision.md](../vision.md)
- [spec.md](../spec.md)
- [data-pipeline.md](../data-pipeline.md)
- [architecture.md](../architecture.md)
- [roadmap.md](../roadmap.md)
