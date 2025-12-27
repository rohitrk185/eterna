import {
  Token,
  TokenCategory,
  BirdeyeTokenOverview,
  TokenRatio,
  ProgressSegment,
} from '@/types/token';

/**
 * Map Birdeye API response to Token interface
 * Generates mock data for fields not available in Birdeye API
 */
export function mapBirdeyeToToken(
  birdeyeToken: BirdeyeTokenOverview,
  category: TokenCategory
): Token {
  // Generate timeAgo (mock - in real app, calculate from createdAt)
  const timeAgo = generateTimeAgo();

  // Generate mock ratios (2-4 ratio pairs)
  const ratioCount = Math.floor(Math.random() * 3) + 2;
  const ratios: TokenRatio[] = Array.from({ length: ratioCount }, () => ({
    active: Math.floor(Math.random() * 100),
    total: Math.floor(Math.random() * 200) + 100,
  }));

  // Generate mock progress segments (3-6 segments)
  const segmentCount = Math.floor(Math.random() * 4) + 3;
  const progressSegments: ProgressSegment[] = Array.from(
    { length: segmentCount },
    (_, index) => ({
      value: Math.floor(Math.random() * 30) + (index * 10),
      isActive: Math.random() > 0.5,
    })
  );

  // Generate mock fee factor
  const feeFactor = Math.random() * 0.1;

  // Generate mock transaction count
  const transactionCount = Math.floor(Math.random() * 100) + 1;

  // Use address as pump address (truncated for display)
  const pumpAddress = birdeyeToken.address;

  return {
    id: birdeyeToken.address,
    address: birdeyeToken.address,
    name: birdeyeToken.name,
    symbol: birdeyeToken.symbol,
    imageUrl: birdeyeToken.logoURI || '',
    timeAgo,
    marketCap: birdeyeToken.marketCap || birdeyeToken.mc || birdeyeToken.fdv || 0,
    volume: birdeyeToken.volume24h || birdeyeToken.v24hUSD || 0,
    ratios,
    feeFactor,
    transactionCount,
    pumpAddress,
    progressSegments,
    price: birdeyeToken.price,
    priceChange24h: birdeyeToken.priceChange24h || birdeyeToken.v24hChangePercent || 0,
    category,
    createdAt: Date.now() - Math.floor(Math.random() * 86400000), // Random time in last 24h
  };
}

/**
 * Generate a random timeAgo string (mock data)
 */
function generateTimeAgo(): string {
  const random = Math.random();
  if (random < 0.3) {
    // Recent (seconds)
    const seconds = Math.floor(Math.random() * 60);
    return `${seconds}s`;
  } else if (random < 0.6) {
    // Minutes
    const minutes = Math.floor(Math.random() * 60) + 1;
    return `${minutes}m`;
  } else if (random < 0.9) {
    // Hours
    const hours = Math.floor(Math.random() * 24) + 1;
    return `${hours}h`;
  } else {
    // Days
    const days = Math.floor(Math.random() * 7) + 1;
    return `${days}d`;
  }
}

