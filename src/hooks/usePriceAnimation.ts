'use client';

import { useEffect, useState, useRef } from 'react';

interface UsePriceAnimationOptions {
  price: number;
  previousPrice?: number;
  animationDuration?: number;
  flashDuration?: number;
}

interface UsePriceAnimationReturn {
  colorClass: string;
  isAnimating: boolean;
  priceChange: number | null;
  priceChangePercent: number | null;
}

/**
 * usePriceAnimation hook - Smooth color transitions for price changes
 * Uses CSS transitions for smooth animations
 * Prevents layout shifts during updates
 */
export function usePriceAnimation(
  options: UsePriceAnimationOptions
): UsePriceAnimationReturn {
  const {
    price,
    previousPrice,
    animationDuration = 300,
    flashDuration = 1000,
  } = options;

  const [colorClass, setColorClass] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPriceRef = useRef<number | undefined>(previousPrice);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate price change
  const priceChange =
    previousPrice !== undefined && previousPrice !== null
      ? price - previousPrice
      : null;

  const priceChangePercent =
    previousPrice !== undefined &&
    previousPrice !== null &&
    previousPrice > 0
      ? ((price - previousPrice) / previousPrice) * 100
      : null;

  useEffect(() => {
    // Only animate if we have a previous price to compare
    if (
      previousPriceRef.current !== undefined &&
      previousPriceRef.current !== null &&
      previousPriceRef.current !== price
    ) {
      const change = price - previousPriceRef.current;

      // Determine color based on price change
      if (change > 0) {
        // Price increased - green
        setColorClass('text-green-500');
        setIsAnimating(true);
      } else if (change < 0) {
        // Price decreased - red
        setColorClass('text-red-500');
        setIsAnimating(true);
      } else {
        // No change
        setColorClass('');
        setIsAnimating(false);
      }

      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Reset animation after flash duration
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        // Keep the color class for a bit longer to show the change
        setTimeout(() => {
          setColorClass('');
        }, animationDuration);
      }, flashDuration);
    }

    // Update previous price reference
    previousPriceRef.current = price;

    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [price, animationDuration, flashDuration]);

  return {
    colorClass,
    isAnimating,
    priceChange,
    priceChangePercent,
  };
}

/**
 * Hook for getting price change color class directly
 * Simplified version for quick use
 */
export function usePriceChangeColor(
  currentPrice: number,
  previousPrice?: number
): string {
  const { colorClass } = usePriceAnimation({
    price: currentPrice,
    previousPrice,
  });
  return colorClass;
}

/**
 * Utility function to get price change color class
 * Can be used without hook for static calculations
 */
export function getPriceChangeColorClass(
  currentPrice: number,
  previousPrice?: number
): string {
  if (previousPrice === undefined || previousPrice === null) {
    return '';
  }

  const change = currentPrice - previousPrice;
  if (change > 0) {
    return 'text-green-500';
  } else if (change < 0) {
    return 'text-red-500';
  }
  return '';
}

