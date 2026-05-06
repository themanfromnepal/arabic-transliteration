> **⚠️ Temporary document** — this file is a reference point for Phase 3 implementation.
> Delete it once Phase 3 is complete.

# Phase 3: Search and Lookup — Stage Breakdown

## Overview

This document breaks Phase 3 into seven incremental stages, ordered by dependency. Each stage
produces a testable deliverable that builds toward the full search-and-lookup pipeline: phonetic
English or Arabic input → correct LemmaEntry, with warm p95 ≤ 50 ms, cold p95 ≤ 500 ms, and
offline support after first load.

## Summary

| Stage | Title                                    | Complexity | Dependencies       | Status  |
| ----- | ---------------------------------------- | ---------- | -------------------| ------- |
| 1     | Dependencies and Project Setup           | Small      | None               | ✅ Done |
| 2     | Storage Layer                            | Medium     | Stage 1            | ✅ Done |
| 3     | Dictionary Loader                        | Medium     | Stages 1, 2        | ✅ Done |
| 4     | Search Index — Fuse.js Integration       | Large      | Stage 3            | —       |
| 5     | Query Router — Dual-Path Lookup          | Large      | Stages 3, 4        | —       |
| 6     | Offline Support and Cache Warming        | Medium     | Stages 2, 3, 5     | —       |
| 7     | Integration Testing and Performance      | Medium     | All prior stages   | —       |

---

### Stage 1: Dependencies and Project Setup ✅

**Goal:** Install runtime dependencies and scaffold the directory structure so later stages can
import from `src/lib/dictionary/` and `src/lib/storage/` immediately.

**Deliverables:**
- `fuse.js` and `idb-keyval` added as runtime dependencies in `package.json`.
- `src/lib/dictionary/` directory with barrel `index.ts`.
- `src/lib/storage/` directory with barrel `index.ts`.

**Files:**
- `package.json` (modify)
- `src/lib/dictionary/index.ts` (create)
- `src/lib/storage/index.ts` (create)

**Dependencies:** None

**Acceptance criteria:**
1. `fuse.js` and `idb-keyval` appear in `dependencies` in `package.json`.
2. `src/lib/dictionary/` and `src/lib/storage/` directories exist with barrel files.
3. Project builds without errors (`npm run build` succeeds).
4. All existing tests pass with no regressions.

**Complexity:** Small

---

### Stage 2: Storage Layer ✅

**Goal:** Provide a thin IndexedDB cache wrapper that stores and retrieves dictionary shards by
key, tracks the manifest version for invalidation, and degrades gracefully when IndexedDB is
unavailable.

**Deliverables:**
- `src/lib/storage/cache.ts` exposing `getShardFromCache`, `putShardToCache`,
  `getCachedManifestVersion`, `setCachedManifestVersion`, and `clearCache`.
- Manifest-based cache invalidation using the `generatedAt` field from `manifest.json`.
- Graceful fallback: all reads return `null` and all writes no-op when IndexedDB is unavailable
  (private browsing, disabled storage) — functions never throw.

**Files:**
- `src/lib/storage/cache.ts` (create)
- `src/lib/storage/index.ts` (modify — re-export)
- `tests/lib/storage/cache.test.ts` (create)

**Dependencies:** Stage 1

**Acceptance criteria:**
1. `putShardToCache` stores a value; `getShardFromCache` retrieves it by the same key.
2. Cache miss returns `null`, not `undefined` or an error.
3. `setCachedManifestVersion` and `getCachedManifestVersion` round-trip the `generatedAt` string.
4. `clearCache` removes all stored shards and the cached manifest version.
5. When IndexedDB is unavailable (mocked), all functions resolve without throwing; reads return
   `null`.
6. Unit tests cover read, write, miss, invalidation, and fallback paths.

**Complexity:** Medium

---

### Stage 3: Dictionary Loader ✅

**Goal:** Fetch dictionary shards with a two-tier strategy — return the lightweight inline index
immediately, then lazy-load the full dictionary on demand — using the storage layer as a
transparent cache.

**Deliverables:**
- `src/lib/dictionary/loader.ts` exposing `getInlineIndex` and `loadFullDictionary`.
- Tiered loading: `getInlineIndex` returns the bundled `InlineIndexEntry[]` synchronously (or from
  a preloaded import); `loadFullDictionary` checks cache → fetches from `public/data/` on miss →
  writes to cache → returns `LemmaEntry[]`.
- Manifest version comparison: fetch `manifest.json`, compare `generatedAt` against cached value;
  if stale, invalidate cache before re-fetching shards.

**Files:**
- `src/lib/dictionary/loader.ts` (create)
- `src/lib/dictionary/index.ts` (modify — re-export)
- `tests/lib/dictionary/loader.test.ts` (create)

**Dependencies:** Stage 1, Stage 2

**Acceptance criteria:**
1. `getInlineIndex` returns `InlineIndexEntry[]` without a network request.
2. Cold load: `loadFullDictionary` fetches from the network, writes to cache, and returns
   `LemmaEntry[]`.
3. Warm load: `loadFullDictionary` returns data from cache without a network fetch.
4. Stale cache: when the fetched `generatedAt` differs from the cached version, the loader
   invalidates the cache and re-fetches all shards.
5. Unit tests cover cold, warm, and stale-cache paths with mocked fetch and storage.

**Complexity:** Medium

---

### Stage 4: Search Index — Fuse.js Integration

**Goal:** Build a Fuse.js fuzzy search index over the lemma corpus, keyed on `phoneticKeys`,
`arabic`, and `root`, with scoring tuned so that exact prefix matches always rank above fuzzy
matches.

**Deliverables:**
- `src/lib/dictionary/search-index.ts` exposing `createSearchIndex` and `fuzzySearch`.
- Fuse.js configuration: keys with weights (`phoneticKeys` highest, `arabic` second, `root`
  third), threshold tuned for phonetic variation.
- Input normalization before matching: lowercase, trim, strip Arabic diacritics for comparison.
- Evaluation of whether a precomputed serialized Fuse.js index is necessary given the 4,199-entry
  corpus, with a build-time script (`scripts/build-search-index.ts`) added only if runtime
  construction exceeds the performance budget.

**Files:**
- `src/lib/dictionary/search-index.ts` (create)
- `src/lib/dictionary/index.ts` (modify — re-export)
- `scripts/build-search-index.ts` (create, if precomputation is needed)
- `tests/lib/dictionary/search-index.test.ts` (create)

**Dependencies:** Stage 3

**Acceptance criteria:**
1. `rahman`, `rahmaan`, and `ra7man` all resolve to the same lemma entry.
2. An exact prefix match on a `phoneticKey` ranks above a fuzzy match on `root`.
3. Fuse.js index construction from the full 4,199-entry dictionary completes within the warm
   p95 ≤ 50 ms budget (measured in a unit test); if it does not, precomputation is added.
4. Input with Arabic diacritics and input without diacritics produce equivalent results.
5. Unit tests cover multi-variant resolution, ranking order, and empty-result cases.

**Complexity:** Large

---

### Stage 5: Query Router — Dual-Path Lookup

**Goal:** Provide a single entry point that accepts phonetic English or Arabic input, routes it
through dual search paths (transliteration + exact match, and Fuse.js fuzzy match), and returns a
merged, deduplicated, ranked list of `LemmaEntry` results.

**Deliverables:**
- `src/lib/dictionary/lookup.ts` exposing `lookup(query: string): Promise<LemmaEntry[]>`.
- Dual-path routing:
  1. Transliterate input via `transliterate()` → exact/normalized match against `arabic` field.
  2. Fuse.js fuzzy match on raw input against `phoneticKeys`, `arabic`, `root`.
- Result merging: exact matches ranked first, fuzzy matches ranked by Fuse.js score, deduplicated
  by `lemmaId`.
- Arabic input detection: if input contains characters in the Arabic Unicode range (U+0600–U+06FF),
  skip the transliteration path and route directly to exact `arabic` match + Fuse.js search on
  `arabic` field.

**Files:**
- `src/lib/dictionary/lookup.ts` (create)
- `src/lib/dictionary/index.ts` (modify — re-export)
- `tests/lib/dictionary/lookup.test.ts` (create)

**Dependencies:** Stage 3, Stage 4

**Acceptance criteria:**
1. Phonetic English input (e.g. `kitab`) returns the correct lemma via the transliteration path.
2. The same input also returns results via the fuzzy path; merged output is deduplicated by
   `lemmaId`.
3. Arabic input (e.g. `كتاب`) bypasses the transliterator entirely and returns the matching lemma.
4. Exact transliteration matches appear before fuzzy-only matches in the result list.
5. Multi-variant spellings (`rahman` / `rahmaan` / `ra7man`) all resolve correctly.
6. Unit tests cover English input, Arabic input, mixed input, deduplication, and ranking.

**Complexity:** Large

---

### Stage 6: Offline Support and Cache Warming

**Goal:** Ensure the lookup pipeline works fully offline after one successful load, and degrade
gracefully when IndexedDB is unavailable.

**Deliverables:**
- Opportunistic cache warming: after first paint, use `requestIdleCallback` (with `setTimeout`
  fallback) to prefetch and cache all dictionary shards in the background.
- Offline lookup: when the network is unavailable, the full pipeline serves results from the
  IndexedDB cache.
- IndexedDB-unavailable fallback: if IndexedDB is not accessible (e.g. private browsing), shards
  fetched over the network are held in memory for the session duration — lookup still works, just
  not persisted.

**Files:**
- `src/lib/dictionary/warm-cache.ts` (create)
- `src/lib/dictionary/index.ts` (modify — re-export)
- `src/lib/storage/cache.ts` (modify — ensure fallback path is wired)
- `tests/lib/dictionary/warm-cache.test.ts` (create)
- `tests/lib/dictionary/offline.test.ts` (create)

**Dependencies:** Stage 2, Stage 3, Stage 5

**Acceptance criteria:**
1. After one successful online load, cache warming prefetches all dictionary shards into IndexedDB.
2. With the network disabled, `lookup()` returns correct results from the cache.
3. In private browsing mode (IndexedDB unavailable, mocked), lookup does not crash and returns
   results from in-memory fallback.
4. `requestIdleCallback` is used when available; `setTimeout` fallback is used otherwise.
5. Unit tests verify offline lookup, cache warming trigger, and IndexedDB-unavailable fallback.

**Complexity:** Medium

---

### Stage 7: Integration Testing and Performance Validation

**Goal:** Validate the full search pipeline end-to-end and assert that performance and bundle-size
budgets are met.

**Deliverables:**
- Integration tests covering the complete path: raw input → transliteration → lookup → ranked
  `LemmaEntry[]` results.
- Performance benchmarks asserting warm-cache p95 ≤ 50 ms and cold-cache p95 ≤ 500 ms (via
  Vitest bench or manual timing assertions).
- Edge-case tests: empty input, very long input, mixed Arabic/Latin input, Arabizi numerals
  (`7`, `3`, `2`), diacritics-only input.
- Bundle-size assertion: inline index (`index.json`) fits within 50 KB gzipped.

**Files:**
- `tests/lib/dictionary/integration.test.ts` (create)
- `tests/lib/dictionary/performance.test.ts` (create)
- `tests/data/bundle-size.test.ts` (create or extend existing)

**Dependencies:** All prior stages (1–6)

**Acceptance criteria:**
1. Integration tests pass for phonetic English, Arabic, and Arabizi-numeral inputs.
2. Warm-cache p95 search latency ≤ 50 ms (measured over 100+ iterations).
3. Cold-cache p95 search latency ≤ 500 ms (measured with cleared cache).
4. `index.json` gzipped size ≤ 50 KB (assertion in CI).
5. Edge-case inputs (empty, long, mixed, diacritics-only) return gracefully without errors.
6. No regressions in existing transliterator or data-integrity tests.

**Complexity:** Medium
