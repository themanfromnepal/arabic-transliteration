# Data Pipeline

## Source inventory

| Source                                     | URL                                          | License                                                                                                                                                                                       | Provides                                                           | Attribution requirement                                 |
| ------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| Tanzil Quran text (Uthmani)                | [tanzil.net](https://tanzil.net)             | Tanzil license; free use, text must not be modified                                                                                                                                           | Uthmani script for every ayah                                      | Credit Tanzil and link to the source                    |
| Quranic Arabic Corpus (v0.4) | [corpus.quran.com](https://corpus.quran.com) | Custom (LicenseRef-QAC-0.4); use permitted in any website or application with attribution and link to corpus.quran.com. Verbatim copying allowed; modification of the source file is not. See [docs/licensing.md](licensing.md).                   | Lemma identifiers, root letters, morphology, occurrences           | Credit the Quranic Arabic Corpus and link to the source |
| Tarteel/Qul word-by-word translations        | [qul.tarteel.ai](https://qul.tarteel.ai)               | LicenseRef-Tarteel-free-use; free and open to use, permission granted by Tarteel Team (6 May 2026). See [docs/licensing.md](licensing.md). | English glosses at the word level                                  | Credit Tarteel / qul.tarteel.ai and link to the source                 |
| everyayah.com (audio)                      | [everyayah.com](https://everyayah.com)       | Public free CDN                                                                                                                                                                               | Per-ayah MP3 recitations; default reciter Saad Al-Ghamdi 40 kbps | Credit everyayah.com and the reciter                    |


## Pipeline overview

The build pipeline transforms committed raw sources into curated JSON shards that the static site
loads at runtime. Bundle and storage size budgets for the emitted shards are defined in
[architecture.md](architecture.md#bundle-and-storage-budget).

```mermaid
flowchart LR
    subgraph Sources[/data/sources/ raw, committed]
        TZ[Tanzil Uthmani]
        QC[Quranic Arabic Corpus]
        WBW[Tarteel/Qul word-by-word]
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
is used unmodified under CC-BY-ND 4.0. Quranic Arabic Corpus v0.4 data is used under its custom
license (LicenseRef-QAC-0.4), which permits use in any website or application with attribution
and a link to corpus.quran.com; the source file must not be modified. Tarteel/Qul word-by-word
translations and the Yusuf Ali English translation are used with permission from the Tarteel Team
(granted 6 May 2026; free and open to use with attribution). everyayah.com audio is streamed from
its public CDN with credit to the reciter; formal permission is pending. The site renders a
`/credits` page that lists every source, license, and required attribution. The full license
record with proof of permissions is maintained in [licensing.md](licensing.md).

## Related decisions

- [ADR-0004 Quranic vocabulary scope](adr/0004-quranic-vocabulary-scope.md)
- [ADR-0005 Curation strategy](adr/0005-curation-strategy.md)
- [ADR-0006 Hybrid build pipeline](adr/0006-hybrid-build-pipeline.md)
