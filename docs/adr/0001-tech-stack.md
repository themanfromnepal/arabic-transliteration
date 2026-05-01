# ADR-0001: Tech Stack

Status: Accepted

## Context

The project owner is a TypeScript-skilled frontend engineer working alone on a free and
open-source static site for English speakers learning to read the Quran. The mission requires a
fast, accessible, free-to-host, and easy-to-maintain stack. The architecture is fixed as a static
site with no backend (see [ADR-0002](0002-no-backend-no-accounts-v1.md)), so the framework must
support static generation, asset hashing, and lazy-loaded JSON shards out of the box. The full
inventory of layered choices and rejected alternatives lives in [tech-stack.md](../tech-stack.md);
the runtime topology lives in [architecture.md](../architecture.md).

## Decision

The v1 stack is Next.js 15 (App Router) with TypeScript in strict mode, Tailwind v4 for styling,
shadcn/ui for accessible component primitives, Lucide for icons, Vitest for unit tests, Playwright
for end-to-end tests, Vercel for hosting on the free tier, GitHub Actions for continuous
integration, and Cloudflare Web Analytics for cookie-free aggregate measurement. The project is
released under the MIT license.

## Consequences

**Positive**

- Single TypeScript codebase across application code, build scripts, and tests reduces context
  switching and shares types end-to-end with the LemmaEntry shape.
- Next.js App Router gives static export, route-level code splitting, and immutable hashed assets
  with no custom build configuration.
- shadcn/ui copy-in components keep accessibility defaults strong without adding runtime
  dependency weight.
- Every chosen service fits within a free tier, which keeps the project free and open-source to
  operate as well as to consume.

**Negative**

- Next.js is heavier than a minimal static site generator for a project that ships no server-side
  routes in v1.
- shadcn/ui requires owning the source of each primitive, which means upstream changes are not
  pulled in automatically.
- Tailwind v4 is newer than v3 and a small number of ecosystem plugins lag behind.

**Neutral**

- The stack locks the project to the React component model, which matches the owner's existing
  skill set.
- Self-hosted Amiri, Scheherazade New, and Inter font files are committed under `/public/fonts`
  rather than fetched from a third-party font CDN.

## Alternatives considered

### Astro with React islands

- Pros: Smaller default JavaScript payload, content-first authoring model, built-in support for
  partial hydration.
- Cons: The shadcn/ui ecosystem is React-first and less mature on Astro; the project does not need
  Astro's content-collection model because data ships as JSON shards, not Markdown.
- Reason rejected: Weaker shadcn/ui story for the result card and search components, with no
  offsetting benefit for a JSON-driven static site.

### Vite + React single-page application

- Pros: Minimal toolchain, very fast development server, full control over the bundle.
- Cons: No first-class static site generation, no per-route HTML for crawlers, and no built-in
  asset hashing pipeline. Lemma deep-link routes would not be pre-rendered, which hurts shareable
  links and search engine indexing.
- Reason rejected: Loses static site generation and search engine optimization for lemma
  deep-links, which are core to the v1 result card flow.

### SvelteKit

- Pros: Strong static export story, small runtime, ergonomic component model.
- Cons: The owner's skill set is TypeScript with React, and the shadcn ecosystem is React-first.
  Skill mismatch would slow delivery without a measurable user benefit.
- Reason rejected: Skill mismatch with the TypeScript and React stack and with the shadcn
  ecosystem; the productivity loss is not justified for a solo project.

## References

- [tech-stack.md](../tech-stack.md)
- [architecture.md](../architecture.md)
- [performance.md](../performance.md)
- [ADR-0002 No backend, no accounts in v1](0002-no-backend-no-accounts-v1.md)
