# Phase 7: Post-launch

## Goal

Operate the live site as a free and open-source project: gather user feedback, prioritize, and
ship the features that were intentionally deferred from v1 in small, well-scoped cycles.

## Inputs

- v1 is live and stable.
- A user feedback channel is open (issues on the canonical repository).

## Deliverables

These items are queued and not all required. Each item, when shipped, follows its own
mini-cycle (define, plan, build, verify, review) and is recorded in a new ADR.

- Multiple Quran translations.
- Lane's Lexicon integration.
- Tafsir packs.
- User accounts and cross-device sync.
- Flashcards and spaced repetition.
- Quran reader with browse-by-sura navigation.
- PWA installable build. Offline-capable app shell ships in v1 via the minimal precache service
  worker (see [phase-5-hardening.md](phase-5-hardening.md)). Phase 7 PWA work covers
  installability, manifest, maskable icons, and push.
- Mobile app built with React Native and Expo.
- UI internationalization (Urdu, French, Indonesian, others).
- Alternate reciters for audio, extending the Saad Al-Ghamdi default per
  [../spec.md](../spec.md#audio-source).

## Workstreams

1. User feedback intake from the public issue tracker and any direct channels.
2. Prioritization against the project mission and current capacity.
3. Per-feature mini-cycles: define, plan, build, verify, review.
4. Staged rollouts that protect the v1 experience.

## Acceptance criteria

1. Each shipped post-v1 feature has its own ADR recording context, decision, consequences,
   alternatives, and status.
2. No post-v1 feature regresses the v1 acceptance criteria in
   [../spec.md](../spec.md#acceptance-criteria-for-v1-launch).
3. The deferred-features list in [../roadmap.md](../roadmap.md#deferred-features-post-v1) remains
   the single source of truth for what is queued; this document mirrors it but does not diverge.

## Risks and mitigations

| Risk                                                | Mitigation                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| Scope creep diluting the Quranic-vocabulary mission | Every new feature must explicitly justify mission alignment in its ADR. |
| Fragmented effort across too many parallel features | Cap concurrent post-v1 mini-cycles and finish before starting more.     |
| Regression in v1 surface from new work              | Re-run the v1 acceptance criteria checks before each post-v1 release.   |

## Related decisions and docs

- [../roadmap.md](../roadmap.md)
- [../vision.md](../vision.md)
- [../adr/0001-tech-stack.md](../adr/0001-tech-stack.md)
- [../adr/0002-no-backend-no-accounts-v1.md](../adr/0002-no-backend-no-accounts-v1.md)
- [../adr/0003-rule-based-transliteration.md](../adr/0003-rule-based-transliteration.md)
- [../adr/0004-quranic-vocabulary-scope.md](../adr/0004-quranic-vocabulary-scope.md)
- [../adr/0005-curation-strategy.md](../adr/0005-curation-strategy.md)
- [../adr/0006-hybrid-build-pipeline.md](../adr/0006-hybrid-build-pipeline.md)
