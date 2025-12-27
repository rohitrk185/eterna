'use client';

import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  id?: string;
}

/**
 * LiveRegion component - Provides screen reader announcements
 * Used for dynamic content updates like price changes
 */
export function LiveRegion({
  message,
  priority = 'polite',
  id = 'live-region',
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear previous message
      regionRef.current.textContent = '';
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      id={id}
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useLiveRegion(priority: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = React.useState('');

  const announce = React.useCallback((text: string) => {
    setMessage(text);
    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  return {
    announce,
    LiveRegion: () => <LiveRegion message={message} priority={priority} />,
  };
}


