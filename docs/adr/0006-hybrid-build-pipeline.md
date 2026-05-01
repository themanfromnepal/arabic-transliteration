# ADR-0006: Hybrid build pipeline

Status: Accepted

## Context

The static site loads pre-built JSON shards at runtime. Two reasonable extremes exist: build the
shards on every deploy, or build the shards locally and never check them in. The first makes
deploys slow and unpredictable and hides the shipped data from contributor review. The second
makes "I forgot to rebuild" silently ship stale data. The hybrid model described in
[data-pipeline.md](../data-pipeline.md#hybrid-build-model) is designed to give the predictability
of committed artifacts together with a continuous-integration drift check that prevents stale
data from reaching production. The runtime expectation that shards are pre-built and lazy-loaded
is reflected in [architecture.md](../architecture.md).

## Decision

Raw source files are committed to the repository under `data/sources/`. Generated JSON shards are
also committed under `public/data/`. The build script `scripts/build-dictionary.ts` runs locally
to produce the shards. Continuous integration re-runs the same script on every push and fails the
build if the freshly produced output differs from the committed JSON. This drift check makes a
forgotten local rebuild a build-time error rather than a silent data regression.

## Consequences

**Positive**

- Deploys are fast and predictable: no data build runs at deploy time, only the static site
  build.
- Contributors can inspect the exact JSON that ships in pull request diffs.
- The drift check makes stale shards impossible to merge; the build fails before review
  completes.
- Reproducibility is enforced by continuous integration, not by convention.

**Negative**

- Pull requests that touch sources or curation include large JSON diffs alongside the source
  changes, which makes review noisier.
- The drift check consumes continuous-integration minutes on every push.
- Contributors must run the build script locally before opening a pull request that touches data.

**Neutral**

- The build script is the single source of truth for the shape of the shipped shards; ad-hoc
  manual edits to the JSON are not supported.

## Alternatives considered

### Manual local builds only (no drift check)

- Pros: Simplest possible setup; zero continuous-integration cost for data.
- Cons: A forgotten rebuild silently ships stale data; the only safeguard is contributor
  discipline.
- Reason rejected: Drift safety is the entire point of the hybrid model; without the check, the
  committed JSON loses its meaning as a reviewable artifact.

### Build-on-deploy in continuous integration (no committed JSON)

- Pros: No JSON noise in pull request diffs; sources are the single source of truth in the
  repository.
- Cons: Every deploy runs the full data build, which is slower and less predictable; reviewers
  cannot inspect the shipped JSON in a diff; a build-script regression breaks deploys instead of
  failing earlier.
- Reason rejected: Loses the predictability and reviewability of committed shards; pushes data
  failures to deploy time.

### Scheduled continuous-integration rebuilds

- Pros: Catches drift between sources and shards on a cadence without requiring contributor
  action.
- Cons: Drift can sit on the main branch between scheduled runs; the check runs whether or not
  anything changed; consumes continuous-integration minutes for no incremental safety over a
  per-push check.
- Reason rejected: A per-push drift check catches the same problem at the moment of introduction
  and at lower aggregate cost.

## References

- [data-pipeline.md](../data-pipeline.md)
- [testing-strategy.md](../testing-strategy.md)
- [architecture.md](../architecture.md)
- [phases/phase-1-data-pipeline.md](../phases/phase-1-data-pipeline.md)
