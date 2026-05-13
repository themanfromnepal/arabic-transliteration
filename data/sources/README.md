# Phase 1 Data Sources

Upstream source files used by the data pipeline. All source files are committed to this repository with verified SHA-256 checksums.

## Sources

> Machine-readable source-of-truth: [`licenses.json`](licenses.json) (consumed by the build pipeline).

| Filename                            | Upstream URL                                     | Version                                                    | License                                             | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| `quran-uthmani.txt`                 | https://tanzil.net/download/                     | Tanzil Uthmani v1.1 (minimal, no pause/sajdah/rub-el-hizb) | CC-BY-ND 4.0                                        | `f9a45b967b4b3407d0c7ca97ac122bbc8afb2d005b0af81e3a0a2c07d64fa94f` |
| `quranic-corpus-morphology-0.4.txt` | https://corpus.quran.com/download/               | Quranic Arabic Corpus v0.4 (Kais Dukes)                    | LicenseRef-QAC-0.4 (custom, see docs/licensing.md)  | `910b721a8f04f4334ac5d4c62b19e858f5d720c525bb975f2e750ea2c6bb532d` |
| `english-wbw-translation.json`      | https://qul.tarteel.ai/resources/translation/92  | current                                                    | LicenseRef-Tarteel-free-use (see docs/licensing.md) | `42992eec66ae5dd98659cda9bff9d350def46d953edb2622a8e3a444d56313b9` |
| `quran-en-yusufali-simple.json`     | https://qul.tarteel.ai/resources/translation/124 | current                                                    | LicenseRef-Tarteel-free-use (see docs/licensing.md) | `ebcdfb71089b74c7d46acd2152471fdd33b686f57c984a055f6a958b844ef9db` |

## Re-acquisition

- **`quran-uthmani.txt`** — Visit https://tanzil.net/download/, select **Uthmani** script, version **1.1**, text type **Minimal** (uncheck pause marks, sajdah signs, and rub-el-hizb), download as plain text, and save as `quran-uthmani.txt`.
- **`quranic-corpus-morphology-0.4.txt`** — Visit https://corpus.quran.com/download/, download the **Quranic Arabic Corpus morphology** archive (v0.4), extract the morphology text file, and save as `quranic-corpus-morphology-0.4.txt`.
- **`english-wbw-translation.json`** — Visit https://qul.tarteel.ai/resources/translation/92, export the resource as JSON, and save as `english-wbw-translation.json`.
- **`quran-en-yusufali-simple.json`** — Visit https://qul.tarteel.ai/resources/translation/124, export the resource as JSON, and save as `quran-en-yusufali-simple.json`.
