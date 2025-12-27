'use client';

import React, { memo } from 'react';
import { ProgressSegment } from '@/types/token';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  segments: ProgressSegment[];
  className?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

/**
 * ProgressBar component - Multi-segment horizontal progress bar
 * Each segment can show percentage or duration
 * Active segments are green, inactive are gray
 */
const ProgressBar = memo(
  ({ segments, className, height = 'md', showLabels = false }: ProgressBarProps) => {
    if (segments.length === 0) {
      return null;
    }

    const heightClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    // Calculate total percentage to ensure segments don't exceed 100%
    const totalPercentage = segments.reduce((sum, segment) => {
      const value =
        typeof segment.value === 'number'
          ? segment.value
          : parseFloat(segment.value.toString().replace('%', '')) || 0;
      return sum + Math.min(100, Math.max(0, value));
    }, 0);

    // Normalize if total exceeds 100%
    const normalizationFactor = totalPercentage > 100 ? 100 / totalPercentage : 1;

    return (
      <div className={cn('flex items-center gap-0.5 w-full rounded-full bg-muted overflow-hidden', className)}>
        {segments.map((segment, index) => {
          const value =
            typeof segment.value === 'number'
              ? segment.value
              : parseFloat(segment.value.toString().replace('%', '')) || 0;

          const normalizedValue = value * normalizationFactor;
          const width = `${Math.min(100, Math.max(0, normalizedValue))}%`;

          const segmentTitle = `${segment.value}${
            typeof segment.value === 'number' ? '%' : ''
          }${segment.isActive ? ' (Active)' : ' (Inactive)'}`;

          return (
            <div
              key={index}
              className={cn(
                'transition-all duration-300 ease-in-out',
                heightClasses[height],
                segment.isActive
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/20'
              )}
              style={{ width }}
              title={segmentTitle}
              role="progressbar"
              aria-valuenow={normalizedValue}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={segmentTitle}
            >
              {showLabels && normalizedValue > 5 && (
                <span className="text-[10px] text-white px-1 truncate flex items-center h-full">
                  {segment.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

