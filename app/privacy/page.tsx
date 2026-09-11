import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Arabic Transliteration',
  description:
    'Arabic Transliteration has no server, no accounts, and no trackers. This page explains what limited data is stored locally on your device.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <nav className="mb-8">
        <Link
          href="/"
          className="text-sm text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
        >
          ← Home
        </Link>
      </nav>

      <h1 className="text-foreground mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Effective date: to be confirmed before launch
      </p>

      <p className="text-foreground mb-6 text-base leading-7">
        This site has no server, no user accounts, and no trackers. This page explains what limited
        data is stored locally on your device when you use the site.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-(--color-primary)">
        What is stored on your device
      </h2>

      <h3 className="text-foreground mt-5 mb-2 text-base font-semibold">
        Browser localStorage — your preferences only
      </h3>
      <ul className="text-foreground mb-4 list-disc space-y-1 pl-6 text-base leading-7">
        <li>Display theme (light or dark mode)</li>
        <li>Arabic font size (S, M, L, or XL)</li>
      </ul>
      <p className="text-muted-foreground mb-6 text-sm leading-6">
        These are kept so the site looks the same on your next visit and are never sent anywhere.
      </p>

      <h3 className="text-foreground mt-5 mb-2 text-base font-semibold">
        Browser IndexedDB — a local lookup cache
      </h3>
      <p className="text-foreground mb-6 text-base leading-7">
        Quranic lemma entries are saved locally after first lookup so that subsequent lookups are
        faster and work without an internet connection. No personal information is stored in the
        cache.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-(--color-primary)">
        What is not collected
      </h2>
      <ul className="text-foreground mb-6 list-disc space-y-1 pl-6 text-base leading-7">
        <li>No analytics or tracking cookies</li>
        <li>No IP address logging</li>
        <li>No advertising or marketing data</li>
        <li>No cross-site tracking</li>
      </ul>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-(--color-primary)">
        Third-party connections
      </h2>
      <p className="text-foreground mb-4 text-base leading-7">
        When you press the Play button on an audio player, your browser contacts{' '}
        <a
          href="https://everyayah.com"
          className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
          target="_blank"
          rel="noopener noreferrer"
        >
          everyayah.com
        </a>{' '}
        directly to stream the recitation audio. This is the only third-party request the site
        makes, and it happens only on that user action.
      </p>
      <p className="text-foreground mb-6 text-base leading-7">
        All fonts, scripts, and data files are self-hosted. No other external connections are made.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-(--color-primary)">Deleting your data</h2>
      <p className="text-foreground mb-6 text-base leading-7">
        Clear your browser&apos;s site data for this domain to remove all stored preferences and
        cached lookups.
      </p>

      <div className="border-border text-muted-foreground mt-10 border-t pt-6 text-sm leading-6">
        <p>Questions about data practices can be raised via the project repository.</p>
      </div>
    </main>
  );
}
