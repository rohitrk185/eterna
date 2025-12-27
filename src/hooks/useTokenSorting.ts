'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Token, TokenCategory } from '@/types/token';
import { sortTokens } from '@/lib/sort-tokens';

interface UseTokenSortingOptions {
  category: TokenCategory;
}

interface UseTokenSortingReturn {
  sortedTokens: Token[];
  sortConfig: {
    field: string;
    direction: string;
  };
}

/**
 * useTokenSorting hook - Sorting logic for tokens by various fields
 * Integrates with Redux sort slice and returns sorted token array
 * Uses useMemo for performance optimization
 */
export function useTokenSorting(
  tokens: Token[],
  options: UseTokenSortingOptions
): UseTokenSortingReturn {
  const { category } = options;

  // Get sort configuration from Redux
  const sortConfig = useAppSelector(
    (state) => state.sort.sortConfigs[category]
  );

  // Sort tokens based on configuration
  const sortedTokens = useMemo(() => {
    if (tokens.length === 0) {
      return [];
    }

    return sortTokens(tokens, sortConfig);
  }, [tokens, sortConfig]);

  return {
    sortedTokens,
    sortConfig: {
      field: sortConfig.field,
      direction: sortConfig.direction,
    },
  };
}

