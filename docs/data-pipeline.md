# Data Pipeline

## Source inventory

| Source                                     | URL                                          | License                                                                                                                                                                                       | Provides                                                           | Attribution requirement                                 |
| ------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| Tanzil Quran text (Uthmani)                | [tanzil.net](https://tanzil.net)             | Tanzil license; free use, text must not be modified                                                                                                                                           | Uthmani script for every ayah                                      | Credit Tanzil and link to the source                    |
| Quranic Arabic Corpus (`<corpus-version>`) | [corpus.quran.com](https://corpus.quran.com) | GPL v3 — copyleft. Use is pending written permission from the maintainers; if not obtained, derived data shards are dual-licensed under GPL while project code remains MIT.                   | Lemma identifiers, root letters, morphology, occurrences           | Credit the Quranic Arabic Corpus and link to the source |
| Quran.com word-by-word translations        | [quran.com](https://quran.com)               | License varies by contributor; pin a specific dataset snapshot (e.g., Qul / Quran.com WBW) and verify CC-BY or compatible terms before bundling. Document the resolved license on `/credits`. | English glosses at the word level                                  | Credit Quran.com and link to the source                 |
| everyayah.com (audio)                      | [everyayah.com](https://everyayah.com)       | Public free CDN                                                                                                                                                                               | Per-ayah MP3 recitations; default reciter Mishary Alafasy 128 kbps | Credit everyayah.com and the reciter                    |

> Assumption: `<corpus-version>` is a placeholder until the exact Quranic Arabic Corpus dataset version is selected and pinned.

> Assumption: The exact word-by-word dataset version and its license are pinned in Phase 1 before any data is bundled.

## Pipeline overview

The build pipeline transforms committed raw sources into curated JSON shards that the static site
loads at runtime. Bundle and storage size budgets for the emitted shards are defined in
[architecture.md](architecture.md#bundle-and-storage-budget).

```mermaid
flowchart LR
    subgraph Sources[/data/sources/ raw, committed]
        TZ[Tanzil Uthmani]
        QC[Quranic Arabic Corpus]
        WBW[Quran.com word-by-word]
    end

    NORM[Normalize] --> MERGE[Merge by lemma id]
    Sources --> NORM
    MERGE --> DRAFT[Automated draft entries]
    DRAFT --> CSV[Reviewer CSV round-trip]
    CSV --> CURATED[Curated lemma JSON]
    CURATED --> SPLIT[Bundle split]

    SPLIT --> INLINE[Top-N lemma index<br/>inlined into initial bundle]
    SPLIT --> DICT[Full dictionary shard]
    SPLIT --> VERSES[Verses shard]
    SPLIT --> OCC[Word-occurrences shard]
    SPLIT --> WBWOUT[Word-by-word shard]

    INLINE --> OUT[/public/data/]
    DICT --> OUT
    VERSES --> OUT
    OCC --> OUT
    WBWOUT --> OUT
```

## LemmaEntry shape

The following type sketch documents the lemma record that the result card consumes. It is
illustrative and lives in `/src/types` once implemented.

```ts
type LemmaEntry = {
  id: string;
  arabic: string; // Uthmani surface form with diacritics
  lemma: string; // canonical lemma form
  root: [string, string, string] | [string, string, string, string];
  phoneticKeys: string[]; // accepted phonetic English spellings
  meaning: string; // concise English gloss
  partOfSpeech?: string;
  occurrences: string[]; // sura:ayah references, e.g. "1:1"
  audioUrl: string; // template resolved per occurrence
};
```

## Curation workflow

1. The build script generates a draft CSV from the merged sources, populating Arabic, root,
   lemma, and occurrences automatically.
2. Reviewers refine the phonetic English keys and the English meanings in the CSV; automated
   fields are not edited by hand.
3. The script ingests the reviewed CSV and emits the final curated lemma JSON.
4. A pull request opens with the resulting diff against the committed JSON shards.
5. The pull request is merged after review by another contributor with the required expertise.

> Assumption: Reviewers must be literate in Quranic Arabic; reviews are PR-based via the project's
> GitHub repository.

## Hybrid build model

Raw source datasets are committed under `/data/sources`. The local build script
`scripts/build-dictionary.ts` consumes those sources and emits the JSON shards under
`/public/data`, which are also committed. Continuous integration re-runs the build script and
verifies that the freshly produced output matches the committed shards. A drift between the two
fails the build, which prevents accidental divergence between sources and shipped data. See
[ADR-0006](adr/0006-hybrid-build-pipeline.md).

## Update process

- When upstream sources publish corrections, contributors refresh the relevant files under
  `/data/sources`, re-run the build script locally, and open a pull request that contains both
  the source and shard changes.
- When curation entries are revised, the CSV round-trip is repeated and the resulting shard diff
  is opened as a pull request.
- The dictionary version field is bumped on every merged change to curated data so that the
  IndexedDB cache can detect stale shards and refresh them.

## Licensing and attribution

The MIT license covers project code only; it does not relicense the source datasets. Tanzil text
is used unmodified under the Tanzil license. Quranic Arabic Corpus data is used under GPL v3
with attribution; per [ADR-0007](adr/0007-data-licensing-strategy.md), the project first requests
written permission from the corpus maintainers to bundle derived morphology data under permissive
terms. If permission is not obtained, the project falls back to a dual-license model: project
code remains MIT (`LICENSE`), and data shards derived from the Quranic Arabic Corpus are released
under GPL v3 (`LICENSE-DATA`). Quran.com word-by-word translations are pinned to a specific
snapshot whose license is verified and documented on `/credits` before bundling; the same
dual-license fallback applies if no permissive snapshot is available. everyayah.com audio is
streamed from its public CDN with credit to the reciter. The site renders a `/credits` page that
lists every source, license, and required attribution.

## Related decisions

- [ADR-0004 Quranic vocabulary scope](adr/0004-quranic-vocabulary-scope.md)
- [ADR-0005 Curation strategy](adr/0005-curation-strategy.md)
- [ADR-0006 Hybrid build pipeline](adr/0006-hybrid-build-pipeline.md)
