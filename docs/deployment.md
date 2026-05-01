# Deployment

## Environments

| Environment | URL                       | Trigger            | Purpose                                                   |
| ----------- | ------------------------- | ------------------ | --------------------------------------------------------- |
| Local dev   | `localhost:3000`          | `npm run dev`      | Day-to-day development on a contributor machine.          |
| Preview     | Vercel preview deployment | Every pull request | Review and quality assurance against the proposed change. |
| Production  | `<production-domain>`     | Push to `main`     | Public site for learners.                                 |

> Assumption: `<production-domain>` is a placeholder until the canonical domain is registered.

## Branching model

The project uses a trunk-based workflow with short-lived feature branches off `main`. Every
change reaches `main` through a pull request; long-lived branches are not used in v1. Commit
conventions and pull request expectations are defined in [contributing.md](contributing.md).

## Release process

1. Merge the pull request to `main` after CI is green and review is complete.
2. Vercel auto-builds and deploys the new commit to the production environment.
3. Tag the release in Git using semantic versioning.
4. Update `CHANGELOG` with the release notes for the tagged version.
5. Confirm Cloudflare Web Analytics shows traffic resuming on the new deployment.

## Rollback

Vercel exposes a one-click "Promote previous deployment" action that restores the prior build
instantly. Because the site is static, rollback is effectively immediate and has no data
migration concerns. Roll back when a regression is caught post-deploy and the fix is not obvious;
roll forward with a small follow-up commit when the fix is small and well understood.

## Monitoring

- Cloudflare Web Analytics for page views and Core Web Vitals, with no cookies set.
- Vercel build and runtime logs for deployment status and CDN delivery diagnostics.
- GitHub Actions CI status surfaces lint, typecheck, test, build, Lighthouse, drift-check, and
  Playwright outcomes on every pull request and on `main`.
- GitHub issue tracker captures user-reported bugs and feature requests.

## Domain and DNS

The production domain is registered with a registrar to be decided (Namecheap and Cloudflare
Registrar are reasonable starting points). DNS is managed via Cloudflare so that the project
benefits from a free CDN and security layer in front of Vercel; this layer is optional and can be
removed without code changes. TLS certificates are issued and renewed automatically by Vercel.

## Analytics setup

A Cloudflare Web Analytics property is created for the production domain, and the beacon script
is included via the Next.js `<Script>` tag with the `afterInteractive` strategy. Because the
provider sets no cookies and stores no personal data, no cookie consent banner is required. A
`/privacy` page is published as part of launch and discloses transient IP processing by Cloudflare
Web Analytics for fingerprint resistance and request metadata logging by the Vercel hosting
platform.

> Assumption: Analytics property tag is a placeholder until the property is created.

## CI/CD overview

GitHub Actions runs lint, typecheck, unit tests, data integrity tests, the Next.js build, the
drift check, Lighthouse CI, and Playwright end-to-end tests on every pull request and on `main`.
Vercel handles the deploy step. Both services run within their free tiers for the workload this
project expects.

## Repository

The project's canonical Git remote is `<repo-url>`. All references to the repository in other
documents resolve to the same placeholder until the canonical remote is chosen.

> Assumption: `<repo-url>` is a placeholder until the canonical Git remote is chosen.

## Out of scope (v1)

> Out of scope: blue / green deployments, canary releases, feature flags, a separate staging
> environment beyond Vercel previews, and server runtime monitoring (no server exists to monitor).

## Related decisions

- [ADR-0001 Tech stack](adr/0001-tech-stack.md) — selection of Vercel and GitHub Actions.
- [ADR-0002 No backend, no accounts in v1](adr/0002-no-backend-no-accounts-v1.md) — rationale for
  static-only deployment.
