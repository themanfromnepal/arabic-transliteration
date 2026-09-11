# Performance

## Goals

The static site should feel instant on the warm path and remain usable on the cold path over a
modest mobile connection. Performance is treated as a first-class quality attribute: numeric
targets are enforced in continuous integration, regressions block merges, and real-user
measurements inform revisions over time.

## Core Web Vitals targets

| Metric                          | Target   | Measurement                                                                                   |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Largest Contentful Paint (LCP)  | ≤ 2.5 s  | Lighthouse CI on every pull request; Cloudflare Web Analytics page-level vitals in production |
| Interaction to Next Paint (INP) | ≤ 200 ms | Lighthouse CI synthetic interaction; Cloudflare Web Analytics page-level vitals in production |
| Cumulative Layout Shift (CLS)   | ≤ 0.1    | Lighthouse CI on every pull request; Cloudflare Web Analytics page-level vitals in production |

> Assumption: Targets follow Google's "Good" thresholds; revise after first real-user
> measurements on `<production-domain>`.

## Search latency targets

| Scenario                                                      | Target                              |
| ------------------------------------------------------------- | ----------------------------------- |
| Warm lookup (shards already in the IndexedDB cache)           | p95 ≤ 50 ms                         |
| First lookup in a session (includes lazy JSON shard fetch)    | p95 ≤ 1 s on 4G, ≤ 5 s on Slow 4G   |
| One-time search index construction (~4,200 lemmas, in memory) | p95 ≤ 150 ms                        |

The warm target governs the query path: a single `fuzzySearch` call against an already-constructed
index, which is what the learner waits on per keystroke. It is the number that describes the
day-to-day experience, and it is unchanged.

Search index construction is a separate concern. It runs once per session on the cold path, so it is
counted inside the first-lookup target and is **not** part of the ≤ 50 ms warm path. Do not apply the
warm target to construction; they measure different operations.

### Why the first-lookup target is connection-qualified

This target was previously stated as p95 ≤ 500 ms with no connection assumption. That figure was not
reachable by any implementation, because rendering the first result card requires three shards:

| Shard             | Parsed size | Transfer (gzip) |
| ----------------- | ----------- | --------------- |
| `dictionary.json` | 2.49 MB     | 331 KB          |
| `verses.json`     | 1.49 MB     | 300 KB          |
| `yusufali.json`   | 1.07 MB     | 336 KB          |
| Total             | 5.05 MB     | 967 KB          |

967 KB is roughly 0.9 s on regular 4G and 4.8 s under the Slow 4G profile Lighthouse throttles to.
A target of 500 ms was therefore a wish rather than a budget, and nothing measured it. The revised
figures are measurable and are what the current data shape can deliver.

The cost is structural, not a wiring problem: `LemmaEntry.occurrences` carries only sura, ayah, and
word index, so the whole verse corpus and the whole translation corpus are fetched to render three
verse snippets. Splitting `verses.json` and `yusufali.json` by sura (114 files, roughly 13 KB each)
would let a lookup fetch only the suras its preview occurrences touch, bringing the first card to
about 350 KB and later cards to near zero. That is data-pipeline work, tracked as a blocker in
[phases/phase-4-ui-stages.md](phases/phase-4-ui-stages.md). Revisit these targets once it lands.

Until then, the loading skeleton defined in [design.html](design/design.html) is what keeps the wait
honest: the learner sees a shaped placeholder rather than a frozen page.

### Storage footprint

The 5.05 MB parsed total above sits inside the ≤ 7 MB IndexedDB ceiling in
[architecture.md](architecture.md#bundle-and-storage-budget) with roughly 2 MB of headroom, so all
three shards are cached and offline lookup covers verse text and translations. Measure this against
parsed size, not file size on disk: the shards are pretty-printed, which makes `dictionary.json`
5.48 MB on disk for 2.49 MB of data. IndexedDB stores the structured clone, not the whitespace.

## Bundle and storage budget

Bundle and storage sizes are the canonical responsibility of the architecture document. See
[architecture.md](architecture.md#bundle-and-storage-budget) for the authoritative table; the
numbers are not duplicated here.

## Caching strategy summary

- On the network branch, HTML responses use `cache-control: no-cache` so that learners always see
  the latest deployment when online; the minimal app-shell service worker serves HTML, JS, CSS,
  and fonts cache-first from its precache so the shell loads without a network after first use.
- Hashed JS, CSS, and font assets use `cache-control: public, max-age=31536000, immutable` and are
  safe to cache aggressively because their filenames change on content change.
- JSON shards under `/public/data` are versioned by filename and stored in the IndexedDB cache via
  idb-keyval after first fetch; subsequent loads read from IndexedDB and skip the network. The
  service worker does not cache JSON shards.
- Audio files from everyayah.com rely on the browser HTTP cache; service-worker audio caching is
  tracked for post-v1.

## Measurement plan

- Lighthouse CI runs on every pull request with budgets enforced; failing budgets block merge.
- Cloudflare Web Analytics reports page-level Core Web Vitals from real users without cookies.
- Manual spot checks on mobile Safari and a low-end Android device are performed before each
  launch and after major dependency updates.
- Open gap: the warm and first-lookup targets above are not yet verified by any automated check.
  The unit suite covers lookup correctness only. Verification belongs to Lighthouse INP plus the
  Playwright search flow, and is outstanding as of Phase 4.

## Performance budgets enforced in CI

- Initial JS + CSS within the bundle budget defined in
  [architecture.md](architecture.md#bundle-and-storage-budget)
- LCP, INP, and CLS budgets per the Core Web Vitals targets above
- Lighthouse Accessibility score ≥ 95
- LCP regression greater than 10% relative to the main branch baseline blocks merge
- Lighthouse Performance score is informational only and reported as the median of 3 runs to
  reduce flakiness; it does not block merge on its own.

## Related decisions

- [ADR-0001 Tech stack](adr/0001-tech-stack.md) — stack choices that enable these performance
  targets
- [ADR-0002 No backend, no accounts in v1](adr/0002-no-backend-no-accounts-v1.md) — no server
  latency to budget for
