# Phase 1 Data Sources

Upstream source files used by the data pipeline. **All files in this directory (except this README and `.gitkeep`) are gitignored and must be acquired locally.** SHA-256 values will be filled in after first acquisition.

## Sources

| Filename                            | Upstream URL                                     | Version                                                    | License                                     | SHA-256 |
| ----------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------- | ------- |
| `quran-uthmani.txt`                 | https://tanzil.net/download/                     | Tanzil Uthmani v1.1 (minimal, no pause/sajdah/rub-el-hizb) | CC-BY-ND 4.0                                | `TBD`   |
| `quranic-corpus-morphology-0.4.txt` | https://corpus.quran.com/download/               | Quranic Arabic Corpus v0.4 (Kais Dukes)                    | GPL                                         | `TBD`   |
| `english-wbw-translation.json`      | https://qul.tarteel.ai/resources/translation/92  | current                                                    | License PENDING (Tarteel — request emailed) | `TBD`   |
| `quran-en-yusufali-simple.json`     | https://qul.tarteel.ai/resources/translation/124 | current                                                    | License PENDING (Tarteel — request emailed) | `TBD`   |

## Re-acquisition

- **`quran-uthmani.txt`** — Visit https://tanzil.net/download/, select **Uthmani** script, version **1.1**, text type **Minimal** (uncheck pause marks, sajdah signs, and rub-el-hizb), download as plain text, and save as `quran-uthmani.txt`.
- **`quranic-corpus-morphology-0.4.txt`** — Visit https://corpus.quran.com/download/, download the **Quranic Arabic Corpus morphology** archive (v0.4), extract the morphology text file, and save as `quranic-corpus-morphology-0.4.txt`.
- **`english-wbw-translation.json`** — Visit https://qul.tarteel.ai/resources/translation/92, export the resource as JSON, and save as `english-wbw-translation.json`.
- **`quran-en-yusufali-simple.json`** — Visit https://qul.tarteel.ai/resources/translation/124, export the resource as JSON, and save as `quran-en-yusufali-simple.json`.

After acquiring each file, compute its SHA-256 and update the table above.
