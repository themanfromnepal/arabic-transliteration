# Arabic Transliteration

A free and open-source static site that helps English speakers learn to read and understand the Quran.
A learner types phonetic English (for example, "rahman") and receives the Uthmani script, a scholarly
transliteration, English word meaning, root letters, verse occurrences by sura:ayah, and audio
pronunciation. The project is MIT-licensed and built as a pure static site so that it remains fast,
private, and offline-capable after first use.

Status: pre-v1 (planning)

License: MIT

## Read in this order

1. [vision.md](vision.md)
2. [spec.md](spec.md)
3. [architecture.md](architecture.md)
4. [tech-stack.md](tech-stack.md)
5. [data-pipeline.md](data-pipeline.md)
6. [ux-design.md](ux-design.md)
7. [security.md](security.md)
8. [performance.md](performance.md)
9. [testing-strategy.md](testing-strategy.md)
10. [deployment.md](deployment.md)
11. [roadmap.md](roadmap.md)
12. [contributing.md](contributing.md)

## Documentation map

### Root docs

| File                                       | Description                                                          |
| ------------------------------------------ | -------------------------------------------------------------------- |
| [README.md](README.md)                     | Entry point, reading order, and documentation map.                   |
| [vision.md](vision.md)                     | Problem, mission, target users, non-goals, and guiding principles.   |
| [spec.md](spec.md)                         | Functional specification for v1, including the result card contract. |
| [architecture.md](architecture.md)         | Static site architecture, module boundaries, and bundle strategy.    |
| [data-pipeline.md](data-pipeline.md)       | Source datasets, normalization steps, and build-time outputs.        |
| [ux-design.md](ux-design.md)               | Visual language, layout, typography, RTL handling, and dark mode.    |
| [tech-stack.md](tech-stack.md)             | Frameworks, libraries, fonts, and tooling choices.                   |
| [security.md](security.md)                 | Threat model for a static site and content security posture.         |
| [performance.md](performance.md)           | Numeric performance targets and measurement methodology.             |
| [testing-strategy.md](testing-strategy.md) | Unit, integration, and end-to-end testing approach.                  |
| [deployment.md](deployment.md)             | Build, hosting, and release process on Vercel.                       |
| [roadmap.md](roadmap.md)                   | Sequenced delivery plan across the seven phases.                     |
| [contributing.md](contributing.md)         | How to propose changes and report issues.                            |

### ADRs

| File                                                                             | Description                                                                                   |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [adr/0001-tech-stack.md](adr/0001-tech-stack.md)                                 | Selection of Next.js 15, TypeScript, Tailwind v4, and shadcn/ui.                              |
| [adr/0002-no-backend-no-accounts-v1.md](adr/0002-no-backend-no-accounts-v1.md)   | Decision to ship v1 as a pure static site with no accounts.                                   |
| [adr/0003-rule-based-transliteration.md](adr/0003-rule-based-transliteration.md) | Choice of a rule-based transliteration engine for v1.                                         |
| [adr/0004-quranic-vocabulary-scope.md](adr/0004-quranic-vocabulary-scope.md)     | Scope limited to the roughly 3,500 Quranic lemma set.                                         |
| [adr/0005-curation-strategy.md](adr/0005-curation-strategy.md)                   | How lemma data is curated, reviewed, and updated.                                             |
| [adr/0006-hybrid-build-pipeline.md](adr/0006-hybrid-build-pipeline.md)           | Build-time data assembly combined with client-side lookup.                                    |
| [adr/0007-data-licensing-strategy.md](adr/0007-data-licensing-strategy.md)       | Two-step strategy for upstream data licenses (request permission, fall back to dual-license). |

### Phases

| File                                                               | Description                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| [phases/phase-0-foundations.md](phases/phase-0-foundations.md)     | Repository setup, tooling, and baseline conventions.   |
| [phases/phase-1-data-pipeline.md](phases/phase-1-data-pipeline.md) | Ingest and normalize Quranic source datasets.          |
| [phases/phase-2-engine.md](phases/phase-2-engine.md)               | Build the rule-based transliteration engine.           |
| [phases/phase-3-search.md](phases/phase-3-search.md)               | Implement fuzzy search and lemma lookup.               |
| [phases/phase-4-ui.md](phases/phase-4-ui.md)                       | Build the user interface, result card, and RTL layout. |
| [phases/phase-5-hardening.md](phases/phase-5-hardening.md)         | Accessibility, performance, and quality hardening.     |
| [phases/phase-6-launch.md](phases/phase-6-launch.md)               | Production launch and rollout.                         |
| [phases/phase-7-post-launch.md](phases/phase-7-post-launch.md)     | Deferred work and post-launch enhancements.            |

## ADR index

Every ADR in this suite uses a fixed five-section template: Context, Decision, Consequences,
Alternatives considered, and Status. New ADRs should follow the same structure to keep decision
history easy to scan.

> Assumption: All ADRs in this suite use the 5-section template defined here on first introduction.

## Repository

Canonical source: `https://github.com/themanfromnepal/arabic-transliteration`

## Attribution

Quranic data is assembled from several openly licensed community sources. The Uthmani script text is
sourced from [Tanzil](https://tanzil.net). Morphological information, including root letters, comes
from the [Quranic Arabic Corpus](https://corpus.quran.com). Word-by-word English translations are
drawn from [Quran.com](https://quran.com). Audio recitation is streamed from
[everyayah.com](https://everyayah.com). The exact dataset versions, licensing terms, and
normalization steps are documented in [data-pipeline.md](data-pipeline.md).
