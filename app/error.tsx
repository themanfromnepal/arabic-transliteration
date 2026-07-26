'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-accent-soft-glow),transparent_28%),linear-gradient(180deg,var(--color-bg-raised)_0%,var(--color-bg)_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="border-border/80 bg-card/95 w-full rounded-[calc(var(--radius)+0.75rem)] border p-8 shadow-[0_24px_70px_-42px_var(--color-shadow)] sm:p-10">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--color-primary)] uppercase">
            Shell error
          </p>
          <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-[0.95rem]">
            The page shell hit an unexpected error. Try rendering this route again.
          </p>
          <div className="mt-6">
            <Button type="button" size="lg" className="rounded-xl px-5" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
