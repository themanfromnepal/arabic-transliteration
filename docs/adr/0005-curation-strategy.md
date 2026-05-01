# ADR-0005: Curation strategy — automated draft plus human review

Status: Accepted

## Context

The dictionary combines fields that come directly from the source datasets (Uthmani Arabic, root
letters, lemma id, sura:ayah occurrences) with fields that require human judgment (phonetic
English keys that real English-speaking learners will type, and concise English meanings at the
correct reading level). Corpus-derived fields are accurate by construction; the human-judgment
fields are not. The curation workflow described in
[data-pipeline.md](../data-pipeline.md#curation-workflow) must preserve the reliability of the
automated fields while letting reviewers iterate on the human-judgment fields safely.

## Decision

Dictionary entries are produced by a two-stage process. First, the automated pipeline generates
draft entries from the source datasets, populating Arabic, root, lemma, and occurrences. Second,
reviewers refine phonetic English keys and English meanings via a CSV round-trip; the reviewed
CSV is ingested by the build script and the resulting curated lemma JSON is opened as a pull
request for review and merge.

> Assumption: Reviewers must be literate in Quranic Arabic; reviews are PR-based via the
> project's GitHub repository.

## Consequences

**Positive**

- Automated fields are never edited by hand, which keeps them aligned with the upstream sources
  and reproducible by re-running the build script.
- Human-judgment fields receive real review by a contributor with the required expertise before
  reaching users.
- The CSV round-trip is a familiar artifact for reviewers and is diff-friendly in pull requests.
- Pull requests give a clear audit trail for every curated change.

**Negative**

- Reviewer throughput is the rate-limiting step for v1 launch and for ongoing corrections.
- The reviewer pool is constrained by the literacy requirement, which limits how many people can
  approve curation pull requests.
- The CSV round-trip adds an intermediate artifact that must be kept in sync with the curated
  JSON.

**Neutral**

- Contributors who only update raw sources still trigger a re-run of the automated draft, but no
  new review is required if the human-judgment fields are unchanged.
- Curation governance is enforced by GitHub branch protection and code review settings rather
  than by application code.

## Alternatives considered

### Fully automated (ship raw corpus output)

- Pros: Fastest time-to-launch; zero curation overhead; fully reproducible from sources.
- Cons: Phonetic English keys derived mechanically do not match what English speakers actually
  type; English glosses from word-by-word translations are often too terse or too literal at the
  lemma level; quality of the result card drops.
- Reason rejected: Mission is to help English speakers learn; uncurated keys and meanings hurt
  the learning experience.

### Fully manual (hand-write every entry)

- Pros: Highest possible quality on every field; no dependency on source-data formats.
- Cons: Ignores accurate, free upstream data; multiplies effort for no quality gain on
  Arabic, root, lemma, and occurrences; vastly slower time-to-launch for ~3,500 lemmas.
- Reason rejected: Wastes the corpus-accurate fields and pushes v1 launch out without improving
  the parts that actually need human judgment.

### Crowdsourced wiki-style editing

- Pros: Scales contributors beyond a small reviewer pool; lowers the bar to participate.
- Cons: Vandalism risk on a public-facing dataset; weaker governance; harder to track who
  approved what; conflicts with the static-site model that ships data shards as committed
  artifacts.
- Reason rejected: Governance and vandalism risk are unacceptable for a learning resource; PR
  review preserves quality while still allowing community contribution.

## References

- [data-pipeline.md](../data-pipeline.md)
- [contributing.md](../contributing.md)
- [phases/phase-1-data-pipeline.md](../phases/phase-1-data-pipeline.md)
- [ADR-0004 Quranic vocabulary scope](0004-quranic-vocabulary-scope.md)
