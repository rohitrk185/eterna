'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/store/hooks';
import TokenColumn from '@/components/pulse/TokenColumn';
import { useTokenData } from '@/hooks/useTokenData';
import { LiveRegion } from '@/components/shared/LiveRegion';

// Dynamic imports for code splitting - load these after initial render
const TokenModalProvider = dynamic(
  () => import('@/components/pulse/TokenModalProvider').then((mod) => ({ default: mod.TokenModalProvider })),
  { ssr: false }
);

// Lazy load WebSocket connection component
const WebSocketConnector = dynamic(
  () => import('@/components/pulse/WebSocketConnector').then((mod) => ({ default: mod.WebSocketConnector })),
  { ssr: false }
);

/**
 * Pulse Page - Main token discovery table page
 * Three-column layout: New Pairs, Final Stretch, Migrated
 */
export default function PulsePage() {

  // Fetch tokens once (Birdeye API doesn't support category filtering)
  // We'll distribute tokens across categories after fetching
  // Only make ONE API call to avoid rate limiting
  const tokensQuery = useTokenData({
    limit: 50, // Fetch tokens to distribute across 3 columns (Birdeye API may have limit restrictions)
    enabled: true, // Only the first call will actually fetch
  });

  // Get tokens from Redux store
  const allTokens = useAppSelector((state) => state.tokens.tokens);

  // Distribute tokens evenly across the 3 categories
  const { newPairsTokens, finalStretchTokens, migratedTokens } = useMemo(() => {
    // Split tokens into 3 groups
    const chunkSize = Math.ceil(allTokens.length / 3);
    const chunks = [
      allTokens.slice(0, chunkSize),
      allTokens.slice(chunkSize, chunkSize * 2),
      allTokens.slice(chunkSize * 2),
    ];

    return {
      newPairsTokens: chunks[0] || [],
      finalStretchTokens: chunks[1] || [],
      migratedTokens: chunks[2] || [],
    };
  }, [allTokens]);

  return (
    <div className="min-h-screen bg-background">
      {/* Screen reader announcements */}
      <LiveRegion message="" priority="polite" id="price-updates" />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" role="main">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pulse</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Real-time token discovery</span>
          </div>
        </div>

        {/* Three-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* New Pairs Column */}
          <TokenColumn
            category="new-pairs"
            tokens={newPairsTokens}
            isLoading={tokensQuery.isLoading}
          />

          {/* Final Stretch Column */}
          <TokenColumn
            category="final-stretch"
            tokens={finalStretchTokens}
            isLoading={tokensQuery.isLoading}
          />

          {/* Migrated Column */}
          <TokenColumn
            category="migrated"
            tokens={migratedTokens}
            isLoading={tokensQuery.isLoading}
          />
        </div>
      </main>

      {/* Global Modal Provider - Loaded after initial render */}
      <TokenModalProvider />
      
      {/* WebSocket Connector - Deferred to improve LCP */}
      <WebSocketConnector />
    </div>
  );
}
