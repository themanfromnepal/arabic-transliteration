# Tech Stack

## Summary

The stack is intentionally narrow: a single TypeScript codebase that compiles to a static site,
hosted on a free tier, with no backend services to operate. Every choice favors free and
open-source tools, accessibility, and performance on modest devices. Numeric performance targets
live in [performance.md](performance.md). Bundle and storage budgets live in
[architecture.md](architecture.md#bundle-and-storage-budget).

## Choices

| Layer                  | Choice                              | Reason                                                                                          | Alternative rejected                    | ADR                                               |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Framework              | Next.js 15 (App Router)             | First-class static export, mature React tooling, strong defaults for routing and asset hashing. | Astro, Vite + React Router              | [ADR-0001](adr/0001-tech-stack.md)                |
| Language               | TypeScript (strict)                 | Static types catch lemma-shape and engine-rule errors at build time.                            | Plain JavaScript                        | [ADR-0001](adr/0001-tech-stack.md)                |
| Styling                | Tailwind v4                         | Utility-first styling keeps the initial CSS small and predictable.                              | CSS Modules, vanilla-extract            | [ADR-0001](adr/0001-tech-stack.md)                |
| Component library      | shadcn/ui                           | Copy-in components avoid runtime dependency weight and stay accessible by default.              | Radix primitives alone, Headless UI     | [ADR-0001](adr/0001-tech-stack.md)                |
| Icons                  | Lucide                              | Tree-shakeable SVG icons with permissive license.                                               | Heroicons, Phosphor                     | [ADR-0001](adr/0001-tech-stack.md)                |
| Arabic font            | Amiri / Scheherazade New            | High-quality Uthmani-friendly typefaces with open licenses; self-hosted.                        | Noto Naskh Arabic                       | [ADR-0001](adr/0001-tech-stack.md)                |
| English font           | Inter                               | Highly legible UI typeface with open license; self-hosted.                                      | System UI stack                         | [ADR-0001](adr/0001-tech-stack.md)                |
| Search                 | Fuse.js                             | Lightweight, in-browser fuzzy search suited to phonetic English keys.                           | Lunr, MiniSearch                        | [ADR-0001](adr/0001-tech-stack.md)                |
| Browser cache          | idb-keyval over IndexedDB           | Tiny wrapper, asynchronous storage suitable for multi-megabyte JSON shards.                     | localStorage, Cache API only            | [ADR-0001](adr/0001-tech-stack.md)                |
| Audio source           | everyayah.com                       | Free public CDN with per-ayah recitations; default reciter Saad Al-Ghamdi 40 kbps.            | Self-hosted audio                       | [ADR-0001](adr/0001-tech-stack.md)                |
| Unit testing           | Vitest                              | Fast, TypeScript-native test runner aligned with the build tooling.                             | Jest                                    | [ADR-0001](adr/0001-tech-stack.md)                |
| End-to-end testing     | Playwright                          | Cross-browser automation including mobile viewports and accessibility checks.                   | Cypress                                 | [ADR-0001](adr/0001-tech-stack.md)                |
| Hosting                | Vercel (free tier)                  | Zero-config static hosting with global CDN; the app stays portable.                             | Cloudflare Pages, Netlify               | [ADR-0001](adr/0001-tech-stack.md)                |
| Continuous integration | GitHub Actions                      | Native to the code host; free for public repositories.                                          | CircleCI                                | [ADR-0001](adr/0001-tech-stack.md)                |
| Analytics              | Cloudflare Web Analytics            | Aggregate measurement with no cookies and no personal data.                                     | Google Analytics, Plausible self-hosted | [ADR-0002](adr/0002-no-backend-no-accounts-v1.md) |
| License                | MIT                                 | Permissive, well understood, compatible with chosen dependencies.                               | Apache-2.0, GPL-3.0                     | [ADR-0001](adr/0001-tech-stack.md)                |
| Code hosting           | GitHub                              | Largest open-source community; integrates with chosen CI.                                       | GitLab, Codeberg                        | [ADR-0001](adr/0001-tech-stack.md)                |
| State                  | React state; Zustand only if needed | Search and theme state are local; a global store is unnecessary in v1.                          | Redux Toolkit                           | [ADR-0001](adr/0001-tech-stack.md)                |
| Backend                | None — pure static site             | Removes server cost, server attack surface, and operational toil.                               | Serverless functions                    | [ADR-0002](adr/0002-no-backend-no-accounts-v1.md) |
| Database               | None                                | All lemma data is shipped as static JSON shards.                                                | SQLite via WASM, hosted Postgres        | [ADR-0002](adr/0002-no-backend-no-accounts-v1.md) |
| Authentication         | None in v1                          | No accounts, no personalization in v1.                                                          | OAuth, passkeys                         | [ADR-0002](adr/0002-no-backend-no-accounts-v1.md) |

## Rationale themes

- TypeScript-only stack: a single language across application code, build scripts, and tests
  reduces context switching and shares types end-to-end.
- Free tiers throughout: hosting, CI, and analytics fit within free plans so the project remains
  zero-cost to operate.
- No backend: static delivery removes the largest class of operational and security concerns.
- Accessibility first: shadcn/ui, semantic markup, keyboard navigation, and self-hosted fonts keep
  the result card usable for assistive technology and on slow networks.
- Performance by default: small dependencies, lazy-loaded JSON shards, and an IndexedDB cache keep
  the warm path fast on modest devices.

## Related ADRs

- [ADR-0001 Tech stack](adr/0001-tech-stack.md)
- [ADR-0002 No backend, no accounts in v1](adr/0002-no-backend-no-accounts-v1.md)
- [ADR-0003 Rule-based transliteration](adr/0003-rule-based-transliteration.md)
- [ADR-0004 Quranic vocabulary scope](adr/0004-quranic-vocabulary-scope.md)
- [ADR-0005 Curation strategy](adr/0005-curation-strategy.md)
- [ADR-0006 Hybrid build pipeline](adr/0006-hybrid-build-pipeline.md)
