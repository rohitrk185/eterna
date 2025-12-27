'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { TokenCategory, SortField } from '@/types/token';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSortField } from '@/store/slices/sortSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColumnHeaderProps {
  category: TokenCategory;
  count?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  onFilterClick?: () => void;
}

// Icon components
const LightningIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const SortUpIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const SortDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const categoryLabels: Record<TokenCategory, string> = {
  'new-pairs': 'New Pairs',
  'final-stretch': 'Final Stretch',
  migrated: 'Migrated',
};

/**
 * ColumnHeader component - Header for each token column
 * Includes title, count, pagination, filter, and sort controls
 */
const ColumnHeader = memo(
  ({
    category,
    count = 0,
    onPageChange,
    currentPage = 1,
    onFilterClick,
  }: ColumnHeaderProps) => {
    const dispatch = useAppDispatch();
    const sortConfig = useAppSelector(
      (state) => state.sort.sortConfigs[category]
    );

    // Memoized handlers
    const handleSortClick = useCallback((field: SortField) => {
      dispatch(setSortField({ category, field }));
    }, [dispatch, category]);

    const handlePageChange = useCallback((page: number) => {
      onPageChange?.(page);
    }, [onPageChange]);

    // Memoized values
    const categoryLabel = useMemo(() => categoryLabels[category], [category]);

    return (
      <div className="flex flex-col gap-2 p-3 border-b border-border bg-card">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {categoryLabel}
            </h2>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Lightning icon with count */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <LightningIcon className="h-4 w-4" />
              <span className="text-xs">{count}</span>
            </div>

            {/* Menu icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="View options"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Secondary Row: P1/P2/P3 and Sort/Filter */}
        <div className="flex items-center justify-between">
          {/* P1/P2/P3 Pagination */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
              >
                P{page}
              </Button>
            ))}
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-1">
            {/* Sort Controls */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleSortClick('price')}
                title="Sort by price ascending"
                aria-label="Sort by price ascending"
                aria-pressed={sortConfig.field === 'price' && sortConfig.direction === 'asc'}
              >
                <SortUpIcon
                  className={cn(
                    'h-3 w-3',
                    sortConfig.field === 'price' && sortConfig.direction === 'asc'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleSortClick('price')}
                title="Sort by price descending"
                aria-label="Sort by price descending"
                aria-pressed={sortConfig.field === 'price' && sortConfig.direction === 'desc'}
              >
                <SortDownIcon
                  className={cn(
                    'h-3 w-3',
                    sortConfig.field === 'price' && sortConfig.direction === 'desc'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
            </div>

            {/* Filter Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onFilterClick}
              aria-label="Filter"
              title="Filter"
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ColumnHeader.displayName = 'ColumnHeader';

export default ColumnHeader;

