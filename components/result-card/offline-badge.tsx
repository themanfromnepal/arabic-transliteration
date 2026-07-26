'use client';

import { WifiOff } from 'lucide-react';
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type OfflineBadgeProps = {
  className?: string;
};

/**
 * Discreet confirmation that a result was served from the on-device dictionary cache.
 *
 * Deliberately not a live region: it accompanies a result rather than announcing one, so it must
 * not fire its own announcement on every cache hit. It carries the visible word "Offline" as well
 * as the icon, so the meaning survives without colour or the tooltip. Its absence carries no
 * meaning — a network-served result simply omits it rather than showing an "online" counterpart.
 *
 * The provider is local to the badge so the component works wherever it is composed, without
 * callers having to remember app-level tooltip setup.
 */
export function OfflineBadge({ className }: OfflineBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn(
              'border-border/60 inline-flex items-center gap-1.5 rounded-full border bg-[color:var(--color-success-fg)] px-2.5 py-1 text-sm text-[color:var(--color-success-strong)]',
              className,
            )}
          >
            <WifiOff aria-hidden className="size-4" />
            Offline copy
          </span>
        </TooltipTrigger>
        <TooltipContent>Served from the dictionary saved on this device.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
