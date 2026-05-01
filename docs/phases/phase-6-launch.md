# Phase 6: Launch

## Goal

Bring the static site live at the production domain, serving real users over HTTPS, with
analytics, attribution, and a rehearsed rollback ready before the public announcement.

## Inputs

- Phases 0 through 5 complete: hardened build with all CI gates green.

## Deliverables

- Production domain registered and DNS configured per
  [../deployment.md](../deployment.md#domain-and-dns).
- TLS active on the production domain.
- Cloudflare Web Analytics property created and the analytics beacon live.
- Privacy policy and terms of service finalized.
- `/credits` page complete with all attribution from
  [../data-pipeline.md](../data-pipeline.md#licensing-and-attribution).
- Soft launch to a small invited group.
- Public launch.
- A 1- to 2-week post-launch monitoring window with active triage.

## Workstreams

1. Pre-launch checklist (DNS, TLS, analytics, legal pages, credits).
2. Soft launch to the invited group and collect feedback.
3. Public launch announcement.
4. Monitoring window with daily review of analytics and Web Vitals.
5. Bug triage and fast-follow fixes.

## Acceptance criteria

1. The production domain serves the application over HTTPS.
2. Cloudflare Web Analytics records page views and Web Vitals from real traffic.
3. There are zero critical bugs open at the close of the monitoring window.
4. The rollback procedure has been rehearsed at least once per
   [../deployment.md](../deployment.md#rollback).

## Risks and mitigations

| Risk                                                               | Mitigation                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Launch-day traffic spike                                           | A static site on a CDN absorbs spikes trivially; monitor and confirm.                         |
| Last-minute accessibility or content issue discovered after launch | Roll back or roll forward per the procedure in [../deployment.md](../deployment.md#rollback). |
| Analytics misconfiguration on the production domain                | Validate the beacon end to end during the soft launch window.                                 |

## Related decisions and docs

- [../deployment.md](../deployment.md)
- [../security.md](../security.md)
- [../contributing.md](../contributing.md)
