import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/credits', label: 'Credits' },
  { href: '/privacy', label: 'Privacy' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border/80 border-t bg-[color:var(--color-surface-overlay)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">
          Built for focused Quranic reading, transliteration, and vocabulary study.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground underline-offset-4 transition-colors hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
