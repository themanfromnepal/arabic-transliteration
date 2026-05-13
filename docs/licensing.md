# Licensing Record

This document is the canonical record of upstream data licenses used by the Arabic Transliteration
project. It documents the license terms, attribution requirements, resolution status, and proof of
permissions for each data source. The MIT license at the repository root (`LICENSE`) covers project
code only and does not relicense any upstream data.

For the architectural decision behind this licensing approach, see
[ADR-0007](adr/0007-data-licensing-strategy.md).

## Source license summary

| # | Source | License identifier | Status | Attribution required |
|---|--------|--------------------|--------|----------------------|
| 1 | Tanzil Quran Text (Uthmani, v1.1) | CC-BY-ND-4.0 | Approved | Credit Tanzil Project, link to https://tanzil.net |
| 2 | Quranic Arabic Corpus (v0.4) | LicenseRef-QAC-0.4 | Approved | Credit Kais Dukes / Quranic Arabic Corpus, link to https://corpus.quran.com |
| 3 | English Word-by-Word Translation (Tarteel/Qul, resource 92) | LicenseRef-Tarteel-free-use | Approved | Credit Tarteel / qul.tarteel.ai |
| 4 | Quran English Translation — Yusuf Ali (Tarteel/Qul, resource 124) | LicenseRef-Tarteel-free-use | Approved | Credit Tarteel / qul.tarteel.ai |
| 5 | everyayah.com audio (Saad Al-Ghamdi, 40 kbps) | Public free CDN | Pending | Credit everyayah.com and the reciter |

## Detailed license terms

### 1. Tanzil Quran Text (Uthmani)

- **Source:** https://tanzil.net
- **Version:** Uthmani v1.1, minimal (no pause marks, sajdah signs, or rub-el-hizb)
- **License:** CC-BY-ND 4.0
- **Terms:** Free to use; text must not be modified. Credit Tanzil Project and link to source.
- **Status:** Approved — standard Creative Commons license, no permission request needed.

### 2. Quranic Arabic Corpus (v0.4)

- **Source:** https://corpus.quran.com
- **Author:** Kais Dukes (Copyright © 2011)
- **License:** Custom (recorded as `LicenseRef-QAC-0.4`)
- **Terms (verbatim from file header):**
  - Permission is granted to copy and distribute verbatim copies of this file, but CHANGING IT IS
    NOT ALLOWED.
  - This annotation can be used in any website or application, provided its source (the Quranic
    Arabic Corpus) is clearly indicated, and a link is made to http://corpus.quran.com to enable
    users to keep track of changes.
  - This copyright notice shall be included in all verbatim copies of the text, and shall be
    reproduced appropriately in all works derived from or containing substantial portion of this
    file.
- **Status:** Approved — the file's own copyright block (lines 1–28 of
  `quranic-corpus-morphology-0.4.txt`) explicitly permits use in any website or application with
  attribution.
- **Note:** Earlier project documentation described this as "GPL v3". The actual terms in the file
  header are a custom license that is more permissive for application use than GPL v3 (no copyleft
  obligation on the application code), though more restrictive on modification of the source file
  itself. The `LICENSE-DATA` dual-license fallback described in ADR-0007 was never needed.

### 3. English Word-by-Word Translation (Tarteel/Qul, resource 92)

- **Source:** https://qul.tarteel.ai/resources/translation/92
- **License:** Custom (recorded as `LicenseRef-Tarteel-free-use`)
- **Terms:** Free and open to use within the application. No specific license name attributed.
- **Status:** Approved — written permission obtained from the Tarteel Team on 6 May 2026.
- **Proof:** See [Permission record](#tarteel-permission-record) below.

### 4. Quran English Translation — Yusuf Ali (Tarteel/Qul, resource 124)

- **Source:** https://qul.tarteel.ai/resources/translation/124
- **License:** Custom (recorded as `LicenseRef-Tarteel-free-use`)
- **Terms:** Free and open to use within the application. No specific license name attributed.
- **Status:** Approved — written permission obtained from the Tarteel Team on 6 May 2026.
- **Proof:** See [Permission record](#tarteel-permission-record) below.

### 5. everyayah.com Audio

- **Source:** https://everyayah.com
- **Default reciter:** Saad Al-Ghamdi (40 kbps)
- **License:** Described as a public free CDN. No formal license document found.
- **Terms:** Audio is streamed at runtime, not bundled in the repository.
- **Status:** Pending — no formal permission has been requested or obtained. Attribution will be
  provided on the `/credits` page.

## Tarteel permission record

Permission to use Tarteel/Qul resources (including resources 92 and 124) was granted via email on
6 May 2026.

**Email details:**

| Field | Value |
|-------|-------|
| From | Hazem from Tarteel (hazem.talha@tarteel-0494d1bdeb01.intercom-mail.com) |
| To | akashphago88@gmail.com |
| Date | 6 May 2026, 12:18 |
| Subject | Re: 🧠 Other questions |
| Signed by | tarteel-0494d1bdeb01.intercom-mail.com |

**Email body (verbatim):**

> Assalamu Alaikum Akash,
>
> JazakAllahu Khairan for reaching out and for the thoughtful work you're doing on Arabic
> Transliteration, may Allah accept it.
>
> To the best of our knowledge there is no specific license attributed to these resources and any
> others that are unlabeled within QUL. They are free and open to use within your application
> inshallah.
>
> JazakAllahu Khairan,
>
> Tarteel Team

## Machine-readable source of truth

The build pipeline reads license status from
[`data/sources/licenses.json`](../data/sources/licenses.json). That file is the machine-readable
source of truth consumed by the license gate at build time. This document is the human-readable
record with proof and context.

## Related documents

- [adr/0007-data-licensing-strategy.md](adr/0007-data-licensing-strategy.md) — Architectural
  decision on the two-step licensing strategy and its resolution.
- [data-pipeline.md](data-pipeline.md) — Source inventory and attribution requirements.
- [`NOTICE`](../NOTICE) — Root-level attribution file.
