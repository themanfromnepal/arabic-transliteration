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

| Scenario                                                      | Target       |
| ------------------------------------------------------------- | ------------ |
| Warm cache lookup (lemma already in IndexedDB cache)          | p95 ≤ 50 ms  |
| Cold cache lookup (includes lazy JSON shard fetch)            | p95 ≤ 500 ms |
| One-time search index construction (~4,200 lemmas, in memory) | p95 ≤ 150 ms |

The warm and cold lookup targets govern the query path: a single `fuzzySearch` call against an
already-constructed index, which is what the learner waits on per keystroke.

Search index construction is a separate concern. It runs once per session on the cold path, so it
is counted inside the ≤ 500 ms cold-cache budget and is **not** part of the ≤ 50 ms warm lookup
path. Do not apply the warm lookup target to construction; they measure different operations.

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
- Open gap: the warm and cold lookup targets above are not yet verified by any automated check.
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
