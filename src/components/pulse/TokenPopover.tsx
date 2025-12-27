'use client';

import React, { memo } from 'react';
import { Token } from '@/types/token';
import { useAppSelector } from '@/store/hooks';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatPrice, formatPercentage, formatCompactNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TokenPopoverProps {
  children: React.ReactNode;
  token: Token | null;
}

/**
 * TokenPopover component - Quick token details on hover
 * Shows price, 24h change, volume, and market cap
 */
const TokenPopover = memo(({ children, token }: TokenPopoverProps) => {
  const isPopoverOpen = useAppSelector((state) => state.ui.isPopoverOpen);
  const popoverToken = useAppSelector((state) => state.ui.popoverToken);

  // Only show popover if token matches
  const shouldShow = isPopoverOpen && popoverToken?.id === token?.id;

  if (!token) {
    return <>{children}</>;
  }

  const priceChangeColor =
    token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Popover open={shouldShow}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
        side="right"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          {/* Token Header */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {token.symbol.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{token.name}</h4>
              <p className="text-xs text-muted-foreground">{token.symbol}</p>
            </div>
          </div>

          {/* Price Info */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Price</span>
              <span className="text-sm font-medium">${formatPrice(token.price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">24h Change</span>
              <span className={cn('text-xs font-medium', priceChangeColor)}>
                {formatPercentage(token.priceChange24h)}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Market Cap</span>
              <span className="text-xs font-medium">
                ${formatCompactNumber(token.marketCap)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">24h Volume</span>
              <span className="text-xs font-medium">
                ${formatCompactNumber(token.volume)}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Transactions</span>
              <span className="font-medium">TX {token.transactionCount}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

TokenPopover.displayName = 'TokenPopover';

export default TokenPopover;

