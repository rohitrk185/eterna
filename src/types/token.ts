/**
 * Token category types matching Axiom Trade's columns
 */
export type TokenCategory = "new-pairs" | "final-stretch" | "migrated";

/**
 * Progress bar segment data
 */
export interface ProgressSegment {
  value: number | string; // Percentage or duration
  isActive: boolean; // Green if active, gray if inactive
}

/**
 * Ratio data for circular icons
 */
export interface TokenRatio {
  active: number;
  total: number;
}

/**
 * Main Token interface matching Axiom Trade's token structure
 */
export interface Token {
  id: string; // Unique identifier (can be token address)
  address: string; // Token address for API calls
  name: string; // Full token name
  symbol: string; // Token symbol
  imageUrl: string; // Token logo/image URL
  timeAgo: string; // "19s", "2m", "1d" format
  countdown?: string; // Optional countdown timer "23:59:39"
  marketCap: number; // Market cap in USD (displayed as "MC $X.XK")
  volume: number; // 24h volume in USD (displayed as "V $X.XK")
  ratios: TokenRatio[]; // Array of ratio pairs for circular icons
  feeFactor: number; // Fee factor (displayed as "F= 0.021")
  transactionCount: number; // Transaction count (displayed as "TX 3")
  pumpAddress: string; // Pump address (truncated for display)
  progressSegments: ProgressSegment[]; // Progress bar segments
  price: number; // Current price in USD
  priceChange24h: number; // 24h price change percentage
  category: TokenCategory; // Which column this token belongs to
  createdAt?: number; // Timestamp when token was created/listed
}

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketPriceUpdate {
  type: "price";
  data: {
    address: string;
    price: number;
    priceChange24h: number;
    volume24h?: number;
    timestamp: number;
  };
}

export interface WebSocketTransactionUpdate {
  type: "tx";
  data: {
    address: string;
    transactionHash: string;
    timestamp: number;
  };
}

export type WebSocketMessage =
  | WebSocketPriceUpdate
  | WebSocketTransactionUpdate;

/**
 * Sorting configuration
 */
export type SortField =
  | "price"
  | "priceChange24h"
  | "marketCap"
  | "volume"
  | "timeAgo"
  | "transactionCount";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

/**
 * Birdeye API response types
 */
export interface BirdeyeTokenPrice {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
}

export interface BirdeyeTokenOverview {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  price: number;
  priceChange24h?: number;
  v24hChangePercent?: number; // Alternative field name from API
  volume24h?: number;
  v24hUSD?: number; // Alternative field name from API
  marketCap?: number;
  mc?: number; // Alternative field name from API
  liquidity: number;
  fdv?: number; // Fully diluted valuation
  holder?: number;
  lastTradeUnixTime?: number;
  isScaledUiToken?: boolean;
  multiplier?: number | null;
}

export interface BirdeyeTokenListResponse {
  success: boolean;
  data: {
    tokens: BirdeyeTokenOverview[];
    total: number;
  };
}

/**
 * UI state types
 */
export interface UIState {
  selectedToken: Token | null;
  isModalOpen: boolean;
  isPopoverOpen: boolean;
  popoverToken: Token | null;
}

/**
 * Filter and pagination types
 */
export interface TokenFilters {
  category?: TokenCategory;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
}

export interface PaginationConfig {
  page: number; // P1, P2, P3 buttons
  pageSize: number;
}
