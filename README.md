# Arabic Transliteration

A free and open-source static site that helps English speakers learn to read and understand the
Quran. A learner types phonetic English (for example, "rahman") and receives the Uthmani script, a
scholarly transliteration, English word meaning, root letters, verse occurrences by sura:ayah, and
audio pronunciation. The project is MIT-licensed and built as a pure static site so that it remains
fast, private, and offline-capable after first use.

## Quickstart

```bash
nvm use
npm install
npm run dev
```

To preview the production build (static export):

```bash
npm run build
npx serve out
```

> Note: `npm start` does not work because the site is exported as a static bundle.

Optional one-time setup for end-to-end tests:

```bash
npx playwright install
```

## Documentation

See [docs/README.md](docs/README.md) for the full documentation map (vision, spec, architecture,
data pipeline, roadmap, etc.).

## License

MIT — see [LICENSE](LICENSE).
