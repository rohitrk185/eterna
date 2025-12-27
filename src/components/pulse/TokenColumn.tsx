'use client';

import React, { memo, useMemo, useState } from 'react';
import { Token, TokenCategory } from '@/types/token';
import { useAppSelector } from '@/store/hooks';
import { sortTokens } from '@/lib/sort-tokens';
import ColumnHeader from './ColumnHeader';
import TokenCard from './TokenCard';
import TokenCardSkeleton from './TokenCardSkeleton';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { cn } from '@/lib/utils';

interface TokenColumnProps {
  category: TokenCategory;
  tokens: Token[];
  isLoading?: boolean;
  className?: string;
  onFilterClick?: () => void;
}

/**
 * TokenColumn component - Wraps ColumnHeader and list of TokenCards
 * Handles sorting, pagination, and scrollable container
 */
const TokenColumn = memo(
  ({ category, tokens, isLoading = false, className, onFilterClick }: TokenColumnProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20; // Number of tokens per page

    // Get sort configuration from Redux
    const sortConfig = useAppSelector(
      (state) => state.sort.sortConfigs[category]
    );

    // Sort tokens based on configuration
    const sortedTokens = useMemo(() => {
      return sortTokens(tokens, sortConfig);
    }, [tokens, sortConfig]);

    // Paginate tokens
    const paginatedTokens = useMemo(() => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return sortedTokens.slice(startIndex, endIndex);
    }, [sortedTokens, currentPage, pageSize]);

    // Calculate total pages
    const totalPages = Math.ceil(sortedTokens.length / pageSize);

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        // Scroll to top of column when page changes
        const columnElement = document.getElementById(`column-${category}`);
        if (columnElement) {
          columnElement.scrollTop = 0;
        }
      }
    };

    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col h-full border border-border rounded-lg bg-card">
            <ColumnHeader
              category={category}
              count={0}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onFilterClick={onFilterClick}
            />
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Error loading tokens. Please try again.
              </p>
            </div>
          </div>
        }
      >
        <div
          id={`column-${category}`}
          className={cn(
            'flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden',
            className
          )}
        >
          <ColumnHeader
            category={category}
            count={tokens.length}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onFilterClick={onFilterClick}
          />

          {/* Scrollable token list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <TokenCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : paginatedTokens.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  No tokens available
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {paginatedTokens.map((token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination info (optional, can be hidden) */}
          {totalPages > 1 && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
              Page {currentPage} of {totalPages} ({sortedTokens.length} tokens)
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }
);

TokenColumn.displayName = 'TokenColumn';

export default TokenColumn;

