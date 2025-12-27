import {
  BirdeyeTokenPrice,
  BirdeyeTokenOverview,
  BirdeyeTokenListResponse,
} from '@/types/token';

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

/**
 * Birdeye API client for fetching token data
 */
export class BirdeyeAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = BIRDEYE_BASE_URL;
  }

  /**
   * Get token price by address
   */
  async getTokenPrice(tokenAddress: string): Promise<BirdeyeTokenPrice> {
    const response = await fetch(
      `${this.baseURL}/v1/token/price?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get multiple token prices at once
   */
  async getMultiTokenPrice(
    addresses: string[]
  ): Promise<Record<string, BirdeyeTokenPrice>> {
    const listAddress = addresses.join(',');
    const response = await fetch(
      `${this.baseURL}/v1/token/multi_price?list_address=${listAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   *  Get full token data
   */
  async getTokenOverview(tokenAddress: string): Promise<BirdeyeTokenOverview> {
    const response = await fetch(
      `${this.baseURL}/v1/token/overview?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get token list
   */
  async getTokenList(params: {
    chain?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<BirdeyeTokenListResponse> {
    const queryParams = new URLSearchParams({
      chain: params.chain || 'solana',
      sort_by: params.sort_by || 'market_cap',
      limit: String(params.limit || 50),
      offset: String(params.offset || 0),
    });

    const response = await fetch(
      `${this.baseURL}/v3/tokenlist?${queryParams}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Get Birdeye API instance
 */
let birdeyeAPIInstance: BirdeyeAPI | null = null;

export function getBirdeyeAPI(): BirdeyeAPI {
  if (!birdeyeAPIInstance) {
    const apiKey =
      process.env.BIRD_EYE_API_KEY
    if (!apiKey) {
      throw new Error(
        'BIRD_EYE_API_KEY environment variable is not set'
      );
    }
    birdeyeAPIInstance = new BirdeyeAPI(apiKey);
  }
  return birdeyeAPIInstance;
}

