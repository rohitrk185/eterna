'use client';

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { Token } from '@/types/token';
import { useAppDispatch } from '@/store/hooks';
import { openModal, openPopover, setHoveredToken } from '@/store/slices/uiSlice';
import { formatCompactNumber, formatPrice, formatPercentage, truncateAddress } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import ProgressBar from './ProgressBar';
import TokenPopover from './TokenPopover';

interface TokenCardProps {
  token: Token;
  onHover?: (token: Token | null) => void;
}

/**
 * TokenCard component - displays individual token information
 * Matches Axiom Trade's token card design
 */
const TokenCard = memo(({ token, onHover }: TokenCardProps) => {
  const dispatch = useAppDispatch();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    dispatch(openModal(token));
  };

  const handleMouseEnter = () => {
    dispatch(setHoveredToken(token));
    dispatch(openPopover(token));
    onHover?.(token);
  };

  const handleMouseLeave = () => {
    dispatch(setHoveredToken(null));
    onHover?.(null);
  };

  // Determine price change color
  const priceChangeColor =
    token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <TokenPopover token={token}>
      <div
        className="group relative cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
      {/* Token Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Token Image */}
          <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-muted">
            {token.imageUrl && !imageError ? (
              <Image
                src={token.imageUrl}
                alt={token.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                {token.symbol.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Token Name and Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-foreground truncate">
                {token.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{token.timeAgo}</span>
              {token.countdown && (
                <span className="text-red-500 font-mono">{token.countdown}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price and Change */}
        <div className="flex flex-col items-end ml-2">
          <div className="text-sm font-medium text-foreground">
            ${formatPrice(token.price)}
          </div>
          <div className={cn('text-xs', priceChangeColor)}>
            {formatPercentage(token.priceChange24h)}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
        <span>MC ${formatCompactNumber(token.marketCap)}</span>
        <span>V ${formatCompactNumber(token.volume)}</span>
      </div>

      {/* Ratios Row */}
      {token.ratios.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          {token.ratios.map((ratio, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium"
              title={`${ratio.active}/${ratio.total}`}
            >
              {ratio.active}/{ratio.total}
            </div>
          ))}
        </div>
      )}

      {/* Fee Factor and Transaction Count */}
      <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
        <span>F= {token.feeFactor.toFixed(3)}</span>
        <span>TX {token.transactionCount}</span>
      </div>

      {/* Pump Address */}
      <div className="text-xs text-muted-foreground mb-2 truncate">
        {truncateAddress(token.pumpAddress)}
      </div>

      {/* Progress Bar */}
      {token.progressSegments.length > 0 && (
        <ProgressBar segments={token.progressSegments} height="md" />
      )}
      </div>
    </TokenPopover>
  );
});

TokenCard.displayName = 'TokenCard';

export default TokenCard;

