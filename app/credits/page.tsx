import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Credits — Arabic Transliteration',
  description:
    'Data sources, fonts, libraries, and permissions that make Arabic Transliteration possible.',
};

export default function CreditsPage() {
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

      <h1 className="text-foreground mb-6 text-3xl font-bold">Credits</h1>

      <p className="text-foreground mb-8 text-base leading-7">
        This project is built on data and tools from the following sources. We are grateful to each
        of the teams and individuals who made their work available.
      </p>

      {/* Quranic Text */}
      <section aria-labelledby="credit-quran-text" className="mb-8">
        <h2
          id="credit-quran-text"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Quranic Text
        </h2>
        <dl className="text-foreground space-y-1 text-base leading-7">
          <dt className="font-medium">Tanzil Quran Text — Uthmani Script (v1.1)</dt>
          <dd className="text-muted-foreground pl-4 text-sm">
            © Tanzil Project —{' '}
            <a
              href="https://creativecommons.org/licenses/by-nd/4.0/"
              className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC-BY-ND 4.0
            </a>{' '}
            —{' '}
            <a
              href="https://tanzil.net"
              className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
              target="_blank"
              rel="noopener noreferrer"
            >
              tanzil.net
            </a>
          </dd>
        </dl>
      </section>

      {/* Morphological Data */}
      <section aria-labelledby="credit-morphology" className="mb-8">
        <h2
          id="credit-morphology"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Morphological Data
        </h2>
        <dl className="text-foreground space-y-1 text-base leading-7">
          <dt className="font-medium">Quranic Arabic Corpus (v0.4)</dt>
          <dd className="text-muted-foreground pl-4 text-sm">
            © Kais Dukes, 2011. Custom license — use in any website or application with attribution;
            verbatim copying permitted; modification of the source file is not permitted.{' '}
            <a
              href="https://corpus.quran.com"
              className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
              target="_blank"
              rel="noopener noreferrer"
            >
              corpus.quran.com
            </a>
          </dd>
        </dl>
      </section>

      {/* Translations */}
      <section aria-labelledby="credit-translations" className="mb-8">
        <h2
          id="credit-translations"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Translations
        </h2>
        <dl className="text-foreground space-y-4 text-base leading-7">
          <div>
            <dt className="font-medium">English Word-by-Word Translation</dt>
            <dd className="text-muted-foreground pl-4 text-sm">
              Tarteel / Qul (resource 92). Free and open to use. Written permission granted by the
              Tarteel Team, 6 May 2026.{' '}
              <a
                href="https://qul.tarteel.ai"
                className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
                target="_blank"
                rel="noopener noreferrer"
              >
                qul.tarteel.ai
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium">Quran English Translation — Yusuf Ali</dt>
            <dd className="text-muted-foreground pl-4 text-sm">
              Tarteel / Qul (resource 124). Free and open to use. Written permission granted by the
              Tarteel Team, 6 May 2026.{' '}
              <a
                href="https://qul.tarteel.ai"
                className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
                target="_blank"
                rel="noopener noreferrer"
              >
                qul.tarteel.ai
              </a>
            </dd>
          </div>
        </dl>
      </section>

      {/* Audio */}
      <section aria-labelledby="credit-audio" className="mb-8">
        <h2
          id="credit-audio"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Audio
        </h2>
        <dl className="text-foreground space-y-1 text-base leading-7">
          <dt className="font-medium">
            Saad Al-Ghamdi (40 kbps) via everyayah.com{' '}
            <span className="ml-1 rounded bg-(--color-accent-tint) px-1.5 py-0.5 text-xs font-normal text-(--color-primary)">
              permission pending
            </span>
          </dt>
          <dd className="text-muted-foreground pl-4 text-sm">
            Per-ayah recitation audio, streamed on demand when you press Play.{' '}
            <a
              href="https://everyayah.com"
              className="text-(--color-primary) underline underline-offset-2 hover:text-(--color-primary-strong)"
              target="_blank"
              rel="noopener noreferrer"
            >
              everyayah.com
            </a>
          </dd>
        </dl>
      </section>

      {/* Fonts */}
      <section aria-labelledby="credit-fonts" className="mb-8">
        <h2
          id="credit-fonts"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Fonts
        </h2>
        <dl className="text-foreground space-y-3 text-base leading-7">
          <div>
            <dt className="font-medium">Amiri</dt>
            <dd className="text-muted-foreground pl-4 text-sm">
              Designed by Khaled Hosny. SIL Open Font License.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Scheherazade New</dt>
            <dd className="text-muted-foreground pl-4 text-sm">
              Designed by SIL International. SIL Open Font License.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Inter</dt>
            <dd className="text-muted-foreground pl-4 text-sm">
              Designed by Rasmus Andersson. SIL Open Font License.
            </dd>
          </div>
        </dl>
      </section>

      {/* Libraries */}
      <section aria-labelledby="credit-libraries" className="mb-8">
        <h2
          id="credit-libraries"
          className="mb-4 text-lg font-semibold tracking-wide text-(--color-primary) uppercase"
        >
          Libraries and Framework
        </h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-6 text-sm leading-7">
          <li>Fuse.js — fuzzy search</li>
          <li>Next.js — static site framework</li>
          <li>React — UI components</li>
          <li>Tailwind CSS — utility-first styling</li>
          <li>shadcn/ui — accessible UI primitives</li>
          <li>Lucide React — icons</li>
          <li>idb-keyval — IndexedDB offline cache</li>
        </ul>
      </section>

      {/* License record */}
      <section aria-labelledby="credit-license-record" className="border-border border-t pt-6">
        <h2
          id="credit-license-record"
          className="mb-2 text-sm font-semibold text-(--color-primary)"
        >
          Full license record
        </h2>
        <p className="text-muted-foreground text-sm leading-6">
          The complete license record, including proof of permissions and SHA-256 checksums for all
          source files, is maintained in{' '}
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">docs/licensing.md</code>{' '}
          and{' '}
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
            data/sources/licenses.json
          </code>{' '}
          in the project repository.
        </p>
      </section>
    </main>
  );
}
