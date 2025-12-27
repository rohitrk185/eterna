'use client';

import { useEffect, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAppSelector } from '@/store/hooks';

/**
 * WebSocketConnector - Deferred WebSocket connection
 * Loads after initial render to improve LCP
 * Uses initial prices from Redux store instead of making API calls
 */
export function WebSocketConnector() {
  const allTokens = useAppSelector((state) => state.tokens.tokens);
  
  // Get all token addresses and initial prices for WebSocket subscription
  const { addresses, initialPrices } = useMemo(() => {
    const addresses = allTokens.map((token) => token.address).filter(Boolean);
    const prices: Record<string, number> = {};
    
    allTokens.forEach((token) => {
      if (token.address && token.price > 0) {
        prices[token.address] = token.price;
      }
    });
    
    return { addresses, initialPrices: prices };
  }, [allTokens]);

  // Set up WebSocket for real-time price updates (deferred)
  const { subscribe, isConnected } = useWebSocket({
    autoReconnect: true,
    reconnectInterval: 3000,
  });

  // Subscribe to all tokens when addresses are available
  // Pass initial prices to avoid API calls
  useEffect(() => {
    if (addresses.length > 0 && isConnected) {
      subscribe(addresses, initialPrices);
    }
  }, [addresses, initialPrices, isConnected, subscribe]);

  return null; // This component doesn't render anything
}

