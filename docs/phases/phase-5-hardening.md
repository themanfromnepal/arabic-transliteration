# Phase 5: Hardening

## Goal

Reach a production-quality posture across security, performance, accessibility, and observability,
so that the static site is safe to ship at the scale of public traffic.

## Inputs

- Phases 0 through 4 complete: a working static site with end-to-end search, result card,
  audio playback, and theming.

## Deliverables

- Security headers configured: Content Security Policy, HSTS, X-Frame-Options, Referrer-Policy,
  and Permissions-Policy.
- Subresource Integrity attributes for any external scripts.
- Lighthouse CI budgets enforced as a merge gate.
- axe-core accessibility tests integrated into Playwright.
- Cross-browser smoke tests on Chrome, Firefox, Safari, mobile Safari, and mobile Chrome.
- SEO metadata: meta tags, Open Graph, sitemap, robots.txt, and JSON-LD where appropriate.
- Audited error and empty states across the result card flow.
- Drift check from Phase 1 enforced as a merge gate.
- Minimal precache service worker for the app shell (HTML/JS/CSS/fonts). No install prompt or PWA
  manifest in v1.
- CSP nonce/hash strategy for Next.js 15 inline scripts, validated against the production build
  before launch.

## Workstreams

1. Security hardening (headers, SRI, dependency review).
2. Performance budget enforcement in CI.
3. Accessibility audit with axe-core and manual keyboard pass.
4. Cross-browser quality assurance.
5. SEO metadata pass.
6. Final UX polish on edge states.
7. Service worker precache + cache-busting on deploy (hashed asset URLs; SW skipWaiting +
   clientsClaim with safe activation).

## Acceptance criteria

1. Content Security Policy is enforced and any violations are reported.
2. All CI gates listed in [../testing-strategy.md](../testing-strategy.md#ci-gates) are green.
3. Lighthouse scores meet the targets in [../performance.md](../performance.md).
4. axe-core reports zero serious violations.
5. The OWASP Top 10 mapping in [../security.md](../security.md#owasp-top-10-mapping) has been
   reviewed and each row is justified for the current build.
6. After first successful load, reloading the page with the network disabled serves the cached
   shell.

## Risks and mitigations

| Risk                                            | Mitigation                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Third-party CDN availability for audio          | Apply Subresource Integrity where feasible, monitor uptime, and defer offline audio caching to post-v1. |
| Lighthouse score regression on minor UI changes | Enforce performance budgets in CI so regressions block merge.                                           |
| Accessibility regression in new components      | Extend axe-core coverage to every new component during the audit.                                       |
| Stale shell after deploy                        | Hashed asset filenames, SW versioned by build hash, force-update on activation.                         |
| Strict CSP breaking hydration                   | Validate the nonce/hash strategy against the actual production build during Phase 5, not earlier.       |

## Related decisions and docs

- [../security.md](../security.md)
- [../performance.md](../performance.md)
- [../testing-strategy.md](../testing-strategy.md)
- [../adr/0002-no-backend-no-accounts-v1.md](../adr/0002-no-backend-no-accounts-v1.md)
