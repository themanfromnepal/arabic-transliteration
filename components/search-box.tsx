'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export function SearchBox() {
  useSearchShortcut('home-search');

  return (
    <section
      aria-labelledby="search-heading"
      className="border-border/80 bg-card/95 rounded-[calc(var(--radius)+0.5rem)] border p-5 shadow-[0_24px_60px_-36px_var(--color-shadow)] sm:p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--color-primary)] uppercase">
            Search workspace
          </p>
          <div>
            <h2
              id="search-heading"
              className="text-foreground text-2xl font-semibold tracking-tight"
            >
              Search Quranic words and verses
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-[0.95rem]">
              The search interactions will be wired in a later phase. This shell establishes the
              layout, semantics, and visual framing.
            </p>
          </div>
        </div>

        <form
          role="search"
          aria-label="Quran search"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label htmlFor="home-search" className="sr-only">
            Search Quranic Arabic, transliteration, or translation
          </label>
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="home-search"
              type="search"
              placeholder="Search will be enabled in the next slice"
              autoComplete="off"
              aria-keyshortcuts="/"
              className="border-border/80 bg-background/80 h-12 rounded-xl pl-10 text-base shadow-none md:text-base"
            />
          </div>
          <Button type="submit" size="lg" className="min-w-32 rounded-xl px-5" disabled>
            Search
          </Button>
        </form>

        <div className="text-muted-foreground grid gap-3 text-sm sm:grid-cols-3">
          <div className="border-border/70 rounded-xl border border-dashed bg-[color:var(--color-surface-warm-soft)] px-3 py-2.5">
            Arabic lemmas and verse lookup
          </div>
          <div className="border-border/70 rounded-xl border border-dashed bg-[color:var(--color-surface-warm-soft)] px-3 py-2.5">
            Transliteration and translation views
          </div>
          <div className="border-border/70 rounded-xl border border-dashed bg-[color:var(--color-surface-warm-soft)] px-3 py-2.5">
            Results shell reserved below
          </div>
        </div>
      </div>
    </section>
  );
}
