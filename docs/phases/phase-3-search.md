# Phase 3: Search and Lookup

## Goal

Given user input in either phonetic English or Arabic script, return the right LemmaEntry quickly
on a warm cache and reliably on a cold cache, and continue working offline after the first
successful load.

## Inputs

- Phases 1 and 2 complete: the lemma corpus is shipped under `public/data/` and the
  transliteration engine is available as a pure function.
- LemmaEntry schema and JSON shards from Phase 1.

## Deliverables

- `src/lib/dictionary/` containing the loader, lookup, and Fuse.js-based fuzzy match.
- `src/lib/storage/` containing idb-keyval wrappers around the IndexedDB cache.
- Tiered loading: top-N lemma index inline, full dictionary lazy-loaded on first real search.
- Arabic input detection that routes Arabic queries directly to dictionary lookup, bypassing the
  transliteration engine.

## Workstreams

1. Build the Fuse.js index over phonetic keys, lemma surface forms, and roots.
2. Implement fuzzy ranking with phonetic-key normalization, including Arabizi-aware comparison.
3. Wire the IndexedDB cache, following the cold and warm runtime data flow in
   [../architecture.md](../architecture.md#runtime-data-flow).
4. Handle the Arabic input path with direct lookup and no transliteration step.

## Acceptance criteria

1. Warm-cache p95 search latency meets the target in
   [../performance.md](../performance.md#search-latency-targets).
2. Cold-cache p95 search latency meets the target in
   [../performance.md](../performance.md#search-latency-targets).
3. Multi-spelling variants such as `rahman`, `rahmaan`, and `raḥmān` resolve to the same lemma.
4. Arabic input returns the matching lemma without invoking the transliteration engine.
5. Lookup works offline after a first successful load that warmed the IndexedDB cache.

## Risks and mitigations

| Risk                                                  | Mitigation                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Fuse.js index size at roughly 3,500 entries           | Precompute the index at build time and ship it serialized.                 |
| IndexedDB quota or unavailability in private browsing | Fall back gracefully to in-memory lookup; never crash the page.            |
| Cold-cache jank on first search                       | Warm the cache opportunistically after first paint, behind idle callbacks. |

## Related decisions and docs

- [../adr/0001-tech-stack.md](../adr/0001-tech-stack.md)
- [../architecture.md](../architecture.md)
- [../performance.md](../performance.md)
