'use client';

import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TokenCardSkeletonProps {
  className?: string;
  showRatios?: boolean;
  showProgressBar?: boolean;
}

/**
 * TokenCardSkeleton component - Loading skeleton matching TokenCard layout
 * Includes shimmer effect for smooth loading experience
 */
const TokenCardSkeleton = memo(
  ({ className, showRatios = true, showProgressBar = true }: TokenCardSkeletonProps) => {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-3',
          className
        )}
      >
        {/* Token Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Token Image Skeleton */}
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />

            {/* Token Name and Info Skeleton */}
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-24 mb-1.5" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Price and Change Skeleton */}
          <div className="flex flex-col items-end ml-2 gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        {/* Metrics Row Skeleton */}
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Ratios Row Skeleton */}
        {showRatios && (
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        )}

        {/* Fee Factor and Transaction Count Skeleton */}
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Pump Address Skeleton */}
        <Skeleton className="h-3 w-32 mb-2" />

        {/* Progress Bar Skeleton */}
        {showProgressBar && (
          <div className="flex items-center gap-0.5 h-2 w-full rounded-full bg-muted overflow-hidden">
            <Skeleton className="h-full w-[20%] rounded-none" />
            <Skeleton className="h-full w-[15%] rounded-none" />
            <Skeleton className="h-full w-[30%] rounded-none" />
            <Skeleton className="h-full w-[10%] rounded-none" />
            <Skeleton className="h-full w-[25%] rounded-none" />
          </div>
        )}
      </div>
    );
  }
);

TokenCardSkeleton.displayName = 'TokenCardSkeleton';

export default TokenCardSkeleton;

