import { SearchExperience } from '@/components/search-experience';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-accent-soft-glow),transparent_28%),linear-gradient(180deg,var(--color-bg-raised)_0%,var(--color-bg)_100%)]">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <SearchExperience />
      </main>

      <SiteFooter />
    </div>
  );
}
