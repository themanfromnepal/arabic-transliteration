import { FontSizeControl } from '@/components/font-size-control';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  return (
    <header className="border-border/80 border-b bg-[color:var(--color-surface-overlay)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--color-primary)] uppercase">
            Arabic Transliteration
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              Read Quranic Arabic with transliteration support
            </h1>
            <span className="rounded-full border border-[color:var(--color-accent-border)] bg-[color:var(--color-accent-tint)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-accent)]">
              Shell preview
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-[0.95rem]">
            A focused search workspace for Quranic words, verses, and transliteration study.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start">
          <div className="border-border/70 bg-background/70 hidden rounded-xl border p-1 sm:block">
            <FontSizeControl />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
