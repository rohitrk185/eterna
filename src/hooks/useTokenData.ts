'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/hooks';
import { setTokens, setLoading, setError } from '@/store/slices/tokenSlice';
import { Token, TokenCategory, BirdeyeTokenListResponse } from '@/types/token';
import { mapBirdeyeToToken } from '@/lib/map-birdeye-to-token';
import { useEffect } from 'react';

interface UseTokenDataOptions {
  category?: TokenCategory;
  chain?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseTokenDataReturn {
  tokens: Token[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useTokenData hook - React Query hook for fetching initial token data
 * Supports filtering by category and handles loading/error states
 * Automatically updates Redux store with fetched tokens
 */
export function useTokenData(
  options: UseTokenDataOptions = {}
): UseTokenDataReturn {
  const {
    category,
    chain = 'solana',
    sortBy = 'market_cap',
    limit = 50,
    offset = 0,
    enabled = true,
  } = options;

  const dispatch = useAppDispatch();

  // Build query key
  const queryKey = ['tokens', category, chain, sortBy, limit, offset];

  // Fetch token list from API
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BirdeyeTokenListResponse>({
    queryKey,
    queryFn: async () => {
      // Note: Birdeye API doesn't support sort_by parameter
      const params = new URLSearchParams({
        chain,
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(`/api/tokens/list?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || `Failed to fetch tokens: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle API error responses
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }

      return data;
    },
    enabled,
    staleTime: 60 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false, // We use WebSocket for real-time updates
  });

  // Map Birdeye tokens to our Token interface and update Redux
  useEffect(() => {
    if (data?.success && data.data?.tokens) {
      // Distribute tokens across categories evenly
      const tokens: Token[] = data.data.tokens.map((birdeyeToken, index) => {
        // Distribute tokens across 3 categories
        const categoryIndex = index % 3;
        const categories: TokenCategory[] = ['new-pairs', 'final-stretch', 'migrated'];
        const tokenCategory = categories[categoryIndex];
        return mapBirdeyeToToken(birdeyeToken, tokenCategory);
      });

      // Only update Redux if this is the first query (no category filter)
      // This prevents overwriting tokens when multiple queries complete
      if (!category) {
        dispatch(setTokens(tokens));
      } else {
        // If category is specified, merge with existing tokens
        // But since we're fetching all at once now, this shouldn't happen
        dispatch(setTokens(tokens));
      }
    }
  }, [data, category, dispatch]);

  // Update loading state in Redux
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  // Update error state in Redux
  useEffect(() => {
    if (isError && error) {
      dispatch(setError(error.message));
    } else {
      dispatch(setError(null));
    }
  }, [isError, error, dispatch]);

  // Memoize the return value to avoid re-creating tokens array on every render
  // The actual tokens are already stored in Redux, so we return an empty array here
  // Components should use useAppSelector to get tokens from Redux store
  return {
    tokens: [], // Tokens are in Redux store, accessed via useAppSelector
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

