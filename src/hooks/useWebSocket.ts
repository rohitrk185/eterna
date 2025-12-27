'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateTokenPrice } from '@/store/slices/tokenSlice';
import { createWebSocket } from '@/lib/websocket-factory';
import { WebSocketPriceUpdate } from '@/types/token';

interface UseWebSocketOptions {
  url?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: (tokenAddresses: string[], initialPrices?: Record<string, number>) => void;
  unsubscribe: (tokenAddresses: string[]) => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * useWebSocket hook - Manages WebSocket connection lifecycle
 * Subscribes to token price updates and updates Redux store
 * Handles reconnection logic automatically
 */
export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    url = 'wss://mock-websocket.birdeye.so',
    autoReconnect = true,
    reconnectInterval = 3000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedTokensRef = useRef<string[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = createWebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnect?.();

        // Resubscribe to tokens if we had any subscriptions
        if (subscribedTokensRef.current.length > 0) {
          subscribe(subscribedTokensRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketPriceUpdate = JSON.parse(event.data);

          if (message.type === 'price' && message.data) {
            // Update Redux store with new price
            dispatch(updateTokenPrice(message));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
        wsRef.current = null;

        // Auto-reconnect if enabled
        if (autoReconnect && subscribedTokensRef.current.length > 0) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsConnected(false);
    }
  }, [url, autoReconnect, reconnectInterval, onConnect, onDisconnect, onError, dispatch]);

  // Subscribe to token price updates
  // initialPrices: optional map of address -> price to avoid API calls
  const subscribe = useCallback(
    (tokenAddresses: string[], initialPrices?: Record<string, number>) => {
      subscribedTokensRef.current = Array.from(
        new Set([...subscribedTokensRef.current, ...tokenAddresses])
      );

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            channel: 'price',
            tokens: subscribedTokensRef.current,
            initialPrices: initialPrices || {}, // Pass initial prices to avoid API calls
          })
        );
      } else if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        // Connect if not connected
        connect();
      }
    },
    [connect]
  );

  // Unsubscribe from token price updates
  const unsubscribe = useCallback((tokenAddresses: string[]) => {
    subscribedTokensRef.current = subscribedTokensRef.current.filter(
      (addr) => !tokenAddresses.includes(addr)
    );

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel: 'price',
          tokens: tokenAddresses,
        })
      );
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    cleanup();
    subscribedTokensRef.current = [];
    setIsConnected(false);
  }, [cleanup]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [connect, cleanup]);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    disconnect,
    reconnect,
  };
}

