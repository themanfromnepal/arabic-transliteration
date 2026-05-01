# Vision

## Problem

Many English speakers want to read and understand the Quran in its original Arabic but lack the
foundation to decode the Uthmani script or to map an Arabic word they have heard to its written
form. Existing resources tend to assume prior literacy in the Arabic script, focus on full
translations rather than word-level understanding, or bury essential information such as root
letters and verse occurrences inside heavyweight tools. The result is a literacy gap: learners can
recognize a few words by sound but cannot connect those words to script, meaning, or location in
the Quran.

## Mission

Help English speakers bridge sound and script by turning phonetic English into accurate Quranic
Arabic with word-level meaning, root letters, occurrences, and audio in a single result card.

## Target users

- New convert who has memorized short suras phonetically and wants to start reading the Uthmani
  script with confidence.
- Second-generation learner who grew up hearing Quranic recitation at home but never built fluent
  Arabic literacy and now wants to study independently.
- Curious student or researcher who encounters a Quranic term in conversation or reading and wants
  a fast, accurate lookup with context.

## Non-goals

- Not a translation tool (transliteration and per-lemma meaning only).
- Not a general Arabic dictionary; scope is Quranic vocabulary as defined in [spec.md](spec.md).
- Not a Quran-reading interface in v1.
- Other deferred capabilities are catalogued in [roadmap.md](roadmap.md#deferred-features-post-v1).

## Guiding principles

- Free and open-source under the MIT license.
- Reverent in tone, typography, and visual design.
- Accurate, with sources cited and curation traceable.
- Fast, with a static site that works on modest hardware and slow networks.
- Accessible, with full keyboard support, semantic markup, and high-contrast modes.
- Offline-capable after first use through an app shell service worker precache and an IndexedDB cache for lemma data.
- No tracking; analytics are limited to privacy-respecting aggregate measurement.

## Success signals (qualitative)

- Learners report being able to map a remembered sound to the correct Uthmani spelling without
  guessing.
- Learners begin recognizing shared root letters across related lemmas during everyday use.
- Reviewers can verify the result card contents against cited sources without ambiguity.
- The site feels calm and reverent, encouraging slow, repeated study rather than rapid scanning.
- Users return to the site for repeat lookups, including from offline contexts after first visit.

Numeric performance targets live in [performance.md](performance.md).
