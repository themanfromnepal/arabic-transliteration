# Roadmap

## Overview

Delivery of v1 is organized into seven phases, executed sequentially from Phase 0 through Phase 6.
Phase 7 begins after the v1 launch and runs continuously to absorb feedback and ship features that
were intentionally deferred from v1. Each phase has its own document under `phases/` describing
inputs, deliverables, workstreams, acceptance criteria, and risks.

> Assumption: Phases 0 through 6 are sequential. Phase 7 is ongoing post-launch.

## Phase summary

| Phase | Title                  | Status         | Goal                                                                     | Link                                                               |
| ----- | ---------------------- | -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 0     | Foundations            | ✅ Complete     | Initialize the repository, tooling, and documentation set.               | [phases/phase-0-foundations.md](phases/phase-0-foundations.md)     |
| 1     | Data Pipeline          | ✅ Complete     | Produce the queryable lemma corpus shipped from `public/data/`.          | [phases/phase-1-data-pipeline.md](phases/phase-1-data-pipeline.md) |
| 2     | Transliteration Engine | ✅ Complete     | Implement the rule-based phonetic English to Uthmani script engine.      | [phases/phase-2-engine.md](phases/phase-2-engine.md)               |
| 3     | Search and Lookup      | Not started    | Resolve user input to the right lemma fast and offline-after-first-load. | [phases/phase-3-search.md](phases/phase-3-search.md)               |
| 4     | UI / Frontend          | Not started    | Build the reverent, accessible search experience.                        | [phases/phase-4-ui.md](phases/phase-4-ui.md)                       |
| 5     | Hardening              | Not started    | Harden security, performance, accessibility, and observability.          | [phases/phase-5-hardening.md](phases/phase-5-hardening.md)         |
| 6     | Launch                 | Not started    | Ship the static site to the production domain.                           | [phases/phase-6-launch.md](phases/phase-6-launch.md)               |
| 7     | Post-launch            | Not started    | Run continuous improvement and ship deferred features.                   | [phases/phase-7-post-launch.md](phases/phase-7-post-launch.md)     |

## v1 launch criteria

The full, numbered list of v1 acceptance criteria lives in
[spec.md](spec.md#acceptance-criteria-for-v1-launch) and is the canonical source. In summary, v1
ships when a reviewer can:

- Look up any of the approximately 3,500 covered Quranic lemmas from phonetic English or Arabic.
- Tolerate single-character typos and Arabizi numerals.
- Play per-ayah audio, switch theme, and adjust Arabic font size.
- Use the site offline after a first successful load.

## Deferred features (post-v1)

The following features are intentionally out of scope for v1 and queued for Phase 7. This list and
the equivalent list in [phases/phase-7-post-launch.md](phases/phase-7-post-launch.md) are the only
places it is maintained.

- Multiple Quran translations — v1 ships a single English gloss per lemma; alternates expand later.
- Lane's Lexicon integration — classical lexicon depth is valuable but heavy; defer until the v1
  surface is stable.
- Tafsir packs — exegesis content is a separate editorial workstream from word-level lookup.
- User accounts and cross-device sync — accounts add a backend, auth, and compliance burden v1
  avoids per [adr/0002-no-backend-no-accounts-v1.md](adr/0002-no-backend-no-accounts-v1.md).
- Flashcards and spaced repetition — study tooling is its own product surface; build it once
  vocabulary lookup is solid.
- Quran reader (browse-by-sura) — v1 is lookup-first; a continuous reader is a distinct mode.
- PWA / installable (web app install prompt, manifest with maskable icons, push) — v1 ships a
  minimal precache service worker for the app shell so the site loads offline after first use;
  full PWA installability and push are deferred.
- Mobile app (React Native + Expo) — a native shell follows once the web product is validated.
- UI internationalization (Urdu, French, Indonesian, others) — v1 user interface copy is
  English-only; translation comes after the surface is stable.
- Alternate reciters for audio — v1 defaults to Saad Al-Ghamdi per
  [spec.md](spec.md#audio-source); reciter selection is a post-v1 enhancement.

## Risks

- Curation throughput (highest risk). Reviewing ~3,500 lemmas requires reviewers literate in
  Quranic Arabic. Mitigation: ship v1 with the top-N most-frequent lemmas fully reviewed and
  remaining entries flagged as auto-generated and pending review; surface review status in the
  result card UI; accept community PRs for review (see
  [ADR-0005](adr/0005-curation-strategy.md) and
  [data-pipeline.md](data-pipeline.md#curation-workflow)).

## Decision log

The architectural decisions that shape this roadmap are recorded as ADRs. Each ADR uses the
five-section template described in [README.md](README.md).

- [adr/0001-tech-stack.md](adr/0001-tech-stack.md)
- [adr/0002-no-backend-no-accounts-v1.md](adr/0002-no-backend-no-accounts-v1.md)
- [adr/0003-rule-based-transliteration.md](adr/0003-rule-based-transliteration.md)
- [adr/0004-quranic-vocabulary-scope.md](adr/0004-quranic-vocabulary-scope.md)
- [adr/0005-curation-strategy.md](adr/0005-curation-strategy.md)
- [adr/0006-hybrid-build-pipeline.md](adr/0006-hybrid-build-pipeline.md)
- [adr/0007-data-licensing-strategy.md](adr/0007-data-licensing-strategy.md) — Two-step strategy for upstream data licenses (request permission, fall back to dual-license).

## Related docs

- [vision.md](vision.md)
- [spec.md](spec.md)
- [architecture.md](architecture.md)
