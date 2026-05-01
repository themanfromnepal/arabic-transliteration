# Architecture

## Overview

Arabic Transliteration is a pure static site. All application logic, including the
transliteration engine, lemma lookup, fuzzy search, and result card rendering, executes in the
browser. The site is delivered as pre-built HTML, JavaScript, CSS, and JSON shards from a content
delivery network. There is no backend owned by this project, no database, and no user accounts.
Audio recitation is the only runtime dependency on a third-party origin.

## High-level diagram

```mermaid
flowchart LR
    subgraph Browser
        SB[SearchBox]
        TE[TransliterationEngine]
        LI[LookupIndex<br/>Fuse.js]
        DS[DictionaryStore]
        CL[CacheLayer<br/>idb-keyval]
        RR[ResultRenderer]
        AP[AudioPlayer]
        SW[ServiceWorker<br/>app-shell precache]
    end

    subgraph IDB[IndexedDB cache]
        IDX[(Lemma shards)]
    end

    subgraph CDN[Vercel CDN]
        HTML[HTML / JS / CSS / fonts<br/>Initial bundle ~200 KB]
        JSON[Lazy JSON shards<br/>dictionary 3 MB · verses 2 MB<br/>occurrences 1 MB · word-by-word 1 MB]
    end

    EA[everyayah CDN<br/>per-ayah MP3]

    SB --> TE
    TE --> LI
    LI --> DS
    DS --> CL
    CL <--> IDB
    DS -. lazy fetch .-> JSON
    SW <-. intercepts shell .-> HTML
    HTML --> Browser
    TE --> RR
    RR --> AP
    AP --> EA
```

## Components

- SearchBox: input control that captures phonetic English or Arabic script and dispatches queries.
- TransliterationEngine: rule-based normalizer that turns phonetic English into candidate Arabic
  forms suitable for lookup.
- LookupIndex: in-memory Fuse.js index over phonetic keys, lemma surface forms, and roots.
- DictionaryStore: facade over the bundled top-N lemma index and the lazy-loaded full dictionary
  shards.
- CacheLayer: thin wrapper over idb-keyval that persists lemma shards in the IndexedDB cache.
- ResultRenderer: renders the result card with Uthmani script, transliteration, meaning, root
  letters, and occurrences.
- AudioPlayer: requests per-ayah audio from everyayah.com on user activation.
- ThemeProvider: manages light and dark mode and Arabic font size, persisting choices in
  localStorage.
- Service Worker (app-shell precache only): precaches the application shell — HTML, JS, CSS, and
  self-hosted fonts — so warm loads work without a network. The service worker does not cache the
  lazy JSON shards; those continue to live in the IndexedDB cache.

## Module boundaries

The future repository layout maps responsibilities to directories without prescribing
implementation:

- `/src/app`: Next.js App Router routes, including the home page, lemma deep-link routes, and the
  credits page.
- `/src/components/ui`: shadcn/ui primitives.
- `/src/components/search`: SearchBox and search result list.
- `/src/components/word`: result card, root letter display, occurrences list, audio controls.
- `/src/components/layout`: header, footer, theme and font-size controls.
- `/src/lib/transliterator`: rule-based engine and candidate generation.
- `/src/lib/dictionary`: dictionary store, lazy shard loaders, and LookupIndex assembly.
- `/src/lib/storage`: IndexedDB cache wrapper around idb-keyval.
- `/src/lib/utils`: shared helpers, including sura:ayah formatting.
- `/src/hooks`: React hooks for search state, theme, and cache lifecycle.
- `/src/types`: shared TypeScript types, including the LemmaEntry shape.
- `/public/data`: pre-built JSON shards emitted by the build pipeline.
- `/public/fonts`: self-hosted Amiri, Scheherazade New, and Inter font files.
- `/scripts`: build-time tooling, including `build-dictionary.ts`.
- `/data/sources`: raw, committed source datasets from Tanzil, the Quranic Arabic Corpus, and
  Quran.com.
- `/tests/unit`: Vitest unit tests.
- `/tests/e2e`: Playwright end-to-end tests.

## Runtime data flow

### Cold load (first visit)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant SW as ServiceWorker
    participant CDN as Vercel CDN
    participant IDB as IndexedDB cache
    participant EA as everyayah CDN

    User->>Browser: Open site
    Browser->>CDN: GET HTML / JS / CSS / fonts (initial bundle)
    CDN-->>Browser: Bundle with top-N lemma index inline
    Browser->>SW: Register and precache app shell
    User->>Browser: Type phonetic English
    Browser->>IDB: Read lemma shard
    IDB-->>Browser: Miss
    Browser->>CDN: Lazy fetch dictionary / verses / occurrences shards
    CDN-->>Browser: JSON shards
    Browser->>IDB: Write shards
    Browser-->>User: Render result card
    User->>Browser: Activate audio
    Browser->>EA: GET per-ayah MP3
    EA-->>Browser: Audio stream
    Browser-->>User: Play recitation
```

### Warm load (cached)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant SW as ServiceWorker
    participant IDB as IndexedDB cache
    participant EA as everyayah CDN

    User->>Browser: Open site (offline or online)
    Browser->>SW: Request HTML / JS / CSS / fonts
    SW-->>Browser: Serve app shell from precache
    Browser->>IDB: Read top-N index and shards
    IDB-->>Browser: Hit
    User->>Browser: Type phonetic English
    Browser->>IDB: Lookup lemma
    IDB-->>Browser: Lemma entry
    Browser-->>User: Render result card
    User->>Browser: Activate audio
    Browser->>EA: GET per-ayah MP3 (HTTP cache)
    EA-->>Browser: Audio stream
    Browser-->>User: Play recitation
```

## Bundle and storage budget

This table is the canonical source for bundle and storage sizes across the project. Other
documents reference it instead of restating these numbers.

| Asset                     | Size (gzipped) | Delivery                                    |
| ------------------------- | -------------- | ------------------------------------------- |
| Initial JS + CSS          | ≤ 200 KB       | Static, CDN-cached, immutable hashed assets |
| Top-N lemma index inline  | ≤ 50 KB        | Inlined into the initial bundle             |
| Full dictionary           | ≤ 3 MB         | Lazy-loaded JSON shard on first real use    |
| Verses (Uthmani text)     | ≤ 2 MB         | Lazy-loaded JSON shard on first real use    |
| Word-occurrences          | ≤ 1 MB         | Lazy-loaded JSON shard on first real use    |
| Word-by-word translations | ≤ 1 MB         | Lazy-loaded JSON shard on first real use    |
| Total cached ceiling      | ≤ 7 MB         | IndexedDB cache via idb-keyval              |

## Why no backend

A static site is the smallest possible attack surface, has no per-request server cost, and degrades
gracefully on slow networks. Removing accounts removes the largest source of personal data and the
largest compliance burden. See [ADR-0002](adr/0002-no-backend-no-accounts-v1.md). The minimal
app-shell service worker lives at `/public/sw.js` and is registered from the root layout; it runs
entirely client-side and does not introduce a backend dependency.

## Related decisions

- [ADR-0001 Tech stack](adr/0001-tech-stack.md)
- [ADR-0002 No backend, no accounts in v1](adr/0002-no-backend-no-accounts-v1.md)
- [ADR-0003 Rule-based transliteration](adr/0003-rule-based-transliteration.md)
- [ADR-0006 Hybrid build pipeline](adr/0006-hybrid-build-pipeline.md)
