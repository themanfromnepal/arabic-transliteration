import { ResultsRegion } from '@/components/results/results-region';
import { SearchBox } from '@/components/search-box';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-accent-soft-glow),transparent_28%),linear-gradient(180deg,var(--color-bg-raised)_0%,var(--color-bg)_100%)]">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <SearchBox />

        <section
          aria-labelledby="results-heading"
          className="border-border/80 rounded-[calc(var(--radius)+0.75rem)] border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_92%,transparent),color-mix(in_srgb,var(--color-surface-warm)_88%,transparent))] p-6 shadow-[0_24px_70px_-42px_var(--color-shadow)] sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.24em] text-(--color-primary) uppercase">
                Results region
              </p>
              {/*
                The heading stays stable across every state — empty, loading, no-results, error, and
                the result card are alternate contents of the region below it, not separate screens.
              */}
              <h2
                id="results-heading"
                className="text-foreground mt-2 text-2xl font-semibold tracking-tight"
              >
                Results
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7 sm:text-[0.95rem]">
                This staged slice renders the resolved state from a fixture. Live query execution
                and real audio playback are wired in a later slice, which is what supplies the
                remaining states at runtime.
              </p>
            </div>

            <aside className="rounded-2xl border border-dashed border-(--color-accent-border) bg-(--color-accent-tint) px-4 py-3 text-sm text-(--color-fg) lg:max-w-xs">
              Fixture only: the <span aria-hidden="true">/</span> shortcut still focuses search on
              desktop, while live query execution and playback wiring remain out of scope in this
              slice.
            </aside>
          </div>

          <ResultsRegion
            className="mt-8"
            state={{ kind: 'ready', result: lemmaResultCardFixture }}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
