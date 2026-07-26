import * as React from 'react';

import { cn } from '@/lib/utils';

export const EMPTY_STATE_EXAMPLES = ['rahman', 'kitab', 'salaam', '7abibi'] as const;

type EmptyStateProps = {
  /**
   * Supplied once the SearchBox owns query state (Stage 4.8). Until then the examples render as
   * static samples rather than buttons, because a button that cannot act is worse than plain text.
   */
  onExampleSelect?: (example: string) => void;
  className?: string;
};

const chipClassName =
  'border-border/70 inline-flex items-center rounded-full border bg-[color:var(--color-surface-alt)] px-3.5 py-1.5 text-sm';

export function EmptyState({ onExampleSelect, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="text-xs font-semibold tracking-[0.24em] text-(--color-primary) uppercase">
        Start here
      </p>

      <h3 className="text-foreground text-xl font-semibold tracking-tight">
        Start with a word you have heard
      </h3>

      <p className="text-muted-foreground max-w-prose text-sm leading-6">
        Type it the way it sounds — Roman letters are enough. Arabizi digits work too:{' '}
        <code>7</code> for ح, <code>3</code> for ع, <code>5</code> for خ, and <code>9</code> for ص.
      </p>

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-[0.18em] uppercase">
          Try one of these
        </p>
        <ul className="flex flex-wrap gap-2">
          {EMPTY_STATE_EXAMPLES.map((example) => (
            <li key={example}>
              {onExampleSelect ? (
                <button
                  type="button"
                  onClick={() => onExampleSelect(example)}
                  className={cn(chipClassName, 'hover:bg-primary/10 cursor-pointer')}
                >
                  {example}
                </button>
              ) : (
                <code className={chipClassName}>{example}</code>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
