# Security

## Threat model summary

Arabic Transliteration is a static site with no backend, no database, no user accounts, and no
personally identifiable information collected or stored. The attack surface is therefore minimal.
The primary residual risks are supply-chain compromise of build-time dependencies, integrity of
the curated content shipped to learners, and abuse of the third-party audio CDN bandwidth.

## OWASP Top 10 mapping

| Risk                                           | Applicability                                                                                                     | Mitigation                                                                                                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control                      | Not applicable — no backend, no accounts, no protected resources to access.                                       | None required.                                                                                                                                                                     |
| A02 Cryptographic Failures                     | Not applicable — no secrets handled, no PII transmitted; HTTPS is enforced by the CDN.                            | None required beyond HTTPS-only delivery.                                                                                                                                          |
| A03 Injection                                  | Not applicable — no server-side queries; client-side input is used only for in-memory lookup against static data. | Treat user input as untrusted; never interpolate into HTML or eval.                                                                                                                |
| A04 Insecure Design                            | Not applicable — design intentionally removes server, accounts, and persistence.                                  | Design reviewed in [ADR-0002](adr/0002-no-backend-no-accounts-v1.md).                                                                                                              |
| A05 Security Misconfiguration                  | Applicable — static asset delivery still requires correct headers and CSP.                                        | Ship a Content Security Policy, HSTS, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy via Next.js headers configuration; review on every release.                  |
| A06 Vulnerable and Outdated Components         | Applicable — npm dependency tree must stay healthy.                                                               | Renovate or Dependabot weekly updates, `npm audit` blocking in CI, pin major versions, review every new dependency.                                                                |
| A07 Identification and Authentication Failures | Not applicable — no authentication exists in v1.                                                                  | None required.                                                                                                                                                                     |
| A08 Software and Data Integrity Failures       | Applicable — both build artifacts and curated lemma data must be trustworthy.                                     | Lockfile-pinned dependencies; CI drift check that re-runs the build pipeline and verifies committed JSON shards match; pull request review on all source and curated data changes. |
| A09 Security Logging and Monitoring Failures   | Not applicable — no server logs to maintain.                                                                      | Cloudflare Web Analytics provides aggregate traffic visibility without personal data.                                                                                              |
| A10 Server-Side Request Forgery                | Not applicable — no backend issues outbound requests.                                                             | None required.                                                                                                                                                                     |

## Content Security Policy

The site enforces a strict Content Security Policy via Next.js headers configuration. The
required directives are:

- `default-src 'self'`
- `img-src 'self' data:`
- `media-src https://everyayah.com`
- `font-src 'self'`
- `connect-src 'self' https://everyayah.com https://static.cloudflareinsights.com`
- `script-src 'self' https://static.cloudflareinsights.com`
- `style-src 'self' 'unsafe-inline'`
- `frame-ancestors 'none'`

The policy is enforced through the framework's headers configuration; no runtime code is required.

Next.js 15 App Router emits inline scripts for streaming RSC payloads and hydration. A literal
`script-src 'self'` will break hydration. v1 will adopt a build-time nonce or static hash strategy
for `script-src`; the exact mechanism is selected during Phase 5 based on the actual production
build output. Until then, the directive list above is a target, not a final policy.

## Subresource Integrity

Any externally hosted script the site loads, such as the Cloudflare Web Analytics beacon, must
include a Subresource Integrity hash where the provider supports it. Self-hosted assets are
delivered with hashed filenames and immutable cache headers, which provides equivalent integrity.

## Dependency hygiene

- Renovate or Dependabot opens weekly update pull requests for all production and development
  dependencies.
- `npm audit` runs in continuous integration and blocks merges on high or critical advisories.
- Major versions are pinned; minor and patch updates are accepted after CI passes.
- Every new dependency is reviewed for license, maintenance health, and bundle impact before it is
  added.

## Third-party risks

| Provider                 | Risk                                                                                     | Mitigation                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| everyayah.com            | Availability and integrity of audio recitations                                          | Result card degrades gracefully when audio fetch fails; service-worker-based audio caching is tracked for post-v1.                                                                |
| Cloudflare Web Analytics | Privacy regression if provider changes terms                                             | Provider uses no cookies and no personally identifiable information; transient IP processing for fingerprint resistance; disclosed in `/privacy`. Usage is reviewed periodically. |
| Vercel                   | Vendor lock-in; request metadata may be logged by the platform; disclosed in `/privacy`. | The site is a portable static bundle; it can be redeployed to any static host without code changes.                                                                               |
| Google Fonts             | Privacy and CSP exposure                                                                 | Not used. Amiri, Scheherazade New, and Inter are self-hosted from `/public/fonts`.                                                                                                |

## Reporting policy

Security researchers may report suspected vulnerabilities by email to the project's security
contact. The project follows a 90-day coordinated disclosure window, during which the maintainers
will acknowledge the report, investigate, and prepare a fix before any public disclosure. Reports
that disclose user impact will be prioritized.

> Assumption: Security contact email is `<security-contact-email>` until a real address is chosen.

## Related decisions

- [ADR-0002 No backend, no accounts in v1](adr/0002-no-backend-no-accounts-v1.md)
