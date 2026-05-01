# ADR-0002: No backend, no accounts in v1

Status: Accepted

## Context

The v1 feature set defined in [spec.md](../spec.md) is search, transliteration, lemma lookup,
audio link, dark mode, and adjustable Arabic font size. None of these features require server
state. The mission is to keep the project free for everyone, and a backend introduces hosting
cost, operational toil, and compliance burden that scale with usage. The target audience is
English speakers learning to read the Quran; cross-device personalization is not part of the v1
goal. The static site security posture and threat model are described in
[security.md](../security.md), and the no-backend topology is reflected in
[architecture.md](../architecture.md).

## Decision

v1 ships as a pure static site with no API server, no project-owned database, and no
authentication. All logic, including the transliteration engine and lemma lookup, runs client-side.
User-visible state is limited to font size and theme in localStorage and the IndexedDB cache that
holds lazy-loaded lemma shards.

## Consequences

**Positive**

- Zero per-request server cost keeps the project free to operate at any traffic level a free
  static host will absorb.
- No accounts means no personal data to store, no password reset flows, and no authentication
  attack surface.
- No server-side compliance burden: no sessions and no cookies tied to identity. No cookie
  consent banner is required because no cookies are set. A privacy notice at `/privacy` is still
  published, disclosing that page-level analytics processed by Cloudflare Web Analytics may handle
  visitor IP addresses transiently for fingerprint resistance, and that the site is hosted by
  Vercel which may log request metadata.
- The static site is trivially mirror-able and can be hosted by anyone who forks the repository.

**Negative**

- No cross-device synchronization of font size, theme, or future bookmarks; each device starts
  from defaults.
- No server-side validation of any future contributed data; quality gates must run at build time
  in continuous integration.
- Adding a backend later is a non-trivial change to the architecture and would itself require a
  follow-up ADR.

**Neutral**

- Analytics are limited to cookie-free aggregate measurement via Cloudflare Web Analytics.
- The IndexedDB cache becomes the single source of truth for warm-load performance and offline
  use.
- v1 includes a minimal precache service worker for the app shell, which is consistent with the
  no-backend stance because the service worker runs entirely client-side.

## Alternatives considered

### Supabase (Postgres + auth)

- Pros: Cross-device sync of preferences and bookmarks, server-side validation of contributed
  entries, hosted Postgres with row-level security.
- Cons: Free tier has hard caps that fail at modest traffic; introduces personal data and
  GDPR-style consent obligations; adds an operational dependency the solo maintainer must monitor.
- Reason rejected: No v1 feature requires it; the cost, complexity, and compliance burden are not
  justified for the v1 scope.

### Firebase (Firestore + Auth)

- Pros: Mature client SDKs, real-time sync, well-documented authentication providers.
- Cons: Vendor lock-in to Google Cloud, opaque pricing at scale, and the same personal-data and
  consent obligations as any backed authenticated service.
- Reason rejected: No v1 feature requires authenticated state; vendor lock-in is a poor trade for
  a free and open-source project.

### Custom Node API on a serverless platform

- Pros: Maximum flexibility, full control over the data model and validation.
- Cons: Highest operational burden, an API surface to harden, cold-start latency, and ongoing
  cost. Adds a backend that must be maintained alongside the static site.
- Reason rejected: Nothing in v1 needs server-side compute; the operational and security cost is
  unjustified.

## References

- [architecture.md](../architecture.md)
- [security.md](../security.md)
- [performance.md](../performance.md)
- [spec.md](../spec.md)
- [roadmap.md](../roadmap.md)
