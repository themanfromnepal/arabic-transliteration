import * as React from 'react';
import { cn } from '@/lib/utils';

// skeleton-block (globals.css) is the approved gradient sweep from design.html section 12.4. The
// shadcn default was `animate-pulse`, which is not the specified loading affordance.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('skeleton-block rounded-md', className)} {...props} />
  );
}

export { Skeleton };
