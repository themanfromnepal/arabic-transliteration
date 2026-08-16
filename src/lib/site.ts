/**
 * Canonical site identity, shared by the metadata export, the sitemap, and robots.
 *
 * The production domain is still a placeholder across the docs, so it comes from the environment
 * with a localhost fallback rather than being hardcoded. Set `NEXT_PUBLIC_SITE_URL` in the
 * deployment before launch, otherwise absolute URLs in OpenGraph tags and the sitemap will point at
 * localhost.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

export const SITE_NAME = 'Arabic Transliteration';

export const SITE_TITLE = 'Arabic Transliteration — Quranic Phonetic Search';

export const SITE_DESCRIPTION =
  'Type phonetic English to find any Quranic word in Uthmani script, with meaning, root letters, verse occurrences, and audio pronunciation.';

/** Every route in the static export. Kept here so the sitemap cannot drift from the app. */
export const SITE_ROUTES = ['/', '/about', '/credits', '/privacy'] as const;
