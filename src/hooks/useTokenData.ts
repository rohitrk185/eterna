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
      const params = new URLSearchParams({
        chain,
        sort_by: sortBy,
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(`/api/tokens/list?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.statusText}`);
      }

      return response.json();
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
      const tokens: Token[] = data.data.tokens.map((birdeyeToken) =>
        mapBirdeyeToToken(birdeyeToken, category || 'new-pairs')
      );

      // Filter by category if specified
      const filteredTokens = category
        ? tokens.filter((token) => token.category === category)
        : tokens;

      dispatch(setTokens(filteredTokens));
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

  return {
    tokens: data?.success && data.data?.tokens
      ? data.data.tokens
          .map((birdeyeToken) =>
            mapBirdeyeToToken(birdeyeToken, category || 'new-pairs')
          )
          .filter((token) => (category ? token.category === category : true))
      : [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

