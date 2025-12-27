import { Token, SortConfig, SortField } from '@/types/token';

/**
 * Sort tokens based on configuration
 */
export function sortTokens(tokens: Token[], config: SortConfig): Token[] {
  const sorted = [...tokens];

  sorted.sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (config.field) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'priceChange24h':
        aValue = a.priceChange24h;
        bValue = b.priceChange24h;
        break;
      case 'marketCap':
        aValue = a.marketCap;
        bValue = b.marketCap;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      case 'transactionCount':
        aValue = a.transactionCount;
        bValue = b.transactionCount;
        break;
      case 'timeAgo':
        // Parse timeAgo string (e.g., "19s", "2m", "1d") to seconds
        aValue = parseTimeAgo(a.timeAgo);
        bValue = parseTimeAgo(b.timeAgo);
        break;
      default:
        return 0;
    }

    // Handle numeric comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const diff = aValue - bValue;
      return config.direction === 'asc' ? diff : -diff;
    }

    // Handle string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return config.direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Parse timeAgo string to seconds for sorting
 * Examples: "19s" -> 19, "2m" -> 120, "1d" -> 86400
 */
function parseTimeAgo(timeAgo: string): number {
  const match = timeAgo.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * (multipliers[unit] || 1);
}

