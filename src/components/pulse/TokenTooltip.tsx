'use client';

import React, { memo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TokenTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

/**
 * TokenTooltip component - Additional info for icons/metrics
 * Wraps any element with a tooltip showing additional information
 */
const TokenTooltip = memo(
  ({
    children,
    content,
    side = 'top',
    delayDuration = 300,
  }: TokenTooltipProps) => {
    return (
      <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side={side}>
            {typeof content === 'string' ? <p>{content}</p> : content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

TokenTooltip.displayName = 'TokenTooltip';

export default TokenTooltip;

