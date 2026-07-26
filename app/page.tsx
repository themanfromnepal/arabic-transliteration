import { IntegratedResultCard } from '@/components/result-card/integrated-result-card';
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
              <h2
                id="results-heading"
                className="text-foreground mt-2 text-2xl font-semibold tracking-tight"
              >
                Fixture-backed integrated result card
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7 sm:text-[0.95rem]">
                This staged slice mounts one composed result card inside the existing search shell.
                Live search execution, real audio playback, and multi-result states remain out of
                scope.
              </p>
            </div>

            <aside className="rounded-2xl border border-dashed border-(--color-accent-border) bg-(--color-accent-tint) px-4 py-3 text-sm text-(--color-fg) lg:max-w-xs">
              Fixture only: the <span aria-hidden="true">/</span> shortcut still focuses search on
              desktop, while live query execution and playback wiring remain out of scope in this
              slice.
            </aside>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <section aria-label="Primary staged result" className="min-h-72">
              <IntegratedResultCard result={lemmaResultCardFixture} />
            </section>

            <aside
              aria-label="Secondary details placeholder"
              className="border-border/80 min-h-72 rounded-2xl border border-dashed bg-(--color-surface-warm-soft) p-5"
            >
              <h3 className="text-foreground text-lg font-medium">Details panel</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Reserved for future supporting metadata, context, and interaction affordances.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
