'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeModal } from '@/store/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';
import {
  formatPrice,
  formatPercentage,
  formatCompactNumber,
  truncateAddress,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * TokenModal component - Full token details on click
 * Shows all metrics, progress bar, and actions
 */
const TokenModal = memo(() => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isModalOpen);
  const token = useAppSelector((state) => state.ui.selectedToken);

  const handleClose = () => {
    dispatch(closeModal());
  };

  if (!token) {
    return null;
  }

  const priceChangeColor =
    token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Token Image */}
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {token.imageUrl ? (
                <Image
                  src={token.imageUrl}
                  alt={`${token.name} logo`}
                  fill
                  sizes="48px"
                  className="object-cover"
                  loading="eager"
                  quality={90}
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium">
                  {token.symbol.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{token.name}</DialogTitle>
              <DialogDescription>{token.symbol}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-2xl font-bold">${formatPrice(token.price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Change</p>
              <p className={cn('text-2xl font-bold', priceChangeColor)}>
                {formatPercentage(token.priceChange24h)}
              </p>
            </div>
          </div>

          {/* Market Data Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-lg font-semibold">
                ${formatCompactNumber(token.marketCap)}
              </p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="text-lg font-semibold">
                ${formatCompactNumber(token.volume)}
              </p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fee Factor</p>
              <p className="text-lg font-semibold">F= {token.feeFactor.toFixed(3)}</p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Transactions</p>
              <p className="text-lg font-semibold">TX {token.transactionCount}</p>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Listed: </span>
              <span className="font-medium">{token.timeAgo} ago</span>
            </div>
            {token.countdown && (
              <div>
                <span className="text-muted-foreground">Countdown: </span>
                <span className="font-mono text-red-500">{token.countdown}</span>
              </div>
            )}
          </div>

          {/* Ratios */}
          {token.ratios.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ratios</p>
              <div className="flex items-center gap-2">
                {token.ratios.map((ratio, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium"
                    title={`${ratio.active}/${ratio.total}`}
                  >
                    {ratio.active}/{ratio.total}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pump Address */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pump Address</p>
            <p className="text-sm font-mono break-all">{token.pumpAddress}</p>
            <p className="text-xs text-muted-foreground mt-1">
              (Display: {truncateAddress(token.pumpAddress)})
            </p>
          </div>

          {/* Progress Bar */}
          {token.progressSegments.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Progress</p>
              <ProgressBar segments={token.progressSegments} height="md" />
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {token.progressSegments.map((segment, index) => (
                  <span key={index}>
                    {segment.value}
                    {typeof segment.value === 'number' ? '%' : ''}{' '}
                    {segment.isActive ? '(Active)' : '(Inactive)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <Button variant="default" className="flex-1">
              View on Explorer
            </Button>
            <Button variant="outline" className="flex-1">
              Add to Watchlist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TokenModal.displayName = 'TokenModal';

export default TokenModal;

