# Phase 4: UI / Frontend

## Goal

Deliver the reverent, accessible search experience defined in [../ux-design.md](../ux-design.md),
turning the transliteration engine and lookup pipeline into an interface that English speakers can
use comfortably to learn Quranic vocabulary.

## Canonicality and scope

- This file is the canonical Phase 4 execution and gating source of truth.
- [phase-4-ui-stages.md](phase-4-ui-stages.md) is a temporary execution aid and does not override any gate, dependency, or exit criteria in this file.
- Step 1 is a documentation-only truth-alignment pass and does not modify runtime, app, test, or config code.

## Design-first gate

No Phase 4 implementation may begin until the corresponding design artifact is present in [../design/design.html](../design/design.html), has design-review approval, and is referenced by implementation PRs.

## Inputs

- Current truth state: Phase 0 and Phase 2 are complete; Phase 3 is planned next.
- Execution prerequisite: Phase 3 must be complete before Phase 4 implementation begins.
- Design tokens and component inventory from [../ux-design.md](../ux-design.md).

## Deliverables

- Layout shell composed of `Header`, `SearchBox`, results area, and `Footer`.
- Result components built from shadcn/ui primitives: `WordCard`, `RootDisplay`, `AudioPlayer`,
  and `VerseList`.
- Dark mode toggle and adjustable Arabic font size with steps S, M, L, and XL.
- Empty, loading, no-results, and error states for the search experience.
- Static pages: About, Credits, and Privacy Policy.
- Self-hosted Amiri or Scheherazade New for Arabic and Inter for the English UI.
- Fully mobile-responsive layout.
- Arabic font subsetting and preload as defined in
  [../ux-design.md](../ux-design.md#font-loading-strategy).

## Workstreams

1. Build the layout shell.
2. Implement the result card and supporting components.
3. Implement empty, loading, no-results, and error states.
4. Wire theme and Arabic font-size controls with persistence.
5. Author the static pages.
6. Run a responsive QA pass across mobile and desktop breakpoints.

## Acceptance criteria

1. The result card matches the contract in [../spec.md](../spec.md#result-card-contract).
2. RTL rules and the accessibility baseline in
   [../ux-design.md](../ux-design.md#accessibility-baseline) are respected.
3. Lighthouse Performance / Accessibility / Best Practices / SEO meet the budgets defined in
   [../performance.md](../performance.md#performance-budgets-enforced-in-ci) and
   [../testing-strategy.md](../testing-strategy.md#ci-gates).

## Risks and mitigations

| Risk                                                       | Mitigation                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Arabic font rendering differences across operating systems | Self-host the Arabic font and set explicit `font-feature-settings`.       |
| shadcn/ui dark-mode token gaps                             | Extend the token palette in the Tailwind theme to cover missing surfaces. |
| Mobile keyboard covering the search field                  | Test with real device viewports; reserve scroll space below the input.    |

## Related decisions and docs

- [../adr/0001-tech-stack.md](../adr/0001-tech-stack.md)
- [../ux-design.md](../ux-design.md)
- [../spec.md](../spec.md)
- [../performance.md](../performance.md)
